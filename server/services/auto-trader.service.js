/**
 * Autonomous AI Trading Service (server/services/auto-trader.service.js)
 * Executes 100% genuine multi-agent debate and autonomously places paper trades
 * based on textbook risk management rules (Chapters 8, 9 & 10).
 */

const binanceService = require('./binance.service');
const masterCouncil = require('../agents/MasterCouncil');
const paperTradingService = require('./paper-trading.service');
const loggerService = require('./logger.service');

class AutoTraderService {
  /**
   * Run genuine AI council debate and autonomously open paper trade if criteria are met
   */
  async executeAutonomousTrade({
    coin = 'BTC',
    riskPercent = 1.5,
    minConfidence = 50,
    forceTrade = false,
    ttlMinutes = null,
    maxLossUsd = null,
    margin = null,
    leverage = null,
    tradingStyle = 'SCALPING'
  } = {}) {
    const startTime = Date.now();
    let targetCoin = (coin || 'BTC').toUpperCase();
    const styleUpper = (tradingStyle || 'SCALPING').toUpperCase();

    loggerService.info(`[AutoTrader] Khởi động phiên tranh luận Hội Đồng cho ${targetCoin}/USDT theo phong cách ${styleUpper}...`);

    // 2. Fetch real Binance live price & Klines for the chosen timeframe
    const ticker = await binanceService.getTicker24h(targetCoin);
    const livePrice = Number(ticker?.price) || 0;

    // 3. Conduct genuine Master Council Multi-Agent Debate (force fresh call)
    const debate = await masterCouncil.runDebate(targetCoin, ticker, true, styleUpper);
    if (!debate || !debate.master_verdict) {
      throw new Error('Hội đồng không thể hoàn tất phiên thảo luận.');
    }

    const verdict = debate.master_verdict;
    const probability = Number(verdict.probability_pct) || 50;
    const action = String(verdict.action || 'HOLD').toUpperCase();

    const isBuy = action.includes('BUY');
    const isSell = action.includes('SELL');
    // Allow execution if probability >= minConfidence, or if forceTrade is explicitly requested
    const isTradeable = Boolean(forceTrade) || ((isBuy || isSell) && probability >= Number(minConfidence)) || (probability >= Number(minConfidence));

    // Helper to clean numerical price from formatted strings
    const parseNum = (str) => {
      if (!str) return 0;
      const matched = String(str).replace(/,/g, '').match(/\d+(\.\d+)?/);
      return matched ? parseFloat(matched[0]) : 0;
    };

    let executedPosition = null;
    let executionReason = '';

    if (isTradeable && livePrice > 0) {
      let type = 'LONG';
      if (isSell) {
        type = 'SHORT';
      } else if (isBuy) {
        type = 'LONG';
      } else {
        const techSig = String(debate.technical_view?.signal || '').toUpperCase();
        type = techSig.includes('BEARISH') ? 'SHORT' : 'LONG';
      }

      const sl = parseNum(verdict.stop_loss) || (type === 'SHORT' ? livePrice * 1.015 : livePrice * 0.985);
      const tp = parseNum(verdict.take_profit) || (type === 'SHORT' ? livePrice * 0.965 : livePrice * 1.035);

      // 1. Determine recommended leverage (or use user custom leverage)
      let finalLeverage = 5;
      if (leverage && leverage !== 'AUTO' && Number(leverage) > 0) {
        finalLeverage = Number(leverage);
      } else if (debate.risk_view?.recommended_max_leverage) {
        const parsedLev = parseInt(debate.risk_view.recommended_max_leverage.replace(/\D/g, ''), 10);
        if (parsedLev > 0 && parsedLev <= 20) finalLeverage = parsedLev;
      }

      // 2. Calculate safe margin (1.5% capital rule or user custom)
      const account = paperTradingService.getAccount();
      const balance = account?.availableBalance || 10000;
      let finalMargin = 0;
      if (margin && margin !== 'AUTO' && Number(margin) > 0) {
        finalMargin = Number(margin);
      } else {
        const riskAmount = balance * (Number(riskPercent) / 100);
        const slDistPct = Math.abs(livePrice - sl) / livePrice;
        const positionSize = slDistPct > 0 ? (riskAmount / slDistPct) : (balance * 0.1);
        finalMargin = Math.min(balance * 0.2, Math.max(50, Math.round(positionSize / finalLeverage)));
      }

      // 3. Dynamic TTL (Time-To-Live based on Trading Style & Confluence)
      let finalTtl = null;
      if (ttlMinutes === 'AUTO' || ttlMinutes === undefined) {
        if (styleUpper === 'SCALPING') {
          finalTtl = probability >= 70 ? 120 : 60; // 1h - 2h for scalping
        } else if (styleUpper === 'DAY_TRADE') {
          finalTtl = probability >= 70 ? 480 : 240; // 4h - 8h for day trade
        } else {
          finalTtl = probability >= 70 ? 2880 : 1440; // 24h - 48h for swing
        }
      } else if (ttlMinutes && ttlMinutes !== 'NEVER' && Number(ttlMinutes) > 0) {
        finalTtl = Number(ttlMinutes);
      }

      // 4. Dynamic Hard Dollar Stop Loss (Based on SMC technical SL distance + 5% buffer)
      let finalMaxLossUsd = null;
      if (maxLossUsd === 'AUTO' || maxLossUsd === undefined) {
        const slDistPct = Math.abs(livePrice - sl) / livePrice;
        const expectedLossUsd = (finalMargin * finalLeverage) * slDistPct * 1.05;
        finalMaxLossUsd = Math.max(10, Math.round(expectedLossUsd * 100) / 100);
      } else if (maxLossUsd && maxLossUsd !== 'OFF' && Number(maxLossUsd) > 0) {
        finalMaxLossUsd = Number(maxLossUsd);
      }

      executedPosition = paperTradingService.openPosition({
        coin: targetCoin,
        type,
        entry_price: livePrice,
        stop_loss: Number(sl.toFixed(4)),
        take_profit: Number(tp.toFixed(4)),
        leverage: finalLeverage,
        margin: finalMargin,
        max_loss_usd: finalMaxLossUsd,
        ttl_minutes: finalTtl,
        debate_payload: debate,
        ai_verdict: `${verdict.action_label} (${probability}%)`,
        notes: `[Lệnh Tự Động Từ Hội Đồng AI Master Council - Xác suất ${probability}%]\nKỹ thuật: ${debate.technical_view?.summary}\nVĩ mô: ${debate.macro_view?.summary}\nQuản trị rủi ro: ${debate.risk_view?.advice || `Đòn bẩy ${finalLeverage}x, tỷ lệ R:R ${debate.risk_view?.risk_reward_ratio}`}\nCảnh báo: ${verdict.vital_warning}`
      });

      executionReason = `Đã tự động mở vị thế ${type} ${targetCoin} tại giá live $${livePrice} với SL: $${sl}, TP: $${tp}.`;
      loggerService.alert(`[AutoTrader] ${executionReason}`);
    } else {
      executionReason = isTradeable
        ? `Giá live Binance không hợp lệ ($${livePrice}).`
        : `Phán quyết là '${verdict.action_label}' (Xác suất ${probability}% < ngưỡng yêu cầu ${minConfidence}%). Không mở lệnh mạo hiểm.`;
      loggerService.info(`[AutoTrader] ${executionReason}`);
    }

    return {
      success: true,
      executed: !!executedPosition,
      coin: targetCoin,
      livePrice,
      verdict,
      position: executedPosition,
      debate,
      token_metrics: debate.token_metrics || null,
      executionReason,
      latencyMs: Date.now() - startTime
    };
  }
}

module.exports = new AutoTraderService();
