const db = require('../config/database');

class JournalRepository {
  getAllEntries(filters = {}) {
    let query = 'SELECT * FROM journal_entries WHERE 1=1';
    const params = [];

    if (filters.coin) {
      query += ' AND UPPER(coin) = UPPER(?)';
      params.push(filters.coin.trim());
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.startDate) {
      query += ' AND date >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND date <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY date DESC, id DESC';
    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    return rows.map(r => ({
      ...r,
      images: JSON.parse(r.images || '[]'),
      setup_confluences: r.setup_confluences ? JSON.parse(r.setup_confluences) : [],
      rules_checked: r.rules_checked ? JSON.parse(r.rules_checked) : []
    }));
  }

  getEntryById(id) {
    const stmt = db.prepare('SELECT * FROM journal_entries WHERE id = ?');
    const row = stmt.get(Number(id));
    if (!row) return null;
    return {
      ...row,
      images: JSON.parse(row.images || '[]'),
      setup_confluences: row.setup_confluences ? JSON.parse(row.setup_confluences) : [],
      rules_checked: row.rules_checked ? JSON.parse(row.rules_checked) : []
    };
  }

  createEntry(data) {
    const now = new Date().toISOString();
    const date = data.date || now.split('T')[0];
    const coin = (data.coin || 'BTC').toUpperCase();
    const type = data.type || 'LONG';
    const entry_price = Number(data.entry_price) || 0;
    const exit_price = Number(data.exit_price) || 0;
    const stop_loss = Number(data.stop_loss) || 0;
    const take_profit = Number(data.take_profit) || 0;
    const position_size = Number(data.position_size) || 0;
    const pnl_amount = Number(data.pnl_amount) || 0;
    const pnl_percent = Number(data.pnl_percent) || 0;
    const status = data.status || 'OPEN';
    const notes = data.notes || '';
    const setup_confluences = JSON.stringify(data.setup_confluences || []);
    const rules_checked = JSON.stringify(data.rules_checked || []);
    const emotions = data.emotions || 'Disciplined';
    const images = JSON.stringify(data.images || []);

    const stmt = db.prepare(`
      INSERT INTO journal_entries (
        date, coin, type, entry_price, exit_price, stop_loss, take_profit,
        position_size, pnl_amount, pnl_percent, status, notes,
        setup_confluences, rules_checked, emotions, images, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      date, coin, type, entry_price, exit_price, stop_loss, take_profit,
      position_size, pnl_amount, pnl_percent, status, notes,
      setup_confluences, rules_checked, emotions, images, now, now
    );

    return this.getEntryById(result.lastInsertRowid);
  }

  updateEntry(id, data) {
    const current = this.getEntryById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    const date = data.date !== undefined ? data.date : current.date;
    const coin = data.coin !== undefined ? data.coin.toUpperCase() : current.coin;
    const type = data.type !== undefined ? data.type : current.type;
    const entry_price = data.entry_price !== undefined ? Number(data.entry_price) : current.entry_price;
    const exit_price = data.exit_price !== undefined ? Number(data.exit_price) : current.exit_price;
    const stop_loss = data.stop_loss !== undefined ? Number(data.stop_loss) : current.stop_loss;
    const take_profit = data.take_profit !== undefined ? Number(data.take_profit) : current.take_profit;
    const position_size = data.position_size !== undefined ? Number(data.position_size) : current.position_size;
    const pnl_amount = data.pnl_amount !== undefined ? Number(data.pnl_amount) : current.pnl_amount;
    const pnl_percent = data.pnl_percent !== undefined ? Number(data.pnl_percent) : current.pnl_percent;
    const status = data.status !== undefined ? data.status : current.status;
    const notes = data.notes !== undefined ? data.notes : current.notes;
    const setup_confluences = data.setup_confluences !== undefined ? JSON.stringify(data.setup_confluences) : JSON.stringify(current.setup_confluences);
    const rules_checked = data.rules_checked !== undefined ? JSON.stringify(data.rules_checked) : JSON.stringify(current.rules_checked);
    const emotions = data.emotions !== undefined ? data.emotions : current.emotions;
    const images = data.images !== undefined ? JSON.stringify(data.images) : JSON.stringify(current.images);

    const stmt = db.prepare(`
      UPDATE journal_entries SET
        date = ?, coin = ?, type = ?, entry_price = ?, exit_price = ?,
        stop_loss = ?, take_profit = ?, position_size = ?, pnl_amount = ?,
        pnl_percent = ?, status = ?, notes = ?, setup_confluences = ?,
        rules_checked = ?, emotions = ?, images = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      date, coin, type, entry_price, exit_price, stop_loss, take_profit,
      position_size, pnl_amount, pnl_percent, status, notes,
      setup_confluences, rules_checked, emotions, images, now, Number(id)
    );

    return this.getEntryById(id);
  }

  deleteEntry(id) {
    const entry = this.getEntryById(id);
    if (!entry) return false;
    const stmt = db.prepare('DELETE FROM journal_entries WHERE id = ?');
    stmt.run(Number(id));
    return true;
  }

  getStats() {
    const entries = this.getAllEntries();
    const totalTrades = entries.length;
    const closedTrades = entries.filter(e => e.status !== 'OPEN');
    const winningTrades = closedTrades.filter(e => e.status === 'WIN' || e.pnl_amount > 0);
    const losingTrades = closedTrades.filter(e => e.status === 'LOSS' || e.pnl_amount < 0);
    const beTrades = closedTrades.filter(e => e.status === 'BREAKEVEN' || (e.pnl_amount === 0 && e.status !== 'WIN' && e.status !== 'LOSS'));
    const openTrades = entries.filter(e => e.status === 'OPEN');

    const totalPnL = entries.reduce((acc, cur) => acc + (cur.pnl_amount || 0), 0);
    const winRate = closedTrades.length > 0 ? ((winningTrades.length / closedTrades.length) * 100).toFixed(1) : 0;
    
    const grossProfit = winningTrades.reduce((acc, cur) => acc + (cur.pnl_amount || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((acc, cur) => acc + (cur.pnl_amount || 0), 0));
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? 'MAX' : 0);

    const coinDistribution = {};
    entries.forEach(e => {
      coinDistribution[e.coin] = (coinDistribution[e.coin] || 0) + 1;
    });

    const timeline = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    let runningPnL = 0;
    const pnlCurve = timeline.map(e => {
      runningPnL += (e.pnl_amount || 0);
      return {
        date: e.date,
        coin: e.coin,
        tradePnL: e.pnl_amount || 0,
        cumulativePnL: Number(runningPnL.toFixed(2))
      };
    });

    return {
      totalTrades,
      closedTrades: closedTrades.length,
      openTrades: openTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      beTrades: beTrades.length,
      winRate: Number(winRate),
      totalPnL: Number(totalPnL.toFixed(2)),
      grossProfit: Number(grossProfit.toFixed(2)),
      grossLoss: Number(grossLoss.toFixed(2)),
      profitFactor,
      coinDistribution,
      pnlCurve
    };
  }

  saveTradeReview(data) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO trade_reviews (
        period_type, start_date, end_date, coin_filter,
        total_trades, discipline_score, analysis_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.period_type || 'CUSTOM',
      data.start_date || null,
      data.end_date || null,
      data.coin_filter || 'ALL',
      Number(data.total_trades) || 0,
      Number(data.discipline_score) || 0,
      typeof data.analysis_data === 'string' ? data.analysis_data : JSON.stringify(data.analysis_data || {}),
      now
    );

    return this.getTradeReviewById(result.lastInsertRowid);
  }

  getTradeReviews(limit = 20) {
    const query = 'SELECT * FROM trade_reviews ORDER BY id DESC LIMIT ?';
    const rows = db.prepare(query).all(limit);
    return rows.map(r => ({
      ...r,
      analysis_data: JSON.parse(r.analysis_data || '{}')
    }));
  }

  getTradeReviewById(id) {
    const stmt = db.prepare('SELECT * FROM trade_reviews WHERE id = ?');
    const row = stmt.get(Number(id));
    if (!row) return null;
    return {
      ...row,
      analysis_data: JSON.parse(row.analysis_data || '{}')
    };
  }

  deleteTradeReview(id) {
    const review = this.getTradeReviewById(id);
    if (!review) return false;
    db.prepare('DELETE FROM trade_reviews WHERE id = ?').run(Number(id));
    return true;
  }
}

module.exports = new JournalRepository();
