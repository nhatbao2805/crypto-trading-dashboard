const aiTraderController = require('../controllers/ai-trader.controller');

async function handleAiTraderRoutes(req, res, pathname, method, query, body) {
  // Council Analysis
  if (pathname === '/api/ai-trader/council-analysis' && method === 'POST') {
    return await aiTraderController.runCouncilAnalysis(req, res, body);
  }

  if (pathname === '/api/ai-trader/debates' && method === 'GET') {
    return aiTraderController.getDebates(req, res, query);
  }

  // Hypothesis Evaluation
  if (pathname === '/api/ai-trader/evaluate-prediction' && method === 'POST') {
    return await aiTraderController.evaluatePrediction(req, res, body);
  }

  if (pathname === '/api/ai-trader/predictions' && method === 'GET') {
    return aiTraderController.getPredictions(req, res, query);
  }

  // Chat
  if (pathname === '/api/ai-trader/chat-council' && method === 'POST') {
    return await aiTraderController.chatCouncil(req, res, body);
  }

  if (pathname === '/api/agy/history' && method === 'GET') {
    return aiTraderController.getChats(req, res, query);
  }

  if (pathname === '/api/agy/history/clear' && method === 'POST') {
    return aiTraderController.clearChats(req, res, body);
  }

  // 24/7 Market Screener
  if (pathname === '/api/ai-trader/screener/live' && method === 'GET') {
    return await aiTraderController.getScreenerLive(req, res);
  }

  if (pathname === '/api/ai-trader/screener/scan-now' && method === 'POST') {
    return await aiTraderController.scanScreenerNow(req, res);
  }

  // NLP Strategy
  if (pathname === '/api/ai-trader/nlp/parse-strategy' && method === 'POST') {
    return await aiTraderController.parseNlpStrategy(req, res, body);
  }

  // Telegram Alert
  if (pathname === '/api/ai-trader/telegram/status' && method === 'GET') {
    return aiTraderController.getTelegramStatus(req, res);
  }

  if (pathname === '/api/ai-trader/telegram/config' && method === 'POST') {
    return aiTraderController.updateTelegramConfig(req, res, body);
  }

  if (pathname === '/api/ai-trader/telegram/test-alert' && method === 'POST') {
    return await aiTraderController.sendTestTelegramAlert(req, res);
  }

  return false;
}

module.exports = handleAiTraderRoutes;
