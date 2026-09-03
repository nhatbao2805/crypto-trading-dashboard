const db = require('../config/database');

class DebateRepository {
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
}

module.exports = new DebateRepository();
