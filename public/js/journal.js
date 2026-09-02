// --- MODULE: TRADING JOURNAL, DISCIPLINED NOTES & AI TRADE AUDITOR ---
// Built directly to practice Chapter 11 (Step 5: Viết Nhật Ký Giao Dịch & Hoàn Thiện Kỷ Luật)

let journalEntries = [];
let noteEntries = [];
let pnlChartInstance = null;
let currentUploadedImages = [];
let currentNoteUploadedImages = [];
let activeJournalSubTab = 'trades';
let activeNoteCategory = 'ALL';
let activeAiPeriod = 'WEEK';
let currentSavedReviews = [];

// ==========================================
// 1. SUB-TAB SWITCHER (Trades, Notes, AI Review)
// ==========================================
function switchJournalSubTab(subTab) {
  activeJournalSubTab = subTab;

  const tabTrades = document.getElementById('journal-trades-view');
  const tabNotes = document.getElementById('journal-notes-view');
  const tabAiReview = document.getElementById('journal-aireview-view');

  const btnTrades = document.getElementById('btn-subtab-trades');
  const btnNotes = document.getElementById('btn-subtab-notes');
  const btnAiReview = document.getElementById('btn-subtab-aireview');

  if (tabTrades) tabTrades.style.display = subTab === 'trades' ? 'block' : 'none';
  if (tabNotes) tabNotes.style.display = subTab === 'notes' ? 'block' : 'none';
  if (tabAiReview) tabAiReview.style.display = subTab === 'aireview' ? 'block' : 'none';

  if (btnTrades) btnTrades.classList.toggle('active', subTab === 'trades');
  if (btnNotes) btnNotes.classList.toggle('active', subTab === 'notes');
  if (btnAiReview) btnAiReview.classList.toggle('active', subTab === 'aireview');

  if (subTab === 'trades') {
    loadJournalEntries();
  } else if (subTab === 'notes') {
    loadNotes();
  } else if (subTab === 'aireview') {
    // Tab AI Review ready
  }
}

// ==========================================
// 2. MODULE: NHẬT KÝ LỆNH TRADE (TRADE JOURNAL WITH LIVE BINANCE PnL)
// ==========================================

function getTradeLivePrice(coin) {
  const coinUpper = (coin || 'BTC').toUpperCase();
  if (window.liveBinancePrices && window.liveBinancePrices[coinUpper]) {
    return window.liveBinancePrices[coinUpper];
  }
  return null;
}

function calculateTradeLivePnL(e) {
  // If trade is CLOSED (WIN, LOSS, BREAKEVEN or stopped), return recorded static PnL
  if (e.status !== 'OPEN') {
    return {
      isLive: false,
      currentPrice: e.exit_price || e.entry_price || 0,
      pnlAmount: Number(e.pnl_amount || 0),
      pnlPercent: Number(e.pnl_percent || 0),
      hitSL: false,
      hitTP: false
    };
  }

  // For OPEN trades: Calculate dynamically from Live Binance Ticker
  const coinUpper = (e.coin || 'BTC').toUpperCase();
  const livePrice = getTradeLivePrice(coinUpper) || e.entry_price || 0;
  const isShort = e.type.includes('SHORT') || e.type.includes('SELL');

  let pnlPercent = 0;
  let pnlAmount = 0;

  if (e.entry_price > 0 && livePrice > 0) {
    if (isShort) {
      pnlPercent = ((e.entry_price - livePrice) / e.entry_price) * 100;
    } else {
      pnlPercent = ((livePrice - e.entry_price) / e.entry_price) * 100;
    }
    pnlAmount = e.position_size > 0 ? (e.position_size * (pnlPercent / 100)) : 0;
  }

  // Check Stop Loss & Take Profit proximity
  let hitSL = false;
  let hitTP = false;

  if (e.stop_loss > 0 && livePrice > 0) {
    hitSL = isShort ? livePrice >= e.stop_loss : livePrice <= e.stop_loss;
  }
  if (e.take_profit > 0 && livePrice > 0) {
    hitTP = isShort ? livePrice <= e.take_profit : livePrice >= e.take_profit;
  }

  return {
    isLive: true,
    currentPrice: livePrice,
    pnlAmount: Number(pnlAmount.toFixed(2)),
    pnlPercent: Number(pnlPercent.toFixed(2)),
    hitSL,
    hitTP
  };
}

async function loadJournalEntries() {
  try {
    const coin = document.getElementById('journal-filter-coin')?.value || '';
    const status = document.getElementById('journal-filter-status')?.value || '';
    const startDate = document.getElementById('journal-filter-start')?.value || '';
    const endDate = document.getElementById('journal-filter-end')?.value || '';

    let url = '/api/journal?';
    if (coin) url += `coin=${encodeURIComponent(coin)}&`;
    if (status) url += `status=${encodeURIComponent(status)}&`;
    if (startDate) url += `startDate=${encodeURIComponent(startDate)}&`;
    if (endDate) url += `endDate=${encodeURIComponent(endDate)}&`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load journal entries');
    const data = await res.json();
    journalEntries = data.entries || [];

    // Ensure all open coins are fetched for live tracking
    const openCoins = [...new Set(journalEntries.filter(t => t.status === 'OPEN').map(t => t.coin.toUpperCase()))];
    for (const c of openCoins) {
      if (!window.liveBinancePrices[c]) {
        fetchInitialCoinPrice(c);
      }
    }

    renderJournalGrid(journalEntries);
    loadJournalStats();
  } catch (err) {
    console.error('Error loading journal:', err);
    showToast('Lỗi tải nhật ký trade: ' + err.message, 'error');
  }
}

