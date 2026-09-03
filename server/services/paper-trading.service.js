const paperTradeRepository = require('../models/PaperTradeRepository');

class PaperTradingService {
  getAccount() {
    return paperTradeRepository.getAccount();
  }

  resetAccount(initialCapital = 10000.0) {
    return paperTradeRepository.resetAccount(initialCapital);
  }

  getOpenPositions(coin = null) {
    return paperTradeRepository.getOpenPositions(coin);
  }

  openPosition(data) {
    return paperTradeRepository.openPosition(data);
  }

  closePosition(id, exitPrice, closeReason = 'MANUAL') {
    return paperTradeRepository.closePosition(id, exitPrice, closeReason);
  }

  getHistory(filters = {}) {
    return paperTradeRepository.getHistory(filters);
  }

  calculatePositionPnL(position, currentPrice) {
    const isShort = position.type === 'SHORT';
    const entry = Number(position.entry_price);
    const curr = Number(currentPrice);
    let pnlPct = 0;

    if (entry > 0 && curr > 0) {
      const priceDiff = isShort ? (entry - curr) : (curr - entry);
      pnlPct = (priceDiff / entry) * 100 * position.leverage;
    }

    const pnlAmount = position.margin * (pnlPct / 100);
    return {
      pnlPercent: Number(pnlPct.toFixed(2)),
      pnlAmount: Number(pnlAmount.toFixed(2))
    };
  }
}

module.exports = new PaperTradingService();
