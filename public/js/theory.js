// --- MODULE 1: THEORY & HANDBOOK LOGIC ---
// 100% Comprehensive Visual Renderer with DOM Mount Points (No escaping bugs)

let theoryChapters = [];
let currentChapterIndex = 0;
let theoryGlossary = [];
let currentTheorySubTab = 'reader'; // 'reader' or 'atlas'

async function loadTheoryTOC() {
  try {
    const res = await fetch('/api/theory');
    if (!res.ok) throw new Error('Failed to load theory TOC');
    const data = await res.json();

    theoryChapters = data.chapters || [];
    theoryGlossary = data.glossary || [];
    window._theoryLoaded = true;

    renderChapterSidebar();
    if (theoryChapters.length > 0) {
      loadChapter(1);
    }
  } catch (err) {
    console.error('Error loading theory TOC:', err);
    document.getElementById('chapter-list-container').innerHTML = `
      <div style="color: var(--color-red); font-size: 13px;">Không thể tải danh sách chương: ${err.message}</div>
    `;
  }
}

function switchTheorySubTab(subTab) {
  currentTheorySubTab = subTab;
  
  const btnReader = document.getElementById('btn-theory-reader');
  const btnAtlas = document.getElementById('btn-theory-atlas');
  const viewReader = document.getElementById('theory-reader-view');
  const viewAtlas = document.getElementById('theory-atlas-view');

  if (btnReader && btnAtlas && viewReader && viewAtlas) {
    if (subTab === 'reader') {
      btnReader.classList.add('active');
      btnAtlas.classList.remove('active');
      viewReader.style.display = 'grid';
      viewAtlas.style.display = 'none';
    } else {
      btnReader.classList.remove('active');
      btnAtlas.classList.add('active');
      viewReader.style.display = 'none';
      viewAtlas.style.display = 'block';
      renderCandlestickAtlas();
    }
  }
}

function renderChapterSidebar(filter = '') {
  const container = document.getElementById('chapter-list-container');
  if (!container) return;

  const filtered = theoryChapters.filter(c => 
    c.title.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); font-size: 12.5px; padding: 10px;">Không tìm thấy chương.</div>`;
    return;
  }

  container.innerHTML = filtered.map((c, idx) => {
    const isActive = theoryChapters[currentChapterIndex] && theoryChapters[currentChapterIndex].id === c.id;
    return `
      <div class="chapter-nav-item ${isActive ? 'active' : ''}" onclick="loadChapter(${c.id})">
        <div style="overflow: hidden; text-overflow: ellipsis;">
          <div style="font-size: 10.5px; color: ${isActive ? '#93c5fd' : 'var(--text-muted)'}; font-weight: 700;">CHƯƠNG ${c.id}</div>
          <div style="margin-top: 1px; line-height: 1.35;">${c.title.replace(/^CHƯƠNG\s+\d+[:\s]*/i, '')}</div>
        </div>
        <span class="badge ${isActive ? 'badge-blue' : 'badge-green'}" style="font-size: 9.5px; margin-left: 6px; flex-shrink: 0;">${c.sectionCount || 1} phần</span>
      </div>
    `;
  }).join('');
}