async function fetchInitialCoinPrice(coin) {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin}USDT`);
    if (res.ok) {
      const d = await res.json();
      window.liveBinancePrices[coin] = parseFloat(d.lastPrice);
      updateOpenTradesLivePnL();
    }
  } catch (err) {}
}

async function loadJournalStats() {
  try {
    const res = await fetch('/api/journal/stats');
    if (!res.ok) return;
    const data = await res.json();
    const stats = data.stats;

    const winrateEl = document.getElementById('stat-winrate');
    if (winrateEl) winrateEl.innerText = `${stats.winRate}%`;

    // Calculate Combined PnL (Realized + Live Unrealized)
    let realizedPnL = 0;
    let liveUnrealizedPnL = 0;

    journalEntries.forEach(t => {
      const calc = calculateTradeLivePnL(t);
      if (t.status === 'OPEN') {
        liveUnrealizedPnL += calc.pnlAmount;
      } else {
        realizedPnL += (t.pnl_amount || 0);
      }
    });

    const netPnL = realizedPnL + liveUnrealizedPnL;
    const pnlEl = document.getElementById('stat-pnl');
    if (pnlEl) {
      const isPos = netPnL >= 0;
      const sign = isPos ? '+' : '';
      pnlEl.innerHTML = `
        <span style="color: ${isPos ? 'var(--color-green)' : 'var(--color-red)'}; font-size: 20px;">
          ${sign}$${netPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <div style="font-size: 10px; color: var(--text-muted); font-weight: 600; margin-top: 2px;">
          Chốt: $${realizedPnL.toFixed(2)} | Live: <span style="color: ${liveUnrealizedPnL >= 0 ? 'var(--color-green)' : 'var(--color-red)'}">${liveUnrealizedPnL >= 0 ? '+' : ''}$${liveUnrealizedPnL.toFixed(2)}</span>
        </div>
      `;
    }

    const totalTradesEl = document.getElementById('stat-total-trades');
    if (totalTradesEl) {
      totalTradesEl.innerHTML = `${stats.totalTrades} <span style="font-size: 12px; color: var(--text-muted);">(${stats.winningTrades}W - ${stats.losingTrades}L - ${stats.beTrades}BE)</span>`;
    }

    const pfEl = document.getElementById('stat-profit-factor');
    if (pfEl) pfEl.innerText = stats.profitFactor;

    const countBadge = document.getElementById('pnl-chart-count');
    if (countBadge) countBadge.innerText = `${stats.closedTrades} Lệnh Đã Đóng`;

    renderPnLChart(stats.pnlCurve || []);

  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// Real-time DOM updater on Binance WebSocket ticker
function updateOpenTradesLivePnL() {
  if (activeJournalSubTab !== 'trades' && activeJournalSubTab !== 'aireview') return;

  const openCards = document.querySelectorAll('.journal-card[data-status="OPEN"]');
  openCards.forEach(card => {
    const tradeId = Number(card.dataset.tradeId);
    const trade = journalEntries.find(t => t.id === tradeId);
    if (!trade) return;

    const calc = calculateTradeLivePnL(trade);
    const priceEl = card.querySelector('.live-current-price-val');
    const pnlEl = card.querySelector('.live-pnl-val');
    const alertBox = card.querySelector('.live-sl-tp-alert');

    if (priceEl) {
      priceEl.innerText = `$${formatDisplayPrice(calc.currentPrice)}`;
    }

    if (pnlEl) {
      const isPos = calc.pnlAmount >= 0;
      const sign = isPos ? '+' : '';
      pnlEl.className = `live-pnl-val ${isPos ? 'color-pos' : 'color-neg'}`;
      pnlEl.style.color = isPos ? 'var(--color-green)' : 'var(--color-red)';
      pnlEl.innerText = `${sign}$${calc.pnlAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${sign}${calc.pnlPercent}%)`;
    }

    if (alertBox) {
      if (calc.hitSL) {
        alertBox.style.display = 'block';
        alertBox.className = 'live-sl-tp-alert alert-sl';
        alertBox.innerHTML = `🛑 <b>CẢNH BÁO:</b> Giá chạm mức Stop Loss ($${formatDisplayPrice(trade.stop_loss)})!`;
      } else if (calc.hitTP) {
        alertBox.style.display = 'block';
        alertBox.className = 'live-sl-tp-alert alert-tp';
        alertBox.innerHTML = `🎯 <b>MỤC TIÊU:</b> Giá đã chạm Take Profit ($${formatDisplayPrice(trade.take_profit)})!`;
      } else {
        alertBox.style.display = 'none';
      }
    }
  });
}

function renderPnLChart(pnlCurve) {
  const canvas = document.getElementById('pnlChart');
  if (!canvas || !window.Chart) return;

  const ctx = canvas.getContext('2d');
  if (pnlChartInstance) {
    pnlChartInstance.destroy();
  }

  const labels = pnlCurve.map((p) => `${p.date} (${p.coin})`);
  const values = pnlCurve.map(p => p.cumulativePnL);

  const gradient = ctx.createLinearGradient(0, 0, 0, 180);
  gradient.addColorStop(0, 'rgba(41, 98, 255, 0.35)');
  gradient.addColorStop(1, 'rgba(41, 98, 255, 0.0)');

  pnlChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['Chưa có lệnh'],
      datasets: [{
        label: 'Lợi Nhuận Tích Lũy ($)',
        data: values.length > 0 ? values : [0],
        borderColor: '#2962ff',
        borderWidth: 2.2,
        fill: true,
        backgroundColor: gradient,
        tension: 0.35,
        pointBackgroundColor: '#2962ff',
        pointRadius: 3.5,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#1a202c',
          titleColor: '#93c5fd',
          bodyColor: '#fff',
          borderColor: '#242c3d',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#64748b', font: { size: 10.5 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: {
            color: '#64748b',
            font: { size: 10.5 },
            callback: (v) => `$${v}`
          }
        }
      }
    }
  });
}

function renderJournalGrid(entries) {
  const container = document.getElementById('journal-entries-container');
  if (!container) return;

  if (entries.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: 12px; padding: 36px; text-align: center; color: var(--text-muted);">
        <div style="font-size: 30px; margin-bottom: 8px;">📊</div>
        <div style="font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px;">Chưa có nhật ký giao dịch nào</div>
        <div style="font-size: 13px; margin-bottom: 14px;">Thực hành Bước 5 theo Giáo Trình: Nhấn '+ Thêm Lệnh Trade Mới' để lưu lại lệnh đầu tiên kèm ảnh TradingView!</div>
        <button class="btn btn-primary" onclick="openAddTradeModal()">➕ Thêm Lệnh Trade Đầu Tiên</button>
      </div>
    `;
    return;
  }

  container.innerHTML = entries.map(e => {
    const calc = calculateTradeLivePnL(e);
    const isOpen = e.status === 'OPEN';

    let statusBadge = 'badge-blue';
    let statusText = 'OPEN ⏳';
    if (e.status === 'WIN') {
      statusBadge = 'badge-green';
      statusText = 'WIN 🏆';
    } else if (e.status === 'LOSS') {
      statusBadge = 'badge-red';
      statusText = 'LOSS 🛑';
    } else if (e.status === 'BREAKEVEN') {
      statusBadge = 'badge-amber';
      statusText = 'BREAKEVEN ⚖️';
    }

    const isPos = calc.pnlAmount >= 0;
    const pnlClass = isPos ? 'color: var(--color-green);' : 'color: var(--color-red);';
    const sign = isPos ? '+' : '';

    const imagesHtml = (e.images && e.images.length > 0) ? `
      <div class="journal-images-preview">
        ${e.images.map(imgUrl => `
          <img src="${imgUrl}" class="journal-thumb-img" onclick="openLightbox('${imgUrl}')" title="Click xem phóng to ảnh chart">
        `).join('')}
      </div>
    ` : '';

    const confluencesHtml = (e.rules_checked && e.rules_checked.length > 0) ? `
      <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px;">
        ${e.rules_checked.map(rule => `
          <span class="badge badge-purple" style="font-size: 9.5px;">✓ ${rule}</span>
        `).join('')}
      </div>
    ` : '';

    return `
      <div class="journal-card" data-status="${e.status}" data-trade-id="${e.id}" style="${isOpen ? 'border: 1px solid rgba(56, 189, 248, 0.4);' : ''}">
        <div class="journal-card-header">
          <div class="journal-coin-info">
            <span class="journal-coin-symbol">${e.coin}</span>
            <span class="badge ${e.type.includes('SHORT') ? 'badge-red' : 'badge-green'}" style="font-size: 10.5px;">
              ${e.type}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            ${isOpen ? '<span class="badge badge-blue" style="font-size: 10px; animation: pulse 1.5s infinite;">🟢 LIVE BINANCE</span>' : ''}
            <span class="badge ${statusBadge}">${statusText}</span>
          </div>
        </div>

        <div class="journal-price-table">
          <div class="price-row">
            <span class="price-label">Entry:</span>
            <span class="price-val">$${formatDisplayPrice(e.entry_price || 0)}</span>
          </div>
          <div class="price-row">
            <span class="price-label">${isOpen ? 'Giá Live Binance:' : 'Exit:'}</span>
            <span class="price-val ${isOpen ? 'live-current-price-val' : ''}" style="${isOpen ? 'color: #38bdf8; font-weight: 800;' : ''}">
              $${formatDisplayPrice(calc.currentPrice)}
            </span>
          </div>
          <div class="price-row">
            <span class="price-label">Stop Loss:</span>
            <span class="price-val" style="color: var(--color-red);">$${formatDisplayPrice(e.stop_loss || 0)}</span>
          </div>
          <div class="price-row">
            <span class="price-label">Take Profit:</span>
            <span class="price-val" style="color: var(--color-green);">$${formatDisplayPrice(e.take_profit || 0)}</span>
          </div>
        </div>

        <!-- Real-time PnL Bar -->
        <div style="padding: 8px 16px; background: rgba(0,0,0,0.28); border-top: 1px solid rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.03); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11.5px; color: var(--text-muted);">${isOpen ? 'PnL Tạm Tính (Live):' : 'Kết quả PnL (Đã chốt):'}</span>
          <span class="live-pnl-val" style="font-size: 15px; font-weight: 800; font-family: var(--font-mono); ${pnlClass}">
            ${sign}$${calc.pnlAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style="font-size: 11.5px;">(${sign}${calc.pnlPercent}%)</span>
          </span>
        </div>

        <!-- SL / TP Alert for Open Position -->
        <div class="live-sl-tp-alert" style="display: ${calc.hitSL || calc.hitTP ? 'block' : 'none'}; padding: 6px 12px; font-size: 11.5px; font-weight: 700; text-align: center; background: ${calc.hitSL ? 'rgba(255,59,105,0.15); color: #f87171;' : 'rgba(0,192,118,0.15); color: #4ade80;'}; border-bottom: 1px solid rgba(255,255,255,0.04);">
          ${calc.hitSL ? `🛑 <b>CẢNH BÁO:</b> Giá đã chạm mức Stop Loss ($${formatDisplayPrice(e.stop_loss)})!` : (calc.hitTP ? `🎯 <b>MỤC TIÊU:</b> Giá đã chạm Take Profit ($${formatDisplayPrice(e.take_profit)})!` : '')}
        </div>

        <div class="journal-notes-body">
          <div style="font-size: 13px; line-height: 1.5; color: #cbd5e1; white-space: pre-wrap;">${e.notes || '<i style="color: var(--text-muted)">Không có ghi chú thêm</i>'}</div>
          ${confluencesHtml}
        </div>

        ${imagesHtml}

        <div class="journal-card-footer">
          <span>📅 ${e.date}</span>
          <div style="display: flex; gap: 5px;">
            ${isOpen ? `
              <button class="btn btn-primary" style="padding: 3px 8px; font-size: 11px; background: #0284c7;" onclick="quickCloseTradeLive(${e.id})" title="Chốt lệnh ngay lập tức tại giá Live Binance">
                ⚡ Chốt Live
              </button>
            ` : ''}
            <button class="btn btn-outline" style="padding: 3px 8px; font-size: 11px;" onclick="editTradeEntry(${e.id})">✏️ Sửa</button>
            <button class="btn btn-outline" style="padding: 3px 8px; font-size: 11px; color: var(--color-red);" onclick="deleteTradeEntry(${e.id})">🗑️ Xóa</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function quickCloseTradeLive(id) {
  const entry = journalEntries.find(e => e.id === id);
  if (!entry) return;

  const coinUpper = (entry.coin || 'BTC').toUpperCase();
  const livePrice = getTradeLivePrice(coinUpper) || entry.entry_price || 0;

  if (!confirm(`Bạn có chắc chắn muốn CHỐT LỆNH #${id} (${coinUpper}) tại giá Live Binance: $${formatDisplayPrice(livePrice)}?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/journal/close-live/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ livePrice })
    });

    const data = await res.json();
    if (res.ok) {
      showToast(`Đã chốt lệnh #${id} tại giá $${formatDisplayPrice(livePrice)} thành công!`, 'success');
      loadJournalEntries();
    } else {
      showToast('Lỗi chốt lệnh: ' + (data.error || 'Failed'), 'error');
    }
  } catch (err) {
    showToast('Lỗi: ' + err.message, 'error');
  }
}

