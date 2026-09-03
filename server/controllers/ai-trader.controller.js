const masterCouncil = require('../agents/MasterCouncil');
const debateRepository = require('../models/DebateRepository');
const binanceService = require('../services/binance.service');
const marketScreenerService = require('../services/market-screener.service');
const telegramAlertService = require('../services/telegram-alert.service');
const nlpStrategyService = require('../services/nlp-strategy.service');

class AiTraderController {
  async runCouncilAnalysis(req, res, body) {
    try {
      const { coin = 'BTC', clientMarket = null, forceRefresh = false } = body || {};
      let market = clientMarket;
      if (!market) {
        market = await binanceService.getTicker24h(coin);
      }
      const debate = await masterCouncil.runDebate(coin, market, forceRefresh);
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
    const chats = debateRepository.getAgyChats(coin, limit);
    return res.json({ chats });
  }

  clearChats(req, res, body) {
    const coin = (body && body.coin) || null;
    debateRepository.clearAgyChats(coin);
    return res.json({ success: true, message: 'Chat history cleared' });
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
}

module.exports = new AiTraderController();
