const masterCouncil = require('../agents/MasterCouncil');
const debateRepository = require('../models/DebateRepository');
const binanceService = require('../services/binance.service');
const marketScreenerService = require('../services/market-screener.service');
const telegramAlertService = require('../services/telegram-alert.service');
const nlpStrategyService = require('../services/nlp-strategy.service');

class AiTraderController {
  async runCouncilAnalysis(req, res, body) {
    try {
      const { coin = 'BTC', clientMarket = null, forceRefresh = false, tradingStyle = 'SCALPING' } = body || {};
      let market = clientMarket;
      if (!market) {
        market = await binanceService.getTicker24h(coin);
      }
      const debate = await masterCouncil.runDebate(coin, market, forceRefresh, tradingStyle);
      return res.json(debate);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  getDebates(req, res, query) {
    const coin = query.coin || null;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const debates = debateRepository.getAiDebates(coin, limit);
    return res.json({ debates });
  }

  async evaluatePrediction(req, res, body) {
    try {
      const { coin = 'BTC', hypothesis = '', userAction = 'LONG', clientMarket = null } = body || {};
      let market = clientMarket;
      if (!market) {
        market = await binanceService.getTicker24h(coin);
      }
      const evaluation = await masterCouncil.evaluateUserPrediction(coin, hypothesis, userAction, market);
      return res.json({ success: true, evaluation });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  getPredictions(req, res, query) {
    const coin = query.coin || null;
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const predictions = debateRepository.getUserPredictions(coin, limit);
    return res.json({ predictions });
  }

  async chatCouncil(req, res, body) {
    try {
      const { prompt, coin = 'BTC', clientMarket = null, sessionId = 'default' } = body || {};
      if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

      let market = clientMarket;
      if (!market) {
        market = await binanceService.getTicker24h(coin);
      }
      const response = await masterCouncil.chatWithCouncil(prompt, coin, market, sessionId);
      return res.json(response);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  getChats(req, res, query) {
    const coin = query.coin || null;
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const chats = debateRepository.getChats(coin, limit);
    return res.json({ success: true, history: chats, chats });
  }

  clearChats(req, res, body) {
    const coin = (body && body.coin) || null;
    debateRepository.clearChats(coin);
    return res.json({ success: true, message: 'Chat history cleared' });
  }

  async executeAutoTrade(req, res, body) {
    try {
      const autoTraderService = require('../services/auto-trader.service');
      const {
        coin = null,
        riskPercent = 1.5,
        minConfidence = 50,
        forceTrade = false,
        ttlMinutes = null,
        maxLossUsd = null,
        margin = null,
        leverage = null,
        tradingStyle = 'SCALPING'
      } = body || {};
      const result = await autoTraderService.executeAutonomousTrade({
        coin,
        riskPercent,
        minConfidence,
        forceTrade,
        ttlMinutes,
        maxLossUsd,
        margin,
        leverage,
        tradingStyle
      });
      return res.json(result);
    } catch (err) {
      console.error('[AiTraderController] Auto trade error:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- 24/7 Market Screener Endpoints ---
  async getScreenerLive(req, res) {
    try {
      const results = marketScreenerService.getLatestResults();
      return res.json({ success: true, ...results });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async scanScreenerNow(req, res) {
    try {
      const results = await marketScreenerService.runScreenerScan();
      return res.json({ success: true, ...results });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // --- NLP Strategy Parser Endpoints ---
  async parseNlpStrategy(req, res, body) {
    try {
      const { prompt = '' } = body || {};
      const result = await nlpStrategyService.parseUserStrategy(prompt);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // --- Telegram Alert Endpoints ---
  getTelegramStatus(req, res) {
    const status = telegramAlertService.getStatus();
    return res.json({ success: true, ...status });
  }

  updateTelegramConfig(req, res, body) {
    const { token = '', chatId = '' } = body || {};
    const status = telegramAlertService.updateConfig(token, chatId);
    return res.json({ success: true, ...status, message: 'Cấu hình Telegram đã được lưu' });
  }

  async sendTestTelegramAlert(req, res) {
    try {
      const success = await telegramAlertService.sendTestAlert();
      return res.json({
        success,
        message: success ? 'Tin nhắn cảnh báo thử nghiệm đã gửi thành công tới Telegram!' : 'Không thể gửi (Vui lòng kiểm tra Token & ChatID).'
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // --- Daily Pre-Market Briefing & Post-Market Review Endpoints ---
  async getDailyBriefing(req, res) {
    try {
      const dailyBriefingService = require('../services/daily-briefing.service');
      const briefing = await dailyBriefingService.getDailyBriefing();
      return res.json(briefing);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async getDailyReview(req, res, query) {
    try {
      const dailyBriefingService = require('../services/daily-briefing.service');
      const date = (query && query.date) || null;
      const review = await dailyBriefingService.getDailyReview(date);
      return res.json(review);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async saveDailyReviewToNote(req, res, body) {
    try {
      const dailyBriefingService = require('../services/daily-briefing.service');
      const result = await dailyBriefingService.saveReviewToNote(body || {});
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new AiTraderController();
