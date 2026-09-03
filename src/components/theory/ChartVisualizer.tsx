import React from "react";
import { ChartConfig } from "../../types";

// --- REALISTIC CANDLESTICK & CHART VISUALIZER ENGINE ---
// 100% Comprehensive Visual Graphics Engine for All 11 Chapters of 'Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md'

const ChartVisualizer = {
  colors: {
    bg: '#080c14',
    bgCard: '#0f1422',
    grid: '#182032',
    bull: '#00c076',
    bullLight: '#26e396',
    bullGlow: 'rgba(0, 192, 118, 0.25)',
    bear: '#ff3b69',
    bearLight: '#ff6b8f',
    bearGlow: 'rgba(255, 59, 105, 0.25)',
    support: 'rgba(0, 192, 118, 0.12)',
    supportBorder: 'rgba(0, 192, 118, 0.5)',
    resistance: 'rgba(255, 59, 105, 0.12)',
    resistanceBorder: 'rgba(255, 59, 105, 0.5)',
    ema20: '#38bdf8',
    ema50: '#f59e0b',
    entry: '#3b82f6',
    sl: '#ef4444',
    tp: '#10b981',
    text: '#94a3b8',
    textLight: '#f8fafc'
  },

  // 1. GENERAL CANDLESTICK CHART RENDERER
  renderChartSvg({
    width = 680,
    height = 320,
    candles = [],
    zones = [],
    indicators = [],
    overlays = [],
    tradeSetup = null,
    title = '',
    timeframe = ''
  }) {
    const padTop = 38;
    const padBottom = 45;
    const padLeft = 16;
    const padRight = 85;

    const chartWidth = width - padLeft - padRight;
    const chartHeight = height - padTop - padBottom;

    if (!candles || candles.length === 0) return '';

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVol = 0;

    candles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.vol && c.vol > maxVol) maxVol = c.vol;
    });

    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.08;
    maxPrice += priceRange * 0.08;
    const finalRange = maxPrice - minPrice;

    const getY = (val) => padTop + chartHeight - ((val - minPrice) / finalRange) * chartHeight;
    const candleWidth = Math.max(10, (chartWidth / candles.length) * 0.62);
    const candleSpacing = chartWidth / candles.length;
    const getX = (index) => padLeft + index * candleSpacing + candleSpacing / 2;

    const gradId = 'grad_' + Math.random().toString(36).substring(2, 8);

    let svg = `<svg viewBox="0 0 ${width} ${height}" class="trading-chart-svg" style="background:${this.colors.bg}; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', -apple-system, monospace;">`;

    svg += `
      <defs>
        <linearGradient id="${gradId}_bull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${this.colors.bullLight}" />
          <stop offset="100%" stop-color="${this.colors.bull}" />
        </linearGradient>
        <linearGradient id="${gradId}_bear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${this.colors.bearLight}" />
          <stop offset="100%" stop-color="${this.colors.bear}" />
        </linearGradient>
      </defs>
    `;

    // Grid lines & Axis
    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (finalRange / gridSteps) * i;
      const y = getY(p);
      svg += `<line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="${this.colors.grid}" stroke-dasharray="3,3" stroke-width="1"/>`;
      svg += `<text x="${width - padRight + 8}" y="${y + 3.5}" fill="${this.colors.text}" font-size="10.5" font-weight="500">${p >= 1000 ? p.toFixed(0) : (p >= 10 ? p.toFixed(1) : p.toFixed(2))}</text>`;
    }

    // Support / Resistance Zones
    zones.forEach(z => {
      const topY = getY(z.top);
      const botY = getY(z.bottom);
      const zoneH = Math.max(5, Math.abs(botY - topY));
      const fill = z.type === 'support' ? this.colors.support : this.colors.resistance;
      const stroke = z.type === 'support' ? this.colors.supportBorder : this.colors.resistanceBorder;
      const labelColor = z.type === 'support' ? this.colors.bull : this.colors.bear;

      svg += `<rect x="${padLeft}" y="${Math.min(topY, botY)}" width="${chartWidth}" height="${zoneH}" fill="${fill}" stroke="${stroke}" stroke-dasharray="4,2" stroke-width="1" rx="3"/>`;
      svg += `<text x="${padLeft + 8}" y="${Math.min(topY, botY) + 13}" fill="${labelColor}" font-size="10" font-weight="bold">${z.label || (z.type === 'support' ? 'VÙNG HỖ TRỢ' : 'VÙNG KHÁNG CỰ')}</text>`;
    });

    // Volume Bars
    const volHeight = 42;
    const volBaseY = height - padBottom;
    candles.forEach((c, idx) => {
      if (c.vol) {
        const x = getX(idx) - candleWidth / 2;
        const vH = (c.vol / (maxVol || 1)) * volHeight;
        const vColor = c.close >= c.open ? 'rgba(0, 192, 118, 0.32)' : 'rgba(255, 59, 105, 0.32)';
        svg += `<rect x="${x}" y="${volBaseY - vH}" width="${candleWidth}" height="${vH}" fill="${vColor}" rx="1"/>`;
      }
    });

    // Indicators
    indicators.forEach(ind => {
      let pathD = '';
      candles.forEach((c, idx) => {
        if (c[ind.key] !== undefined) {
          const x = getX(idx);
          const y = getY(c[ind.key]);
          pathD += (idx === 0 || !pathD) ? `M ${x} ${y}` : ` L ${x} ${y}`;
        }
      });
      if (pathD) {
        svg += `<path d="${pathD}" fill="none" stroke="${ind.color || this.colors.ema20}" stroke-width="2" stroke-linecap="round"/>`;
      }
    });

    // Candlesticks
    candles.forEach((c, idx) => {
      const isBull = c.close >= c.open;
      const fill = isBull ? `url(#${gradId}_bull)` : `url(#${gradId}_bear)`;
      const stroke = isBull ? this.colors.bull : this.colors.bear;

      const x = getX(idx);
      const openY = getY(c.open);
      const closeY = getY(c.close);
      const highY = getY(c.high);
      const lowY = getY(c.low);

      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(2.5, Math.abs(closeY - openY));

      svg += `<line x1="${x}" y1="${highY}" x2="${x}" y2="${bodyTop}" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>`;
      svg += `<line x1="${x}" y1="${bodyTop + bodyHeight}" x2="${x}" y2="${lowY}" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>`;
      svg += `<rect x="${x - candleWidth / 2}" y="${bodyTop}" width="${candleWidth}" height="${bodyHeight}" fill="${fill}" stroke="${stroke}" stroke-width="1" rx="1.5"/>`;

      if (c.label) {
        const isUp = c.labelPos !== 'bottom';
        const labelY = isUp ? highY - 14 : lowY + 18;
        const badgeColor = c.labelColor || (isBull ? this.colors.bull : this.colors.bear);
        const w = c.label.length * 6.5 + 20;
        
        svg += `<g transform="translate(${x}, ${labelY})">
          <rect x="${-w/2}" y="-10" width="${w}" height="18" fill="rgba(10, 15, 26, 0.95)" stroke="${badgeColor}" stroke-width="1.2" rx="4"/>
          <text x="0" y="2.5" text-anchor="middle" fill="${badgeColor}" font-size="9" font-weight="bold">${c.label}</text>
        </g>`;
      }
    });

    // Overlays
    overlays.forEach(ov => {
      if (ov.type === 'trendline') {
        const x1 = getX(ov.x1);
        const y1 = getY(ov.y1);
        const x2 = getX(ov.x2);
        const y2 = getY(ov.y2);
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ov.color || '#f59e0b'}" stroke-width="2" stroke-dasharray="${ov.dashed ? '4,4' : '0'}"/>`;
      } else if (ov.type === 'arrow') {
        const x = getX(ov.x);
        const y = getY(ov.y);
        const dir = ov.dir === 'up' ? -1 : 1;
        const color = ov.color || '#38bdf8';
        svg += `<path d="M ${x} ${y} L ${x - 6} ${y - 12 * dir} L ${x + 6} ${y - 12 * dir} Z" fill="${color}"/>`;
        if (ov.text) {
          svg += `<text x="${x}" y="${y - 16 * dir}" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold">${ov.text}</text>`;
        }
      }
    });

    // Trade Setup (Entry, SL, TP)
    if (tradeSetup) {
      const entryY = getY(tradeSetup.entry);
      const slY = getY(tradeSetup.sl);
      const tpY = getY(tradeSetup.tp);
      const startX = getX(tradeSetup.startIndex || Math.floor(candles.length * 0.6));
      const endX = width - padRight;

      // SL
      svg += `<line x1="${startX}" y1="${slY}" x2="${endX}" y2="${slY}" stroke="${this.colors.sl}" stroke-dasharray="4,3" stroke-width="1.8"/>`;
      svg += `<rect x="${endX + 4}" y="${slY - 9}" width="75" height="18" fill="rgba(239, 68, 68, 0.2)" stroke="${this.colors.sl}" rx="3"/>`;
      svg += `<text x="${endX + 41.5}" y="${slY + 3.5}" text-anchor="middle" fill="${this.colors.sl}" font-size="9.5" font-weight="bold">SL: $${tradeSetup.sl}</text>`;

      // Entry
      svg += `<line x1="${startX}" y1="${entryY}" x2="${endX}" y2="${entryY}" stroke="${this.colors.entry}" stroke-width="1.8"/>`;
      svg += `<rect x="${endX + 4}" y="${entryY - 9}" width="75" height="18" fill="rgba(59, 130, 246, 0.2)" stroke="${this.colors.entry}" rx="3"/>`;
      svg += `<text x="${endX + 41.5}" y="${entryY + 3.5}" text-anchor="middle" fill="${this.colors.entry}" font-size="9.5" font-weight="bold">ENTRY: $${tradeSetup.entry}</text>`;

      // TP
      if (tradeSetup.tp) {
        svg += `<line x1="${startX}" y1="${tpY}" x2="${endX}" y2="${tpY}" stroke="${this.colors.tp}" stroke-dasharray="4,3" stroke-width="1.8"/>`;
        svg += `<rect x="${endX + 4}" y="${tpY - 9}" width="75" height="18" fill="rgba(16, 185, 129, 0.2)" stroke="${this.colors.tp}" rx="3"/>`;
        svg += `<text x="${endX + 41.5}" y="${tpY + 3.5}" text-anchor="middle" fill="${this.colors.tp}" font-size="9.5" font-weight="bold">TP: $${tradeSetup.tp}</text>`;

        const boxTop = Math.min(entryY, tpY);
        const boxH = Math.abs(tpY - entryY);
        const lossH = Math.abs(slY - entryY);
        
        svg += `<rect x="${startX}" y="${boxTop}" width="${endX - startX}" height="${boxH}" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.35)" stroke-width="1"/>`;
        svg += `<rect x="${startX}" y="${Math.min(entryY, slY)}" width="${endX - startX}" height="${lossH}" fill="rgba(239, 68, 68, 0.08)" stroke="rgba(239, 68, 68, 0.35)" stroke-width="1"/>`;
      }
    }

    if (title) {
      svg += `<text x="${padLeft + 8}" y="20" fill="${this.colors.textLight}" font-size="12.5" font-weight="bold">${title}</text>`;
    }
    if (timeframe) {
      svg += `<text x="${width - padRight - 6}" y="20" text-anchor="end" fill="${this.colors.text}" font-size="11" font-weight="bold">TF: ${timeframe}</text>`;
    }

    svg += `</svg>`;
    return svg;
  },

  // 2. CHAPTER 1: BLOCKCHAIN LEDGER BLOCKS GRAPHIC
  renderBlockchainLedgerSvg() {
    return `
      <svg viewBox="0 0 760 210" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="380" y="24" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="bold">🔗 CƠ CHẾ LIÊN KẾT KHỐI BLOCKCHAIN BẤT BIẾN (BLOCK #101 ➔ #102 ➔ #103)</text>
        
        <!-- Block 101 -->
        <g transform="translate(30, 45)">
          <rect width="200" height="135" fill="#0f172a" stroke="#3b82f6" stroke-width="2" rx="8"/>
          <rect width="200" height="30" fill="#1e3a8a" rx="8"/>
          <text x="100" y="20" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">📦 BLOCK #101</text>
          
          <text x="12" y="55" fill="#94a3b8" font-size="10">Hash: <tspan fill="#38bdf8">000abc45f89...</tspan></text>
          <text x="12" y="75" fill="#94a3b8" font-size="10">PrevHash: <tspan fill="#64748b">000999aa1...</tspan></text>
          <line x1="12" y1="88" x2="188" y2="88" stroke="#334155" stroke-width="1"/>
          <text x="12" y="108" fill="#cbd5e1" font-size="10">💳 Alice ➔ Bob: 1 BTC</text>
          <text x="12" y="124" fill="#00c076" font-size="9.5">✅ Đã khóa mã hóa</text>
        </g>

        <!-- Arrow 1 -->
        <path d="M 240 112 L 270 112" stroke="#60a5fa" stroke-width="3" stroke-dasharray="4,2"/>
        <polygon points="270,107 280,112 270,117" fill="#60a5fa"/>

        <!-- Block 102 -->
        <g transform="translate(280, 45)">
          <rect width="200" height="135" fill="#0f172a" stroke="#06b6d4" stroke-width="2" rx="8"/>
          <rect width="200" height="30" fill="#0e7490" rx="8"/>
          <text x="100" y="20" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">📦 BLOCK #102</text>
          
          <text x="12" y="55" fill="#94a3b8" font-size="10">Hash: <tspan fill="#22d3ee">000def78a12...</tspan></text>
          <text x="12" y="75" fill="#94a3b8" font-size="10">PrevHash: <tspan fill="#38bdf8">000abc45f89...</tspan></text>
          <line x1="12" y1="88" x2="188" y2="88" stroke="#334155" stroke-width="1"/>
          <text x="12" y="108" fill="#cbd5e1" font-size="10">💳 Bob ➔ Charlie: 0.5 BTC</text>
          <text x="12" y="124" fill="#00c076" font-size="9.5">✅ Đã khóa mã hóa</text>
        </g>

        <!-- Arrow 2 -->
        <path d="M 490 112 L 520 112" stroke="#60a5fa" stroke-width="3" stroke-dasharray="4,2"/>
        <polygon points="520,107 530,112 520,117" fill="#60a5fa"/>

        <!-- Block 103 -->
        <g transform="translate(530, 45)">
          <rect width="200" height="135" fill="#0f172a" stroke="#a855f7" stroke-width="2" rx="8"/>
          <rect width="200" height="30" fill="#6b21a8" rx="8"/>
          <text x="100" y="20" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">📦 BLOCK #103</text>
          
          <text x="12" y="55" fill="#94a3b8" font-size="10">Hash: <tspan fill="#c084fc">000xyz99c34...</tspan></text>
          <text x="12" y="75" fill="#94a3b8" font-size="10">PrevHash: <tspan fill="#22d3ee">000def78a12...</tspan></text>
          <line x1="12" y1="88" x2="188" y2="88" stroke="#334155" stroke-width="1"/>
          <text x="12" y="108" fill="#cbd5e1" font-size="10">💳 Dan ➔ Eva: 2 BTC</text>
          <text x="12" y="124" fill="#00c076" font-size="9.5">✅ Đã khóa mã hóa</text>
        </g>
      </svg>
    `;
  },

  // 3. CHAPTER 3: CANDLE ANATOMY (OHLC + INTRADAY PATH + WICKS MEANING)
  renderCandleAnatomySvg() {
    return `
      <svg viewBox="0 0 760 460" style="background:#080c14; border-radius:12px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <!-- Top Title -->
        <rect x="20" y="14" width="720" height="32" fill="#0c121e" stroke="#1e293b" rx="6"/>
        <text x="380" y="35" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">📊 GIẢI PHẪU NẾN NHẬT (OHLC) & ĐỒ THỊ ĐƯỜNG GIÁ HÌNH THÀNH TRONG PHIÊN</text>

        <!-- Horizontal Guides -->
        <line x1="40" y1="80" x2="720" y2="80" stroke="#1e293b" stroke-dasharray="3,3"/>
        <line x1="40" y1="140" x2="720" y2="140" stroke="#1e293b" stroke-dasharray="3,3"/>
        <line x1="40" y1="210" x2="720" y2="210" stroke="#1e293b" stroke-dasharray="3,3"/>
        <line x1="40" y1="270" x2="720" y2="270" stroke="#1e293b" stroke-dasharray="3,3"/>

        <!-- ================= LEFT COLUMN: BULLISH CANDLE ================= -->
        <g transform="translate(40, 60)">
          <!-- Background Card -->
          <rect x="0" y="0" width="325" height="380" fill="#09121a" stroke="rgba(0, 192, 118, 0.3)" rx="8"/>
          
          <text x="162" y="24" text-anchor="middle" fill="#00c076" font-size="13" font-weight="bold">🟢 1. NẾN TĂNG (BULLISH CANDLE)</text>
          <text x="162" y="40" text-anchor="middle" fill="#94a3b8" font-size="9.5">Giá Đóng Cửa (C) &gt; Giá Mở Cửa (O)</text>

          <!-- Candle Representation -->
          <g transform="translate(65, 30)">
            <!-- Upper Wick -->
            <line x1="0" y1="20" x2="0" y2="70" stroke="#00c076" stroke-width="3" stroke-linecap="round"/>
            <!-- Body -->
            <rect x="-24" y="70" width="48" height="80" fill="#00c076" stroke="#26e396" stroke-width="2" rx="3"/>
            <!-- Lower Wick -->
            <line x1="0" y1="150" x2="0" y2="190" stroke="#00c076" stroke-width="3" stroke-linecap="round"/>

            <!-- Price Markers -->
            <circle cx="0" cy="20" r="4" fill="#38bdf8"/>
            <text x="-32" y="24" text-anchor="end" fill="#38bdf8" font-size="9.5" font-weight="bold">H (High)</text>

            <circle cx="0" cy="70" r="3.5" fill="#00c076"/>
            <text x="-32" y="74" text-anchor="end" fill="#00c076" font-size="9.5" font-weight="bold">C (Close)</text>

            <circle cx="0" cy="150" r="3.5" fill="#94a3b8"/>
            <text x="-32" y="154" text-anchor="end" fill="#94a3b8" font-size="9.5" font-weight="bold">O (Open)</text>

            <circle cx="0" cy="190" r="4" fill="#f59e0b"/>
            <text x="-32" y="194" text-anchor="end" fill="#f59e0b" font-size="9.5" font-weight="bold">L (Low)</text>
          </g>

          <!-- Real Intraday Price Path Chart -->
          <g transform="translate(155, 45)">
            <rect width="155" height="180" fill="#06090e" stroke="#1e293b" rx="6"/>
            <text x="77" y="16" text-anchor="middle" fill="#38bdf8" font-size="8.5" font-weight="bold">📈 Đồ Thị Đường Giá Chạy</text>
            
            <!-- Path: Open -> Dip to Low -> Rally to High -> Pullback to Close -->
            <path d="M 12 135 Q 35 175 55 168 T 100 35 T 145 65" fill="none" stroke="#00c076" stroke-width="2.5" stroke-linecap="round"/>
            
            <!-- Key Points -->
            <circle cx="12" cy="135" r="3" fill="#94a3b8"/><text x="14" y="148" fill="#94a3b8" font-size="7.5">1.Open</text>
            <circle cx="55" cy="168" r="3" fill="#f59e0b"/><text x="55" y="178" fill="#f59e0b" font-size="7.5">2.Low</text>
            <circle cx="100" cy="35" r="3" fill="#38bdf8"/><text x="100" y="28" fill="#38bdf8" font-size="7.5">3.High</text>
            <circle cx="145" cy="65" r="3" fill="#00c076"/><text x="135" y="78" fill="#00c076" font-size="7.5">4.Close</text>
          </g>

          <!-- Meaning Explanations -->
          <g transform="translate(12, 240)">
            <rect width="300" height="128" fill="#06090e" stroke="#1e293b" rx="6"/>
            <text x="10" y="18" fill="#00c076" font-size="10" font-weight="bold">🟢 Ý NGHĨA NẾN XANH & RÂU NẾN:</text>
            <text x="10" y="38" fill="#cbd5e1" font-size="9">• <tspan fill="#00c076" font-weight="bold">Thân Nến Xanh:</tspan> Phe Mua (Bulls) làm chủ cuộc chơi, đẩy giá tăng vọt.</text>
            <text x="10" y="62" fill="#cbd5e1" font-size="9">• <tspan fill="#38bdf8" font-weight="bold">Râu Trên:</tspan> Phe Bán xả hàng chốt lời, ép giá lùi lại từ đỉnh High về Close.</text>
            <text x="10" y="86" fill="#cbd5e1" font-size="9">• <tspan fill="#f59e0b" font-weight="bold">Râu Dưới:</tspan> Lực bắt đáy / Cá mập gom hàng hấp thụ sạch lực bán xả ở Low.</text>
            <text x="10" y="110" fill="#22d3ee" font-size="8.5">➔ Râu dưới càng dài, lực gom hàng bắt đáy càng mạnh!</text>
          </g>
        </g>

        <!-- ================= RIGHT COLUMN: BEARISH CANDLE ================= -->
        <g transform="translate(395, 60)">
          <!-- Background Card -->
          <rect x="0" y="0" width="325" height="380" fill="#14090c" stroke="rgba(255, 59, 105, 0.3)" rx="8"/>
          
          <text x="162" y="24" text-anchor="middle" fill="#ff3b69" font-size="13" font-weight="bold">🔴 2. NẾN GIẢM (BEARISH CANDLE)</text>
          <text x="162" y="40" text-anchor="middle" fill="#94a3b8" font-size="9.5">Giá Đóng Cửa (C) &lt; Giá Mở Cửa (O)</text>

          <!-- Candle Representation -->
          <g transform="translate(65, 30)">
            <!-- Upper Wick -->
            <line x1="0" y1="20" x2="0" y2="60" stroke="#ff3b69" stroke-width="3" stroke-linecap="round"/>
            <!-- Body -->
            <rect x="-24" y="60" width="48" height="80" fill="#ff3b69" stroke="#ff6b8f" stroke-width="2" rx="3"/>
            <!-- Lower Wick -->
            <line x1="0" y1="140" x2="0" y2="190" stroke="#ff3b69" stroke-width="3" stroke-linecap="round"/>

            <!-- Price Markers -->
            <circle cx="0" cy="20" r="4" fill="#38bdf8"/>
            <text x="-32" y="24" text-anchor="end" fill="#38bdf8" font-size="9.5" font-weight="bold">H (High)</text>

            <circle cx="0" cy="60" r="3.5" fill="#94a3b8"/>
            <text x="-32" y="64" text-anchor="end" fill="#94a3b8" font-size="9.5" font-weight="bold">O (Open)</text>

            <circle cx="0" cy="140" r="3.5" fill="#ff3b69"/>
            <text x="-32" y="144" text-anchor="end" fill="#ff3b69" font-size="9.5" font-weight="bold">C (Close)</text>

            <circle cx="0" cy="190" r="4" fill="#f59e0b"/>
            <text x="-32" y="194" text-anchor="end" fill="#f59e0b" font-size="9.5" font-weight="bold">L (Low)</text>
          </g>

          <!-- Real Intraday Price Path Chart -->
          <g transform="translate(155, 45)">
            <rect width="155" height="180" fill="#06090e" stroke="#1e293b" rx="6"/>
            <text x="77" y="16" text-anchor="middle" fill="#ff3b69" font-size="8.5" font-weight="bold">📉 Đồ Thị Đường Giá Chạy</text>
            
            <!-- Path: Open -> Pump to High -> Dump to Low -> Bounce to Close -->
            <path d="M 12 65 Q 35 25 60 28 T 115 175 T 145 140" fill="none" stroke="#ff3b69" stroke-width="2.5" stroke-linecap="round"/>
            
            <!-- Key Points -->
            <circle cx="12" cy="65" r="3" fill="#94a3b8"/><text x="14" y="58" fill="#94a3b8" font-size="7.5">1.Open</text>
            <circle cx="60" cy="28" r="3" fill="#38bdf8"/><text x="60" y="20" fill="#38bdf8" font-size="7.5">2.High</text>
            <circle cx="115" cy="175" r="3" fill="#f59e0b"/><text x="115" y="183" fill="#f59e0b" font-size="7.5">3.Low</text>
            <circle cx="145" cy="140" r="3" fill="#ff3b69"/><text x="135" y="132" fill="#ff3b69" font-size="7.5">4.Close</text>
          </g>

          <!-- Meaning Explanations -->
          <g transform="translate(12, 240)">
            <rect width="300" height="128" fill="#06090e" stroke="#1e293b" rx="6"/>
            <text x="10" y="18" fill="#ff3b69" font-size="10" font-weight="bold">🔴 Ý NGHĨA NẾN ĐỎ & RÂU NẾN:</text>
            <text x="10" y="38" fill="#cbd5e1" font-size="9">• <tspan fill="#ff3b69" font-weight="bold">Thân Nến Đỏ:</tspan> Phe Bán (Bears) kiểm soát toàn diện, xả hàng tháo chạy.</text>
            <text x="10" y="62" fill="#cbd5e1" font-size="9">• <tspan fill="#38bdf8" font-weight="bold">Râu Trên:</tspan> Phe Mua cố đẩy giá lên High nhưng bị phe Bán đè bẹp xả tháo.</text>
            <text x="10" y="86" fill="#cbd5e1" font-size="9">• <tspan fill="#f59e0b" font-weight="bold">Râu Dưới:</tspan> Lực cầu đỡ giá yếu ớt ở đáy Low giúp giá rút nhẹ lên Close.</text>
            <text x="10" y="110" fill="#fb7185" font-size="8.5">➔ Râu trên càng dài, áp lực xả hàng đè giá càng khủng khiếp!</text>
          </g>
        </g>
      </svg>
    `;
  },

  // 4. CHAPTER 3.4: 4 CANDLE WICK & BODY BEHAVIOR CASES
  renderThreeCandleCasesSvg() {
    return `
      <svg viewBox="0 0 760 270" style="background:#080c14; border-radius:12px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <rect x="20" y="14" width="720" height="30" fill="#0c121e" stroke="#1e293b" rx="6"/>
        <text x="380" y="34" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="bold">🧠 4 TRƯỜNG HỢP RÂU NẾN & TÂM LÝ HỌC HÀNH VI CHIẾN TRƯỜNG - CHƯƠNG 3.4</text>

        <!-- Case 1: Marubozu (No Wick) -->
        <g transform="translate(40, 55)">
          <rect width="155" height="195" fill="#0c121e" stroke="#1e293b" rx="6"/>
          <text x="77" y="20" text-anchor="middle" fill="#00c076" font-size="10.5" font-weight="bold">1. KHÔNG RÂU</text>
          <text x="77" y="34" text-anchor="middle" fill="#94a3b8" font-size="8.5">(Nến Marubozu)</text>

          <rect x="55" y="45" width="45" height="100" fill="#00c076" stroke="#26e396" rx="2"/>
          <text x="77" y="100" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="bold">ĐẶC</text>

          <text x="77" y="162" text-anchor="middle" fill="#00c076" font-size="9" font-weight="bold">Thắng Tuyệt Đối 100%</text>
          <text x="77" y="178" text-anchor="middle" fill="#cbd5e1" font-size="8">Không có lực cản trở</text>
        </g>

        <!-- Case 2: Long Upper Wick (Rejection of High) -->
        <g transform="translate(215, 55)">
          <rect width="155" height="195" fill="#0c121e" stroke="#1e293b" rx="6"/>
          <text x="77" y="20" text-anchor="middle" fill="#ff3b69" font-size="10.5" font-weight="bold">2. RÂU TRÊN DÀI</text>
          <text x="77" y="34" text-anchor="middle" fill="#94a3b8" font-size="8.5">(Từ chối giá cao)</text>

          <line x1="77" y1="45" x2="77" y2="105" stroke="#ff3b69" stroke-width="2.5"/>
          <rect x="55" y="105" width="45" height="30" fill="#ff3b69" stroke="#ff6b8f" rx="2"/>
          <line x1="77" y1="135" x2="77" y2="145" stroke="#ff3b69" stroke-width="2"/>

          <text x="77" y="162" text-anchor="middle" fill="#ff3b69" font-size="9" font-weight="bold">Bị Xả Hàng Cực Mạnh</text>
          <text x="77" y="178" text-anchor="middle" fill="#cbd5e1" font-size="8">Phe bán đè bẹp phe mua</text>
        </g>

        <!-- Case 3: Long Lower Wick (Rejection of Low) -->
        <g transform="translate(390, 55)">
          <rect width="155" height="195" fill="#0c121e" stroke="#1e293b" rx="6"/>
          <text x="77" y="20" text-anchor="middle" fill="#00c076" font-size="10.5" font-weight="bold">3. RÂU DƯỚI DÀI</text>
          <text x="77" y="34" text-anchor="middle" fill="#94a3b8" font-size="8.5">(Từ chối giá thấp)</text>

          <line x1="77" y1="45" x2="77" y2="55" stroke="#00c076" stroke-width="2"/>
          <rect x="55" y="55" width="45" height="30" fill="#00c076" stroke="#26e396" rx="2"/>
          <line x1="77" y1="85" x2="77" y2="145" stroke="#00c076" stroke-width="2.5"/>

          <text x="77" y="162" text-anchor="middle" fill="#00c076" font-size="9" font-weight="bold">Bắt Đáy / Gom Hàng</text>
          <text x="77" y="178" text-anchor="middle" fill="#cbd5e1" font-size="8">Lực cầu nuốt trọn lực xả</text>
        </g>

        <!-- Case 4: Long Both Wicks / Doji (Indecision) -->
        <g transform="translate(565, 55)">
          <rect width="155" height="195" fill="#0c121e" stroke="#1e293b" rx="6"/>
          <text x="77" y="20" text-anchor="middle" fill="#f59e0b" font-size="10.5" font-weight="bold">4. RÂU 2 ĐẦU DÀI</text>
          <text x="77" y="34" text-anchor="middle" fill="#94a3b8" font-size="8.5">(Lưỡng lự / Doji)</text>

          <line x1="77" y1="45" x2="77" y2="145" stroke="#f59e0b" stroke-width="2"/>
          <rect x="55" y="90" width="45" height="12" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" rx="2"/>

          <text x="77" y="162" text-anchor="middle" fill="#fbbf24" font-size="9" font-weight="bold">Chiến Trường Giằng Co</text>
          <text x="77" y="178" text-anchor="middle" fill="#cbd5e1" font-size="8">Nén lò xo chờ biến động</text>
        </g>
      </svg>
    `;
  },


  // 5. CHAPTER 4.1.C: 3 DOJI TYPES
  renderDojiTypesSvg() {
    return `
      <svg viewBox="0 0 740 220" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="370" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">🕯️ 3 LOẠI NẾN DOJI KINH ĐIỂN - CHƯƠNG 4.1.C</text>

        <!-- 1. Doji Chuẩn -->
        <g transform="translate(145, 35)">
          <line x1="0" y1="20" x2="0" y2="140" stroke="#f59e0b" stroke-width="2.5"/>
          <line x1="-32" y1="80" x2="32" y2="80" stroke="#f59e0b" stroke-width="3"/>
          <text x="0" y="165" text-anchor="middle" fill="#f59e0b" font-size="11.5" font-weight="bold">1. DOJI CHUẨN</text>
          <text x="0" y="182" text-anchor="middle" fill="#94a3b8" font-size="9.5">Lưỡng lự, Mua = Bán</text>
        </g>

        <!-- 2. Dragonfly Doji -->
        <g transform="translate(370, 35)">
          <line x1="0" y1="30" x2="0" y2="140" stroke="#00c076" stroke-width="2.5"/>
          <line x1="-36" y1="30" x2="36" y2="30" stroke="#00c076" stroke-width="3.5"/>
          <text x="0" y="165" text-anchor="middle" fill="#00c076" font-size="11.5" font-weight="bold">2. DOJI CHUỒN CHUỒN</text>
          <text x="0" y="182" text-anchor="middle" fill="#94a3b8" font-size="9.5">Đảo chiều TĂNG ở đáy</text>
        </g>

        <!-- 3. Gravestone Doji -->
        <g transform="translate(595, 35)">
          <line x1="0" y1="20" x2="0" y2="130" stroke="#ff3b69" stroke-width="2.5"/>
          <line x1="-36" y1="130" x2="36" y2="130" stroke="#ff3b69" stroke-width="3.5"/>
          <text x="0" y="165" text-anchor="middle" fill="#ff3b69" font-size="11.5" font-weight="bold">3. DOJI BIA MỘ</text>
          <text x="0" y="182" text-anchor="middle" fill="#94a3b8" font-size="9.5">Đảo chiều GIẢM ở đỉnh</text>
        </g>
      </svg>
    `;
  },

  // 6. CHAPTER 4.2.A: BULLISH & BEARISH ENGULFING REAL COMPARISON
  renderEngulfingPairSvg() {
    return `
      <svg viewBox="0 0 740 250" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="370" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">🕯️ MÔ HÌNH NHẤN CHÌM TĂNG (BULLISH) VS NHẤN CHÌM GIẢM (BEARISH) - CHƯƠNG 4.2.A</text>

        <!-- LEFT: BULLISH ENGULFING -->
        <g transform="translate(190, 30)">
          <!-- Candle 1: Red small -->
          <line x1="-30" y1="70" x2="-30" y2="140" stroke="#ff3b69" stroke-width="1.8"/>
          <rect x="-45" y="85" width="30" height="40" fill="#ff3b69" rx="2"/>
          <text x="-30" y="110" text-anchor="middle" fill="#fff" font-size="9.5">ĐỎ</text>

          <!-- Candle 2: Green giant -->
          <line x1="25" y1="45" x2="25" y2="165" stroke="#00c076" stroke-width="2"/>
          <rect x="5" y="60" width="40" height="90" fill="#00c076" stroke="#26e396" stroke-width="1.5" rx="3"/>
          <text x="25" y="110" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">XANH<br/>TRÙM</text>

          <text x="0" y="195" text-anchor="middle" fill="#00c076" font-size="12" font-weight="bold">BULLISH ENGULFING (MUA MẠNH)</text>
          <text x="0" y="212" text-anchor="middle" fill="#94a3b8" font-size="9.5">Nến xanh nuốt trọn nến đỏ trước đó</text>
        </g>

        <!-- RIGHT: BEARISH ENGULFING -->
        <g transform="translate(550, 30)">
          <!-- Candle 1: Green small -->
          <line x1="-30" y1="70" x2="-30" y2="140" stroke="#00c076" stroke-width="1.8"/>
          <rect x="-45" y="85" width="30" height="40" fill="#00c076" rx="2"/>
          <text x="-30" y="110" text-anchor="middle" fill="#fff" font-size="9.5">XANH</text>

          <!-- Candle 2: Red giant -->
          <line x1="25" y1="45" x2="25" y2="165" stroke="#ff3b69" stroke-width="2"/>
          <rect x="5" y="60" width="40" height="90" fill="#ff3b69" stroke="#ff6b8f" stroke-width="1.5" rx="3"/>
          <text x="25" y="110" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">ĐỎ<br/>TRÙM</text>

          <text x="0" y="195" text-anchor="middle" fill="#ff3b69" font-size="12" font-weight="bold">BEARISH ENGULFING (BÁN MẠNH)</text>
          <text x="0" y="212" text-anchor="middle" fill="#94a3b8" font-size="9.5">Nến đỏ nuốt trọn nến xanh trước đó</text>
        </g>
      </svg>
    `;
  },

  // 6.B. CHAPTER 4.1: HAMMER & SHOOTING STAR COMPARISON
  renderHammerShootingStarSvg() {
    return `
      <svg viewBox="0 0 740 260" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="370" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">🔨 NẾN HAMMER (BÚA ĐÁY) VS 🌠 SHOOTING STAR (SAO BĂNG ĐỈNH) - CHƯƠNG 4.1</text>

        <!-- LEFT: HAMMER -->
        <g transform="translate(190, 40)">
          <!-- Downtrend path -->
          <path d="M -110 50 L -60 90 L -30 110" fill="none" stroke="#ff3b69" stroke-width="2" stroke-dasharray="3,3"/>
          
          <!-- Hammer Candle -->
          <line x1="0" y1="90" x2="0" y2="105" stroke="#00c076" stroke-width="2"/>
          <rect x="-24" y="105" width="48" height="30" fill="#00c076" stroke="#26e396" stroke-width="1.5" rx="3"/>
          <line x1="0" y1="135" x2="0" y2="195" stroke="#00c076" stroke-width="2.8"/>
          
          <!-- Support Zone -->
          <rect x="-110" y="140" width="220" height="24" fill="rgba(0, 192, 118, 0.1)" stroke="rgba(0, 192, 118, 0.4)" stroke-dasharray="4,2" rx="3"/>
          <text x="-100" y="156" fill="#00c076" font-size="9" font-weight="bold">HỖ TRỢ ĐÁY</text>

          <text x="75" y="165" fill="#38bdf8" font-size="9.5" font-weight="bold">Râu dài 2-3x thân</text>
          <line x1="10" y1="165" x2="65" y2="165" stroke="#38bdf8" stroke-dasharray="2,2"/>

          <text x="0" y="222" text-anchor="middle" fill="#00c076" font-size="12.5" font-weight="bold">NẾN HAMMER (ĐẢO CHIỀU TĂNG)</text>
          <text x="0" y="238" text-anchor="middle" fill="#94a3b8" font-size="9.5">Phe mua bắt đáy gom hàng đẩy bật ngược</text>
        </g>

        <!-- RIGHT: SHOOTING STAR -->
        <g transform="translate(550, 40)">
          <!-- Uptrend path -->
          <path d="M -110 180 L -60 140 L -30 120" fill="none" stroke="#00c076" stroke-width="2" stroke-dasharray="3,3"/>
          
          <!-- Shooting Star Candle -->
          <line x1="0" y1="45" x2="0" y2="105" stroke="#ff3b69" stroke-width="2.8"/>
          <rect x="-24" y="105" width="48" height="30" fill="#ff3b69" stroke="#ff6b8f" stroke-width="1.5" rx="3"/>
          <line x1="0" y1="135" x2="0" y2="148" stroke="#ff3b69" stroke-width="2"/>
          
          <!-- Resistance Zone -->
          <rect x="-110" y="75" width="220" height="24" fill="rgba(255, 59, 105, 0.1)" stroke="rgba(255, 59, 105, 0.4)" stroke-dasharray="4,2" rx="3"/>
          <text x="-100" y="91" fill="#ff3b69" font-size="9" font-weight="bold">KHÁNG CỰ ĐỈNH</text>

          <text x="75" y="75" fill="#f59e0b" font-size="9.5" font-weight="bold">Râu trên xả mạnh</text>
          <line x1="10" y1="75" x2="65" y2="75" stroke="#f59e0b" stroke-dasharray="2,2"/>

          <text x="0" y="222" text-anchor="middle" fill="#ff3b69" font-size="12.5" font-weight="bold">SHOOTING STAR (ĐẢO CHIỀU GIẢM)</text>
          <text x="0" y="238" text-anchor="middle" fill="#94a3b8" font-size="9.5">Phe bán chặn đứng xả hàng đè bẹp lực mua</text>
        </g>
      </svg>
    `;
  },

  // 6.C. CHAPTER 4.2.B: MORNING STAR VS EVENING STAR
  renderMorningEveningStarSvg() {
    return `
      <svg viewBox="0 0 740 270" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="370" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">🌟 MÔ HÌNH SAO MAI (MORNING STAR) VS SAO HÔM (EVENING STAR) - CHƯƠNG 4.2.B</text>

        <!-- LEFT: MORNING STAR (BULLISH REVERSAL) -->
        <g transform="translate(190, 45)">
          <rect x="-140" y="-10" width="280" height="200" fill="#0c121e" stroke="#1e293b" rx="8"/>
          
          <!-- 50% Benchmark Line -->
          <line x1="-120" y1="65" x2="120" y2="65" stroke="#64748b" stroke-dasharray="3,2"/>
          <text x="115" y="61" text-anchor="end" fill="#64748b" font-size="8.5">&gt; 50% Thân Nến 1</text>

          <!-- Candle 1: Red Big -->
          <g transform="translate(-70, 20)">
            <line x1="0" y1="0" x2="0" y2="15" stroke="#ff3b69" stroke-width="2"/>
            <rect x="-18" y="15" width="36" height="70" fill="#ff3b69" stroke="#ff6b8f" stroke-width="1.2" rx="2"/>
            <line x1="0" y1="85" x2="0" y2="98" stroke="#ff3b69" stroke-width="2"/>
            <text x="0" y="55" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">1. ĐỎ LỚN</text>
          </g>

          <!-- Candle 2: Small / Doji at bottom -->
          <g transform="translate(0, 100)">
            <line x1="0" y1="0" x2="0" y2="35" stroke="#f59e0b" stroke-width="2"/>
            <rect x="-12" y="8" width="24" height="18" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" rx="2"/>
            <text x="0" y="48" text-anchor="middle" fill="#f59e0b" font-size="8.5" font-weight="bold">2. DOJI ĐÁY</text>
          </g>

          <!-- Candle 3: Green Big > 50% -->
          <g transform="translate(70, 25)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#00c076" stroke-width="2"/>
            <rect x="-18" y="12" width="36" height="75" fill="#00c076" stroke="#26e396" stroke-width="1.5" rx="2"/>
            <line x1="0" y1="87" x2="0" y2="98" stroke="#00c076" stroke-width="2"/>
            <text x="0" y="55" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">3. XANH LỚN</text>
          </g>

          <text x="0" y="168" text-anchor="middle" fill="#00c076" font-size="12" font-weight="bold">MORNING STAR (SAO MAI ➔ MUA)</text>
          <text x="0" y="184" text-anchor="middle" fill="#94a3b8" font-size="9">Đảo chiều từ GIẢM sang TĂNG MẠNH</text>
        </g>

        <!-- RIGHT: EVENING STAR (BEARISH REVERSAL) -->
        <g transform="translate(550, 45)">
          <rect x="-140" y="-10" width="280" height="200" fill="#0c121e" stroke="#1e293b" rx="8"/>
          
          <!-- 50% Benchmark Line -->
          <line x1="-120" y1="75" x2="120" y2="75" stroke="#64748b" stroke-dasharray="3,2"/>
          <text x="-115" y="71" text-anchor="start" fill="#64748b" font-size="8.5">&gt; 50% Thân Nến 1</text>

          <!-- Candle 1: Green Big -->
          <g transform="translate(-70, 30)">
            <line x1="0" y1="0" x2="0" y2="15" stroke="#00c076" stroke-width="2"/>
            <rect x="-18" y="15" width="36" height="70" fill="#00c076" stroke="#26e396" stroke-width="1.2" rx="2"/>
            <line x1="0" y1="85" x2="0" y2="98" stroke="#00c076" stroke-width="2"/>
            <text x="0" y="55" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">1. XANH LỚN</text>
          </g>

          <!-- Candle 2: Small / Doji at top -->
          <g transform="translate(0, 0)">
            <line x1="0" y1="0" x2="0" y2="35" stroke="#f59e0b" stroke-width="2"/>
            <rect x="-12" y="8" width="24" height="18" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" rx="2"/>
            <text x="0" y="-4" text-anchor="middle" fill="#f59e0b" font-size="8.5" font-weight="bold">2. DOJI ĐỈNH</text>
          </g>

          <!-- Candle 3: Red Big > 50% -->
          <g transform="translate(70, 35)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#ff3b69" stroke-width="2"/>
            <rect x="-18" y="12" width="36" height="75" fill="#ff3b69" stroke="#ff6b8f" stroke-width="1.5" rx="2"/>
            <line x1="0" y1="87" x2="0" y2="98" stroke="#ff3b69" stroke-width="2"/>
            <text x="0" y="55" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">3. ĐỎ LỚN</text>
          </g>

          <text x="0" y="168" text-anchor="middle" fill="#ff3b69" font-size="12" font-weight="bold">EVENING STAR (SAO HÔM ➔ BÁN)</text>
          <text x="0" y="184" text-anchor="middle" fill="#94a3b8" font-size="9">Đảo chiều từ TĂNG sang GIẢM MẠNH</text>
        </g>
      </svg>
    `;
  },

  // 6.D. CHAPTER 5.1: SUPPORT & RESISTANCE ZONES
  renderSupportResistanceZoneSvg() {
    return `
      <svg viewBox="0 0 740 230" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="370" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">🏢 VÙNG HỖ TRỢ (MẶT SÀN) & VÙNG KHÁNG CỰ (TRẦN NHÀ) - CHƯƠNG 5.1</text>

        <!-- Resistance Zone Box -->
        <rect x="50" y="45" width="640" height="30" fill="rgba(255, 59, 105, 0.12)" stroke="rgba(255, 59, 105, 0.5)" stroke-dasharray="4,2" rx="4"/>
        <text x="60" y="65" fill="#ff3b69" font-size="11" font-weight="bold">🔴 VÙNG KHÁNG CỰ (TRẦN NHÀ - NƠI BÁN RA / CHỐT LỜI CỦA PHE GẤU)</text>

        <!-- Support Zone Box -->
        <rect x="50" y="165" width="640" height="30" fill="rgba(0, 192, 118, 0.12)" stroke="rgba(0, 192, 118, 0.5)" stroke-dasharray="4,2" rx="4"/>
        <text x="60" y="185" fill="#00c076" font-size="11" font-weight="bold">🟢 VÙNG HỖ TRỢ (MẶT SÀN - NƠI MUA VÀO / ĐỠ GIÁ CỦA PHE BÒ)</text>

        <!-- Price Waves bouncing between zones -->
        <path d="M 80 165 L 170 60 L 260 165 L 360 60 L 460 165 L 560 60 L 650 165" fill="none" stroke="#38bdf8" stroke-width="2.8" stroke-linecap="round"/>
        
        <!-- Bouncing Dots -->
        <circle cx="170" cy="60" r="5" fill="#ff3b69"/>
        <circle cx="360" cy="60" r="5" fill="#ff3b69"/>
        <circle cx="560" cy="60" r="5" fill="#ff3b69"/>
        <circle cx="260" cy="165" r="5" fill="#00c076"/>
        <circle cx="460" cy="165" r="5" fill="#00c076"/>
        <circle cx="650" cy="165" r="5" fill="#00c076"/>

        <text x="370" y="215" text-anchor="middle" fill="#94a3b8" font-size="10.5">💡 Quy tắc vàng: Mua tại Vùng Hỗ Trợ Mặt Sàn - Bán tại Vùng Kháng Cự Trần Nhà</text>
      </svg>
    `;
  },

  // 6.E. CHAPTER 5.2: ROLE REVERSAL (BREAKOUT & RETEST)
  renderRoleReversalDiagramSvg() {
    return `
      <svg viewBox="0 0 740 240" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="370" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">🔄 QUY TẮC CHUYỂN ĐỔI VAI TRÒ: BREAKOUT & RETEST - CHƯƠNG 5.2</text>

        <!-- Old Resistance Zone -->
        <rect x="40" y="100" width="310" height="26" fill="rgba(255, 59, 105, 0.12)" stroke="rgba(255, 59, 105, 0.5)" stroke-dasharray="4,2" rx="3"/>
        <text x="50" y="117" fill="#ff3b69" font-size="10.5" font-weight="bold">🔴 KHÁNG CỰ CŨ (BỊ ĐỤC THỦNG)</text>

        <!-- New Support Zone -->
        <rect x="350" y="100" width="350" height="26" fill="rgba(0, 192, 118, 0.12)" stroke="rgba(0, 192, 118, 0.5)" stroke-dasharray="4,2" rx="3"/>
        <text x="360" y="117" fill="#00c076" font-size="10.5" font-weight="bold">🟢 BIẾN THÀNH HỖ TRỢ MỚI (RETEST)</text>

        <!-- Wave Path -->
        <path d="M 60 170 L 120 110 L 180 165 L 240 110 L 320 165 L 420 50 L 490 100 L 620 40" fill="none" stroke="#38bdf8" stroke-width="2.8" stroke-linecap="round"/>

        <!-- Annotations -->
        <circle cx="420" cy="50" r="5" fill="#38bdf8"/>
        <text x="420" y="40" text-anchor="middle" fill="#38bdf8" font-size="11" font-weight="bold">BREAKOUT 💥 (Volume lớn)</text>

        <circle cx="490" cy="100" r="5" fill="#00c076"/>
        <text x="490" y="145" text-anchor="middle" fill="#00c076" font-size="11" font-weight="bold">🎯 ĐIỂM VÀO MUA RETEST</text>

        <path d="M 600 45 L 620 40 L 610 58" fill="#00c076"/>
        <text x="630" y="35" fill="#00c076" font-size="11" font-weight="bold">TĂNG TIẾP 🚀</text>
      </svg>
    `;
  },

  // 6.F. CHAPTER 6.1: MARKET STRUCTURE (UPTREND, DOWNTREND, SIDEWAY)
  renderMarketStructureSvg() {
    return `
      <svg viewBox="0 0 740 250" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="370" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">📈 3 TRẠNG THÁI CẤU TRÚC THỊ TRƯỜNG (MARKET STRUCTURE) - CHƯƠNG 6.1</text>

        <!-- 1. UPTREND -->
        <g transform="translate(30, 45)">
          <rect width="215" height="185" fill="#0c121e" stroke="#00c076" stroke-width="1.5" rx="6"/>
          <text x="107" y="24" text-anchor="middle" fill="#00c076" font-size="12" font-weight="bold">🟢 1. UPTREND (TĂNG)</text>
          <text x="107" y="40" text-anchor="middle" fill="#94a3b8" font-size="9">Đỉnh sau cao hơn (HH)<br/>Đáy sau cao hơn (HL)</text>
          
          <path d="M 25 150 L 65 105 L 95 130 L 140 75 L 165 98 L 195 50" fill="none" stroke="#00c076" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="65" cy="105" r="3.5" fill="#38bdf8"/><text x="65" y="96" text-anchor="middle" fill="#38bdf8" font-size="8" font-weight="bold">HH1</text>
          <circle cx="95" cy="130" r="3.5" fill="#00c076"/><text x="95" y="144" text-anchor="middle" fill="#00c076" font-size="8" font-weight="bold">HL1</text>
          <circle cx="140" cy="75" r="3.5" fill="#38bdf8"/><text x="140" y="66" text-anchor="middle" fill="#38bdf8" font-size="8" font-weight="bold">HH2</text>
          <circle cx="165" cy="98" r="3.5" fill="#00c076"/><text x="165" y="112" text-anchor="middle" fill="#00c076" font-size="8" font-weight="bold">HL2</text>
        </g>

        <!-- 2. DOWNTREND -->
        <g transform="translate(262, 45)">
          <rect width="215" height="185" fill="#0c121e" stroke="#ff3b69" stroke-width="1.5" rx="6"/>
          <text x="107" y="24" text-anchor="middle" fill="#ff3b69" font-size="12" font-weight="bold">🔴 2. DOWNTREND (GIẢM)</text>
          <text x="107" y="40" text-anchor="middle" fill="#94a3b8" font-size="9">Đỉnh sau thấp hơn (LH)<br/>Đáy sau thấp hơn (LL)</text>

          <path d="M 25 55 L 65 110 L 95 85 L 140 140 L 165 118 L 195 165" fill="none" stroke="#ff3b69" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="25" cy="55" r="3.5" fill="#ff3b69"/><text x="25" y="46" text-anchor="middle" fill="#ff3b69" font-size="8" font-weight="bold">High</text>
          <circle cx="65" cy="110" r="3.5" fill="#f59e0b"/><text x="65" y="124" text-anchor="middle" fill="#f59e0b" font-size="8" font-weight="bold">LL1</text>
          <circle cx="95" cy="85" r="3.5" fill="#ff3b69"/><text x="95" y="76" text-anchor="middle" fill="#ff3b69" font-size="8" font-weight="bold">LH1</text>
          <circle cx="140" cy="140" r="3.5" fill="#f59e0b"/><text x="140" y="154" text-anchor="middle" fill="#f59e0b" font-size="8" font-weight="bold">LL2</text>
          <circle cx="165" cy="118" r="3.5" fill="#ff3b69"/><text x="165" y="109" text-anchor="middle" fill="#ff3b69" font-size="8" font-weight="bold">LH2</text>
        </g>

        <!-- 3. SIDEWAY -->
        <g transform="translate(495, 45)">
          <rect width="215" height="185" fill="#0c121e" stroke="#f59e0b" stroke-width="1.5" rx="6"/>
          <text x="107" y="24" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="bold">⚪ 3. SIDEWAY (ĐI NGANG)</text>
          <text x="107" y="40" text-anchor="middle" fill="#94a3b8" font-size="9">Đỉnh bằng Kháng cự (R)<br/>Đáy bằng Hỗ trợ (S)</text>

          <line x1="20" y1="75" x2="195" y2="75" stroke="#ff3b69" stroke-dasharray="3,2"/>
          <line x1="20" y1="145" x2="195" y2="145" stroke="#00c076" stroke-dasharray="3,2"/>

          <path d="M 25 145 L 60 75 L 100 145 L 140 75 L 180 145" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
          <text x="190" y="72" fill="#ff3b69" font-size="8" font-weight="bold">R</text>
          <text x="190" y="155" fill="#00c076" font-size="8" font-weight="bold">S</text>
        </g>
      </svg>
    `;
  },

  // 6.G. CHAPTER 7.2: FRACTAL 5-CANDLE SWING HIGH / LOW
  renderFractalSwingSvg() {
    return `
      <svg viewBox="0 0 740 240" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="370" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">🎯 QUY TẮC FRACTAL 5 NẾN XÁC ĐỊNH ĐỈNH (SWING HIGH) & ĐÁY (SWING LOW) - CHƯƠNG 7.2</text>

        <!-- LEFT: SWING HIGH -->
        <g transform="translate(190, 40)">
          <rect x="-140" y="-5" width="280" height="185" fill="#0c121e" stroke="#1e293b" rx="8"/>
          
          <!-- 5 Candles -->
          <!-- 1 -->
          <g transform="translate(-80, 50)"><line x1="0" y1="0" x2="0" y2="50" stroke="#00c076" stroke-width="2"/><rect x="-10" y="10" width="20" height="30" fill="#00c076" rx="2"/><text x="0" y="65" text-anchor="middle" fill="#94a3b8" font-size="8.5">N1</text></g>
          <!-- 2 -->
          <g transform="translate(-40, 30)"><line x1="0" y1="0" x2="0" y2="55" stroke="#00c076" stroke-width="2"/><rect x="-10" y="10" width="20" height="35" fill="#00c076" rx="2"/><text x="0" y="70" text-anchor="middle" fill="#94a3b8" font-size="8.5">N2</text></g>
          <!-- 3: PEAK -->
          <g transform="translate(0, 10)"><line x1="0" y1="0" x2="0" y2="65" stroke="#f59e0b" stroke-width="2.5"/><rect x="-12" y="10" width="24" height="42" fill="#f59e0b" rx="2"/><text x="0" y="78" text-anchor="middle" fill="#fbbf24" font-size="9" font-weight="bold">N3 ⭐</text></g>
          <!-- 4 -->
          <g transform="translate(40, 35)"><line x1="0" y1="0" x2="0" y2="50" stroke="#ff3b69" stroke-width="2"/><rect x="-10" y="10" width="20" height="30" fill="#ff3b69" rx="2"/><text x="0" y="65" text-anchor="middle" fill="#94a3b8" font-size="8.5">N4</text></g>
          <!-- 5 -->
          <g transform="translate(80, 55)"><line x1="0" y1="0" x2="0" y2="45" stroke="#ff3b69" stroke-width="2"/><rect x="-10" y="10" width="20" height="25" fill="#ff3b69" rx="2"/><text x="0" y="60" text-anchor="middle" fill="#94a3b8" font-size="8.5">N5</text></g>

          <text x="0" y="150" text-anchor="middle" fill="#38bdf8" font-size="11.5" font-weight="bold">ĐỈNH CHUẨN (SWING HIGH)</text>
          <text x="0" y="166" text-anchor="middle" fill="#94a3b8" font-size="8.5">Nến 3 cao nhất, 2 nến trái & 2 nến phải thấp hơn</text>
        </g>

        <!-- RIGHT: SWING LOW -->
        <g transform="translate(550, 40)">
          <rect x="-140" y="-5" width="280" height="185" fill="#0c121e" stroke="#1e293b" rx="8"/>
          
          <!-- 5 Candles -->
          <!-- 1 -->
          <g transform="translate(-80, 15)"><line x1="0" y1="0" x2="0" y2="45" stroke="#ff3b69" stroke-width="2"/><rect x="-10" y="10" width="20" height="25" fill="#ff3b69" rx="2"/><text x="0" y="60" text-anchor="middle" fill="#94a3b8" font-size="8.5">N1</text></g>
          <!-- 2 -->
          <g transform="translate(-40, 30)"><line x1="0" y1="0" x2="0" y2="50" stroke="#ff3b69" stroke-width="2"/><rect x="-10" y="10" width="20" height="30" fill="#ff3b69" rx="2"/><text x="0" y="65" text-anchor="middle" fill="#94a3b8" font-size="8.5">N2</text></g>
          <!-- 3: LOWEST -->
          <g transform="translate(0, 45)"><line x1="0" y1="0" x2="0" y2="65" stroke="#00c076" stroke-width="2.5"/><rect x="-12" y="10" width="24" height="42" fill="#00c076" rx="2"/><text x="0" y="78" text-anchor="middle" fill="#00c076" font-size="9" font-weight="bold">N3 ⭐</text></g>
          <!-- 4 -->
          <g transform="translate(40, 30)"><line x1="0" y1="0" x2="0" y2="50" stroke="#00c076" stroke-width="2"/><rect x="-10" y="10" width="20" height="30" fill="#00c076" rx="2"/><text x="0" y="65" text-anchor="middle" fill="#94a3b8" font-size="8.5">N4</text></g>
          <!-- 5 -->
          <g transform="translate(80, 15)"><line x1="0" y1="0" x2="0" y2="45" stroke="#00c076" stroke-width="2"/><rect x="-10" y="10" width="20" height="25" fill="#00c076" rx="2"/><text x="0" y="60" text-anchor="middle" fill="#94a3b8" font-size="8.5">N5</text></g>

          <text x="0" y="150" text-anchor="middle" fill="#00c076" font-size="11.5" font-weight="bold">ĐÁY CHUẨN (SWING LOW)</text>
          <text x="0" y="166" text-anchor="middle" fill="#94a3b8" font-size="8.5">Nến 3 thấp nhất, 2 nến trái & 2 nến phải cao hơn</text>
        </g>
      </svg>
    `;
  },

  // 6.H. CHAPTER 10.2: RISK TO REWARD R:R = 1:2 MATHEMATICAL SETUP
  renderRiskRewardDiagramSvg() {
    return `
      <svg viewBox="0 0 740 230" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="370" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">⚖️ SỨC MẠNH TOÁN HỌC CỦA TỶ LỆ R:R = 1 : 2 (LÃI ĐẬM DÙ CHỈ ĐÚNG 40%) - CHƯƠNG 10.2</text>

        <!-- Trade Target Box -->
        <g transform="translate(60, 45)">
          <rect width="620" height="150" fill="#0c121e" stroke="#1e293b" rx="8"/>
          
          <!-- TP Box -->
          <rect x="20" y="15" width="280" height="50" fill="rgba(16, 185, 129, 0.12)" stroke="#10b981" rx="4"/>
          <text x="35" y="38" fill="#10b981" font-size="12" font-weight="bold">🎯 TAKE PROFIT (+20% / +$200)</text>
          <text x="35" y="54" fill="#cbd5e1" font-size="9.5">Mục tiêu lợi nhuận gấp đôi rủi ro</text>

          <!-- Entry Line -->
          <line x1="20" y1="80" x2="300" y2="80" stroke="#3b82f6" stroke-width="2.5"/>
          <text x="35" y="75" fill="#3b82f6" font-size="10.5" font-weight="bold">🔵 ENTRY ($0 - ĐIỂM VÀO LỆNH)</text>

          <!-- SL Box -->
          <rect x="20" y="95" width="280" height="40" fill="rgba(239, 68, 68, 0.12)" stroke="#ef4444" rx="4"/>
          <text x="35" y="115" fill="#ef4444" font-size="11.5" font-weight="bold">🛑 STOP LOSS (-10% / -$100)</text>
          <text x="35" y="128" fill="#cbd5e1" font-size="9">Cắt lỗ tối đa 1% tổng tài khoản</text>

          <!-- 10 Trades Math Result Table on Right -->
          <g transform="translate(320, 15)">
            <rect width="280" height="120" fill="#080c14" stroke="#334155" rx="6"/>
            <text x="140" y="22" text-anchor="middle" fill="#fbbf24" font-size="11" font-weight="bold">KẾT QUẢ 10 LỆNH TRADE (WINRATE 40%)</text>
            <line x1="10" y1="30" x2="270" y2="30" stroke="#1e293b"/>
            
            <text x="15" y="50" fill="#f87171" font-size="10">• 6 Lệnh THUA x $100 = <tspan fill="#ef4444" font-weight="bold">-$600</tspan></text>
            <text x="15" y="72" fill="#34d399" font-size="10">• 4 Lệnh THẮNG x $200 = <tspan fill="#10b981" font-weight="bold">+$800</tspan></text>
            <line x1="15" y1="82" x2="265" y2="82" stroke="#334155"/>
            <text x="140" y="104" text-anchor="middle" fill="#34d399" font-size="13" font-weight="bold">➔ TỔNG KẾT: LÃI DƯƠNG +$200 USD! 🚀</text>
          </g>
        </g>
      </svg>
    `;
  },

  // 7. CHAPTER 8.2: RSI OSCILLATOR GAUGE & DIVERGENCE
  renderRsiOscillatorSvg() {

    return `
      <svg viewBox="0 0 740 230" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="370" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">📊 CHỈ SỐ RSI (0 - 100) & PHÂN KỲ ĐẢO CHIỀU TĂNG GIÁ (DIVERGENCE) - CHƯƠNG 8.2</text>

        <!-- RSI Scale Box -->
        <rect x="60" y="45" width="620" height="130" fill="#0c121e" stroke="#1e293b" rx="6"/>

        <!-- Zones -->
        <rect x="60" y="45" width="620" height="35" fill="rgba(255, 59, 105, 0.15)"/>
        <line x1="60" y1="80" x2="680" y2="80" stroke="#ff3b69" stroke-dasharray="4,3"/>
        <text x="690" y="84" fill="#ff3b69" font-size="10" font-weight="bold">70: QUÁ MUA (Overbought)</text>

        <line x1="60" y1="110" x2="680" y2="110" stroke="#64748b" stroke-dasharray="2,2"/>
        <text x="690" y="114" fill="#94a3b8" font-size="10">50: TRUNG TÍNH</text>

        <rect x="60" y="140" width="620" height="35" fill="rgba(0, 192, 118, 0.15)"/>
        <line x1="60" y1="140" x2="680" y2="140" stroke="#00c076" stroke-dasharray="4,3"/>
        <text x="690" y="144" fill="#00c076" font-size="10" font-weight="bold">30: QUÁ BÁN (Oversold)</text>

        <!-- RSI Line with Divergence -->
        <path d="M 80 100 Q 140 60 200 75 T 320 155 T 440 120 T 560 145 T 660 70" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round"/>

        <!-- Annotation Divergence -->
        <circle cx="320" cy="155" r="4" fill="#00c076"/>
        <circle cx="560" cy="145" r="4" fill="#00c076"/>
        <line x1="320" y1="155" x2="560" y2="145" stroke="#00c076" stroke-width="2"/>
        <text x="440" y="165" text-anchor="middle" fill="#00c076" font-size="10" font-weight="bold">ĐÁY RSI DÂNG CAO (HL) ➔ PHÂN KỲ TĂNG GIÁ 🚀</text>

        <text x="370" y="205" text-anchor="middle" fill="#cbd5e1" font-size="11">RSI &gt; 70: Cảnh báo chốt lời | RSI &lt; 30: Vùng gom hàng bắt đáy</text>
      </svg>
    `;
  },

  // 8. CHAPTER 9: SUCCESS TRIANGLE
  renderSuccessTriangleSvg() {
    return `
      <svg viewBox="0 0 740 220" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="370" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">🔺 TAM GIÁC THÀNH CÔNG TRONG GIAO DỊCH CRYPTO - CHƯƠNG 9</text>

        <!-- 3 Pillars -->
        <!-- 1. Mindset 50% -->
        <g transform="translate(60, 50)">
          <rect width="190" height="135" fill="rgba(168, 85, 247, 0.1)" stroke="#a855f7" stroke-width="2" rx="8"/>
          <text x="95" y="30" text-anchor="middle" fill="#c084fc" font-size="14" font-weight="800">50% TÂM LÝ</text>
          <text x="95" y="55" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Kỷ luật & Cảm xúc</text>
          <line x1="20" y1="68" x2="170" y2="68" stroke="#334155"/>
          <text x="15" y="88" fill="#cbd5e1" font-size="10">• Không FOMO đỉnh</text>
          <text x="15" y="105" fill="#cbd5e1" font-size="10">• Không FUD hoang mang</text>
          <text x="15" y="122" fill="#cbd5e1" font-size="10">• Tránh Revenge Trading</text>
        </g>

        <!-- 2. Risk Management 30% -->
        <g transform="translate(275, 50)">
          <rect width="190" height="135" fill="rgba(0, 192, 118, 0.1)" stroke="#00c076" stroke-width="2" rx="8"/>
          <text x="95" y="30" text-anchor="middle" fill="#26e396" font-size="14" font-weight="800">30% QUẢN LÝ VỐN</text>
          <text x="95" y="55" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Nguyên Tắc Sống Còn</text>
          <line x1="20" y1="68" x2="170" y2="68" stroke="#334155"/>
          <text x="15" y="88" fill="#cbd5e1" font-size="10">• Rủi ro 1-2% / lệnh</text>
          <text x="15" y="105" fill="#cbd5e1" font-size="10">• Tỷ lệ R:R ≥ 1:2</text>
          <text x="15" y="122" fill="#cbd5e1" font-size="10">• Tuyệt đối đặt Stop Loss</text>
        </g>

        <!-- 3. Technical Analysis 20% -->
        <g transform="translate(490, 50)">
          <rect width="190" height="135" fill="rgba(56, 189, 248, 0.1)" stroke="#38bdf8" stroke-width="2" rx="8"/>
          <text x="95" y="30" text-anchor="middle" fill="#38bdf8" font-size="14" font-weight="800">20% KỸ THUẬT</text>
          <text x="95" y="55" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Đọc Chart & Nến</text>
          <line x1="20" y1="68" x2="170" y2="68" stroke="#334155"/>
          <text x="15" y="88" fill="#cbd5e1" font-size="10">• Mô hình nến đảo chiều</text>
          <text x="15" y="105" fill="#cbd5e1" font-size="10">• Hỗ trợ & Kháng cự 4H</text>
          <text x="15" y="122" fill="#cbd5e1" font-size="10">• Đa khung thời gian 15m</text>
        </g>
      </svg>
    `;
  },

  // 9. CHAPTER 9: CAPITAL FLOW CYCLE & BITCOIN DOMINANCE SVG
  renderCapitalFlowCycleSvg() {
    return `
      <svg viewBox="0 0 760 260" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="380" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">🌊 CHU KỲ 5 PHA LUÂN CHUYỂN DÒNG TIỀN & BẢN VỊ BITCOIN (CHƯƠNG 9.2)</text>

        <!-- Phase 1: BTC -->
        <g transform="translate(20, 50)">
          <rect width="130" height="150" fill="#1e1508" stroke="#f59e0b" stroke-width="2" rx="8"/>
          <text x="65" y="26" text-anchor="middle" fill="#fbbf24" font-size="13" font-weight="bold">PHA 1: BTC</text>
          <text x="65" y="44" text-anchor="middle" fill="#fff" font-size="10">Dòng Vốn Ngoại</text>
          <line x1="10" y1="54" x2="120" y2="54" stroke="#451a03"/>
          <text x="10" y="74" fill="#cbd5e1" font-size="9.5">• Tiền đổ vào BTC</text>
          <text x="10" y="94" fill="#cbd5e1" font-size="9.5">• BTC.D TĂNG cao</text>
          <text x="10" y="114" fill="#f87171" font-size="9.5">• Altcoin bị hút máu</text>
          <text x="10" y="136" fill="#fbbf24" font-size="9" font-weight="bold">➔ HODL BTC</text>
        </g>

        <path d="M 155 125 L 170 125" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="3,2"/>
        <polygon points="170,121 176,125 170,129" fill="#f59e0b"/>

        <!-- Phase 2: ETH & Top Coins -->
        <g transform="translate(176, 50)">
          <rect width="130" height="150" fill="#0b1329" stroke="#3b82f6" stroke-width="2" rx="8"/>
          <text x="65" y="26" text-anchor="middle" fill="#60a5fa" font-size="13" font-weight="bold">PHA 2: TOP COIN</text>
          <text x="65" y="44" text-anchor="middle" fill="#fff" font-size="10">ETH, SOL, BNB</text>
          <line x1="10" y1="54" x2="120" y2="54" stroke="#1e3a8a"/>
          <text x="10" y="74" fill="#cbd5e1" font-size="9.5">• Lãi BTC chốt sang</text>
          <text x="10" y="94" fill="#cbd5e1" font-size="9.5">• ETH/BTC bật tăng</text>
          <text x="10" y="114" fill="#38bdf8" font-size="9.5">• Top L1 lập đỉnh</text>
          <text x="10" y="136" fill="#60a5fa" font-size="9" font-weight="bold">➔ Trade Top Cap</text>
        </g>

        <path d="M 311 125 L 326 125" stroke="#3b82f6" stroke-width="2.5" stroke-dasharray="3,2"/>
        <polygon points="326,121 332,125 326,129" fill="#3b82f6"/>

        <!-- Phase 3: Mid / Low Cap -->
        <g transform="translate(332, 50)">
          <rect width="130" height="150" fill="#042f2e" stroke="#14b8a6" stroke-width="2" rx="8"/>
          <text x="65" y="26" text-anchor="middle" fill="#2dd4bf" font-size="12.5" font-weight="bold">PHA 3: MID/LOW</text>
          <text x="65" y="44" text-anchor="middle" fill="#fff" font-size="10">DeFi, AI, Layer 2</text>
          <line x1="10" y1="54" x2="120" y2="54" stroke="#134e4a"/>
          <text x="10" y="74" fill="#cbd5e1" font-size="9.5">• Tiền tràn sang Eco</text>
          <text x="10" y="94" fill="#cbd5e1" font-size="9.5">• ALTSEASON nổ rộ</text>
          <text x="10" y="114" fill="#2dd4bf" font-size="9.5">• X2 - X5 tài khoản</text>
          <text x="10" y="136" fill="#2dd4bf" font-size="9" font-weight="bold">➔ Đỉnh Altseason</text>
        </g>

        <path d="M 467 125 L 482 125" stroke="#14b8a6" stroke-width="2.5" stroke-dasharray="3,2"/>
        <polygon points="482,121 488,125 482,129" fill="#14b8a6"/>

        <!-- Phase 4: Memecoins -->
        <g transform="translate(488, 50)">
          <rect width="130" height="150" fill="#2e0819" stroke="#f43f5e" stroke-width="2" rx="8"/>
          <text x="65" y="26" text-anchor="middle" fill="#fb7185" font-size="13" font-weight="bold">PHA 4: MEME</text>
          <text x="65" y="44" text-anchor="middle" fill="#fff" font-size="10">FOMO Điên Cuồng</text>
          <line x1="10" y1="54" x2="120" y2="54" stroke="#881337"/>
          <text x="10" y="74" fill="#cbd5e1" font-size="9.5">• Coin chó mèo bay</text>
          <text x="10" y="94" fill="#cbd5e1" font-size="9.5">• Đám đông tham lam</text>
          <text x="10" y="114" fill="#f43f5e" font-size="9.5">• Dấu hiệu đỉnh chu kỳ</text>
          <text x="10" y="136" fill="#fb7185" font-size="9" font-weight="bold">➔ Cảnh giác cao</text>
        </g>

        <path d="M 623 125 L 638 125" stroke="#f43f5e" stroke-width="2.5" stroke-dasharray="3,2"/>
        <polygon points="638,121 644,125 638,129" fill="#f43f5e"/>

        <!-- Phase 5: Stablecoin / Cash -->
        <g transform="translate(644, 50)">
          <rect width="100" height="150" fill="#06281e" stroke="#10b981" stroke-width="2" rx="8"/>
          <text x="50" y="26" text-anchor="middle" fill="#34d399" font-size="12" font-weight="bold">PHA 5: USDT</text>
          <text x="50" y="44" text-anchor="middle" fill="#fff" font-size="9.5">Chốt Lời Thoát</text>
          <line x1="8" y1="54" x2="92" y2="54" stroke="#065f46"/>
          <text x="8" y="74" fill="#cbd5e1" font-size="9">• Xả về USDT</text>
          <text x="8" y="94" fill="#cbd5e1" font-size="9">• Sập Downtrend</text>
          <text x="8" y="114" fill="#cbd5e1" font-size="9">• Mùa đông tích lũy</text>
          <text x="8" y="136" fill="#34d399" font-size="8.5" font-weight="bold">➔ Giữ Tiền Mặt</text>
        </g>

        <!-- Return Loop Arrow -->
        <path d="M 694 205 C 694 240 70 240 70 205" fill="none" stroke="#64748b" stroke-width="1.8" stroke-dasharray="4,3"/>
        <text x="380" y="242" text-anchor="middle" fill="#94a3b8" font-size="10.5">🔄 Cá Mập Dùng USDT Tích Lũy Bắt Đáy BTC Cho Chu Kỳ Mới</text>
      </svg>
    `;
  },

  // 10. CHAPTER 9.4: 7 WHALE MANIPULATION CHECKLIST OVERVIEW SVG
  renderWhaleManipulationSvg() {
    return `
      <svg viewBox="0 0 760 270" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="380" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">🦈 7 DẤU HIỆU CÁ MẬP (MARKET MAKERS) THAO TÚNG & QUÉT SÀN (CHƯƠNG 9.4)</text>

        <!-- 7 Badges in a 2-row layout -->
        <g transform="translate(20, 45)">
          <!-- 1 -->
          <rect x="0" y="0" width="230" height="90" fill="#0f172a" stroke="#ef4444" stroke-width="1.5" rx="6"/>
          <text x="12" y="22" fill="#f87171" font-size="11" font-weight="bold">1. QUÉT RÂU SFP ĐỈNH/ĐÁY</text>
          <text x="12" y="42" fill="#cbd5e1" font-size="9.5">• Chọc thủng cản rồi rút râu nhanh</text>
          <text x="12" y="58" fill="#cbd5e1" font-size="9.5">• Cắn Stop Loss phe đông</text>
          <text x="12" y="74" fill="#38bdf8" font-size="9.5">• Volume nến quét cực đại</text>

          <!-- 2 -->
          <rect x="245" y="0" width="230" height="90" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" rx="6"/>
          <text x="257" y="22" fill="#fbbf24" font-size="11" font-weight="bold">2. BẪY JUDAS SWING</text>
          <text x="257" y="42" fill="#cbd5e1" font-size="9.5">• Giật bẫy 1 hướng trước giờ tin CPI</text>
          <text x="257" y="58" fill="#cbd5e1" font-size="9.5">• Dụ đám đông FOMO đu theo</text>
          <text x="257" y="74" fill="#fb7185" font-size="9.5">• Ngay lập tức quay xe 180 độ</text>

          <!-- 3 -->
          <rect x="490" y="0" width="230" height="90" fill="#0f172a" stroke="#a855f7" stroke-width="1.5" rx="6"/>
          <text x="502" y="22" fill="#c084fc" font-size="11" font-weight="bold">3. BẪY FUNDING & OI</text>
          <text x="502" y="42" fill="#cbd5e1" font-size="9.5">• Funding âm sâu &lt; -0.08%/8h</text>
          <text x="502" y="58" fill="#cbd5e1" font-size="9.5">• OI tăng vọt nhưng giá đi ngang</text>
          <text x="502" y="74" fill="#34d399" font-size="9.5">• Kích hoạt SHORT SQUEEZE nổ tung</text>
        </g>

        <g transform="translate(20, 145)">
          <!-- 4 -->
          <rect x="0" y="0" width="170" height="100" fill="#0f172a" stroke="#06b6d4" stroke-width="1.5" rx="6"/>
          <text x="10" y="20" fill="#22d3ee" font-size="10" font-weight="bold">4. KÊ LỆNH ẢO SPOOFING</text>
          <text x="10" y="40" fill="#cbd5e1" font-size="9">• Đặt tường Limit khủng</text>
          <text x="10" y="56" fill="#cbd5e1" font-size="9">• Dọa nạt hoặc dụ mua</text>
          <text x="10" y="72" fill="#cbd5e1" font-size="9">• Hủy lệnh sát nút</text>
          <text x="10" y="88" fill="#22d3ee" font-size="8.5">➔ Kèm Iceberg ẩn</text>

          <!-- 5 -->
          <rect x="180" y="0" width="175" height="100" fill="#0f172a" stroke="#10b981" stroke-width="1.5" rx="6"/>
          <text x="10" y="20" fill="#34d399" font-size="10" font-weight="bold">5. PHÂN KỲ CVD DELTA</text>
          <text x="10" y="40" fill="#cbd5e1" font-size="9">• Giá tạo đáy thấp hơn (LL)</text>
          <text x="10" y="56" fill="#cbd5e1" font-size="9">• CVD tạo đáy cao hơn (HL)</text>
          <text x="10" y="72" fill="#cbd5e1" font-size="9">• Hấp thụ (Absorption)</text>
          <text x="10" y="88" fill="#34d399" font-size="8.5">➔ Lực gom hàng đáy</text>

          <!-- 6 -->
          <rect x="365" y="0" width="175" height="100" fill="#0f172a" stroke="#f43f5e" stroke-width="1.5" rx="6"/>
          <text x="10" y="20" fill="#fb7185" font-size="10" font-weight="bold">6. BẪY ĐÁY BẰNG EQL/EQH</text>
          <text x="10" y="40" fill="#cbd5e1" font-size="9">• Đáy phẳng mời gọi SL</text>
          <text x="10" y="56" fill="#cbd5e1" font-size="9">• Miếng phô mai bẫy chuột</text>
          <text x="10" y="72" fill="#cbd5e1" font-size="9">• Quét xong mới bay</text>
          <text x="10" y="88" fill="#fb7185" font-size="8.5">➔ Đừng đặt SL sát đáy</text>

          <!-- 7 -->
          <rect x="550" y="0" width="170" height="100" fill="#0f172a" stroke="#6366f1" stroke-width="1.5" rx="6"/>
          <text x="10" y="20" fill="#818cf8" font-size="10" font-weight="bold">7. GIÃN PHÍ SPREAD FUTURES</text>
          <text x="10" y="40" fill="#cbd5e1" font-size="9">• Lệch giá Spot vs Futures</text>
          <text x="10" y="56" fill="#cbd5e1" font-size="9">• Râu ảo đêm muộn</text>
          <text x="10" y="72" fill="#cbd5e1" font-size="9">• Quét Margin Call</text>
          <text x="10" y="88" fill="#818cf8" font-size="8.5">➔ Dùng Mark Price SL</text>
        </g>
      </svg>
    `;
  },

  // 11. SMC: FAIR VALUE GAP (FVG / IMBALANCE 3-CANDLE PATTERN)
  renderFvgDiagramSvg() {
    return `
      <svg viewBox="0 0 760 270" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="380" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">⚖️ KHOẢNG TRỐNG GIÁ TRỊ CÂN BẰNG (FAIR VALUE GAP - FVG) / IMBALANCE 3 NẾN</text>

        <!-- LEFT: BULLISH FVG -->
        <g transform="translate(190, 45)">
          <rect x="-140" y="-10" width="280" height="205" fill="#0c121e" stroke="#1e293b" rx="8"/>
          <text x="0" y="16" text-anchor="middle" fill="#00c076" font-size="11.5" font-weight="bold">🟢 BULLISH FVG (KHOẢNG TRỐNG TĂNG)</text>

          <!-- FVG Area -->
          <rect x="-120" y="65" width="240" height="42" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-dasharray="4,2" rx="3"/>
          <text x="110" y="88" text-anchor="end" fill="#38bdf8" font-size="9" font-weight="bold">VÙNG FVG BĂNG QUA</text>

          <!-- Candle 1 -->
          <g transform="translate(-70, 75)">
            <line x1="0" y1="0" x2="0" y2="70" stroke="#00c076" stroke-width="2"/>
            <rect x="-14" y="25" width="28" height="40" fill="#00c076" rx="2"/>
            <circle cx="0" cy="32" r="3" fill="#f59e0b"/>
            <text x="0" y="85" text-anchor="middle" fill="#94a3b8" font-size="8">Nến 1 (Đỉnh Râu)</text>
          </g>

          <!-- Candle 2: Big Impulse -->
          <g transform="translate(0, 15)">
            <line x1="0" y1="0" x2="0" y2="135" stroke="#00c076" stroke-width="2.5"/>
            <rect x="-18" y="15" width="36" height="105" fill="#00c076" stroke="#26e396" stroke-width="1.5" rx="3"/>
            <text x="0" y="70" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">Nến 2 (Đột Biến)</text>
          </g>

          <!-- Candle 3 -->
          <g transform="translate(70, 0)">
            <line x1="0" y1="0" x2="0" y2="80" stroke="#00c076" stroke-width="2"/>
            <rect x="-14" y="10" width="28" height="45" fill="#00c076" rx="2"/>
            <circle cx="0" cy="65" r="3" fill="#f59e0b"/>
            <text x="0" y="95" text-anchor="middle" fill="#94a3b8" font-size="8">Nến 3 (Đáy Râu)</text>
          </g>

          <text x="0" y="180" text-anchor="middle" fill="#38bdf8" font-size="9.5">Khoảng trống giữa Râu Nến 1 và Râu Nến 3</text>
        </g>

        <!-- RIGHT: BEARISH FVG -->
        <g transform="translate(550, 45)">
          <rect x="-140" y="-10" width="280" height="205" fill="#0c121e" stroke="#1e293b" rx="8"/>
          <text x="0" y="16" text-anchor="middle" fill="#ff3b69" font-size="11.5" font-weight="bold">🔴 BEARISH FVG (KHOẢNG TRỐNG GIẢM)</text>

          <!-- FVG Area -->
          <rect x="-120" y="70" width="240" height="42" fill="rgba(255, 59, 105, 0.15)" stroke="#ff3b69" stroke-dasharray="4,2" rx="3"/>
          <text x="110" y="93" text-anchor="end" fill="#ff3b69" font-size="9" font-weight="bold">VÙNG FVG XẢ TRỐNG</text>

          <!-- Candle 1 -->
          <g transform="translate(-70, 10)">
            <line x1="0" y1="0" x2="0" y2="70" stroke="#ff3b69" stroke-width="2"/>
            <rect x="-14" y="10" width="28" height="40" fill="#ff3b69" rx="2"/>
            <circle cx="0" cy="50" r="3" fill="#f59e0b"/>
            <text x="0" y="78" text-anchor="middle" fill="#94a3b8" font-size="8">Nến 1 (Đáy Râu)</text>
          </g>

          <!-- Candle 2: Big Impulse Down -->
          <g transform="translate(0, 30)">
            <line x1="0" y1="0" x2="0" y2="135" stroke="#ff3b69" stroke-width="2.5"/>
            <rect x="-18" y="15" width="36" height="105" fill="#ff3b69" stroke="#ff6b8f" stroke-width="1.5" rx="3"/>
            <text x="0" y="70" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">Nến 2 (Xả Mạnh)</text>
          </g>

          <!-- Candle 3 -->
          <g transform="translate(70, 75)">
            <line x1="0" y1="0" x2="0" y2="80" stroke="#ff3b69" stroke-width="2"/>
            <rect x="-14" y="25" width="28" height="45" fill="#ff3b69" rx="2"/>
            <circle cx="0" cy="37" r="3" fill="#f59e0b"/>
            <text x="0" y="95" text-anchor="middle" fill="#94a3b8" font-size="8">Nến 3 (Đỉnh Râu)</text>
          </g>

          <text x="0" y="180" text-anchor="middle" fill="#fb7185" font-size="9.5">Giá có xu hướng quay lại lấp đầy FVG</text>
        </g>
      </svg>
    `;
  },

  // 12. SMC: ORDER BLOCK (BULLISH OB & BEARISH OB)
  renderOrderBlockSvg() {
    return `
      <svg viewBox="0 0 760 260" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="380" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">🧱 KHỐI LỆNH TỔ CHỨC (ORDER BLOCK - OB) & ĐIỂM RETEST TỐI ƯU (OTE)</text>

        <!-- LEFT: BULLISH ORDER BLOCK -->
        <g transform="translate(190, 45)">
          <rect x="-140" y="-10" width="280" height="195" fill="#0c121e" stroke="#1e293b" rx="8"/>
          <text x="0" y="16" text-anchor="middle" fill="#00c076" font-size="11.5" font-weight="bold">🟢 BULLISH ORDER BLOCK (+OB)</text>

          <!-- OB Zone -->
          <rect x="-120" y="95" width="240" height="36" fill="rgba(0, 192, 118, 0.18)" stroke="#00c076" stroke-dasharray="4,2" rx="3"/>
          <text x="110" y="117" text-anchor="end" fill="#00c076" font-size="8.5" font-weight="bold">KHỐI ORDER BLOCK MUA</text>

          <!-- Path -->
          <path d="M -110 50 L -60 110 L 10 30 L 60 105 L 110 40" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="-60" cy="110" r="4" fill="#ef4444"/><text x="-60" y="125" text-anchor="middle" fill="#ef4444" font-size="8">Nến đỏ cuối</text>
          <circle cx="10" cy="30" r="4" fill="#00c076"/><text x="10" y="22" text-anchor="middle" fill="#00c076" font-size="8">BOS Phá Đỉnh</text>
          <circle cx="60" cy="105" r="5" fill="#22d3ee"/><text x="60" y="145" text-anchor="middle" fill="#22d3ee" font-size="8.5" font-weight="bold">🎯 ENTRY RETEST</text>

          <text x="0" y="172" text-anchor="middle" fill="#94a3b8" font-size="9">Cây nến đỏ cuối cùng trước sóng tăng phá vỡ cấu trúc</text>
        </g>

        <!-- RIGHT: BEARISH ORDER BLOCK -->
        <g transform="translate(550, 45)">
          <rect x="-140" y="-10" width="280" height="195" fill="#0c121e" stroke="#1e293b" rx="8"/>
          <text x="0" y="16" text-anchor="middle" fill="#ff3b69" font-size="11.5" font-weight="bold">🔴 BEARISH ORDER BLOCK (-OB)</text>

          <!-- OB Zone -->
          <rect x="-120" y="40" width="240" height="36" fill="rgba(255, 59, 105, 0.18)" stroke="#ff3b69" stroke-dasharray="4,2" rx="3"/>
          <text x="110" y="62" text-anchor="end" fill="#ff3b69" font-size="8.5" font-weight="bold">KHỐI ORDER BLOCK BÁN</text>

          <!-- Path -->
          <path d="M -110 120 L -60 50 L 10 140 L 60 55 L 110 135" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="-60" cy="50" r="4" fill="#00c076"/><text x="-60" y="38" text-anchor="middle" fill="#00c076" font-size="8">Nến xanh cuối</text>
          <circle cx="10" cy="140" r="4" fill="#ff3b69"/><text x="10" y="152" text-anchor="middle" fill="#ff3b69" font-size="8">BOS Phá Đáy</text>
          <circle cx="60" cy="55" r="5" fill="#f59e0b"/><text x="60" y="25" text-anchor="middle" fill="#fbbf24" font-size="8.5" font-weight="bold">🎯 ENTRY SHORT</text>

          <text x="0" y="172" text-anchor="middle" fill="#94a3b8" font-size="9">Cây nến xanh cuối cùng trước sóng xả thủng cấu trúc</text>
        </g>
      </svg>
    `;
  },

  // 13. SMC: BOS (BREAK OF STRUCTURE) VS CHOCH (CHANGE OF CHARACTER)
  renderBosChochSvg() {
    return `
      <svg viewBox="0 0 760 260" style="background:#080c14; border-radius:10px; width:100%; height:auto; display:block; font-family:'JetBrains Mono', monospace;">
        <text x="380" y="24" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="bold">⚡ PHÂN BIỆT BOS (TIẾP DIỄN XU HƯỚNG) VS CHOCH (ĐẢO CHIỀU CẤU TRÚC) - SMC</text>

        <!-- LEFT: BOS (Break of Structure) -->
        <g transform="translate(190, 45)">
          <rect x="-140" y="-10" width="280" height="195" fill="#0c121e" stroke="#1e293b" rx="8"/>
          <text x="0" y="16" text-anchor="middle" fill="#38bdf8" font-size="11.5" font-weight="bold">📈 BOS (TIẾP DIỄN UPTREND)</text>

          <path d="M -110 130 L -70 80 L -40 105 L 10 50 L 40 75 L 90 20" fill="none" stroke="#00c076" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="-70" y1="80" x2="30" y2="80" stroke="#38bdf8" stroke-dasharray="3,2"/>
          <text x="0" y="75" text-anchor="middle" fill="#38bdf8" font-size="8.5" font-weight="bold">BOS 1 ➔</text>
          <line x1="10" y1="50" x2="100" y2="50" stroke="#38bdf8" stroke-dasharray="3,2"/>
          <text x="65" y="45" text-anchor="middle" fill="#38bdf8" font-size="8.5" font-weight="bold">BOS 2 ➔</text>

          <text x="0" y="160" text-anchor="middle" fill="#cbd5e1" font-size="9.5">Giá liên tục phá đỉnh cũ (HH) tiếp diễn tăng</text>
        </g>

        <!-- RIGHT: CHOCH (Change of Character) -->
        <g transform="translate(550, 45)">
          <rect x="-140" y="-10" width="280" height="195" fill="#0c121e" stroke="#1e293b" rx="8"/>
          <text x="0" y="16" text-anchor="middle" fill="#f59e0b" font-size="11.5" font-weight="bold">🔄 CHOCH (ĐẢO CHIỀU SANG DOWNTREND)</text>

          <path d="M -110 90 L -70 40 L -40 65 L 10 30 L 60 130 L 90 100 L 120 150" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="10" cy="30" r="4" fill="#38bdf8"/><text x="10" y="20" text-anchor="middle" fill="#38bdf8" font-size="8">Đỉnh Cao Nhất</text>
          <line x1="-40" y1="65" x2="80" y2="65" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="4,2"/>
          <circle cx="60" cy="130" r="4" fill="#ef4444"/>
          <text x="40" y="60" text-anchor="middle" fill="#fbbf24" font-size="8.5" font-weight="bold">CHOCH (GÃY ĐÁY HL) ⚡</text>

          <text x="0" y="160" text-anchor="middle" fill="#cbd5e1" font-size="9.5">Giá thủng đáy tạo đỉnh thấp hơn ➔ Đảo chiều</text>
        </g>
      </svg>
    `;
  },

  // PRESET PATTERNS STRICTLY EXTRACTED FROM 'Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md'
  getPresetPatterns() {
    return {
      liquidity_sweep_sfp: {
        title: 'Chương 5 & 9: Quét Thanh Khoản Đáy EQL Rút Chân (Swing Failure Pattern - SFP)',
        desc: 'Giá tạo 2 đáy bằng nhau EQL dụ bầy cừu đặt Stop Loss. Nến 15m đâm xuyên thủng đáy rồi rút râu dài ngoặc đóng nến bên trong biên với Volume cực đại ➔ Vào Long bắt nhịp cá mập gom hàng!',
        candles: [
          { open: 64200, high: 64500, low: 62800, close: 63000, vol: 180 },
          { open: 63000, high: 63200, low: 61000, close: 61100, vol: 240, label: 'Đáy 1 ($61,000)' },
          { open: 61100, high: 62800, low: 61050, close: 62500, vol: 190 },
          { open: 62500, high: 62600, low: 61000, close: 61050, vol: 210, label: 'Đáy 2 EQL ($61,000)' },
          { open: 61050, high: 61400, low: 59700, close: 61200, vol: 620, label: 'QUÉT RÂU SFP 🩸⚡', labelColor: '#00c076' },
          { open: 61200, high: 63100, low: 61150, close: 63000, vol: 480, label: 'BÙNG NỔ TĂNG 🚀', labelColor: '#38bdf8' },
          { open: 63000, high: 64900, low: 62900, close: 64800, vol: 410 }
        ],
        zones: [
          { type: 'support', top: 61150, bottom: 60900, label: 'BÃI STOP LOSS EQL (BỂ THANH KHOẢN SSL)' }
        ],
        tradeSetup: { entry: 61250, sl: 59600, tp: 65000, startIndex: 4 }
      },

      judas_swing: {
        title: 'Chương 7 & 9: Bẫy Judas Swing Giờ Ra Tin CPI (Phá Vỡ Giả Đỉnh BSL)',
        desc: 'Trước giờ CPI, cây nến 5m giật vọt đỉnh cũ $65k dụ đám đông FOMO Long. Ngay khi tin ra, nến đỏ khổng lồ nuốt chửng toàn bộ đà tăng ➔ Phe Long bị dính bẫy thanh khoản BSL!',
        candles: [
          { open: 63800, high: 64500, low: 63700, close: 64400, vol: 150 },
          { open: 64400, high: 65000, low: 64300, close: 64900, vol: 210, label: 'Đỉnh Cũ $65k' },
          { open: 64900, high: 65800, low: 64800, close: 65600, vol: 390, label: 'BẪY DỤ LONG 💥', labelColor: '#f59e0b' },
          { open: 65600, high: 65700, low: 63600, close: 63800, vol: 780, label: 'JUDAS DUMP 🩸', labelColor: '#ff3b69' },
          { open: 63800, high: 63900, low: 62200, close: 62400, vol: 510, label: 'SẬP SÂU ↘' }
        ],
        zones: [
          { type: 'resistance', top: 65200, bottom: 64800, label: 'VÙNG KHÁNG CỰ ĐỈNH (BSL LIQUIDITY)' }
        ],
        tradeSetup: { entry: 63800, sl: 65900, tp: 59500, startIndex: 3 }
      },

      funding_squeeze: {
        title: 'Chương 8 & 9: Bẫy Funding Rate Âm & Kích Hoạt Short Squeeze',
        desc: 'Sau cú giảm, Funding Rate rớt sâu -0.15%/8h (Short đuổi đông đảo). Cá mập bơm lệnh Mua kích hoạt chuỗi thanh lý Short khiến giá dựng cột bắn thẳng đứng!',
        candles: [
          { open: 150, high: 152, low: 136, close: 138, vol: 280 },
          { open: 138, high: 140, low: 130, close: 132, vol: 310, label: 'Funding -0.15% ⚠️' },
          { open: 132, high: 133, low: 129, close: 131, vol: 290, label: 'OI Tăng Cao Kỷ Lục' },
          { open: 131, high: 148, low: 130.5, close: 146, vol: 890, label: 'SHORT SQUEEZE 🚀', labelColor: '#00c076' },
          { open: 146, high: 162, low: 145, close: 160, vol: 720, label: 'Thanh Lý Toàn Sàn' }
        ],
        zones: [
          { type: 'support', top: 132, bottom: 128, label: 'VÙNG TÍCH TỤ ĐÒN BẨY SHORT' }
        ],
        tradeSetup: { entry: 133, sl: 128.5, tp: 160, startIndex: 2 }
      },

      wyckoff_spring: {
        title: 'Chương 9.3: Pha Spring Rũ Bỏ Cuối Cùng Theo Wyckoff (Phase C)',
        desc: 'Giá đi ngang tích lũy rồi đột ngột xả gãy sàn rơi tự do quét sạch toàn bộ vị thế yếu tay. Sau đó nến xanh kéo ngược thần tốc trở lại hộp tích lũy chuẩn bị vào sóng đẩy Markup!',
        candles: [
          { open: 22, high: 24, low: 21, close: 23, vol: 120 },
          { open: 23, high: 25, low: 22, close: 24.5, vol: 150, label: 'Biên Trên TR ($25)' },
          { open: 24.5, high: 24.8, low: 20.2, close: 20.5, vol: 180, label: 'Biên Dưới TR ($20)' },
          { open: 20.5, high: 21, low: 18.2, close: 18.6, vol: 540, label: 'SPRING RŨ BỎ ⚠️', labelColor: '#ef4444' },
          { open: 18.6, high: 22.5, low: 18.5, close: 22.0, vol: 490, label: 'QUAY LẠI HỘP ⭐', labelColor: '#00c076' },
          { open: 22.0, high: 28.5, low: 21.8, close: 28.0, vol: 680, label: 'SÓNG ĐẨY MARKUP 🚀' }
        ],
        zones: [
          { type: 'support', top: 21.0, bottom: 20.0, label: 'BIÊN DƯỚI TÍCH LŨY (TRADING RANGE)' }
        ],
        tradeSetup: { entry: 22.0, sl: 18.0, tp: 32.0, startIndex: 4 }
      },

      hammer: {
        title: 'Chương 4.1: Nến Hammer (Nến Búa) - Đảo Chiều Tăng Giá ở Đáy',
        desc: 'Râu nến dưới dài gấp 2-3 lần thân nến. Phe bán ép giá rơi sâu nhưng phe mua gom hàng đẩy bật ngược trở lại.',
        candles: [
          { open: 62400, high: 62600, low: 61800, close: 61900, vol: 120 },
          { open: 61900, high: 62100, low: 61200, close: 61300, vol: 150 },
          { open: 61300, high: 61400, low: 60500, close: 60600, vol: 190 },
          { open: 60600, high: 60800, low: 59200, close: 60700, vol: 390, label: 'HAMMER (BÚA) ⭐', labelColor: '#00c076' },
          { open: 60700, high: 61800, low: 60600, close: 61700, vol: 290, label: 'Xác Nhận Tăng', labelColor: '#38bdf8' },
          { open: 61700, high: 62900, low: 61600, close: 62800, vol: 240 }
        ],
        zones: [
          { type: 'support', top: 60600, bottom: 59400, label: 'VÙNG HỖ TRỢ ĐÁY (SUPPORT)' }
        ],
        tradeSetup: { entry: 60800, sl: 59100, tp: 64200, startIndex: 3 }
      },

      shooting_star: {
        title: 'Chương 4.1: Nến Shooting Star (Sao Băng) - Đảo Chiều Giảm Giá ở Đỉnh',
        desc: 'Râu nến trên rất dài sau khi chạm vùng kháng cự, thể hiện lực đẩy lên bị phe bán chặn đứng và xả hàng dứt khoát.',
        candles: [
          { open: 135, high: 142, low: 134, close: 141, vol: 150 },
          { open: 141, high: 149, low: 140, close: 148, vol: 220 },
          { open: 148, high: 160, low: 147, close: 149, vol: 480, label: 'SHOOTING STAR 🩸', labelColor: '#ff3b69' },
          { open: 149, high: 150, low: 139, close: 140, vol: 390, label: 'Nến Đỏ Xác Nhận' },
          { open: 140, high: 141, low: 131, close: 132, vol: 310 }
        ],
        zones: [
          { type: 'resistance', top: 160, bottom: 154, label: 'VÙNG KHÁNG CỰ ĐỈNH (RESISTANCE)' }
        ],
        tradeSetup: { entry: 147, sl: 161, tp: 125, startIndex: 2 }
      },

      bullish_engulfing: {
        title: 'Chương 4.2: Mô Hình Nến Nhấn Chìm Tăng (Bullish Engulfing)',
        desc: 'Nến 2 xanh thân lớn nuốt chửng hoàn toàn nến 1 đỏ trước đó, báo hiệu phe mua chiếm quyền kiểm soát 100%.',
        candles: [
          { open: 3400, high: 3420, low: 3340, close: 3350, vol: 140 },
          { open: 3350, high: 3365, low: 3280, close: 3290, vol: 170 },
          { open: 3290, high: 3300, low: 3230, close: 3240, vol: 210, label: 'Nến 1: Đỏ Nhỏ' },
          { open: 3230, high: 3370, low: 3220, close: 3360, vol: 430, label: 'BULLISH ENGULFING 🚀', labelColor: '#00c076' },
          { open: 3360, high: 3460, low: 3350, close: 3450, vol: 340 }
        ],
        zones: [
          { type: 'support', top: 3260, bottom: 3200, label: 'HỖ TRỢ MẶT SÀN ĐỠ GIÁ' }
        ],
        tradeSetup: { entry: 3365, sl: 3210, tp: 3650, startIndex: 3 }
      },

      morning_star: {
        title: 'Chương 4.2: Mô Hình Cụm 3 Nến Sao Mai (Morning Star)',
        desc: 'Nến 1 giảm mạnh (Đỏ), Nến 2 thân nhỏ/Doji ở đáy, Nến 3 tăng mạnh (Xanh) lấn sâu >50% thân nến đỏ thứ nhất.',
        candles: [
          { open: 100, high: 102, low: 92, close: 93, vol: 150 },
          { open: 93, high: 94, low: 82, close: 83, vol: 250, label: 'Nến 1: Giảm Mạnh' },
          { open: 82, high: 83, low: 78, close: 80, vol: 110, label: 'Nến 2: Doji' },
          { open: 80, high: 93, low: 79, close: 92, vol: 340, label: 'Nến 3: Tăng Mạnh 🌟', labelColor: '#00c076' },
          { open: 92, high: 99, low: 91, close: 98, vol: 280 }
        ],
        zones: [
          { type: 'support', top: 82, bottom: 77, label: 'VÙNG ĐÁY CHU KỲ (SUPPORT)' }
        ],
        tradeSetup: { entry: 92.5, sl: 77.5, tp: 115, startIndex: 3 }
      },

      role_reversal: {
        title: 'Chương 5.4: Quy Tắc Chuyển Đổi Vai Trò & Phá Vỡ (Breakout & Retest)',
        desc: 'Kháng cự cũ bị đục thủng với Volume lớn, giá quay lại Retest thành công và biến thành Vùng Hỗ Trợ Mới.',
        candles: [
          { open: 2.10, high: 2.28, low: 2.08, close: 2.25, vol: 100 },
          { open: 2.25, high: 2.30, low: 2.18, close: 2.20, vol: 110 },
          { open: 2.20, high: 2.48, low: 2.19, close: 2.45, vol: 410, label: 'BREAKOUT 💥', labelColor: '#38bdf8' },
          { open: 2.45, high: 2.50, low: 2.37, close: 2.39, vol: 170 },
          { open: 2.39, high: 2.42, low: 2.30, close: 2.34, vol: 120, label: 'RETEST 🎯', labelColor: '#00c076' },
          { open: 2.34, high: 2.62, low: 2.33, close: 2.60, vol: 450, label: 'TĂNG TIẾP 🚀' },
          { open: 2.60, high: 2.76, low: 2.58, close: 2.74, vol: 360 }
        ],
        zones: [
          { type: 'resistance', top: 2.33, bottom: 2.28, label: 'KHÁNG CỰ CŨ ➔ BIẾN THÀNH HỖ TRỢ MỚI' }
        ],
        tradeSetup: { entry: 2.35, sl: 2.24, tp: 2.80, startIndex: 4 }
      },

      multi_timeframe_btc: {
        title: 'Chương 7.5: Kịch Bản Thực Chiến 3 Khung Giờ BTC (Top-Down: 4H ➔ 1H ➔ 15M)',
        desc: 'Khung 4H Uptrend chạm hỗ trợ 60k-60.5k; Khung 15m xuất hiện nến Hammer rút chân + Bullish Engulfing tại 60,300, SL 59,950, TP 64,800. Tỷ lệ R:R = 1:12.8!',
        candles: [
          { open: 64800, high: 65000, low: 63200, close: 63400, vol: 160 },
          { open: 63400, high: 63600, low: 61800, close: 62000, vol: 210 },
          { open: 62000, high: 62200, low: 60400, close: 60500, vol: 270, label: 'Chạm Hỗ Trợ 4H' },
          { open: 60500, high: 60600, low: 59950, close: 60100, vol: 390, label: '15m HAMMER ⭐', labelColor: '#00c076' },
          { open: 60100, high: 60400, low: 60050, close: 60300, vol: 460, label: 'ENGULFING (ENTRY)', labelColor: '#38bdf8' },
          { open: 60300, high: 62200, low: 60250, close: 62000, vol: 400 },
          { open: 62000, high: 63800, low: 61900, close: 63600, vol: 380 },
          { open: 63600, high: 64900, low: 63500, close: 64800, vol: 490, label: 'TP ĐỈNH CŨ 4H 🎯' }
        ],
        zones: [
          { type: 'support', top: 60500, bottom: 59900, label: 'VÙNG HỖ TRỢ CỨNG 4H (60,000$ - 60,500$)' }
        ],
        tradeSetup: { entry: 60300, sl: 59950, tp: 64800, startIndex: 4 }
      }
    };
  }
};