function getHotColdWalletHtml() {
  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 18px 0;">
      <div style="background: rgba(255, 59, 105, 0.08); border: 1px solid rgba(255, 59, 105, 0.35); border-radius: 10px; padding: 16px;">
        <div style="font-size: 15px; font-weight: 800; color: #ff6b8f; margin-bottom: 8px;">🔥 VÍ NÓNG (HOT WALLET)</div>
        <ul style="margin-left: 16px; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          <li><b>Đặc điểm:</b> Kết nối trực tiếp Internet (App di động / Extension trình duyệt).</li>
          <li><b>Ưu điểm:</b> Tiện lợi giao dịch hàng ngày, kết nối DeFi/Web3 tức thì, chi phí 0đ.</li>
          <li><b>Rủi ro:</b> Dễ bị dính mã độc, link phishing lừa đảo nếu bất cẩn.</li>
          <li><b>Đại diện tiêu biểu:</b> MetaMask, Phantom, Trust Wallet, Rabby Wallet.</li>
        </ul>
      </div>
      <div style="background: rgba(0, 192, 118, 0.08); border: 1px solid rgba(0, 192, 118, 0.35); border-radius: 10px; padding: 16px;">
        <div style="font-size: 15px; font-weight: 800; color: #26e396; margin-bottom: 8px;">🧊 VÍ LẠNH (COLD WALLET)</div>
        <ul style="margin-left: 16px; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          <li><b>Đặc điểm:</b> Thiết bị phần cứng vật lý riêng biệt, ngắt hoàn toàn khỏi Internet.</li>
          <li><b>Ưu điểm:</b> An toàn tuyệt đối chống hacker từ xa, xác thực vật lý bằng nút bấm.</li>
          <li><b>Mục đích:</b> Thích hợp lưu trữ tài sản lớn dài hạn (HODL).</li>
          <li><b>Đại diện tiêu biểu:</b> Ledger Nano X, Trezor Model T, SafePal S1.</li>
        </ul>
      </div>
    </div>
  `;
}


function cleanLatexSymbols(text) {
  if (!text) return "";
  return text
    .replace(/\$\rightarrow\$/g, "➔")
    .replace(/\\rightarrow/g, "➔")
    .replace(/\$\leftarrow\$/g, "⬅")
    .replace(/\\leftarrow/g, "⬅")
    .replace(/\$\ge\$/g, "≥")
    .replace(/\\ge/g, "≥")
    .replace(/\$\le\$/g, "≤")
    .replace(/\\le/g, "≤")
    .replace(/\$\times\$/g, "×")
    .replace(/\\times/g, "×")
    .replace(/\$\approx\$/g, "≈")
    .replace(/\\approx/g, "≈")
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\%/g, "%")
    .replace(/\\\$/g, "$");
}

async function loadChapter(chapterId) {
  const chapter = theoryChapters.find(c => c.id === chapterId);
  if (!chapter) return;

  currentChapterIndex = theoryChapters.findIndex(c => c.id === chapterId);
  renderChapterSidebar();

  document.getElementById('current-chapter-badge').innerText = `CHƯƠNG ${chapter.id} / ${theoryChapters.length}`;
  document.getElementById('current-chapter-title').innerText = chapter.title;

  const bodyEl = document.getElementById('chapter-markdown-body');
  bodyEl.innerHTML = '<div style="color: var(--text-muted); padding: 20px;">Đang tải nội dung chương...</div>';

  try {
    const res = await fetch(`/api/theory/chapter/${chapterId}`);
    if (!res.ok) throw new Error('Cannot load chapter content');
    const fullChap = await res.json();

    // Clean up duplicate top H1
    let rawContent = fullChap.content.replace(/^#\s+CHƯƠNG\s+\d+[:\s].*\n+/i, '');

    // Replace ASCII code blocks with clean Mount Point elements
    // 1. Chapter 1: Blockchain Ledger
    rawContent = rawContent.replace(/```[\s\S]*?BLOCK #101[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="blockchain-ledger"></div>\n\n');

    // 2. Chapter 2: Hot vs Cold Wallet
    rawContent = rawContent.replace(/```[\s\S]*?VÍ NÓNG[\s\S]*?VÍ LẠNH[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="hot-cold-wallet"></div>\n\n');

    // 3. Chapter 3: Candle Anatomy & 3 Cases
    rawContent = rawContent.replace(/```[\s\S]*?NẾN TĂNG \(BULLISH\)[\s\S]*?NẾN GIẢM \(BEARISH\)[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="candle-anatomy"></div>\n\n');
    rawContent = rawContent.replace(/```[\s\S]*?TRƯỜNG HỢP 1[\s\S]*?TRƯỜNG HỢP 2[\s\S]*?TRƯỜNG HỢP 3[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="three-candle-cases"></div>\n\n');

    // 4. Chapter 4: Candlestick Patterns
    rawContent = rawContent.replace(/```[\s\S]*?Xu hướng giảm[\s\S]*?Nến Hammer[\s\S]*?```/gi, '\n\n<div class="visual-mount-box" data-visual="hammer-shooting-star"></div>\n\n');
    rawContent = rawContent.replace(/```[\s\S]*?DOJI CHUẨN[\s\S]*?DOJI CHUỒN CHUỒN[\s\S]*?DOJI BIA MỘ[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="doji-types"></div>\n\n');
    rawContent = rawContent.replace(/```[\s\S]*?BULLISH ENGULFING[\s\S]*?BEARISH ENGULFING[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="engulfing-pair"></div>\n\n');
    rawContent = rawContent.replace(/```[\s\S]*?MORNING STAR[\s\S]*?EVENING STAR[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="morning-evening-star"></div>\n\n');

    // 5. Chapter 5: Support & Resistance / Role Reversal
    rawContent = rawContent.replace(/```[\s\S]*?VÙNG KHÁNG CỰ \(Trần Nhà[\s\S]*?VÙNG HỖ TRỢ \(Mặt Sàn[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="support-resistance-zone"></div>\n\n');
    rawContent = rawContent.replace(/```[\s\S]*?Phá vỡ \(Breakout\)[\s\S]*?HỖ TRỢ GỐC[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="role-reversal-diagram"></div>\n\n');

    // 6. Chapter 6: Market Structure
    rawContent = rawContent.replace(/```[\s\S]*?UPTREND \(Xu hướng Tăng\)[\s\S]*?DOWNTREND[\s\S]*?SIDEWAY[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="market-structure"></div>\n\n');

    // 7. Chapter 7: Multi-timeframe Fractal Swing
    rawContent = rawContent.replace(/```[\s\S]*?QUY TẮC XÁC NHẬN ĐỈNH[\s\S]*?QUY TẮC XÁC NHẬN ĐÁY[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="fractal-swing"></div>\n\n');

    // 8. Chapter 8: RSI Oscillator
    rawContent = rawContent.replace(/```[\s\S]*?QUÁ MUA[\s\S]*?QUÁ BÁN[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="rsi-oscillator"></div>\n\n');

    // 9. Chapter 9: Whale Manipulation Checklist
    rawContent = rawContent.replace(/```[\s\S]*?TỔNG HỢP 7 DẤU HIỆU CÁ MẬP QUÉT SÀN[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="whale-manipulation-overview"></div>\n\n');

    // 10. Chapter 10: Success Triangle & Risk Reward
    rawContent = rawContent.replace(/```[\s\S]*?50% TÂM LÝ[\s\S]*?30% QUẢN LÝ VỐN[\s\S]*?20% PHÂN TÍCH KỸ THUẬT[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="success-triangle"></div>\n\n');
    rawContent = rawContent.replace(/```[\s\S]*?Mục tiêu Chốt Lời[\s\S]*?TỶ LỆ R:R = 1:2[\s\S]*?```/g, '\n\n<div class="visual-mount-box" data-visual="risk-reward-diagram"></div>\n\n');

    // Parse Markdown safely
    let html = '';
    if (window.marked) {
      marked.setOptions({
        gfm: true,
        breaks: true
      });
      html = marked.parse(rawContent);
    } else {
      html = rawContent;
    }

    bodyEl.innerHTML = html;

    // Mount actual interactive SVG and HTML components into placeholders
    mountVisualElements(bodyEl);

    // Inject Additional Real Charts at the top of relevant chapters
    injectVisualChartsIntoChapter(chapterId);

    // Render Mermaid diagrams
    setTimeout(() => {
      if (window.mermaid) {
        document.querySelectorAll('#chapter-markdown-body .language-mermaid, #chapter-markdown-body pre code.language-mermaid').forEach((block, i) => {
          const code = block.innerText;
          const div = document.createElement('div');
          div.className = 'mermaid';
          div.id = `mermaid-diagram-${chapterId}-${i}`;
          div.innerHTML = code;
          block.parentElement.replaceWith(div);
        });
        try {
          mermaid.run({
            nodes: document.querySelectorAll('#chapter-markdown-body .mermaid')
          });
        } catch (mErr) {
          console.warn('Mermaid rendering note:', mErr);
        }
      }
    }, 100);

    // Scroll to top smoothly
    window.scrollTo({ top: 100, behavior: 'smooth' });

  } catch (err) {
    bodyEl.innerHTML = `<div style="color: var(--color-red);">Lỗi: ${err.message}</div>`;
  }
}

// Mounts SVGs and Custom Elements directly into DOM
function mountVisualElements(container) {
  if (!container || !window.ChartVisualizer) return;

  container.querySelectorAll('.visual-mount-box').forEach(el => {
    const type = el.getAttribute('data-visual');
    if (type === 'blockchain-ledger') {
      el.innerHTML = ChartVisualizer.renderBlockchainLedgerSvg();
    } else if (type === 'candle-anatomy') {
      el.innerHTML = ChartVisualizer.renderCandleAnatomySvg();
    } else if (type === 'three-candle-cases') {
      el.innerHTML = ChartVisualizer.renderThreeCandleCasesSvg();
    } else if (type === 'doji-types') {
      el.innerHTML = ChartVisualizer.renderDojiTypesSvg();
    } else if (type === 'engulfing-pair') {
      el.innerHTML = ChartVisualizer.renderEngulfingPairSvg();
    } else if (type === 'hammer-shooting-star') {
      el.innerHTML = ChartVisualizer.renderHammerShootingStarSvg();
    } else if (type === 'morning-evening-star') {
      el.innerHTML = ChartVisualizer.renderMorningEveningStarSvg();
    } else if (type === 'support-resistance-zone') {
      el.innerHTML = ChartVisualizer.renderSupportResistanceZoneSvg();
    } else if (type === 'role-reversal-diagram') {
      el.innerHTML = ChartVisualizer.renderRoleReversalDiagramSvg();
    } else if (type === 'market-structure') {
      el.innerHTML = ChartVisualizer.renderMarketStructureSvg();
    } else if (type === 'fractal-swing') {
      el.innerHTML = ChartVisualizer.renderFractalSwingSvg();
    } else if (type === 'rsi-oscillator') {
      el.innerHTML = ChartVisualizer.renderRsiOscillatorSvg();
    } else if (type === 'success-triangle') {
      el.innerHTML = ChartVisualizer.renderSuccessTriangleSvg();
    } else if (type === 'risk-reward-diagram') {
      el.innerHTML = ChartVisualizer.renderRiskRewardDiagramSvg();
    } else if (type === 'hot-cold-wallet') {
      el.innerHTML = getHotColdWalletHtml();
    } else if (type === 'capital-flow-cycle') {
      el.innerHTML = ChartVisualizer.renderCapitalFlowCycleSvg();
    } else if (type === 'whale-manipulation-overview') {
      el.innerHTML = ChartVisualizer.renderWhaleManipulationSvg();
    } else if (type === 'fvg-diagram') {
      el.innerHTML = ChartVisualizer.renderFvgDiagramSvg();
    } else if (type === 'order-block') {
      el.innerHTML = ChartVisualizer.renderOrderBlockSvg();
    } else if (type === 'bos-choch') {
      el.innerHTML = ChartVisualizer.renderBosChochSvg();
    }
  });
}


// Injects Real Candlestick Visuals directly into Chapters
function injectVisualChartsIntoChapter(chapterId) {
  if (!window.ChartVisualizer) return;

  const presets = ChartVisualizer.getPresetPatterns();
  const bodyEl = document.getElementById('chapter-markdown-body');
  if (!bodyEl) return;

  // Chapter 4: Candlestick Patterns Real Cards
  if (chapterId === 4) {
    const banner = document.createElement('div');
    banner.className = 'visual-chart-callout-grid';
    banner.innerHTML = `
      <div style="font-size: 15px; font-weight: 800; color: #38bdf8; margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
        <span>🕯️</span> BỘ HÌNH ẢNH MÔ HÌNH NẾN ĐẢO CHIỀU THỰC TẾ (CHƯƠNG 4)
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 16px;">
        <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          ${ChartVisualizer.renderChartSvg({ ...presets.hammer, width: 500, height: 260 })}
        </div>
        <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          ${ChartVisualizer.renderChartSvg({ ...presets.shooting_star, width: 500, height: 260 })}
        </div>
        <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          ${ChartVisualizer.renderChartSvg({ ...presets.bullish_engulfing, width: 500, height: 260 })}
        </div>
        <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          ${ChartVisualizer.renderChartSvg({ ...presets.morning_star, width: 500, height: 260 })}
        </div>
      </div>
    `;
    bodyEl.insertBefore(banner, bodyEl.firstChild);
  }

  // Chapter 5: Support & Resistance / Role Reversal Break & Retest & SFP
  if (chapterId === 5) {
    const banner = document.createElement('div');
    banner.className = 'visual-chart-callout-grid';
    banner.innerHTML = `
      <div style="font-size: 15px; font-weight: 800; color: #38bdf8; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
        <span>📈</span> BIỂU ĐỒ CHUYỂN ĐỔI VAI TRÒ (BREAKOUT & RETEST) & QUÉT RÂU SFP THỰC TẾ
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 16px;">
        <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          ${ChartVisualizer.renderChartSvg({ ...presets.role_reversal, width: 500, height: 260 })}
        </div>
        <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          ${ChartVisualizer.renderChartSvg({ ...presets.liquidity_sweep_sfp, width: 500, height: 260 })}
        </div>
      </div>
    `;
    bodyEl.insertBefore(banner, bodyEl.firstChild);
  }

  // Chapter 7: Multi-timeframe BTC scenario
  if (chapterId === 7) {
    const banner = document.createElement('div');
    banner.className = 'visual-chart-callout-grid';
    banner.innerHTML = `
      <div style="font-size: 15px; font-weight: 800; color: #38bdf8; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
        <span>🎯</span> BIỂU ĐỒ KỊCH BẢN THỰC CHIẾN 3 KHUNG GIỜ BTC (R:R = 1 : 12.8) & BẪY JUDAS
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 16px;">
        <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          ${ChartVisualizer.renderChartSvg({ ...presets.multi_timeframe_btc, width: 500, height: 260 })}
        </div>
        <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          ${ChartVisualizer.renderChartSvg({ ...presets.judas_swing, width: 500, height: 260 })}
        </div>
      </div>
    `;
    bodyEl.insertBefore(banner, bodyEl.firstChild);
  }

  // Chapter 9: Whale Manipulation, Liquidity Sweeps, Short Squeeze & Wyckoff Spring
  if (chapterId === 9) {
    const banner = document.createElement('div');
    banner.className = 'visual-chart-callout-grid';
    banner.innerHTML = `
      <div style="font-size: 15px; font-weight: 800; color: #38bdf8; margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
        <span>🐋</span> 4 BẪY THỰC CHIẾN KINH ĐIỂN CỦA CÁ MẬP (WHALES & MARKET MAKERS)
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 16px;">
        <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          ${ChartVisualizer.renderChartSvg({ ...presets.liquidity_sweep_sfp, width: 500, height: 260 })}
        </div>
        <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          ${ChartVisualizer.renderChartSvg({ ...presets.judas_swing, width: 500, height: 260 })}
        </div>
        <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          ${ChartVisualizer.renderChartSvg({ ...presets.funding_squeeze, width: 500, height: 260 })}
        </div>
        <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          ${ChartVisualizer.renderChartSvg({ ...presets.wyckoff_spring, width: 500, height: 260 })}
        </div>
      </div>
    `;
    bodyEl.insertBefore(banner, bodyEl.firstChild);
  }
}


// Render Candlestick Atlas (Visual library tab)
function renderCandlestickAtlas() {
  const container = document.getElementById('theory-atlas-grid');
  if (!container || !window.ChartVisualizer) return;

  const presets = ChartVisualizer.getPresetPatterns();
  const keys = Object.keys(presets);

  container.innerHTML = `
    <!-- Top Atlas Special Banner: OHLC Anatomy -->
    <div style="grid-column: 1 / -1; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; background: #06090e; margin-bottom: 8px;">
      ${ChartVisualizer.renderCandleAnatomySvg()}
    </div>
    <div style="grid-column: 1 / -1; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; background: #06090e; margin-bottom: 8px;">
      ${ChartVisualizer.renderThreeCandleCasesSvg()}
    </div>
    <div style="grid-column: 1 / -1; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; background: #06090e; margin-bottom: 8px;">
      ${ChartVisualizer.renderHammerShootingStarSvg()}
    </div>
    <div style="grid-column: 1 / -1; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; background: #06090e; margin-bottom: 8px;">
      ${ChartVisualizer.renderDojiTypesSvg()}
    </div>
    <div style="grid-column: 1 / -1; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; background: #06090e; margin-bottom: 8px;">
      ${ChartVisualizer.renderEngulfingPairSvg()}
    </div>
    <div style="grid-column: 1 / -1; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; background: #06090e; margin-bottom: 14px;">
      ${ChartVisualizer.renderMorningEveningStarSvg()}
    </div>
  ` + keys.map(k => {
    const item = presets[k];
    const chartSvg = ChartVisualizer.renderChartSvg({ ...item, width: 560, height: 280 });
    return `
      <div class="card" style="padding: 18px; display: flex; flex-direction: column; gap: 12px;">
        <div style="font-size: 15px; font-weight: 800; color: #fff;">
          ${item.title}
        </div>
        <div style="font-size: 12.5px; color: #cbd5e1; line-height: 1.5;">
          ${item.desc}
        </div>
        <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          ${chartSvg}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; background: var(--bg-input); padding: 9px; border-radius: 7px; font-size: 11.5px; font-family: var(--font-mono);">
          <div><span style="color: var(--text-muted);">Entry:</span> <b>$${item.tradeSetup.entry}</b></div>
          <div><span style="color: var(--color-red);">SL:</span> <b>$${item.tradeSetup.sl}</b></div>
          <div><span style="color: var(--color-green);">TP:</span> <b>$${item.tradeSetup.tp}</b></div>
        </div>
      </div>
    `;
  }).join('');
}

function navigateChapter(dir) {
  const newIndex = currentChapterIndex + dir;
  if (newIndex >= 0 && newIndex < theoryChapters.length) {
    loadChapter(theoryChapters[newIndex].id);
  }
}

function searchTheory(keyword) {
  renderChapterSidebar(keyword);
}

// Glossary Modal
function openGlossaryModal() {
  openModal('glossary-modal');
  renderGlossaryList('');
}

function renderGlossaryList(filter = '') {
  const container = document.getElementById('glossary-list-body');
  if (!container) return;

  const filtered = theoryGlossary.filter(g => 
    g.term.toLowerCase().includes(filter.toLowerCase()) ||
    g.origin.toLowerCase().includes(filter.toLowerCase()) ||
    g.desc.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); padding: 20px; text-align: center;">Không tìm thấy thuật ngữ phù hợp.</div>`;
    return;
  }

  container.innerHTML = filtered.map(g => `
    <div style="background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 7px; padding: 10px 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
        <span style="font-weight: 800; font-size: 14.5px; color: #60a5fa;">${g.term}</span>
        <span style="font-size: 11.5px; color: var(--text-muted); font-style: italic;">${g.origin}</span>
      </div>
      <div style="font-size: 12.5px; color: #cbd5e1; line-height: 1.5;">${g.desc}</div>
    </div>
  `).join('');
}

function filterGlossary(val) {
  renderGlossaryList(val);
}

// Position Size Calculator
function openCalculatorModal() {
  openModal('calc-modal');
  runCalculator();
}

function runCalculator() {
  const capital = parseFloat(document.getElementById('calc-capital').value) || 1000;
  const riskPct = parseFloat(document.getElementById('calc-risk-pct').value) || 1.0;
  const entry = parseFloat(document.getElementById('calc-entry').value) || 100;
  const sl = parseFloat(document.getElementById('calc-sl').value) || 95;
  const tp = parseFloat(document.getElementById('calc-tp').value) || 110;

  const riskAmount = (capital * riskPct) / 100;
  const slDistance = Math.abs(entry - sl);
  const slDistPct = entry > 0 ? ((slDistance / entry) * 100).toFixed(2) : 0;

  let posSizeUsd = 0;
  if (slDistance > 0) {
    posSizeUsd = (riskAmount / (slDistance / entry));
  }

  let rrRatio = 'N/A';
  if (tp && slDistance > 0) {
    const tpDistance = Math.abs(tp - entry);
    rrRatio = `1 : ${(tpDistance / slDistance).toFixed(2)}`;
  }

  document.getElementById('calc-res-risk-amt').innerText = `$${riskAmount.toFixed(2)}`;
  document.getElementById('calc-res-sl-dist').innerText = `${slDistPct}% ($${slDistance.toFixed(2)})`;
  document.getElementById('calc-res-pos-size').innerText = `$${posSizeUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('calc-res-rr').innerText = rrRatio;
}
