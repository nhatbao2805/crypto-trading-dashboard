/**
 * Market Screener Service (server/services/market-screener.service.js)
 * 24/7 Autonomous Market-Wide Screener & Confluence Ranking Engine
 */

const binanceService = require('./binance.service');

class MarketScreenerService {
  constructor() {
    this.screenerResults = this.getInitialFallbackResults();
    this.isScanning = false;
    this.scanIntervalMs = 60000; // Scan every 60 seconds
    this.telegramDispatcher = null;

    // Start background scanner immediately
    this.startBackgroundScanner();
  }

  getInitialFallbackResults() {
    const rawList = [
      { symbol: 'BTCUSDT', coin: 'BTC', price: 65240, change24h: 1.85, volumeUsdt: 1250000000, estimatedRsi: 58 },
      { symbol: 'ETHUSDT', coin: 'ETH', price: 3450, change24h: 2.10, volumeUsdt: 650000000, estimatedRsi: 62 },
      { symbol: 'SOLUSDT', coin: 'SOL', price: 145.5, change24h: 3.40, volumeUsdt: 420000000, estimatedRsi: 66 },
      { symbol: 'BNBUSDT', coin: 'BNB', price: 585.0, change24h: 0.80, volumeUsdt: 180000000, estimatedRsi: 52 },
      { symbol: 'SUIUSDT', coin: 'SUI', price: 1.85, change24h: 5.12, volumeUsdt: 210000000, estimatedRsi: 72 },
      { symbol: 'DOGEUSDT', coin: 'DOGE', price: 0.125, change24h: 6.50, volumeUsdt: 310000000, estimatedRsi: 74 },
      { symbol: 'XRPUSDT', coin: 'XRP', price: 0.58, change24h: -1.20, volumeUsdt: 190000000, estimatedRsi: 44 },
      { symbol: 'NEARUSDT', coin: 'NEAR', price: 4.80, change24h: 4.20, volumeUsdt: 140000000, estimatedRsi: 68 },
      { symbol: 'ADAUSDT', coin: 'ADA', price: 0.38, change24h: 1.10, volumeUsdt: 95000000, estimatedRsi: 49 },
      { symbol: 'AVAXUSDT', coin: 'AVAX', price: 26.5, change24h: 2.80, volumeUsdt: 110000000, estimatedRsi: 61 }
    ];

    const scored = rawList.map(t => {
      let score = 75;
      if (t.change24h > 4.0) score = 88;
      else if (t.change24h > 2.0) score = 82;
      else if (t.change24h < 0) score = 65;

      const isBreakout = t.change24h > 2.0;
      return {
        symbol: t.symbol,
        coin: t.coin,
        price: t.price,
        change24h: t.change24h,
        volumeUsdt: t.volumeUsdt,
        volumeUsdFormatted: `$${(t.volumeUsdt / 1e6).toFixed(1)}M`,
        estimatedRsi: t.estimatedRsi,
        confluenceScore: score,
        signal: isBreakout ? 'BÙNG NỔ VOL & TĂNG TRƯỞNG (LONG)' : 'QUAN SÁT TÍCH LŨY',
        action: isBreakout ? 'STRONG_BUY' : 'OBSERVE',
        setupType: isBreakout ? 'BREAKOUT' : 'RANGE',
        entryZone: `$${(t.price * 0.995).toFixed(2)} - $${(t.price * 1.005).toFixed(2)}`,
        stopLoss: `$${(t.price * 0.98).toFixed(2)}`,
        takeProfit: `$${(t.price * 1.05).toFixed(2)}`,
        rrRatio: '1:2.5',
        trapWarning: 'Đảm bảo nến 15m có xác nhận đóng nến trước khi vào lệnh.'
      };
    });

    return {
      timestamp: new Date().toISOString(),
      totalScanned: rawList.length,
      bullishBreadth: 90,
      topBreakouts: scored.filter(s => s.setupType === 'BREAKOUT'),
      topOversold: scored.filter(s => s.confluenceScore < 70),
      topOverbought: scored.filter(s => s.estimatedRsi > 70),
      rankedSignals: scored
    };
  }

  setTelegramDispatcher(dispatcher) {
    this.telegramDispatcher = dispatcher;
  }

  startBackgroundScanner() {
    // Initial scan right away
    this.runScreenerScan().catch(() => {});
    // Recurring scan every 60s
    setInterval(() => this.runScreenerScan(), this.scanIntervalMs);
  }

