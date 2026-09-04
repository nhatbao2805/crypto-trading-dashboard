const path = require('node:path');
const fs = require('node:fs');

// Auto-load .env file if present in project root (Node 20.6.0+)
const envPath = path.join(__dirname, '..', '..', '.env');
if (typeof process.loadEnvFile === 'function' && fs.existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath);
  } catch (_) {}
}

const CONSTANTS = {
  PORT: process.env.PORT || 3000,
  ROOT_DIR: path.join(__dirname, '..', '..'),
  DIST_DIR: path.join(__dirname, '..', '..', 'dist'),
  DATA_DIR: path.join(__dirname, '..', '..', 'data'),
  UPLOADS_DIR: path.join(__dirname, '..', '..', 'uploads'),
  DB_PATH: path.join(__dirname, '..', '..', 'data', 'dashboard.sqlite'),
  THEORY_DIR: path.join(__dirname, '..', '..'),
  TRACKED_COINS: ['btc', 'eth', 'sol', 'bnb', 'sui', 'doge', 'xrp', 'near', 'ada', 'avax'],
  DEFAULT_INITIAL_CAPITAL: 10000.0,
  MIME_TYPES: {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  }
};

module.exports = CONSTANTS;
