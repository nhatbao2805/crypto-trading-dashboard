const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'dashboard.sqlite');
const db = new DatabaseSync(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    coin TEXT NOT NULL,
    type TEXT DEFAULT 'LONG',
    entry_price REAL,
    exit_price REAL,
    stop_loss REAL,
    take_profit REAL,
    position_size REAL,
    pnl_amount REAL DEFAULT 0,
    pnl_percent REAL DEFAULT 0,
    status TEXT DEFAULT 'OPEN',
    notes TEXT,
    setup_confluences TEXT,
    rules_checked TEXT,
    emotions TEXT,
    images TEXT DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Ghi Chú Chung',
    content TEXT NOT NULL,
    is_pinned INTEGER DEFAULT 0,
    images TEXT DEFAULT '[]',
    date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS trade_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_type TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    coin_filter TEXT,
    total_trades INTEGER DEFAULT 0,
    discipline_score REAL DEFAULT 0,
    analysis_data TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS news_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coin TEXT NOT NULL,
    impact_score TEXT,
    impact_level TEXT,
    sentiment_score REAL,
    catalysts TEXT,
    summary TEXT,
    recommendations TEXT,
    raw_articles TEXT,
    terminal_logs TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS terminal_chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coin TEXT,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const dbManager = {
  // --- JOURNAL CRUD ---
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
  },

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
  },

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
  },

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
  },

  deleteEntry(id) {
    const entry = this.getEntryById(id);
    if (!entry) return false;
    const stmt = db.prepare('DELETE FROM journal_entries WHERE id = ?');
    stmt.run(Number(id));
    return true;
  },

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

    // Distribution by coin
    const coinDistribution = {};
    entries.forEach(e => {
      coinDistribution[e.coin] = (coinDistribution[e.coin] || 0) + 1;
    });

    // PnL over time for chart
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
  },

  // --- TRADING & PSYCHOLOGY NOTES CRUD ---
  getAllNotes(filters = {}) {
    let query = 'SELECT * FROM notes WHERE 1=1';
    const params = [];

    if (filters.category && filters.category !== 'ALL') {
      query += ' AND category = ?';
      params.push(filters.category.trim());
    }
    if (filters.search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${filters.search.trim()}%`, `%${filters.search.trim()}%`);
    }
    if (filters.startDate) {
      query += ' AND date >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND date <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY is_pinned DESC, date DESC, id DESC';
    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    return rows.map(r => ({
      ...r,
      is_pinned: Boolean(r.is_pinned),
      images: JSON.parse(r.images || '[]')
    }));
  },

  getNoteById(id) {
    const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    const row = stmt.get(Number(id));
    if (!row) return null;
    return {
      ...row,
      is_pinned: Boolean(row.is_pinned),
      images: JSON.parse(row.images || '[]')
    };
  },

  createNote(data) {
    const now = new Date().toISOString();
    const date = data.date || now.split('T')[0];
    const title = (data.title || 'Ghi chú mới').trim();
    const category = data.category || 'Ghi Chú Chung';
    const content = data.content || '';
    const is_pinned = data.is_pinned ? 1 : 0;
    const images = JSON.stringify(data.images || []);

    const stmt = db.prepare(`
      INSERT INTO notes (
        title, category, content, is_pinned, images, date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(title, category, content, is_pinned, images, date, now, now);
    return this.getNoteById(result.lastInsertRowid);
  },

  updateNote(id, data) {
    const current = this.getNoteById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    const title = data.title !== undefined ? data.title.trim() : current.title;
    const category = data.category !== undefined ? data.category : current.category;
    const content = data.content !== undefined ? data.content : current.content;
    const is_pinned = data.is_pinned !== undefined ? (data.is_pinned ? 1 : 0) : (current.is_pinned ? 1 : 0);
    const images = data.images !== undefined ? JSON.stringify(data.images) : JSON.stringify(current.images);
    const date = data.date !== undefined ? data.date : current.date;

    const stmt = db.prepare(`
      UPDATE notes SET
        title = ?, category = ?, content = ?, is_pinned = ?, images = ?, date = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(title, category, content, is_pinned, images, date, now, Number(id));
    return this.getNoteById(id);
  },

  deleteNote(id) {
    const note = this.getNoteById(id);
    if (!note) return false;
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    stmt.run(Number(id));
    return true;
  },

  togglePinNote(id) {
    const note = this.getNoteById(id);
    if (!note) return null;
    const newPin = note.is_pinned ? 0 : 1;
    const now = new Date().toISOString();
    db.prepare('UPDATE notes SET is_pinned = ?, updated_at = ? WHERE id = ?').run(newPin, now, Number(id));
    return this.getNoteById(id);
  },

  // --- AI TRADE REVIEWS CRUD ---
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
  },

  getTradeReviews(limit = 20) {
    const query = 'SELECT * FROM trade_reviews ORDER BY id DESC LIMIT ?';
    const rows = db.prepare(query).all(limit);
    return rows.map(r => ({
      ...r,
      analysis_data: JSON.parse(r.analysis_data || '{}')
    }));
  },

  getTradeReviewById(id) {
    const stmt = db.prepare('SELECT * FROM trade_reviews WHERE id = ?');
    const row = stmt.get(Number(id));
    if (!row) return null;
    return {
      ...row,
      analysis_data: JSON.parse(row.analysis_data || '{}')
    };
  },

  deleteTradeReview(id) {
    const review = this.getTradeReviewById(id);
    if (!review) return false;
    db.prepare('DELETE FROM trade_reviews WHERE id = ?').run(Number(id));
    return true;
  },

  // --- NEWS & AGY ANALYSES ---
  saveNewsAnalysis(data) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO news_analyses (
        coin, impact_score, impact_level, sentiment_score,
        catalysts, summary, recommendations, raw_articles, terminal_logs, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      (data.coin || 'BTC').toUpperCase(),
      data.impact_score || 'NEUTRAL',
      data.impact_level || 'MEDIUM',
      Number(data.sentiment_score) || 0,
      JSON.stringify(data.catalysts || []),
      data.summary || '',
      data.recommendations || '',
      JSON.stringify(data.raw_articles || []),
      data.terminal_logs || '',
      now
    );

    return result.lastInsertRowid;
  },

  getNewsHistory(coin = null, limit = 20) {
    let query = 'SELECT * FROM news_analyses';
    const params = [];
    if (coin) {
      query += ' WHERE UPPER(coin) = UPPER(?)';
      params.push(coin.trim());
    }
    query += ' ORDER BY id DESC LIMIT ?';
    params.push(limit);

    const rows = db.prepare(query).all(...params);
    return rows.map(r => ({
      ...r,
      catalysts: JSON.parse(r.catalysts || '[]'),
      raw_articles: JSON.parse(r.raw_articles || '[]')
    }));
  },

  saveChatMessage(coin, prompt, response) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO terminal_chats (coin, prompt, response, created_at)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(coin ? coin.toUpperCase() : 'GENERAL', prompt, response, now);
    return result.lastInsertRowid;
  },

  getChatHistory(coin = null, limit = 50) {
    let query = 'SELECT * FROM terminal_chats';
    const params = [];
    if (coin) {
      query += ' WHERE UPPER(coin) = UPPER(?)';
      params.push(coin.trim());
    }
    query += ' ORDER BY id ASC LIMIT ?';
    params.push(limit);
    return db.prepare(query).all(...params);
  },

  clearChatHistory(coin = null) {
    if (coin) {
      db.prepare('DELETE FROM terminal_chats WHERE UPPER(coin) = UPPER(?)').run(coin.trim());
    } else {
      db.prepare('DELETE FROM terminal_chats').run();
    }
    return true;
  }
};

module.exports = dbManager;