function filterJournal() {
  loadJournalEntries();
}

function resetJournalFilters() {
  const coinEl = document.getElementById('journal-filter-coin');
  const statusEl = document.getElementById('journal-filter-status');
  const startEl = document.getElementById('journal-filter-start');
  const endEl = document.getElementById('journal-filter-end');

  if (coinEl) coinEl.value = '';
  if (statusEl) statusEl.value = '';
  if (startEl) startEl.value = '';
  if (endEl) endEl.value = '';
  loadJournalEntries();
}

// Modal Trade Form Handling
function openAddTradeModal() {
  document.getElementById('trade-modal-title').innerText = '📊 Thêm Lệnh Giao Dịch Mới (Chuẩn Giáo Trình)';
  document.getElementById('trade-form').reset();
  document.getElementById('trade-id').value = '';
  document.getElementById('trade-date').value = new Date().toISOString().split('T')[0];
  currentUploadedImages = [];
  renderUploadedImagesPreview();
  setupImagePasteDropzone();
  openModal('trade-modal');
}

async function editTradeEntry(id) {
  const entry = journalEntries.find(e => e.id === id);
  if (!entry) return;

  document.getElementById('trade-modal-title').innerText = `✏️ Chỉnh Sửa Lệnh Trade #${entry.id}`;
  document.getElementById('trade-id').value = entry.id;
  document.getElementById('trade-date').value = entry.date;
  document.getElementById('trade-coin').value = entry.coin;
  document.getElementById('trade-type').value = entry.type;
  document.getElementById('trade-entry').value = entry.entry_price || '';
  document.getElementById('trade-exit').value = entry.exit_price || '';
  document.getElementById('trade-sl').value = entry.stop_loss || '';
  document.getElementById('trade-tp').value = entry.take_profit || '';
  document.getElementById('trade-size').value = entry.position_size || '';
  document.getElementById('trade-status').value = entry.status || 'OPEN';
  document.getElementById('trade-pnl-amount').value = entry.pnl_amount || '';
  document.getElementById('trade-pnl-percent').value = entry.pnl_percent || '';
  document.getElementById('trade-notes').value = entry.notes || '';

  const rules = entry.rules_checked || [];
  document.getElementById('chk-mtf').checked = rules.includes('Đã phân tích Đa khung 4H ➔ 1H ➔ 15M (Chương 7)') || rules.includes('Đã phân tích Đa khung 4H -> 1H -> 15M (Chương 7)');
  document.getElementById('chk-sl').checked = rules.includes('Đã đặt Stop Loss dưới râu nến (Chương 4 & 9)');
  document.getElementById('chk-rr').checked = rules.includes('Tỷ lệ R:R ≥ 1:2 (Chương 9.2)') || rules.includes('Tỷ lệ R:R >= 1:2 (Chương 9.2)');
  document.getElementById('chk-fomo').checked = rules.includes('Không FOMO/FUD/Giao dịch trả thù (Chương 9.3)');
  document.getElementById('chk-vol').checked = rules.includes('Đã kiểm tra Volume nến (Chương 8.1)');

  currentUploadedImages = entry.images ? [...entry.images] : [];
  renderUploadedImagesPreview();
  setupImagePasteDropzone();
  openModal('trade-modal');
}

function calculateTradePreview() {
  const entry = parseFloat(document.getElementById('trade-entry').value) || 0;
  const exit = parseFloat(document.getElementById('trade-exit').value) || 0;
  const type = document.getElementById('trade-type').value;

  if (entry > 0 && exit > 0) {
    let pct = 0;
    if (type.includes('SHORT')) {
      pct = ((entry - exit) / entry) * 100;
    } else {
      pct = ((exit - entry) / entry) * 100;
    }
    const pnlPctInput = document.getElementById('trade-pnl-percent');
    if (!pnlPctInput.value || pnlPctInput.dataset.autocalc !== 'false') {
      pnlPctInput.value = pct.toFixed(2);
      pnlPctInput.dataset.autocalc = 'true';
    }
  }
}

