const db = require('../config/database');

// Auto-migrate schema for TTL, Max Dollar Loss & Debate Payload
try {
  const tableInfo = db.prepare(`PRAGMA table_info(paper_trades)`).all();
  const columnNames = tableInfo.map(c => c.name);
  if (!columnNames.includes('max_loss_usd')) {
    db.exec(`ALTER TABLE paper_trades ADD COLUMN max_loss_usd REAL;`);
  }
  if (!columnNames.includes('expires_at')) {
    db.exec(`ALTER TABLE paper_trades ADD COLUMN expires_at TEXT;`);
  }
  if (!columnNames.includes('debate_payload')) {
    db.exec(`ALTER TABLE paper_trades ADD COLUMN debate_payload TEXT;`);
  }
} catch (e) {
  console.warn('[PaperTradeRepository] Schema migration note:', e.message);
}

class PaperTradeRepository {
  getAccount() {
    const row = db.prepare('SELECT * FROM paper_account WHERE id = 1').get();
    if (!row) {
      db.exec(`INSERT OR IGNORE INTO paper_account (id, balance, initial_capital, updated_at) VALUES (1, 10000.0, 10000.0, datetime('now'));`);
      return { id: 1, balance: 10000.0, initial_capital: 10000.0, availableBalance: 10000.0, lockedMargin: 0.0 };
    }

    const openPos = this.getOpenPositions();
    const lockedMargin = openPos.reduce((sum, p) => sum + (p.margin || 0), 0);
    const availableBalance = Math.max(0, row.balance - lockedMargin);

    return {
      id: row.id,
      balance: Number(row.balance),
      initial_capital: Number(row.initial_capital),
      lockedMargin: Number(lockedMargin.toFixed(2)),
      availableBalance: Number(availableBalance.toFixed(2)),
      updated_at: row.updated_at
    };
  }

  resetAccount(initialCapital = 10000.0) {
    const capital = Number(initialCapital) || 10000.0;
    const now = new Date().toISOString();
    
    db.prepare(`
      UPDATE paper_account 
      SET balance = ?, initial_capital = ?, updated_at = ? 
      WHERE id = 1
    `).run(capital, capital, now);

    db.exec(`DELETE FROM paper_trades;`);
    return this.getAccount();
  }

  updateBalance(deltaAmount) {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE paper_account 
      SET balance = balance + ?, updated_at = ? 
      WHERE id = 1
    `).run(Number(deltaAmount), now);
    return this.getAccount();
  }

  getOpenPositions(coin = null) {
    let query = `SELECT * FROM paper_trades WHERE status = 'OPEN'`;
    const params = [];
    if (coin) {
      query += ` AND UPPER(coin) = UPPER(?)`;
      params.push(coin.trim());
    }
    query += ` ORDER BY id DESC`;
    return db.prepare(query).all(...params);
  }

  getPositionById(id) {
    return db.prepare('SELECT * FROM paper_trades WHERE id = ?').get(Number(id));
  }

  openPosition(data) {
    const account = this.getAccount();
    const margin = Number(data.margin) || 100.0;
    const leverage = Number(data.leverage) || 1;

    if (margin > account.availableBalance) {
      throw new Error(`Số dư khả dụng ($${account.availableBalance}) không đủ để ký quỹ $${margin}`);
    }

    const now = new Date().toISOString();
    const date = data.date || now.split('T')[0];
    const coin = (data.coin || 'BTC').toUpperCase();
    const type = (data.type || 'LONG').toUpperCase();
    const entry_price = Number(data.entry_price) || 0;
    const stop_loss = data.stop_loss ? Number(data.stop_loss) : null;
    const take_profit = data.take_profit ? Number(data.take_profit) : null;
    const position_size = Number((margin * leverage).toFixed(2));
    const ai_verdict = data.ai_verdict || '';
    const notes = data.notes || '';
    const max_loss_usd = data.max_loss_usd ? Number(data.max_loss_usd) : null;
    const expires_at = data.expires_at || (data.ttl_minutes ? new Date(Date.now() + Number(data.ttl_minutes) * 60000).toISOString() : null);
    const debate_payload = typeof data.debate_payload === 'object' ? JSON.stringify(data.debate_payload) : (data.debate_payload || null);

    const stmt = db.prepare(`
      INSERT INTO paper_trades (
        date, coin, type, entry_price, stop_loss, take_profit,
        leverage, position_size, margin, status, ai_verdict, notes,
        max_loss_usd, expires_at, debate_payload,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      date, coin, type, entry_price, stop_loss, take_profit,
      leverage, position_size, margin, ai_verdict, notes,
      max_loss_usd, expires_at, debate_payload, now, now
    );

    return this.getPositionById(result.lastInsertRowid);
  }

  closePosition(id, exitPrice, closeReason = 'MANUAL') {
    const pos = this.getPositionById(id);
    if (!pos) throw new Error(`Không tìm thấy vị thế #${id}`);
    if (pos.status !== 'OPEN') throw new Error(`Vị thế #${id} đã được đóng trước đó`);

    const exit_price = Number(exitPrice);
    const entry_price = Number(pos.entry_price);
    const isShort = pos.type === 'SHORT';

    let pnl_percent = 0;
    if (entry_price > 0) {
      const priceDiffPct = isShort
        ? ((entry_price - exit_price) / entry_price) * 100
        : ((exit_price - entry_price) / entry_price) * 100;
      pnl_percent = priceDiffPct * pos.leverage;
    }

    const pnl_amount = pos.margin * (pnl_percent / 100);
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE paper_trades SET
        exit_price = ?,
        pnl_amount = ?,
        pnl_percent = ?,
        status = 'CLOSED',
        close_reason = ?,
        updated_at = ?
      WHERE id = ?
    `).run(exit_price, Number(pnl_amount.toFixed(2)), Number(pnl_percent.toFixed(2)), closeReason, now, Number(id));

    this.updateBalance(pnl_amount);
    return this.getPositionById(id);
  }

  updateStopLoss(id, newStopLoss) {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE paper_trades 
      SET stop_loss = ?, updated_at = ? 
      WHERE id = ? AND status = 'OPEN'
    `).run(Number(newStopLoss), now, Number(id));
    return this.getPositionById(id);
  }

  getHistory(filters = {}) {
    let query = `SELECT * FROM paper_trades WHERE status = 'CLOSED'`;
    const params = [];

    if (filters.coin) {
      query += ` AND UPPER(coin) = UPPER(?)`;
      params.push(filters.coin.trim());
    }

    query += ` ORDER BY id DESC`;
    if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(Number(filters.limit));
    }

    const trades = db.prepare(query).all(...params);

    const totalTrades = trades.length;
    const winTrades = trades.filter(t => t.pnl_amount > 0).length;
    const lossTrades = trades.filter(t => t.pnl_amount < 0).length;
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl_amount || 0), 0);
    const winRate = totalTrades > 0 ? Number(((winTrades / totalTrades) * 100).toFixed(1)) : 0;

    return {
      trades,
      stats: {
        totalTrades,
        winTrades,
        lossTrades,
        totalPnl: Number(totalPnl.toFixed(2)),
        winRate
      }
    };
  }
}

module.exports = new PaperTradeRepository();
