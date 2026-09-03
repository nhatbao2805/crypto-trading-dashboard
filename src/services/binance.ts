// --- BINANCE WEBSOCKET & REST PRICE SERVICE ---
import { BinanceTicker } from "../types";

export const TRACKED_COINS = ["btc", "eth", "sol", "bnb", "sui", "doge", "xrp", "near", "ada", "avax"];

type PriceCallback = (coin: string, price: number, change24h: number) => void;

class BinanceService {
  private ws: WebSocket | null = null;
  private listeners: Set<PriceCallback> = new Set();
  private prices: Record<string, number> = {};
  private changes: Record<string, number> = {};
  private pollInterval: any = null;
  private isConnecting: boolean = false;

  constructor() {
    this.init();
  }

  public subscribe(cb: PriceCallback) {
    this.listeners.add(cb);
    // Send current cached prices immediately
    Object.keys(this.prices).forEach((coin) => {
      cb(coin, this.prices[coin], this.changes[coin] || 0);
    });
    return () => {
      this.listeners.delete(cb);
    };
  }

  public getPrices(): Record<string, number> {
    return { ...this.prices };
  }

  public getPrice(coin: string): number | null {
    return this.prices[coin.toUpperCase()] || null;
  }

  private notify(coin: string, price: number, change24h: number) {
    const upper = coin.toUpperCase();
    this.prices[upper] = price;
    this.changes[upper] = change24h;
    this.listeners.forEach((cb) => {
      try {
        cb(upper, price, change24h);
      } catch (err) {
        console.error("Listener error:", err);
      }
    });
  }

  public async fetchRestTickers() {
    for (const coin of TRACKED_COINS) {
      const symbol = `${coin.toUpperCase()}USDT`;
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
        if (res.ok) {
          const data = await res.json();
          const price = parseFloat(data.lastPrice);
          const change = parseFloat(data.priceChangePercent);
          this.notify(coin, price, change);
        } else {
          this.fetchFallback(coin);
        }
      } catch {
        this.fetchFallback(coin);
      }
    }
  }

  private async fetchFallback(coin: string) {
    try {
      const res = await fetch(`/api/market/ticker?coin=${coin.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ticker) {
          this.notify(coin, data.ticker.price, data.ticker.change24h || 0);
        }
      }
    } catch {}
  }

  public connectWebSocket() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) return;
    this.isConnecting = true;

    try {
      const streams = TRACKED_COINS.map((c) => `${c}usdt@ticker`).join("/");
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        console.log("⚡ Connected to Binance Live WebSocket Stream");
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg && msg.data) {
            const d = msg.data;
            const symbol = d.s.toLowerCase().replace("usdt", "");
            const price = parseFloat(d.c);
            const change = parseFloat(d.P);
            this.notify(symbol, price, change);
          }
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      this.ws.onerror = (err) => {
        this.isConnecting = false;
        console.warn("Binance WS error:", err);
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        console.log("Binance WS closed, reconnecting in 3s...");
        setTimeout(() => this.connectWebSocket(), 3000);
      };
    } catch (e) {
      this.isConnecting = false;
      console.warn("WebSocket init error:", e);
    }
  }

  private init() {
    this.fetchRestTickers();
    this.connectWebSocket();
    this.pollInterval = setInterval(() => this.fetchRestTickers(), 6000);
  }

  public destroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const binanceService = new BinanceService();

export function formatCoinPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 1) {
    return price.toFixed(4);
  } else {
    return price.toFixed(6);
  }
}