function setupImagePasteDropzone() {
  const dropzone = document.getElementById('image-dropzone');
  const fileInput = document.getElementById('image-file-input');
  if (!dropzone) return;

  dropzone.onclick = () => fileInput.click();

  dropzone.ondragover = (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  };
  dropzone.ondragleave = () => {
    dropzone.classList.remove('dragover');
  };
  dropzone.ondrop = (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  document.onpaste = async (e) => {
    const tradeModal = document.getElementById('trade-modal');
    const noteModal = document.getElementById('note-modal');

    if (tradeModal && tradeModal.classList.contains('active')) {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            uploadSingleFile(file);
            showToast('📸 Đã dán ảnh chart từ clipboard!', 'success');
          }
        }
      }
    } else if (noteModal && noteModal.classList.contains('active')) {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            uploadSingleNoteFile(file);
            showToast('📸 Đã dán ảnh ghi chú từ clipboard!', 'success');
          }
        }
      }
    }
  };
}

function handleFileSelect(files) {
  if (!files || files.length === 0) return;
  for (let i = 0; i < files.length; i++) {
    uploadSingleFile(files[i]);
  }
}

async function uploadSingleFile(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = e.target.result;
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data })
      });
      const data = await res.json();
      if (data.success && data.url) {
        currentUploadedImages.push(data.url);
        renderUploadedImagesPreview();
        showToast('Tải ảnh biểu đồ thành công!', 'success');
      } else {
        showToast('Lỗi tải ảnh: ' + (data.error || 'Unknown'), 'error');
      }
    } catch (err) {
      showToast('Lỗi upload: ' + err.message, 'error');
    }
  };
  reader.readAsDataURL(file);
}

function renderUploadedImagesPreview() {
  const container = document.getElementById('uploaded-images-preview');
  if (!container) return;

  container.innerHTML = currentUploadedImages.map((url, idx) => `
    <div class="preview-img-container">
      <img src="${url}" alt="Preview">
      <button type="button" class="btn-remove-img" onclick="removeUploadedImage(${idx})">✕</button>
    </div>
  `).join('');
}

function removeUploadedImage(idx) {
  currentUploadedImages.splice(idx, 1);
  renderUploadedImagesPreview();
}

