const aiTraderController = require('../controllers/ai-trader.controller');

async function handleAiTraderRoutes(req, res, pathname, method, query, body) {
  // Council Analysis & Auto-Trading
  if ((pathname === '/api/ai-trader/council-analysis' || pathname === '/api/ai-trader/council/debate') && method === 'POST') {
    return await aiTraderController.runCouncilAnalysis(req, res, body);
  }

  if (pathname === '/api/ai-trader/auto-trade/execute' && method === 'POST') {
    return await aiTraderController.executeAutoTrade(req, res, body);
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

  // Pre-Market Daily Briefing & Post-Market Review
  if (pathname === '/api/ai-trader/daily-briefing' && method === 'GET') {
    return await aiTraderController.getDailyBriefing(req, res);
  }

  if (pathname === '/api/ai-trader/daily-review' && method === 'GET') {
    return await aiTraderController.getDailyReview(req, res, query);
  }

  if (pathname === '/api/ai-trader/daily-review/save-note' && method === 'POST') {
    return await aiTraderController.saveDailyReviewToNote(req, res, body);
  }

  return false;
}

module.exports = handleAiTraderRoutes;
