/**
 * Telegram Alert Service (server/services/telegram-alert.service.js)
 * Realtime Notification Dispatcher via Telegram Bot API
 */

const https = require('node:https');

class TelegramAlertService {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
    this.lastDispatchedMap = new Map(); // Prevent spamming same coin within 30 minutes
    this.alertHistory = [];
  }

  updateConfig(token, chatId) {
    if (token) this.botToken = token.trim();
    if (chatId) this.chatId = chatId.trim();
    return {
      configured: Boolean(this.botToken && this.chatId),
      chatId: this.chatId ? `${this.chatId.slice(0, 4)}***` : ''
    };
  }

  getStatus() {
    return {
      configured: Boolean(this.botToken && this.chatId),
      chatId: this.chatId ? `${this.chatId.slice(0, 4)}***` : '',
      lastAlerts: this.alertHistory.slice(-5)
    };
  }

  postTelegramMessage(text) {
    if (!this.botToken || !this.chatId) {
      console.log('[TelegramAlert] Skipped (No Token/ChatID configured):', text.slice(0, 60));
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const payload = JSON.stringify({
        chat_id: this.chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });

      const req = https.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 5000
      }, (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(true);
          } else {
            console.warn('[TelegramAlert] API Error:', raw);
            resolve(false);
          }
        });
      });

      req.on('error', (e) => {
        console.warn('[TelegramAlert] Network error:', e.message);
        resolve(false);
      });
      req.write(payload);
      req.end();
    });
  }

  /**
   * Dispatch Rich Setup Alert for Market Screener Candidates
   */
  async dispatchScreenerAlert(candidate) {
    const symbol = candidate.symbol;
    const now = Date.now();
    const lastSent = this.lastDispatchedMap.get(symbol) || 0;

    // Cooldown 30 minutes per coin
    if (now - lastSent < 30 * 60 * 1000) return false;

    const message = `
🚨 <b>[AGY 24/7 RADAR CẢNH BÁO BREAKOUT]</b>
━━━━━━━━━━━━━━━━━━━━
🪙 <b>Cặp giao dịch:</b> #${candidate.coin} / USDT
🔥 <b>Điểm Hội Tụ (Confluence Score):</b> ${candidate.confluenceScore}/100 ⭐
⚡ <b>Tín hiệu:</b> <b>${candidate.signal}</b>
💰 <b>Giá hiện tại:</b> $${candidate.price} (+${candidate.change24h}%)
📊 <b>Volume 24h:</b> ${candidate.volumeUsdFormatted} | <b>RSI:</b> ${candidate.estimatedRsi}/100

🎯 <b>Kế hoạch vào lệnh (Setup):</b>
• <b>Vùng Entry:</b> <code>${candidate.entryZone}</code>
• <b>Stop Loss bắt buộc:</b> <code>${candidate.stopLoss}</code>
• <b>Take Profit mục tiêu:</b> <code>${candidate.takeProfit}</code> (R:R ${candidate.rrRatio})

⚠️ <b>Phản biện Săn Bẫy (Sentinel):</b>
<i>${candidate.trapWarning}</i>
━━━━━━━━━━━━━━━━━━━━
🤖 <i>Hệ thống AI Multi-Agent Trading Council</i>`;

    this.lastDispatchedMap.set(symbol, now);
    this.alertHistory.push({
      symbol,
      coin: candidate.coin,
      score: candidate.confluenceScore,
      action: candidate.action,
      time: new Date().toLocaleTimeString('vi-VN')
    });

    return this.postTelegramMessage(message);
  }

  /**
   * Test Dispatch Alert
   */
  async sendTestAlert() {
    const sample = {
      symbol: 'BTCUSDT',
      coin: 'BTC',
      confluenceScore: 92,
      signal: 'BÙNG NỔ VOL & TĂNG TRƯỞNG (LONG)',
      price: 65420.50,
      change24h: 3.45,
      volumeUsdFormatted: '$1.4B',
      estimatedRsi: 54,
      entryZone: '$65,200 - $65,500',
      stopLoss: '$64,100',
      takeProfit: '$68,200',
      rrRatio: '1:2.8',
      trapWarning: 'Chú ý vùng kháng cự $66,000 phiên Mỹ. Bắt buộc giữ Stop Loss.'
    };
    return this.dispatchScreenerAlert(sample);
  }
}

const telegramAlertService = new TelegramAlertService();

// Connect dispatcher to Screener
const marketScreenerService = require('./market-screener.service');
marketScreenerService.setTelegramDispatcher(telegramAlertService);

module.exports = telegramAlertService;
