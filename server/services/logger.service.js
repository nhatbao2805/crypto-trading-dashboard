/**
 * Logger Service (server/services/logger.service.js)
 * High-performance append logger for 24/7 background screener and telegram alerts.
 * File: logs/screener.log
 */

const fs = require('node:fs');
const path = require('node:path');

class LoggerService {
  constructor() {
    this.logsDir = path.join(__dirname, '..', '..', 'logs');
    this.logFile = path.join(this.logsDir, 'screener.log');
    this.recentMemoryLogs = [];
    this.maxMemoryLogs = 50;

    if (!fs.existsSync(this.logsDir)) {
      try {
        fs.mkdirSync(this.logsDir, { recursive: true });
      } catch (_) {}
    }
  }

  log(level = 'INFO', message = '', metadata = {}) {
    const timestamp = new Date().toLocaleString('vi-VN', {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const metaStr = Object.keys(metadata).length ? ` | ${JSON.stringify(metadata)}` : '';
    const logLine = `[${timestamp}] [${level}] ${message}${metaStr}\n`;

    // 1. Keep in memory for instant CLI/Web access
    this.recentMemoryLogs.unshift({
      timestamp,
      level,
      message,
      metadata
    });
    if (this.recentMemoryLogs.length > this.maxMemoryLogs) {
      this.recentMemoryLogs.pop();
    }

    // 2. Append to logs/screener.log
    try {
      fs.appendFileSync(this.logFile, logLine, 'utf8');
    } catch (e) {
      console.warn('[LoggerService] Write error:', e.message);
    }
  }

  info(msg, meta) {
    this.log('INFO', msg, meta);
  }

  alert(msg, meta) {
    this.log('ALERT', msg, meta);
  }

  warn(msg, meta) {
    this.log('WARN', msg, meta);
  }

  error(msg, meta) {
    this.log('ERROR', msg, meta);
  }

  getRecentLogs(limit = 10) {
    return this.recentMemoryLogs.slice(0, limit);
  }
}

module.exports = new LoggerService();
