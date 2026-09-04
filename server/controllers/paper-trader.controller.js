const paperTradingService = require('../services/paper-trading.service');

class PaperTraderController {
  getAccount(req, res) {
    const account = paperTradingService.getAccount();
    return res.json({ account });
  }

  resetAccount(req, res, body) {
    try {
      const capital = Number(body?.initialCapital) || 10000.0;
      const account = paperTradingService.resetAccount(capital);
      return res.json({ success: true, account });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  getPositions(req, res, query) {
    const coin = query.coin || null;
    const positions = paperTradingService.getOpenPositions(coin);
    return res.json({ positions });
  }

  async getLivePositions(req, res) {
    try {
      const data = await paperTradingService.getOpenPositionsLiveMetrics();
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  openPosition(req, res, body) {
    try {
      const position = paperTradingService.openPosition(body);
      const account = paperTradingService.getAccount();
      return res.status(201).json({ success: true, position, account });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  closePosition(req, res, params, body) {
    try {
      const { exitPrice, closeReason = 'MANUAL' } = body || {};
      if (!exitPrice || Number(exitPrice) <= 0) {
        return res.status(400).json({ error: 'Giá đóng lệnh (exitPrice) không hợp lệ' });
      }

      const closedPosition = paperTradingService.closePosition(params.id, exitPrice, closeReason);
      const account = paperTradingService.getAccount();
      return res.json({ success: true, position: closedPosition, account });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  getHistory(req, res, query) {
    const history = paperTradingService.getHistory(query);
    return res.json(history);
  }
}

module.exports = new PaperTraderController();
