/**
 * Main Application Server Entrypoint
 * Modularized Architecture - Delegating to server/app.js
 */

const { startServer } = require('./server/app.js');

if (require.main === module) {
  startServer();
}

module.exports = require('./server/app.js');
