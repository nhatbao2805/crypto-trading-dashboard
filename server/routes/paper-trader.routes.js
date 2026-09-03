const paperTraderController = require('../controllers/paper-trader.controller');

function handlePaperTraderRoutes(req, res, pathname, method, query, body) {
  if (pathname === '/api/paper-trader/account' && method === 'GET') {
    return paperTraderController.getAccount(req, res);
  }

  if (pathname === '/api/paper-trader/account/reset' && method === 'POST') {
    return paperTraderController.resetAccount(req, res, body);
  }

  if (pathname === '/api/paper-trader/positions' && method === 'GET') {
    return paperTraderController.getPositions(req, res, query);
  }

  if (pathname === '/api/paper-trader/positions' && method === 'POST') {
    return paperTraderController.openPosition(req, res, body);
  }

  if (pathname.startsWith('/api/paper-trader/positions/') && pathname.endsWith('/close') && method === 'POST') {
    const id = pathname.replace('/api/paper-trader/positions/', '').replace('/close', '');
    return paperTraderController.closePosition(req, res, { id }, body);
  }

  if (pathname === '/api/paper-trader/history' && method === 'GET') {
    return paperTraderController.getHistory(req, res, query);
  }

  return false;
}

module.exports = handlePaperTraderRoutes;