if (typeof window !== "undefined") { (window as any).ChartVisualizer = ChartVisualizer; }



export { ChartVisualizer };

export const ChartRenderer: React.FC<ChartConfig & { className?: string }> = (props) => {
  const svgHtml = ChartVisualizer.renderChartSvg(props);
  return <div className={props.className || "w-full"} dangerouslySetInnerHTML={{ __html: svgHtml }} />;
};

export const VisualMount: React.FC<{ type: string; className?: string }> = ({ type, className }) => {
  let html = "";
  if (type === "blockchain-ledger") html = ChartVisualizer.renderBlockchainLedgerSvg();
  else if (type === "candle-anatomy") html = ChartVisualizer.renderCandleAnatomySvg();
  else if (type === "three-candle-cases") html = ChartVisualizer.renderThreeCandleCasesSvg();
  else if (type === "doji-types") html = ChartVisualizer.renderDojiTypesSvg();
  else if (type === "engulfing-pair") html = ChartVisualizer.renderEngulfingPairSvg();
  else if (type === "hammer-shooting-star") html = ChartVisualizer.renderHammerShootingStarSvg();
  else if (type === "morning-evening-star") html = ChartVisualizer.renderMorningEveningStarSvg();
  else if (type === "support-resistance-zone") html = ChartVisualizer.renderSupportResistanceZoneSvg();
  else if (type === "role-reversal-diagram") html = ChartVisualizer.renderRoleReversalDiagramSvg();
  else if (type === "market-structure") html = ChartVisualizer.renderMarketStructureSvg();
  else if (type === "fractal-swing") html = ChartVisualizer.renderFractalSwingSvg();
  else if (type === "rsi-oscillator") html = ChartVisualizer.renderRsiOscillatorSvg();
  else if (type === "success-triangle") html = ChartVisualizer.renderSuccessTriangleSvg();
  else if (type === "risk-reward-diagram") html = ChartVisualizer.renderRiskRewardDiagramSvg();
  else if (type === "capital-flow-cycle") html = ChartVisualizer.renderCapitalFlowCycleSvg();
  else if (type === "whale-manipulation-overview") html = ChartVisualizer.renderWhaleManipulationSvg();
  else if (type === "fvg-diagram") html = ChartVisualizer.renderFvgDiagramSvg();
  else if (type === "order-block") html = ChartVisualizer.renderOrderBlockSvg();
  else if (type === "bos-choch") html = ChartVisualizer.renderBosChochSvg();

  if (!html) return null;
  return <div className={className || "my-4 overflow-hidden rounded-xl border border-slate-800 bg-[#06090e]"} dangerouslySetInnerHTML={{ __html: html }} />;
};
