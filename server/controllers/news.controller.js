const binanceService = require('../services/binance.service');
const newsService = require('../services/news.service');
const debateRepository = require('../models/DebateRepository');
const masterCouncil = require('../agents/MasterCouncil');

class NewsController {
  async getMarketPrice(req, res, query) {
    const coin = query.coin || 'BTC';
    const ticker = await binanceService.getTicker24h(coin);
    return res.json({ success: true, ticker });
  }

  async getAllMarketPrices(req, res) {
    const tickers = await binanceService.getAllTickers();
    return res.json({ success: true, tickers });
  }

  getVolatilityStream(req, res, query) {
    const volatilityService = require('../services/volatility-detector.service');
    const limit = query && query.limit ? parseInt(query.limit, 10) : 10;
    const events = volatilityService.getLatestEvents(limit);
    return res.json({ success: true, events });
  }

  async getNewsArticles(req, res, query) {
    const coin = query.coin || 'BTC';
    const articles = await newsService.getLatestNews(coin);
    return res.json({ success: true, articles });
  }

  async analyzeNewsImpact(req, res, body) {
    const { coin = 'BTC' } = body || {};
    try {
      const result = await newsService.analyzeNewsImpact(coin);
      return res.json({ success: true, analysis: result, result });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async getLatestAnalysis(req, res, query) {
    const coin = query.coin || 'BTC';
    const analysis = debateRepository.getLatestNewsAnalysis(coin);
    return res.json({ success: true, analysis, history: analysis ? [analysis] : [] });
  }

  async execAgyPrompt(req, res, body) {
    try {
      const { prompt = '', coin = 'BTC', clientMarket = null } = body || {};
      let market = clientMarket;
      if (!market) {
        market = await binanceService.getTicker24h(coin);
      }
      const response = await masterCouncil.chatWithCouncil(prompt, coin, market);
      const out = response.output || response.reply || response.text || 'Đã thực thi thành công phân tích AGY.';
      debateRepository.saveChat(coin, prompt, out);
      return res.json({
        success: true,
        coin,
        output: out
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new NewsController();