async function saveTradeEntry(e) {
  e.preventDefault();

  const id = document.getElementById('trade-id').value;
  const date = document.getElementById('trade-date').value;
  const coin = document.getElementById('trade-coin').value.trim().toUpperCase();
  const type = document.getElementById('trade-type').value;
  const entry_price = parseFloat(document.getElementById('trade-entry').value) || 0;
  const exit_price = parseFloat(document.getElementById('trade-exit').value) || 0;
  const stop_loss = parseFloat(document.getElementById('trade-sl').value) || 0;
  const take_profit = parseFloat(document.getElementById('trade-tp').value) || 0;
  const position_size = parseFloat(document.getElementById('trade-size').value) || 0;
  const status = document.getElementById('trade-status').value;
  const pnl_amount = parseFloat(document.getElementById('trade-pnl-amount').value) || 0;
  const pnl_percent = parseFloat(document.getElementById('trade-pnl-percent').value) || 0;
  const notes = document.getElementById('trade-notes').value;

  const rules_checked = [];
  if (document.getElementById('chk-mtf').checked) rules_checked.push('Đã phân tích Đa khung 4H ➔ 1H ➔ 15M (Chương 7)');
  if (document.getElementById('chk-sl').checked) rules_checked.push('Đã đặt Stop Loss dưới râu nến (Chương 4 & 9)');
  if (document.getElementById('chk-rr').checked) rules_checked.push('Tỷ lệ R:R ≥ 1:2 (Chương 9.2)');
  if (document.getElementById('chk-fomo').checked) rules_checked.push('Không FOMO/FUD/Giao dịch trả thù (Chương 9.3)');
  if (document.getElementById('chk-vol').checked) rules_checked.push('Đã kiểm tra Volume nến (Chương 8.1)');

  const payload = {
    date, coin, type, entry_price, exit_price, stop_loss, take_profit,
    position_size, status, pnl_amount, pnl_percent, notes,
    rules_checked,
    images: currentUploadedImages
  };

  try {
    let res;
    if (id) {
      res = await fetch(`/api/journal/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (res.ok) {
      showToast(id ? 'Đã cập nhật lệnh trade!' : 'Đã lưu lệnh trade mới thành công!', 'success');
      closeModal('trade-modal');
      loadJournalEntries();
    } else {
      showToast('Lỗi: ' + (data.error || 'Failed to save'), 'error');
    }
  } catch (err) {
    showToast('Lỗi lưu trade: ' + err.message, 'error');
  }
}

async function deleteTradeEntry(id) {
  if (!confirm(`Bạn có chắc chắn muốn xóa lệnh trade #${id}?`)) return;

  try {
    const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Đã xóa lệnh trade.', 'info');
      loadJournalEntries();
    } else {
      showToast('Không thể xóa lệnh.', 'error');
    }
  } catch (err) {
    showToast('Lỗi: ' + err.message, 'error');
  }
}

// ==========================================
// 3. MODULE: SỔ TAY GHI CHÚ & KỶ LUẬT (NOTES)
// ==========================================
async function loadNotes() {
  try {
    const search = document.getElementById('notes-search-input')?.value || '';
    const date = document.getElementById('notes-filter-date')?.value || '';

    let url = '/api/notes?';
    if (activeNoteCategory && activeNoteCategory !== 'ALL') url += `category=${encodeURIComponent(activeNoteCategory)}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (date) url += `startDate=${encodeURIComponent(date)}&endDate=${encodeURIComponent(date)}&`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load notes');
    const data = await res.json();
    noteEntries = data.notes || [];

    renderNotesGrid(noteEntries);
  } catch (err) {
    console.error('Error loading notes:', err);
    showToast('Lỗi tải ghi chú: ' + err.message, 'error');
  }
}

function renderNotesGrid(notes) {
  const container = document.getElementById('notes-entries-container');
  if (!container) return;

  if (notes.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: 12px; padding: 36px; text-align: center; color: var(--text-muted);">
        <div style="font-size: 32px; margin-bottom: 8px;">📒</div>
        <div style="font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px;">Chưa có ghi chú nào</div>
        <div style="font-size: 13px; margin-bottom: 14px;">Ghi lại cảm xúc tâm lý, bài học sau mỗi phiên giao dịch hoặc kế hoạch trade sắp tới!</div>
        <button class="btn btn-primary" onclick="openAddNoteModal()">➕ Viết Ghi Chú Đầu Tiên</button>
      </div>
    `;
    return;
  }

  container.innerHTML = notes.map(n => {
    let categoryBadge = 'badge-blue';
    if (n.category === 'Tâm Lý & Kỷ Luật') categoryBadge = 'badge-purple';
    else if (n.category === 'Phân Tích Thị Trường') categoryBadge = 'badge-green';
    else if (n.category === 'Kinh Nghiệm / Bài Học') categoryBadge = 'badge-amber';
    else if (n.category === 'Kế Hoạch Trade') categoryBadge = 'badge-blue';

    const imagesHtml = (n.images && n.images.length > 0) ? `
      <div class="journal-images-preview" style="padding: 0 16px 10px;">
        ${n.images.map(imgUrl => `
          <img src="${imgUrl}" class="journal-thumb-img" onclick="event.stopPropagation(); openLightbox('${imgUrl}')" title="Click xem phóng to ảnh">
        `).join('')}
      </div>
    ` : '';

    const contentSnippet = n.content.length > 180 ? n.content.substring(0, 180) + '...' : n.content;

    return `
      <div class="note-card ${n.is_pinned ? 'note-card-pinned' : ''}" onclick="viewNoteDetail(${n.id})">
        <div class="note-card-header">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="badge ${categoryBadge}">${n.category}</span>
            ${n.is_pinned ? '<span class="badge badge-amber" title="Ghi chú được ghim">📌 Đã Ghim</span>' : ''}
          </div>
          <span style="font-size: 11.5px; color: var(--text-muted); font-family: var(--font-mono);">📅 ${n.date}</span>
        </div>

        <div class="note-card-body">
          <h4 class="note-card-title">${escapeHtml(n.title)}</h4>
          <div class="note-card-text">${escapeHtml(contentSnippet)}</div>
        </div>

        ${imagesHtml}

        <div class="note-card-footer" onclick="event.stopPropagation();">
          <button class="btn btn-outline" style="padding: 2px 7px; font-size: 11px;" onclick="togglePinNote(${n.id})">
            ${n.is_pinned ? 'Bỏ ghim 📌' : 'Ghim 📌'}
          </button>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-outline" style="padding: 2px 7px; font-size: 11px;" onclick="editNoteEntry(${n.id})">✏️ Sửa</button>
            <button class="btn btn-outline" style="padding: 2px 7px; font-size: 11px; color: var(--color-red);" onclick="deleteNoteEntry(${n.id})">🗑️ Xóa</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterNotesCategory(category) {
  activeNoteCategory = category;
  const pills = document.querySelectorAll('#notes-category-pills .coin-pill-btn');
  pills.forEach(p => {
    if (p.innerText.includes(category) || (category === 'ALL' && p.innerText.includes('Tất Cả'))) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
  loadNotes();
}

function filterNotes() {
  loadNotes();
}

function resetNotesFilters() {
  const searchEl = document.getElementById('notes-search-input');
  const dateEl = document.getElementById('notes-filter-date');
  if (searchEl) searchEl.value = '';
  if (dateEl) dateEl.value = '';
  filterNotesCategory('ALL');
}

function openAddNoteModal() {
  document.getElementById('note-modal-title').innerText = '📒 Thêm Ghi Chú & Bài Học Kỷ Luật Mới';
  document.getElementById('note-form').reset();
  document.getElementById('note-id').value = '';
  document.getElementById('note-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('note-pinned').checked = false;
  currentNoteUploadedImages = [];
  renderNoteUploadedImagesPreview();
  setupNoteImageDropzone();
  openModal('note-modal');
}

async function editNoteEntry(id) {
  const note = noteEntries.find(n => n.id === id);
  if (!note) return;

  document.getElementById('note-modal-title').innerText = `✏️ Chỉnh Sửa Ghi Chú #${note.id}`;
  document.getElementById('note-id').value = note.id;
  document.getElementById('note-date').value = note.date;
  document.getElementById('note-category').value = note.category;
  document.getElementById('note-title').value = note.title;
  document.getElementById('note-content').value = note.content;
  document.getElementById('note-pinned').checked = Boolean(note.is_pinned);

  currentNoteUploadedImages = note.images ? [...note.images] : [];
  renderNoteUploadedImagesPreview();
  setupNoteImageDropzone();
  openModal('note-modal');
}

function viewNoteDetail(id) {
  const note = noteEntries.find(n => n.id === id);
  if (!note) return;

  const badgeEl = document.getElementById('detail-note-badge');
  if (badgeEl) badgeEl.innerText = note.category;

  document.getElementById('detail-note-title').innerText = note.title;
  document.getElementById('detail-note-date').innerText = `📅 Ngày ghi: ${note.date}`;
  document.getElementById('detail-note-pinned-status').innerHTML = note.is_pinned ? '<span class="badge badge-amber">📌 Đã Ghim Lên Đầu</span>' : '';

  const bodyEl = document.getElementById('detail-note-body');
  if (bodyEl) {
    if (window.marked) {
      bodyEl.innerHTML = marked.parse(note.content);
    } else {
      bodyEl.innerText = note.content;
    }
  }

  const imagesContainer = document.getElementById('detail-note-images');
  if (imagesContainer) {
    if (note.images && note.images.length > 0) {
      imagesContainer.innerHTML = note.images.map(imgUrl => `
        <img src="${imgUrl}" style="width: 100%; max-height: 380px; object-fit: contain; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer;" onclick="openLightbox('${imgUrl}')" title="Click xem phóng to">
      `).join('');
    } else {
      imagesContainer.innerHTML = '';
    }
  }

  const editBtn = document.getElementById('btn-edit-current-note');
  if (editBtn) {
    editBtn.onclick = () => {
      closeModal('note-detail-modal');
      editNoteEntry(note.id);
    };
  }

  const deleteBtn = document.getElementById('btn-delete-current-note');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      closeModal('note-detail-modal');
      deleteNoteEntry(note.id);
    };
  }

  openModal('note-detail-modal');
}

async function saveNoteEntry(e) {
  e.preventDefault();

  const id = document.getElementById('note-id').value;
  const date = document.getElementById('note-date').value;
  const category = document.getElementById('note-category').value;
  const title = document.getElementById('note-title').value.trim();
  const content = document.getElementById('note-content').value.trim();
  const is_pinned = document.getElementById('note-pinned').checked;

  const payload = {
    date, category, title, content, is_pinned,
    images: currentNoteUploadedImages
  };

  try {
    let res;
    if (id) {
      res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (res.ok) {
      showToast(id ? 'Đã cập nhật ghi chú!' : 'Đã thêm ghi chú mới thành công!', 'success');
      closeModal('note-modal');
      loadNotes();
    } else {
      showToast('Lỗi: ' + (data.error || 'Failed to save note'), 'error');
    }
  } catch (err) {
    showToast('Lỗi lưu ghi chú: ' + err.message, 'error');
  }
}

async function deleteNoteEntry(id) {
  if (!confirm(`Bạn có chắc chắn muốn xóa ghi chú này?`)) return;

  try {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Đã xóa ghi chú.', 'info');
      loadNotes();
    } else {
      showToast('Không thể xóa ghi chú.', 'error');
    }
  } catch (err) {
    showToast('Lỗi: ' + err.message, 'error');
  }
}

async function togglePinNote(id) {
  try {
    const res = await fetch(`/api/notes/${id}/pin`, { method: 'POST' });
    if (res.ok) {
      showToast('Đã thay đổi trạng thái ghim.', 'success');
      loadNotes();
    }
  } catch (err) {
    showToast('Lỗi ghim note: ' + err.message, 'error');
  }
}

// Note Image Upload & Dropzone
function setupNoteImageDropzone() {
  const dropzone = document.getElementById('note-image-dropzone');
  const fileInput = document.getElementById('note-image-file-input');
  if (!dropzone) return;

  dropzone.onclick = () => fileInput.click();

  dropzone.ondragover = (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  };
  dropzone.ondragleave = () => {
    dropzone.classList.remove('dragover');
  };
  dropzone.ondrop = (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleNoteFileSelect(e.dataTransfer.files);
    }
  };
}

function handleNoteFileSelect(files) {
  if (!files || files.length === 0) return;
  for (let i = 0; i < files.length; i++) {
    uploadSingleNoteFile(files[i]);
  }
}

async function uploadSingleNoteFile(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = e.target.result;
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data })
      });
      const data = await res.json();
      if (data.success && data.url) {
        currentNoteUploadedImages.push(data.url);
        renderNoteUploadedImagesPreview();
        showToast('Tải ảnh ghi chú thành công!', 'success');
      } else {
        showToast('Lỗi tải ảnh: ' + (data.error || 'Unknown'), 'error');
      }
    } catch (err) {
      showToast('Lỗi upload: ' + err.message, 'error');
    }
  };
  reader.readAsDataURL(file);
}

