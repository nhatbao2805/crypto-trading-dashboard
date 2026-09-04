const db = require('../config/database');

class DebateRepository {
  constructor() {
    db.exec(`
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

    try {
      db.exec(`ALTER TABLE daily_market_briefs ADD COLUMN short_term_holds TEXT;`);
    } catch (e) {
      // Column already exists, safe to ignore
    }
  }

  saveAiDebate(data) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO ai_debates (
        coin, technical_view, macro_view, risk_view,
        validator_view, master_verdict, probability_pct, raw_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.coin ? data.coin.toUpperCase() : 'BTC',
      typeof data.technical_view === 'string' ? data.technical_view : JSON.stringify(data.technical_view || {}),
      typeof data.macro_view === 'string' ? data.macro_view : JSON.stringify(data.macro_view || {}),
      typeof data.risk_view === 'string' ? data.risk_view : JSON.stringify(data.risk_view || {}),
      typeof data.validator_view === 'string' ? data.validator_view : JSON.stringify(data.validator_view || {}),
      typeof data.master_verdict === 'string' ? data.master_verdict : JSON.stringify(data.master_verdict || {}),
      Number(data.probability_pct) || 50.0,
      typeof data.raw_data === 'string' ? data.raw_data : JSON.stringify(data.raw_data || {}),
      now
    );

    return this.getAiDebateById(result.lastInsertRowid);
  }

  getAiDebates(coin = null, limit = 20) {
    let query = 'SELECT * FROM ai_debates WHERE 1=1';
    const params = [];
    if (coin) {
      query += ' AND UPPER(coin) = UPPER(?)';
      params.push(coin.trim());
    }
    query += ' ORDER BY id DESC LIMIT ?';
    params.push(Number(limit));

    const rows = db.prepare(query).all(...params);
    return rows.map(r => ({
      ...r,
      technical_view: JSON.parse(r.technical_view || '{}'),
      macro_view: JSON.parse(r.macro_view || '{}'),
      risk_view: JSON.parse(r.risk_view || '{}'),
      validator_view: JSON.parse(r.validator_view || '{}'),
      master_verdict: JSON.parse(r.master_verdict || '{}'),
      raw_data: JSON.parse(r.raw_data || '{}')
    }));
  }

  getAiDebateById(id) {
    const row = db.prepare('SELECT * FROM ai_debates WHERE id = ?').get(Number(id));
    if (!row) return null;
    return {
      ...row,
      technical_view: JSON.parse(row.technical_view || '{}'),
      macro_view: JSON.parse(row.macro_view || '{}'),
      risk_view: JSON.parse(row.risk_view || '{}'),
      validator_view: JSON.parse(row.validator_view || '{}'),
      master_verdict: JSON.parse(row.master_verdict || '{}'),
      raw_data: JSON.parse(row.raw_data || '{}')
    };
  }

  saveUserPrediction(data) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO user_predictions (
        coin, hypothesis, user_action, probability_pct,
        risk_score, verdict, advice, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.coin ? data.coin.toUpperCase() : 'BTC',
      data.hypothesis || '',
      data.user_action || 'LONG',
      Number(data.probability_pct) || 50.0,
      Number(data.risk_score) || 5.0,
      data.verdict || '',
      data.advice || '',
      now
    );

    return db.prepare('SELECT * FROM user_predictions WHERE id = ?').get(result.lastInsertRowid);
  }

  getUserPredictions(coin = null, limit = 50) {
    let query = 'SELECT * FROM user_predictions WHERE 1=1';
    const params = [];
    if (coin) {
      query += ' AND UPPER(coin) = UPPER(?)';
      params.push(coin.trim());
    }
    query += ' ORDER BY id DESC LIMIT ?';
    params.push(Number(limit));
    return db.prepare(query).all(...params);
  }

  saveChat(coin, prompt, response) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`INSERT INTO terminal_chats (coin, prompt, response, created_at) VALUES (?, ?, ?, ?)`);
    const result = stmt.run(coin ? coin.toUpperCase() : null, prompt, response, now);
    return db.prepare('SELECT * FROM terminal_chats WHERE id = ?').get(result.lastInsertRowid);
  }

  getChats(coin = null, limit = 50) {
    let query = 'SELECT * FROM terminal_chats WHERE 1=1';
    const params = [];
    if (coin) {
      query += ' AND UPPER(coin) = UPPER(?)';
      params.push(coin.trim());
    }
    query += ' ORDER BY id DESC LIMIT ?';
    params.push(Number(limit));
    return db.prepare(query).all(...params);
  }

  clearChats(coin = null) {
    if (coin) {
      db.prepare('DELETE FROM terminal_chats WHERE UPPER(coin) = UPPER(?)').run(coin.trim());
    } else {
      db.prepare('DELETE FROM terminal_chats').run();
    }
    return true;
  }

  saveNewsAnalysis(coin, analysisData) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO news_analyses (
        coin, impact_score, impact_level, sentiment_score,
        catalysts, summary, recommendations, raw_articles, terminal_logs, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      coin.toUpperCase(),
      analysisData.impact_score || 'Trung Tính',
      analysisData.impact_level || 'MEDIUM',
      Number(analysisData.sentiment_score) || 0,
      JSON.stringify(analysisData.catalysts || []),
      analysisData.summary || '',
      JSON.stringify(analysisData.recommendations || []),
      JSON.stringify(analysisData.raw_articles || []),
      analysisData.terminal_logs || '',
      now
    );

    return db.prepare('SELECT * FROM news_analyses WHERE id = ?').get(result.lastInsertRowid);
  }

  getLatestNewsAnalysis(coin) {
    const query = 'SELECT * FROM news_analyses WHERE UPPER(coin) = UPPER(?) ORDER BY id DESC LIMIT 1';
    const row = db.prepare(query).get(coin.trim());
    if (!row) return null;
    return {
      ...row,
      catalysts: JSON.parse(row.catalysts || '[]'),
      recommendations: JSON.parse(row.recommendations || '[]'),
      raw_articles: JSON.parse(row.raw_articles || '[]')
    };
  }

  savePracticeProgress(statsData) {
    const now = new Date().toISOString();
    const dataStr = typeof statsData === 'string' ? statsData : JSON.stringify(statsData);
    db.prepare(`
      INSERT INTO practice_progress (id, stats_data, updated_at)
      VALUES (1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        stats_data = excluded.stats_data,
        updated_at = excluded.updated_at
    `).run(dataStr, now);
    return this.getPracticeProgress();
  }

  getPracticeProgress() {
    const row = db.prepare('SELECT * FROM practice_progress WHERE id = 1').get();
    if (!row) return null;
    return JSON.parse(row.stats_data || '{}');
  }

  saveDailyBrief(data) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO daily_market_briefs (
        date, macro_headline, market_mood, sentiment_score,
        executive_summary, focus_coins, actionable_trade_setups,
        short_term_holds, risk_notice, raw_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.date || new Date().toISOString().split('T')[0],
      data.macroHeadline || data.macro_headline || 'Bản Tin Vĩ Mô & Thị Trường',
      data.marketMood || data.market_mood || 'NEUTRAL',
      Number(data.sentimentScore ?? data.sentiment_score ?? 0),
      typeof (data.executiveSummary ?? data.executive_summary) === 'string'
        ? (data.executiveSummary ?? data.executive_summary)
        : JSON.stringify(data.executiveSummary ?? data.executive_summary ?? []),
      typeof (data.focusCoins ?? data.focus_coins) === 'string'
        ? (data.focusCoins ?? data.focus_coins)
        : JSON.stringify(data.focusCoins ?? data.focus_coins ?? []),
      typeof (data.actionableTradeSetups ?? data.actionable_trade_setups) === 'string'
        ? (data.actionableTradeSetups ?? data.actionable_trade_setups)
        : JSON.stringify(data.actionableTradeSetups ?? data.actionable_trade_setups ?? []),
      typeof (data.shortTermHolds ?? data.short_term_holds) === 'string'
        ? (data.shortTermHolds ?? data.short_term_holds)
        : JSON.stringify(data.shortTermHolds ?? data.short_term_holds ?? []),
      data.riskNotice || data.risk_notice || '',
      typeof (data.rawData ?? data.raw_data) === 'string'
        ? (data.rawData ?? data.raw_data)
        : JSON.stringify(data.rawData ?? data.raw_data ?? {}),
      now
    );

    return this.getDailyBriefById(result.lastInsertRowid);
  }

  getDailyBriefById(id) {
    const row = db.prepare('SELECT * FROM daily_market_briefs WHERE id = ?').get(Number(id));
    if (!row) return null;
    return this._formatDailyBrief(row);
  }

  getLatestDailyBrief() {
    const row = db.prepare('SELECT * FROM daily_market_briefs ORDER BY id DESC LIMIT 1').get();
    if (!row) return null;
    return this._formatDailyBrief(row);
  }

  _formatDailyBrief(row) {
    const parseSafe = (val, fallback) => {
      try {
        return typeof val === 'string' ? JSON.parse(val) : (val || fallback);
      } catch (e) {
        return fallback;
      }
    };

    const executiveSummary = parseSafe(row.executive_summary, []);
    const focusCoins = parseSafe(row.focus_coins, []);
    const actionableTradeSetups = parseSafe(row.actionable_trade_setups, []);
    const shortTermHolds = parseSafe(row.short_term_holds, []);
    const rawData = parseSafe(row.raw_data, {});

    return {
      id: row.id,
      date: row.date,
      macroHeadline: row.macro_headline,
      marketMood: row.market_mood,
      sentimentScore: Number(row.sentiment_score) || 0,
      executiveSummary,
      focusCoins,
      actionableTradeSetups,
      shortTermHolds,
      riskNotice: row.risk_notice || '',
      rawData,
      createdAt: row.created_at,
      // Alias snake_case
      macro_headline: row.macro_headline,
      market_mood: row.market_mood,
      sentiment_score: Number(row.sentiment_score) || 0,
      executive_summary: executiveSummary,
      focus_coins: focusCoins,
      actionable_trade_setups: actionableTradeSetups,
      short_term_holds: shortTermHolds,
      risk_notice: row.risk_notice || '',
      raw_data: rawData,
      created_at: row.created_at
    };
  }
}

module.exports = new DebateRepository();
