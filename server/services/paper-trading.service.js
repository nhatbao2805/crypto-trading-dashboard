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
    const closed = paperTradeRepository.closePosition(id, exitPrice, closeReason);

    // Automatic 2-way sync to Trade Journal
    try {
      const journalRepo = require('../models/JournalRepository');
      journalRepo.createEntry({
        date: closed.date || new Date().toISOString().split('T')[0],
        coin: closed.coin,
        type: closed.type,
        entry_price: closed.entry_price,
        exit_price: closed.exit_price,
        stop_loss: closed.stop_loss || 0,
        take_profit: closed.take_profit || 0,
        position_size: Number(Number(closed.position_size || (closed.margin * closed.leverage)).toFixed(2)),
        pnl_amount: closed.pnl_amount || 0,
        pnl_percent: closed.pnl_percent || 0,
        status: closed.pnl_amount > 0 ? 'WIN' : (closed.pnl_amount < 0 ? 'LOSS' : 'BREAKEVEN'),
        notes: `[Tự động đồng bộ từ Sàn Paper Trading - Khớp lệnh lúc ${new Date().toLocaleString('vi-VN')} - Lý do: ${closeReason}]\n${closed.notes || ''}`.trim(),
        emotions: closed.pnl_amount >= 0 ? 'Confident' : (closeReason === 'STOP_LOSS' ? 'Disciplined' : 'Calm')
      });
    } catch (err) {
      console.warn('[PaperTradingService] Auto sync to journal error:', err.message);
    }

    return closed;
  }

  getHistory(filters = {}) {
    return paperTradeRepository.getHistory(filters);
  }

  /**
   * Evaluates all open paper trading positions against real-time prices
   * Automatically triggers Take Profit or Stop Loss
   */
  evaluateOpenPositionsAgainstLivePrices(livePrices = {}) {
    const openPositions = this.getOpenPositions();
    if (!openPositions || openPositions.length === 0) return [];

    const closedList = [];
    for (const pos of openPositions) {
      const coin = (pos.coin || 'BTC').toUpperCase();
      const currentPrice = Number(livePrices[coin] || livePrices[`${coin}USDT`]);
      if (!currentPrice || currentPrice <= 0) continue;

      // Sanity check: Ignore outlier prices that deviate > 20% from entry in a single tick
      if (pos.entry_price > 0 && Math.abs(currentPrice - Number(pos.entry_price)) / Number(pos.entry_price) > 0.20) {
        continue;
      }

      const isLong = pos.type === 'LONG';
      const isShort = pos.type === 'SHORT';
      const sl = pos.stop_loss ? Number(pos.stop_loss) : null;
      const tp = pos.take_profit ? Number(pos.take_profit) : null;

      let triggeredReason = null;
      let exitPrice = currentPrice;

      // 1. Kiểm tra hết hạn thời gian giữ lệnh (TTL Time-Stop)
      if (pos.expires_at && new Date() >= new Date(pos.expires_at)) {
        triggeredReason = 'EXPIRED_TTL';
        exitPrice = currentPrice;
      }

      // 2. Kiểm tra chạm ngưỡng lỗ tối đa USD (Hard Capital Stop chống cháy tài khoản)
      const currentPnL = this.calculatePositionPnL(pos, currentPrice);
      if (!triggeredReason && pos.max_loss_usd && currentPnL.pnlAmount <= -Math.abs(Number(pos.max_loss_usd))) {
        triggeredReason = 'HARD_STOP_LOSS';
        exitPrice = currentPrice;
      }

      // 3. Kiểm tra SL / TP kỹ thuật SMC thông thường
      if (!triggeredReason) {
        if (isLong) {
          if (sl && currentPrice <= sl) {
            triggeredReason = 'STOP_LOSS';
            exitPrice = sl;
          } else if (tp && currentPrice >= tp) {
            triggeredReason = 'TAKE_PROFIT';
            exitPrice = tp;
          }
        } else if (isShort) {
          if (sl && currentPrice >= sl) {
            triggeredReason = 'STOP_LOSS';
            exitPrice = sl;
          } else if (tp && currentPrice <= tp) {
            triggeredReason = 'TAKE_PROFIT';
            exitPrice = tp;
          }
        }
      }

      if (triggeredReason) {
        const closed = this.closePosition(pos.id, exitPrice, triggeredReason);
        closedList.push(closed);
      } else {
        // Dynamic Breakeven Stop Loss (Chương 9: Bảo toàn vốn khi có lãi >= +2.0%)
        const pnl = this.calculatePositionPnL(pos, currentPrice);
        if (pnl.pnlPercent >= 2.0) {
          const entry = Number(pos.entry_price);
          if (isLong && (!sl || sl < entry)) {
            paperTradeRepository.updateStopLoss(pos.id, entry);
          } else if (isShort && (!sl || sl > entry)) {
            paperTradeRepository.updateStopLoss(pos.id, entry);
          }
        }
      }
    }
    return closedList;
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

  /**
   * Continuous high-frequency background monitor (every 3s)
   * Ensures Stop Loss and Take Profit trigger in real time
   */
  startContinuousMonitor(intervalMs = 3000) {
    if (this._monitorInterval) return;
    this._monitorInterval = setInterval(async () => {
      try {
        const openPos = this.getOpenPositions();
        if (!openPos || openPos.length === 0) return;

        const binance = require('./binance.service');
        const priceMap = {};
        for (const pos of openPos) {
          const coin = pos.coin.toUpperCase();
          if (!priceMap[coin]) {
            const ticker = await binance.getTicker24h(coin);
            if (ticker?.price) {
              priceMap[coin] = Number(ticker.price);
            }
          }
        }
        this.evaluateOpenPositionsAgainstLivePrices(priceMap);
      } catch (_) {}
    }, intervalMs);
  }

  /**
   * Get all open positions enriched with real-time live metrics:
   * current live price, PnL %, distance to SL %, distance to TP %
   */
  async getOpenPositionsLiveMetrics() {
    const openPositions = this.getOpenPositions();
    if (!openPositions || openPositions.length === 0) {
      return {
        success: true,
        positions: [],
        totalUnrealizedPnl: 0,
        count: 0,
        timestamp: new Date().toISOString()
      };
    }

    const binance = require('./binance.service');
    let totalUnrealizedPnl = 0;
    const enriched = await Promise.all(openPositions.map(async (pos) => {
      const coin = pos.coin.toUpperCase();
      const ticker = await binance.getTicker24h(coin);
      const currentPrice = Number(ticker?.price) || Number(pos.entry_price);
      const pnlInfo = this.calculatePositionPnL(pos, currentPrice);
      totalUnrealizedPnl += pnlInfo.pnlAmount;

      const isLong = pos.type === 'LONG';
      const sl = pos.stop_loss ? Number(pos.stop_loss) : null;
      const tp = pos.take_profit ? Number(pos.take_profit) : null;

      let distanceToStopLossPercent = null;
      let isNearStopLoss = false;
      if (sl && currentPrice > 0) {
        distanceToStopLossPercent = isLong
          ? Number((((currentPrice - sl) / currentPrice) * 100).toFixed(2))
          : Number((((sl - currentPrice) / currentPrice) * 100).toFixed(2));
        isNearStopLoss = distanceToStopLossPercent <= 1.0;
      }

      let distanceToTakeProfitPercent = null;
      if (tp && currentPrice > 0) {
        distanceToTakeProfitPercent = isLong
          ? Number((((tp - currentPrice) / currentPrice) * 100).toFixed(2))
          : Number((((currentPrice - tp) / currentPrice) * 100).toFixed(2));
      }

      return {
        ...pos,
        currentLivePrice: currentPrice,
        unrealizedPnlAmount: pnlInfo.pnlAmount,
        unrealizedPnlPercent: pnlInfo.pnlPercent,
        distanceToStopLossPercent,
        distanceToTakeProfitPercent,
        isNearStopLoss,
        isRiskFree: isLong ? (sl && sl >= pos.entry_price) : (sl && sl <= pos.entry_price)
      };
    }));

    return {
      success: true,
      positions: enriched,
      totalUnrealizedPnl: Number(totalUnrealizedPnl.toFixed(2)),
      count: enriched.length,
      timestamp: new Date().toISOString()
    };
  }
}

const serviceInstance = new PaperTradingService();
serviceInstance.startContinuousMonitor(3000);
module.exports = serviceInstance;