function renderNoteUploadedImagesPreview() {
  const container = document.getElementById('note-uploaded-images-preview');
  if (!container) return;

  container.innerHTML = currentNoteUploadedImages.map((url, idx) => `
    <div class="preview-img-container">
      <img src="${url}" alt="Preview">
      <button type="button" class="btn-remove-img" onclick="removeUploadedNoteImage(${idx})">✕</button>
    </div>
  `).join('');
}

function removeUploadedNoteImage(idx) {
  currentNoteUploadedImages.splice(idx, 1);
  renderNoteUploadedImagesPreview();
}

// ==========================================
// 4. MODULE: AI REVIEW & CHUẨN ĐOÁN LỆNH GIAO DỊCH (UPGRADED)
// ==========================================
function selectAiPeriod(period) {
  activeAiPeriod = period;
  const pills = document.querySelectorAll('#ai-review-period-pills .coin-pill-btn');
  pills.forEach(p => {
    if (
      (period === 'TODAY' && p.innerText.includes('Hôm Nay')) ||
      (period === 'WEEK' && p.innerText.includes('Tuần Này')) ||
      (period === 'MONTH' && p.innerText.includes('Tháng Này')) ||
      (period === 'YEAR' && p.innerText.includes('Năm Nay')) ||
      (period === 'ALL' && p.innerText.includes('Toàn Bộ')) ||
      (period === 'CUSTOM' && p.innerText.includes('Tùy Chỉnh'))
    ) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });

  const customDateBox = document.getElementById('ai-custom-date-container');
  if (customDateBox) {
    customDateBox.style.display = period === 'CUSTOM' ? 'flex' : 'none';
  }
}

async function runAiTradeReview() {
  const loadingEl = document.getElementById('ai-review-loading');
  const placeholderEl = document.getElementById('ai-review-placeholder');
  const resultEl = document.getElementById('ai-review-result-container');
  const btn = document.getElementById('btn-run-ai-review');

  let startDate = null;
  let endDate = null;
  const now = new Date();

  if (activeAiPeriod === 'TODAY') {
    startDate = now.toISOString().split('T')[0];
    endDate = startDate;
  } else if (activeAiPeriod === 'WEEK') {
    const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    startDate = past7.toISOString().split('T')[0];
    endDate = now.toISOString().split('T')[0];
  } else if (activeAiPeriod === 'MONTH') {
    const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    startDate = past30.toISOString().split('T')[0];
    endDate = now.toISOString().split('T')[0];
  } else if (activeAiPeriod === 'YEAR') {
    startDate = `${now.getFullYear()}-01-01`;
    endDate = now.toISOString().split('T')[0];
  } else if (activeAiPeriod === 'CUSTOM') {
    startDate = document.getElementById('ai-review-start')?.value || null;
    endDate = document.getElementById('ai-review-end')?.value || null;
  }

  const coinFilter = document.getElementById('ai-review-coin')?.value || 'ALL';

  if (loadingEl) loadingEl.style.display = 'block';
  if (placeholderEl) placeholderEl.style.display = 'none';
  if (resultEl) resultEl.style.display = 'none';
  if (btn) btn.disabled = true;

  try {
    const res = await fetch('/api/journal/ai-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        periodType: activeAiPeriod,
        startDate,
        endDate,
        coinFilter,
        save: true,
        livePrices: window.liveBinancePrices || {}
      })
    });

    if (!res.ok) throw new Error('Failed to run AI review');
    const data = await res.json();
    const review = data.review;

    renderAiReviewResult(review);
    showToast('✨ AI Trade Review đã hoàn tất theo giá Live Binance!', 'success');
  } catch (err) {
    showToast('Lỗi AI Review: ' + err.message, 'error');
    if (placeholderEl) placeholderEl.style.display = 'block';
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
    if (btn) btn.disabled = false;
  }
}

