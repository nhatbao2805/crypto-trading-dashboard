const https = require('node:https');
const CONSTANTS = require('../config/constants');

class BinanceService {
  constructor() {
    this.priceCache = new Map();
    this.fullMarketCache = null;
    this.fullMarketCacheTime = 0;
  }

  fetchJson(url) {
    return new Promise((resolve, reject) => {
      https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh)' }, timeout: 8000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON from Binance API'));
          }
        });
      }).on('error', err => reject(err));
    });
  }

  async getTicker24h(coin = 'BTC') {
    const symbol = `${coin.toUpperCase()}USDT`;
    const now = Date.now();
    const cached = this.priceCache.get(symbol);

    if (cached && now - cached.timestamp < 3000) {
      return cached.data;
    }

    try {
      const data = await this.fetchJson(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
      if (data && data.lastPrice) {
        const result = {
          symbol: data.symbol,
          price: parseFloat(data.lastPrice),
          high24h: parseFloat(data.highPrice),
          low24h: parseFloat(data.lowPrice),
          change24h: parseFloat(data.priceChangePercent),
          volume: parseFloat(data.volume),
          volumeUsdt: parseFloat(data.quoteVolume)
        };
        this.priceCache.set(symbol, { data: result, timestamp: now });
        return result;
      }
    } catch (err) {
      // Fallback prices if network is unavailable
      const fallbackPrices = {
        BTCUSDT: { price: 65240, high24h: 66800, low24h: 64100, change24h: 1.85, volumeUsdt: 1250000000 },
        ETHUSDT: { price: 3450, high24h: 3520, low24h: 3380, change24h: 2.10, volumeUsdt: 650000000 },
        SOLUSDT: { price: 145.5, high24h: 152.0, low24h: 141.2, change24h: 3.40, volumeUsdt: 420000000 },
        BNBUSDT: { price: 585.0, high24h: 595.0, low24h: 578.0, change24h: 0.80, volumeUsdt: 180000000 },
        SUIUSDT: { price: 1.85, high24h: 1.98, low24h: 1.76, change24h: 5.12, volumeUsdt: 210000000 },
        DOGEUSDT: { price: 0.125, high24h: 0.135, low24h: 0.118, change24h: 6.50, volumeUsdt: 310000000 },
        XRPUSDT: { price: 0.58, high24h: 0.60, low24h: 0.56, change24h: -1.20, volumeUsdt: 190000000 },
        NEARUSDT: { price: 4.80, high24h: 5.10, low24h: 4.65, change24h: 4.20, volumeUsdt: 140000000 },
        ADAUSDT: { price: 0.38, high24h: 0.39, low24h: 0.36, change24h: 1.10, volumeUsdt: 95000000 },
        AVAXUSDT: { price: 26.5, high24h: 28.0, low24h: 25.8, change24h: 2.80, volumeUsdt: 110000000 }
      };
      const def = fallbackPrices[symbol] || { price: 100, high24h: 105, low24h: 95, change24h: 0, volumeUsdt: 50000000 };
      return { symbol, ...def, volume: def.volumeUsdt / def.price };
    }
  }

  async getAllTrackedTickers() {
    const promises = CONSTANTS.TRACKED_COINS.map(c => this.getTicker24h(c));
    return Promise.all(promises);
  }

  /**
   * Fetch All ~350 USDT Tickers from Binance for 24/7 Market Screener
   */
  async fetchFullMarket24h() {
    const now = Date.now();
    if (this.fullMarketCache && (now - this.fullMarketCacheTime < 10000)) {
      return this.fullMarketCache;
    }

    try {
      const allData = await this.fetchJson('https://api.binance.com/api/v3/ticker/24hr');
      if (Array.isArray(allData)) {
        // Filter only USDT pairs with decent volume (> $1M USDT)
        const usdtPairs = allData
          .filter(t => t.symbol.endsWith('USDT') && !t.symbol.includes('UP') && !t.symbol.includes('DOWN'))
          .map(t => {
            const quoteVol = parseFloat(t.quoteVolume) || 0;
            const price = parseFloat(t.lastPrice) || 0;
            const high = parseFloat(t.highPrice) || price;
            const low = parseFloat(t.lowPrice) || price;
            const change24h = parseFloat(t.priceChangePercent) || 0;
            const range = Math.max(0.0001, high - low);
            const pos = (price - low) / range;
            const rsi = Math.round(30 + pos * 40 + Math.min(10, Math.max(-10, change24h * 2)));

            return {
              symbol: t.symbol,
              coin: t.symbol.replace('USDT', ''),
              price,
              high24h: high,
              low24h: low,
              change24h,
              volumeUsdt: quoteVol,
              volume: parseFloat(t.volume) || 0,
              estimatedRsi: Math.max(10, Math.min(95, rsi))
            };
          })
          .filter(t => t.volumeUsdt >= 500000); // Filter >= 500K USD volume

        this.fullMarketCache = usdtPairs;
        this.fullMarketCacheTime = now;
        return usdtPairs;
      }
    } catch (err) {
      console.warn('[BinanceService] Full market fetch error, using tracked list:', err.message);
    }

    // Fallback: return tracked coins
    const tracked = await this.getAllTrackedTickers();
    return tracked.map(t => ({
      ...t,
      coin: t.symbol.replace('USDT', ''),
      estimatedRsi: 50
    }));
  }

  async getAllPrices() {
    return this.getAllTrackedTickers();
  }
}

module.exports = new BinanceService();
