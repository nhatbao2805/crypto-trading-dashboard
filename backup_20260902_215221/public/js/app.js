// --- APP STATE, GLOBAL CONTROLLERS & REAL-TIME BINANCE WEBSOCKET TICKER ---

let currentTab = 'tab-theory';
let binanceWs = null;
const previousPrices = {};

function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));

  const targetPane = document.getElementById(tabId);
  const targetBtn = document.getElementById(`btn-${tabId}`);
  if (targetPane) targetPane.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');

  // Trigger tab-specific refresh
  if (tabId === 'tab-theory') {
    if (typeof loadTheoryTOC === 'function' && !window._theoryLoaded) {
      loadTheoryTOC();
    }
  } else if (tabId === 'tab-practice') {
    if (typeof initPracticeModule === 'function') {
      initPracticeModule();
    }
  } else if (tabId === 'tab-journal') {
    if (typeof loadJournalEntries === 'function') {
      loadJournalEntries();
    }
  } else if (tabId === 'tab-news') {
    // news tab ready
  }
}

// Modal Helpers
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  else if (type === 'error') icon = '❌';
  else if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// --- REAL-TIME BINANCE TICKER ENGINE (WEBSOCKET + REST FALLBACK) ---
const TRACKED_COINS = ['btc', 'eth', 'sol', 'bnb', 'sui', 'doge', 'xrp', 'near', 'ada', 'avax'];
window.liveBinancePrices = window.liveBinancePrices || {};

function formatCoinPrice(price) {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 1) {
    return price.toFixed(4);
  } else {
    return price.toFixed(6);
  }
}

function updateTickerElement(coinKey, price, change24h) {
  const coinUpper = coinKey.toUpperCase();
  window.liveBinancePrices[coinUpper] = price;

  const el = document.getElementById(`ticker-${coinKey.toLowerCase()}`);
  const box = document.getElementById(`ticker-box-${coinKey.toLowerCase()}`);
  
  if (el) {
    const prev = previousPrices[coinKey];
    const isPos = change24h >= 0;
    const sign = isPos ? '+' : '';
    const formattedPrice = formatCoinPrice(price);

    el.innerHTML = `$${formattedPrice} <span class="${isPos ? 'pos' : 'neg'}">(${sign}${change24h.toFixed(2)}%)</span>`;

    if (box && prev !== undefined && prev !== price) {
      box.classList.remove('tick-flash-up', 'tick-flash-down');
      void box.offsetWidth; // Trigger DOM reflow to restart CSS animation
      if (price > prev) {
        box.classList.add('tick-flash-up');
      } else {
        box.classList.add('tick-flash-down');
      }
    }
  }

  previousPrices[coinKey] = price;

  // Real-time update live trade profits if Journal tab is active
  if (typeof updateOpenTradesLivePnL === 'function') {
    updateOpenTradesLivePnL();
  }
}

// 1. Initial Quick Fetch via REST API
async function fetchInitialTickers() {
  for (const coin of TRACKED_COINS) {
    const symbol = `${coin.toUpperCase()}USDT`;
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
      if (res.ok) {
        const data = await res.json();
        updateTickerElement(coin, parseFloat(data.lastPrice), parseFloat(data.priceChangePercent));
      } else {
        fetchServerTickerFallback(coin);
      }
    } catch (e) {
      fetchServerTickerFallback(coin);
    }
  }
}

async function fetchServerTickerFallback(coin) {
  try {
    const res = await fetch(`/api/market/ticker?coin=${coin.toUpperCase()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.ticker) {
        updateTickerElement(coin, data.ticker.price, data.ticker.change24h || 0);
      }
    }
  } catch (err) {}
}

// 2. Real-time Live WebSocket Connection directly to Binance Stream
function connectBinanceWebSocket() {
  const streams = TRACKED_COINS.map(c => `${c}usdt@ticker`).join('/');
  const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

  try {
    binanceWs = new WebSocket(wsUrl);

    binanceWs.onopen = () => {
      console.log('⚡ Connected to Binance Live WebSocket Stream');
    };

    binanceWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg && msg.data) {
          const d = msg.data;
          const symbol = d.s.toLowerCase().replace('usdt', '');
          const price = parseFloat(d.c);
          const change = parseFloat(d.P);
          updateTickerElement(symbol, price, change);
        }
      } catch (err) {
        console.error('WS Parse Error:', err);
      }
    };

    binanceWs.onerror = (err) => {
      console.warn('Binance WS Error, switching to periodic REST sync:', err);
    };

    binanceWs.onclose = () => {
      console.log('Binance WS disconnected. Reconnecting in 3s...');
      setTimeout(connectBinanceWebSocket, 3000);
    };
  } catch (e) {
    console.warn('Cannot initiate WebSocket, using fallback polling interval:', e);
  }
}


// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Mermaid
  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#121620',
        primaryColor: '#2962ff',
        primaryTextColor: '#fff',
        lineColor: '#60a5fa',
        textColor: '#cbd5e1'
      }
    });
  }

  // Initial tab load
  loadTheoryTOC();

  // Start Real-time Live Ticker
  fetchInitialTickers();
  connectBinanceWebSocket();

  // Periodic REST refresh every 5s as backup
  setInterval(fetchInitialTickers, 5000);
});
