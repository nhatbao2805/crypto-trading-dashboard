const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const CONSTANTS = require('./constants');

if (!fs.existsSync(CONSTANTS.DATA_DIR)) {
  fs.mkdirSync(CONSTANTS.DATA_DIR, { recursive: true });
}

if (!fs.existsSync(CONSTANTS.UPLOADS_DIR)) {
  fs.mkdirSync(CONSTANTS.UPLOADS_DIR, { recursive: true });
}

const db = new DatabaseSync(CONSTANTS.DB_PATH);

// Initialize all SQLite tables
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

  CREATE TABLE IF NOT EXISTS practice_progress (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    stats_data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS paper_account (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    balance REAL DEFAULT 10000.0,
    initial_capital REAL DEFAULT 10000.0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS paper_trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    coin TEXT NOT NULL,
    type TEXT NOT NULL,
    entry_price REAL NOT NULL,
    exit_price REAL,
    stop_loss REAL,
    take_profit REAL,
    leverage INTEGER DEFAULT 1,
    position_size REAL NOT NULL,
    margin REAL NOT NULL,
    pnl_amount REAL DEFAULT 0,
    pnl_percent REAL DEFAULT 0,
    status TEXT DEFAULT 'OPEN',
    close_reason TEXT,
    ai_verdict TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ai_debates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coin TEXT NOT NULL,
    technical_view TEXT NOT NULL,
    macro_view TEXT NOT NULL,
    risk_view TEXT NOT NULL,
    validator_view TEXT NOT NULL,
    master_verdict TEXT NOT NULL,
    probability_pct REAL DEFAULT 50.0,
    raw_data TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coin TEXT NOT NULL,
    hypothesis TEXT NOT NULL,
    user_action TEXT,
    probability_pct REAL DEFAULT 50.0,
    risk_score REAL DEFAULT 5.0,
    verdict TEXT NOT NULL,
    advice TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS daily_market_briefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    macro_headline TEXT NOT NULL,
    market_mood TEXT NOT NULL,
    sentiment_score REAL DEFAULT 0.0,
    executive_summary TEXT NOT NULL,
    focus_coins TEXT NOT NULL,
    actionable_trade_setups TEXT NOT NULL,
    short_term_holds TEXT,
    risk_notice TEXT,
    raw_data TEXT,
    created_at TEXT NOT NULL
  );
`);

// Safe non-destructive column migration
try {
  db.exec(`ALTER TABLE daily_market_briefs ADD COLUMN short_term_holds TEXT;`);
} catch (e) {
  // Column already exists, safe to ignore
}

// Ensure default paper account exists
db.exec(`
  INSERT OR IGNORE INTO paper_account (id, balance, initial_capital, updated_at)
  VALUES (1, 10000.0, 10000.0, datetime('now'));
`);

module.exports = db;