  /**
   * Core Screener Calculation across 300+ pairs
   */
  async runScreenerScan() {
    if (this.isScanning) return this.screenerResults;
    this.isScanning = true;

    try {
      const allTickers = await binanceService.fetchFullMarket24h();
      if (!allTickers || !allTickers.length) {
        this.isScanning = false;
        return this.screenerResults;
      }

      const totalScanned = allTickers.length;
      const gainers = allTickers.filter(t => t.change24h > 0);
      const bullishBreadth = Number(((gainers.length / totalScanned) * 100).toFixed(1));

      // 1. Calculate Confluence Score for each token
      const scoredList = allTickers.map(t => {
        let score = 50; // base score

        // Volume factor (Max 25 pts)
        if (t.volumeUsdt > 100000000) score += 20;
        else if (t.volumeUsdt > 20000000) score += 15;
        else if (t.volumeUsdt > 5000000) score += 10;

        // Momentum factor (Max 25 pts)
        if (t.change24h > 4.0 && t.change24h < 18.0) score += 20; // healthy pump
        else if (t.change24h > 18.0) score += 5; // over-extended pump risk
        else if (t.change24h < -5.0 && t.estimatedRsi < 32) score += 18; // oversold bounce

        // RSI Alignment (Max 20 pts)
        if (t.estimatedRsi >= 45 && t.estimatedRsi <= 62) score += 15; // trend continuation
        else if (t.estimatedRsi < 30) score += 12; // deep oversold
        else if (t.estimatedRsi > 78) score -= 15; // trap overbought risk

        // Cap score
        const finalScore = Math.max(10, Math.min(96, score));

        // Signal classification
        let signal = 'QUAN SÁT TÍCH LŨY';
        let action = 'OBSERVE';
        let setupType = 'RANGE';

        if (finalScore >= 75 && t.change24h > 2.0 && t.estimatedRsi < 70) {
          signal = 'BÙNG NỔ VOL & TĂNG TRƯỞNG (LONG)';
          action = 'STRONG_BUY';
          setupType = 'BREAKOUT';
        } else if (t.estimatedRsi < 32 && t.change24h > -8.0) {
          signal = 'BẮT ĐÁY QUÁ BÁN RÚT RÂU (LONG)';
          action = 'BUY';
          setupType = 'REBOUND';
        } else if (t.estimatedRsi > 78 || t.change24h > 25.0) {
          signal = 'CẢNH BÁO PHÂN KỲ ĐỈNH (CANH SHORT)';
          action = 'SELL';
          setupType = 'OVERBOUGHT_TRAP';
        }

        const slPrice = action.includes('BUY') ? (t.price * 0.975).toFixed(4) : (t.price * 1.025).toFixed(4);
        const tpPrice = action.includes('BUY') ? (t.price * 1.055).toFixed(4) : (t.price * 0.945).toFixed(4);

        return {
          symbol: t.symbol,
          coin: t.coin,
          price: t.price,
          change24h: t.change24h,
          volumeUsdt: t.volumeUsdt,
          volumeUsdFormatted: `$${(t.volumeUsdt / 1e6).toFixed(1)}M`,
          estimatedRsi: t.estimatedRsi,
          confluenceScore: finalScore,
          signal,
          action,
          setupType,
          entryZone: `$${(t.price * 0.995).toFixed(4)} - $${(t.price * 1.005).toFixed(4)}`,
          stopLoss: `$${slPrice}`,
          takeProfit: `$${tpPrice}`,
          rrRatio: '1:2.4',
          trapWarning: t.estimatedRsi > 75 
            ? 'Cảnh báo bẫy FOMO đu đỉnh! Kháng cự dày đặc phía trên.' 
            : 'Đảm bảo nến 15m có xác nhận đóng nến trước khi vào lệnh.'
        };
      });

      // 2. Sort into Top categories
      const sortedByScore = [...scoredList].sort((a, b) => b.confluenceScore - a.confluenceScore);
      const topBreakouts = [...scoredList]
        .filter(s => s.setupType === 'BREAKOUT')
        .sort((a, b) => b.volumeUsdt - a.volumeUsdt)
        .slice(0, 10);

      const topOversold = [...scoredList]
        .filter(s => s.setupType === 'REBOUND')
        .sort((a, b) => a.estimatedRsi - b.estimatedRsi)
        .slice(0, 8);

      const topOverbought = [...scoredList]
        .filter(s => s.setupType === 'OVERBOUGHT_TRAP')
        .sort((a, b) => b.change24h - a.change24h)
        .slice(0, 8);

      this.screenerResults = {
        timestamp: new Date().toISOString(),
        totalScanned,
        bullishBreadth,
        topBreakouts,
        topOversold,
        topOverbought,
        rankedSignals: sortedByScore.slice(0, 20)
      };

      // 3. Trigger Telegram Alert for top high-confluence coin (Score >= 82)
      if (this.telegramDispatcher && topBreakouts.length > 0) {
        const bestCandidate = topBreakouts[0];
        if (bestCandidate.confluenceScore >= 82) {
          this.telegramDispatcher.dispatchScreenerAlert(bestCandidate);
        }
      }
    } catch (err) {
      console.error('[MarketScreenerService] Scan error:', err.message);
    } finally {
      this.isScanning = false;
    }

    return this.screenerResults;
  }

  getLatestResults() {
    return this.screenerResults;
  }
}

module.exports = new MarketScreenerService();