function renderAiReviewResult(review) {
  const container = document.getElementById('ai-review-result-container');
  if (!container) return;

  container.style.display = 'block';

  const score = review.disciplineScore || 0;
  const grade = review.grade || 'Chưa có điểm';
  const gradeColor = review.gradeColor || '#38bdf8';
  const stats = review.stats || {};
  const classifications = review.classifications || {};
  const warnings = review.warnings || [];
  const strengths = review.strengths || [];
  const remediations = review.remediations || [];

  const goodTrades = classifications.goodTrades || [];
  const faultyTrades = classifications.faultyTrades || [];
  const unnecessaryTrades = classifications.unnecessaryTrades || [];
  const tiltedTrades = classifications.tiltedTrades || [];
  const activeOpenTrades = classifications.activeOpenTrades || [];

  const isPos = (stats.totalPnL || 0) >= 0;
  const pnlSign = isPos ? '+' : '';
  const pnlColor = isPos ? 'var(--color-green)' : 'var(--color-red)';

  container.innerHTML = `
    <!-- Top Row: Discipline Score Meter & Executive Summary -->
    <div style="display: grid; grid-template-columns: 320px 1fr; gap: 18px; margin-bottom: 20px;">
      
      <!-- Discipline Score Gauge Card -->
      <div class="card" style="text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 24px; border: 1px solid rgba(41, 98, 255, 0.4); background: radial-gradient(circle at center, #0e172a 0%, #080c14 100%);">
        <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
          🎯 ĐIỂM CHẤM KỶ LUẬT TRADING
        </div>
        <div style="font-size: 52px; font-weight: 900; font-family: var(--font-mono); color: ${gradeColor}; line-height: 1; margin-bottom: 8px;">
          ${score}<span style="font-size: 24px; color: var(--text-muted);">/100</span>
        </div>
        <div style="font-size: 13px; font-weight: 800; color: ${gradeColor}; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.4px;">
          ${grade}
        </div>
        <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
          <div style="width: ${score}%; height: 100%; background: ${gradeColor}; border-radius: 4px; transition: width 0.6s ease;"></div>
        </div>
      </div>

      <!-- Executive Overview Card -->
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 20px;">
        <div>
          <div style="font-size: 14px; font-weight: 800; color: #60a5fa; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <span>💡</span> ĐÁNH GIÁ TỔNG QUAN HIỆU SUẤT & ĐỘ NHẤT QUÁN (LIVE BINANCE)
          </div>
          <div style="font-size: 13.5px; line-height: 1.65; color: #cbd5e1; margin-bottom: 14px;">
            ${review.summary}
          </div>
        </div>

        <!-- Real-Time Metrics Overview Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: var(--bg-input); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--border-color); font-family: var(--font-mono); font-size: 12px;">
          <div>
            <div style="color: var(--text-muted); font-size: 10.5px;">Tổng Lệnh Quét:</div>
            <div style="font-size: 15px; font-weight: 800; color: #fff;">${stats.total || 0}</div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: 10.5px;">PnL Đã Chốt:</div>
            <div style="font-size: 14px; font-weight: 800; color: ${(stats.realizedPnL || 0) >= 0 ? 'var(--color-green)' : 'var(--color-red)'};">${(stats.realizedPnL || 0) >= 0 ? '+' : ''}${(stats.realizedPnL || 0).toLocaleString()}</div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: 10.5px;">PnL Live Binance:</div>
            <div style="font-size: 14px; font-weight: 800; color: ${(stats.unrealizedPnL || 0) >= 0 ? 'var(--color-green)' : 'var(--color-red)'};">${(stats.unrealizedPnL || 0) >= 0 ? '+' : ''}${(stats.unrealizedPnL || 0).toLocaleString()}</div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: 10.5px;">Tổng PnL Thực Tế:</div>
            <div style="font-size: 15px; font-weight: 800; color: ${pnlColor};">${pnlSign}${(stats.totalPnL || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

    </div>

    <!-- Active Open Positions Card (If Any) -->
    ${activeOpenTrades.length > 0 ? `
      <div class="card" style="border: 1px solid rgba(56, 189, 248, 0.4); background: #050b14; margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: 800; color: #38bdf8; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span style="display: flex; align-items: center; gap: 6px;"><span>⏳</span> VỊ THẾ ĐANG MỞ THEO GIÁ LIVE BINANCE (${activeOpenTrades.length} LỆNH)</span>
          <span class="badge badge-blue" style="font-size: 10px;">🟢 LIVE STREAM</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;">
          ${activeOpenTrades.map(t => {
            const isPosTrade = (t.live_pnl_amount || 0) >= 0;
            const signTrade = isPosTrade ? '+' : '';
            return `
              <div style="background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-weight: 800; color: #fff; font-size: 13.5px;">#${t.tradeId} • ${t.coin} (${t.type})</span>
                  <span class="badge ${t.tagClass}" style="font-size: 10px;">${t.positionTag}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11.5px; font-family: var(--font-mono); margin-bottom: 8px;">
                  <span style="color: var(--text-muted)">Entry: <b>$${formatDisplayPrice(t.entry_price)}</b></span>
                  <span style="color: #38bdf8">Giá Live: <b>$${formatDisplayPrice(t.current_price)}</b></span>
                  <span style="color: var(--color-red)">Stop Loss: <b>$${formatDisplayPrice(t.stop_loss)}</b></span>
                  <span style="color: var(--color-green)">Take Profit: <b>$${formatDisplayPrice(t.take_profit)}</b></span>
                </div>
                <div style="padding: 6px 10px; background: rgba(0,0,0,0.3); border-radius: 6px; font-size: 12.5px; font-weight: 800; font-family: var(--font-mono); color: ${isPosTrade ? 'var(--color-green)' : 'var(--color-red)'}; margin-bottom: 6px; display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted); font-size: 11px;">PnL Tạm Tính:</span>
                  <span>${signTrade}$${(t.live_pnl_amount || 0).toLocaleString()} (${signTrade}${t.live_pnl_percent || 0}%)</span>
                </div>
                <div style="font-size: 11.5px; color: #cbd5e1; line-height: 1.5; font-style: italic;">
                  ${t.positionAdvice}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Warnings & Strengths Alerts -->
    ${warnings.length > 0 ? `
      <div style="background: rgba(255, 59, 105, 0.08); border: 1px solid rgba(255, 59, 105, 0.35); border-left: 4px solid var(--color-red); padding: 14px 18px; border-radius: 8px; margin-bottom: 16px;">
        <div style="font-size: 13.5px; font-weight: 800; color: #f87171; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>🚨</span> CÁC LỖI KỶ LUẬT & NGUY CƠ RỦI RO CẦN LOẠI BỎ NGAY:
        </div>
        <ul style="margin-left: 20px; font-size: 12.5px; color: #cbd5e1; line-height: 1.6;">
          ${warnings.map(w => `<li>${w}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    ${strengths.length > 0 ? `
      <div style="background: rgba(0, 192, 118, 0.08); border: 1px solid rgba(0, 192, 118, 0.35); border-left: 4px solid var(--color-green); padding: 14px 18px; border-radius: 8px; margin-bottom: 20px;">
        <div style="font-size: 13.5px; font-weight: 800; color: #4ade80; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>✅</span> ĐIỂM SÁNG KỶ LUẬT CẦN TIẾP TỤC DUY TRÌ:
        </div>
        <ul style="margin-left: 20px; font-size: 12.5px; color: #cbd5e1; line-height: 1.6;">
          ${strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <!-- 4-GRID BREAKDOWN: GOOD, FAULTY, UNNECESSARY, TILTED TRADES -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-bottom: 24px;">
      
      <!-- Card 1: Tilted / Revenge Trades (High Priority Warning) -->
      <div class="card" style="border-top: 3px solid var(--color-red);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 13.5px; font-weight: 800; color: #f87171; display: flex; align-items: center; gap: 6px;">
            <span>🚨</span> Lệnh Thiếu Tỉnh Táo (Revenge / FOMO)
          </div>
          <span class="badge ${tiltedTrades.length > 0 ? 'badge-red' : 'badge-green'}">${tiltedTrades.length} Lệnh</span>
        </div>
        
        ${tiltedTrades.length === 0 ? `
          <div style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 20px;">
            🎉 Không phát hiện lệnh nào có dấu hiệu trả thù hoặc cay cú vào lệnh!
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${tiltedTrades.map(t => `
              <div style="background: rgba(255, 59, 105, 0.08); border: 1px solid rgba(255, 59, 105, 0.25); padding: 10px 12px; border-radius: 6px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 3px;">
                  <span style="color: #fff;">#${t.tradeId} • ${t.coin} (${t.type})</span>
                  <span style="color: var(--text-muted); font-family: var(--font-mono);">${t.date}</span>
                </div>
                <div style="color: #fca5a5; line-height: 1.45; margin-bottom: 4px;"><b>Lý do:</b> ${t.detail}</div>
                <div style="color: #94a3b8; font-size: 11px; font-style: italic;">👉 ${t.lesson}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Card 2: Faulty / Technical Violations -->
      <div class="card" style="border-top: 3px solid var(--color-amber);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 13.5px; font-weight: 800; color: #fbbf24; display: flex; align-items: center; gap: 6px;">
            <span>❌</span> Lệnh Sai Kỹ Thuật & Không Đặt SL
          </div>
          <span class="badge ${faultyTrades.length > 0 ? 'badge-amber' : 'badge-green'}">${faultyTrades.length} Lệnh</span>
        </div>

        ${faultyTrades.length === 0 ? `
          <div style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 20px;">
            ✅ Tuyệt vời! Tất cả các lệnh đều có Stop Loss và R:R chuẩn mực.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${faultyTrades.map(t => `
              <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); padding: 10px 12px; border-radius: 6px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 3px;">
                  <span style="color: #fff;">#${t.tradeId} • ${t.coin} (${t.type})</span>
                  <span style="color: var(--text-muted); font-family: var(--font-mono);">${t.date}</span>
                </div>
                <div style="color: #fde68a; line-height: 1.45; margin-bottom: 4px;"><b>Lỗi:</b> ${t.reason}</div>
                <div style="color: #94a3b8; font-size: 11px; font-style: italic;">👉 ${t.lesson}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Card 3: Unnecessary / Overtrading -->
      <div class="card" style="border-top: 3px solid #38bdf8;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 13.5px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
            <span>⚠️</span> Lệnh Không Cần Thiết (Overtrading)
          </div>
          <span class="badge ${unnecessaryTrades.length > 0 ? 'badge-blue' : 'badge-green'}">${unnecessaryTrades.length} Lệnh</span>
        </div>

        ${unnecessaryTrades.length === 0 ? `
          <div style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 20px;">
            👌 Tần suất vào lệnh rất hợp lý, không bị cuốn vào giao dịch quá mức.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${unnecessaryTrades.map(t => `
              <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); padding: 10px 12px; border-radius: 6px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 3px;">
                  <span style="color: #fff;">#${t.tradeId} • ${t.coin}</span>
                  <span style="color: var(--text-muted); font-family: var(--font-mono);">${t.date}</span>
                </div>
                <div style="color: #bae6fd; line-height: 1.45; margin-bottom: 4px;">${t.reason}</div>
                <div style="color: #94a3b8; font-size: 11px; font-style: italic;">👉 ${t.detail}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Card 4: Disciplined & Valid Trades -->
      <div class="card" style="border-top: 3px solid var(--color-green);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 13.5px; font-weight: 800; color: #4ade80; display: flex; align-items: center; gap: 6px;">
            <span>🟢</span> Lệnh Đúng Chuẩn Kỷ Luật (A+ Setups)
          </div>
          <span class="badge badge-green">${goodTrades.length} Lệnh</span>
        </div>

        ${goodTrades.length === 0 ? `
          <div style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 20px;">
            Chưa có lệnh nào tích đủ 3-5 confluences giáo trình. Hãy xem phần khắc phục bên dưới!
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto;">
            ${goodTrades.map(t => `
              <div style="background: rgba(0, 192, 118, 0.08); border: 1px solid rgba(0, 192, 118, 0.25); padding: 10px 12px; border-radius: 6px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 3px;">
                  <span style="color: #fff;">#${t.tradeId} • ${t.coin} (${t.type})</span>
                  <span class="badge ${t.status === 'WIN' ? 'badge-green' : (t.status === 'LOSS' ? 'badge-red' : 'badge-amber')}">${t.status}</span>
                </div>
                <div style="color: #86efac; font-size: 11.5px; margin-bottom: 4px;">✓ Tỷ lệ R:R: ${t.rrRatio} • Đầy đủ Stop Loss & Hợp lưu</div>
                <div style="display: flex; flex-wrap: wrap; gap: 3px;">
                  ${(t.confluences || []).slice(0, 3).map(c => `<span style="font-size: 9.5px; background: rgba(0,0,0,0.3); padding: 1px 4px; border-radius: 3px; color: #cbd5e1;">${c}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>

    <!-- ACTIONABLE REMEDIATION & DISCIPLINE PROTOCOL -->
    <div class="card" style="background: #090e1a; border: 1px solid rgba(41, 98, 255, 0.4); border-left: 4px solid var(--color-blue); padding: 20px;">
      <div style="font-size: 15px; font-weight: 800; color: #60a5fa; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        <span>🎯</span> PHÁC ĐỒ & CÁCH KHẮC PHỤC TRIỆT ĐỂ (CHUẨN 11 CHƯƠNG GIÁO TRÌNH)
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${remediations.map(r => `
          <div style="background: var(--bg-input); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 3px;">
              📚 ${r.chapter} ➔ ${r.rule}
            </div>
            <div style="font-size: 13px; color: #cbd5e1; line-height: 1.55;">
              ${r.action}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// AI Coach Chat Interactive Execution
async function runAiCoachPrompt() {
  const input = document.getElementById('ai-coach-prompt-input');
  const btn = document.getElementById('btn-submit-ai-coach');
  const chatBox = document.getElementById('ai-coach-chat-messages');

  if (!input || !input.value.trim()) return;
  const prompt = input.value.trim();
  input.value = '';

  // Append user bubble
  const userBubble = document.createElement('div');
  userBubble.style.cssText = 'align-self: flex-end; max-width: 82%; background: #1e3a8a; border: 1px solid #3b82f6; border-radius: 12px 12px 2px 12px; padding: 10px 14px; font-size: 13px; color: #fff; margin-bottom: 6px;';
  userBubble.innerText = prompt;
  chatBox.appendChild(userBubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Append AI loading bubble
  const aiBubble = document.createElement('div');
  aiBubble.style.cssText = 'align-self: flex-start; max-width: 88%; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px 12px 12px 2px; padding: 14px; font-size: 13px; color: #cbd5e1; margin-bottom: 6px;';
  aiBubble.innerHTML = '<span style="color: #38bdf8;">🤖 AI Coach đang tổng hợp dữ liệu lệnh và phân tích...</span>';
  chatBox.appendChild(aiBubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (btn) btn.disabled = true;

  try {
    const res = await fetch('/api/journal/coach-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        livePrices: window.liveBinancePrices || {}
      })
    });

    const data = await res.json();
    if (res.ok && data.output) {
      if (window.marked) {
        aiBubble.innerHTML = marked.parse(data.output);
      } else {
        aiBubble.innerText = data.output;
      }
    } else {
      aiBubble.innerHTML = `<span style="color: var(--color-red);">Lỗi: ${data.error || 'Không nhận được phản hồi từ AI'}</span>`;
    }
  } catch (err) {
    aiBubble.innerHTML = `<span style="color: var(--color-red);">Lỗi kết nối: ${err.message}</span>`;
  } finally {
    if (btn) btn.disabled = false;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function clearAiCoachHistory() {
  const chatBox = document.getElementById('ai-coach-chat-messages');
  if (chatBox) {
    chatBox.innerHTML = `
      <div style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 12px;">
        🤖 Đã xóa lịch sử chat. Hãy đặt câu hỏi mới cho AI Trade Coach!
      </div>
    `;
  }
}

// AI Review History
async function openAiReviewHistoryModal() {
  const container = document.getElementById('ai-review-history-list');
  if (!container) return;

  openModal('ai-review-history-modal');
  container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 24px;">Đang tải lịch sử AI Review...</div>';

  try {
    const res = await fetch('/api/journal/ai-review/history');
    if (!res.ok) throw new Error('Failed to load history');
    const data = await res.json();
    currentSavedReviews = data.history || [];

    if (currentSavedReviews.length === 0) {
      container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 24px;">Chưa có bản phân tích AI Review nào được lưu. Hãy bấm nút "Kích Hoạt AI Phân Tích & Chuẩn Đoán Lệnh" để tạo bản đầu tiên!</div>';
      return;
    }

    container.innerHTML = currentSavedReviews.map(r => {
      const d = r.analysis_data || {};
      const score = r.discipline_score || d.disciplineScore || 0;
      const dateStr = new Date(r.created_at).toLocaleString('vi-VN');

      return `
        <div style="background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
          <div>
            <div style="font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px;">
              Bản Review: ${r.period_type} (${r.coin_filter || 'ALL'}) — <span style="color: #38bdf8;">Điểm Kỷ Luật: ${score}/100</span>
            </div>
            <div style="font-size: 11.5px; color: var(--text-muted);">
              🕒 Thời gian: ${dateStr} • ${r.total_trades} Lệnh được rà soát
            </div>
          </div>
          <div style="display: flex; gap: 6px; flex-shrink: 0;">
            <button class="btn btn-primary" style="padding: 4px 10px; font-size: 11.5px;" onclick="viewSavedReviewDetail(${r.id})">🔍 Xem Lại</button>
            <button class="btn btn-outline" style="padding: 4px 10px; font-size: 11.5px; color: var(--color-red);" onclick="deleteSavedReview(${r.id})">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-red); text-align: center; padding: 20px;">Lỗi tải lịch sử: ${err.message}</div>`;
  }
}

function viewSavedReviewDetail(id) {
  const item = currentSavedReviews.find(r => r.id === id);
  if (!item || !item.analysis_data) return;

  closeModal('ai-review-history-modal');
  switchJournalSubTab('aireview');
  renderAiReviewResult(item.analysis_data);
}

async function deleteSavedReview(id) {
  if (!confirm(`Bạn có chắc muốn xóa bản lưu AI Review #${id}?`)) return;

  try {
    const res = await fetch(`/api/journal/ai-review/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Đã xóa bản lưu AI Review.', 'info');
      openAiReviewHistoryModal();
    }
  } catch (err) {
    showToast('Lỗi xóa review: ' + err.message, 'error');
  }
}

// Lightbox & Utility
function openLightbox(imgUrl) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-image');
  if (modal && img) {
    img.src = imgUrl;
    openModal('lightbox-modal');
  }
}

function formatDisplayPrice(price) {
  const p = Number(price) || 0;
  if (p >= 1000) {
    return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (p >= 1) {
    return p.toFixed(4);
  } else {
    return p.toFixed(6);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// 5. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadJournalEntries();
});

