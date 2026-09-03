const newsController = require('../controllers/news.controller');

async function handleNewsRoutes(req, res, pathname, method, query, body) {
  if ((pathname === '/api/market/price' || pathname === '/api/market/ticker') && method === 'GET') {
    return await newsController.getMarketPrice(req, res, query);
  }

  if (pathname === '/api/market/prices' && method === 'GET') {
    return await newsController.getAllMarketPrices(req, res);
  }

  if (pathname === '/api/news' && method === 'GET') {
    return await newsController.getNewsArticles(req, res, query);
  }

  if (pathname === '/api/news/analyze' && method === 'POST') {
    return await newsController.analyzeNewsImpact(req, res, body);
  }

  if ((pathname === '/api/news/latest' || pathname === '/api/news/history') && method === 'GET') {
    return await newsController.getLatestAnalysis(req, res, query);
  }

  if (pathname === '/api/agy/exec' && method === 'POST') {
    return await newsController.execAgyPrompt(req, res, body);
  }

  return false;
}

module.exports = handleNewsRoutes;
