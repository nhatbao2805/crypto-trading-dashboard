#!/usr/bin/env node
/**
 * ==============================================================================
 * 🏛️ REALTIME MULTI-AGENT COUNCIL TERMINAL DASHBOARD & INTERACTIVE CLI
 * HKUDS/AI-Trader Architecture for LyThuyetCoin
 * ==============================================================================
 */

const readline = require('node:readline');
const masterCouncil = require('./server/agents/MasterCouncil');
const binanceService = require('./server/services/binance.service');
const marketScreenerService = require('./server/services/market-screener.service');
const loggerService = require('./server/services/logger.service');

// Global error traps to avoid unhandled exits
process.on('uncaughtException', (err) => {
  if (err.code === 'EIO' || err.code === 'EPIPE' || err.syscall === 'read') return;
  console.error('\n[Terminal Error]:', err.message);
});

// High-Contrast ANSI Colors
const C = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[38;5;203m",
  green: "\x1b[38;5;84m",
  yellow: "\x1b[38;5;221m",
  blue: "\x1b[38;5;75m",
  magenta: "\x1b[38;5;177m",
  cyan: "\x1b[38;5;81m",
  white: "\x1b[38;5;255m",
  gray: "\x1b[38;5;244m",
  bgBlue: "\x1b[48;5;24m",
  bgMagenta: "\x1b[48;5;54m",
  bgCyan: "\x1b[48;5;30m",
  bgGreen: "\x1b[48;5;28m"
};

const VALID_COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'SUI', 'DOGE', 'XRP', 'NEAR', 'ADA', 'AVAX'];

let currentCoin = 'BTC';
let isBusy = false;

function formatPrice(p) {
  const val = Number(p) || 0;
  if (val >= 1000) {
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${val.toFixed(4)}`;
}

function cleanInput(str) {
  if (!str) return '';
  return str
    .replace(/\x1b\[[0-9;]*[a-zA-Z~]/g, '')
    .replace(/['"`]/g, '')
    .trim();
}

// 1. Readline Interface in Standard Line Mode (No TTY Detachment)
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

process.stdin.resume();

function promptUser() {
  rl.setPrompt(`${C.bright}${C.cyan}👉 AI-Trader [${currentCoin}] > ${C.reset}`);
  rl.prompt();
}

/**
 * Beautiful Full Council Table Renderer
 */
async function renderCouncilSession(coin = currentCoin) {
  if (isBusy) return;
  isBusy = true;

  try {
    const liveMarket = await binanceService.getTicker24h(coin);
    const debate = await masterCouncil.runDebate(coin, liveMarket, true);
    const now = new Date().toLocaleTimeString('vi-VN');

    const p = liveMarket.price;
    const chg = liveMarket.change24h || 0;
    const isPos = chg >= 0;
    const chgStr = `${isPos ? '+' : ''}${chg.toFixed(2)}%`;

    console.log(`\n${C.bright}${C.bgBlue} 🏛️  HỘI ĐỒNG MULTI-AGENT AI-TRADER — REALTIME COCKPIT [${now}] ${C.reset}`);
    console.log(`${C.cyan}╔══════════════════════════════════════════════════════════════════════════════════════════╗${C.reset}`);
    console.log(`${C.cyan}║${C.reset} ${C.bright}⚡ CẶP:${C.reset} ${C.yellow}${coin}/USDT${C.reset} | ${C.bright}GIÁ LIVE:${C.reset} ${C.white}${formatPrice(p)}${C.reset} | ${C.bright}24H:${C.reset} ${isPos ? C.green : C.red}${chgStr}${C.reset} | ${C.bright}VOL:${C.reset} ${C.white}${debate.macro_view.volumeUsd}${C.reset} | ${C.green}● SẴN SÀNG${C.reset}`);
    console.log(`${C.cyan}╠══════════════════════════════════════════════════════════════════════════════════════════╣${C.reset}`);

    // Sub-Agent 1: Technical
    console.log(`${C.cyan}║${C.reset} ${C.magenta}📊 [AGENT ALPHA - KỸ THUẬT & PRICE ACTION]:${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   • Tín hiệu : ${debate.technical_view.signal.includes('BULLISH') ? C.green : (debate.technical_view.signal.includes('BEARISH') ? C.red : C.yellow)}${debate.technical_view.signal}${C.reset} (RSI: ${debate.technical_view.estimatedRsi}/100)`);
    console.log(`${C.cyan}║${C.reset}   • Hỗ trợ   : ${C.green}${debate.technical_view.support_zone}${C.reset} | Kháng cự: ${C.red}${debate.technical_view.resistance_zone}${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   • Nhận định: ${C.white}${debate.technical_view.summary}${C.reset}`);
    console.log(`${C.cyan}╟──────────────────────────────────────────────────────────────────────────────────────────╢${C.reset}`);

    // Sub-Agent 2: Macro & News
    console.log(`${C.cyan}║${C.reset} ${C.blue}📰 [AGENT MACRO - VĨ MÔ & DÒNG TIỀN]:${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   • Tín hiệu : ${debate.macro_view.signal === 'BULLISH' ? C.green : (debate.macro_view.signal === 'BEARISH' ? C.red : C.yellow)}${debate.macro_view.signal}${C.reset} | Funding: ${C.yellow}${debate.macro_view.fundingRate}${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   • Dòng tiền: ${C.white}${debate.macro_view.summary}${C.reset}`);
    console.log(`${C.cyan}╟──────────────────────────────────────────────────────────────────────────────────────────╢${C.reset}`);

    // Sub-Agent 3: Risk Manager
    console.log(`${C.cyan}║${C.reset} ${C.yellow}🛡️  [AGENT GUARDIAN - QUẢN TRỊ RỦI RO & BẢO VỆ VỐN]:${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   • Điểm Rủi Ro: ${C.yellow}${debate.risk_view.risk_score}/10${C.reset} (${debate.risk_view.risk_level}) | Đòn bẩy Max: ${C.magenta}${debate.risk_view.recommended_max_leverage}${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   • Cắt Lỗ (SL): ${C.red}${debate.risk_view.stop_loss}${C.reset} | Chốt Lời (TP): ${C.green}${debate.risk_view.take_profit_2}${C.reset} | R:R: ${C.green}${debate.risk_view.risk_reward_ratio}${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   • Lời khuyên : ${C.white}${debate.risk_view.advice}${C.reset}`);
    console.log(`${C.cyan}╟──────────────────────────────────────────────────────────────────────────────────────────╢${C.reset}`);

    // Sub-Agent 4: Validator / Critic
    console.log(`${C.cyan}║${C.reset} ${C.red}⚖️  [AGENT SENTINEL - PHẢN BIỆN & TÌM BẪY GIÁ]:${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   • Cảnh báo bẫy: ${C.yellow}${debate.validator_view.trap_warning}${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   • Pre-Mortem  : ${C.dim}${debate.validator_view.pre_mortem_failures ? debate.validator_view.pre_mortem_failures[0] : debate.validator_view.critical_question}${C.reset}`);
    console.log(`${C.cyan}╠══════════════════════════════════════════════════════════════════════════════════════════╣${C.reset}`);

    // Master Verdict
    console.log(`${C.cyan}║${C.reset} ${C.bright}${C.bgMagenta} 👑 KẾT LUẬN CHỦ TỊCH HỘI ĐỒNG (MASTER COUNCIL VERDICT) ${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   👉 ${C.bright}QUYẾT ĐỊNH :${C.reset} ${debate.master_verdict.action.includes('BUY') ? C.green : (debate.master_verdict.action.includes('SELL') ? C.red : C.yellow)}${C.bright}${debate.master_verdict.action_label}${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   🎯 ${C.bright}XÁC SUẤT   :${C.reset} ${C.bright}${C.green}${debate.master_verdict.probability_pct}% KHẢ THI${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   📍 ${C.bright}VÙNG ENTRY :${C.reset} ${C.cyan}${debate.master_verdict.entry_zone}${C.reset} | ${C.bright}SL:${C.reset} ${C.red}${debate.master_verdict.stop_loss}${C.reset} | ${C.bright}TP:${C.reset} ${C.green}${debate.master_verdict.take_profit}${C.reset}`);
    console.log(`${C.cyan}╚══════════════════════════════════════════════════════════════════════════════════════════╝${C.reset}`);

    console.log(`${C.dim}💡 LỆNH NHANH: 'btc', 'eth', 'sol' | 'eval <ý kiến>' | 'chat <câu hỏi>' | 'scan' | 'logs' | 'q' thoát.${C.reset}\n`);
  } catch (err) {
    console.error(`\n${C.red}[LỖI PHÂN TÍCH] ${err.message}${C.reset}\n`);
  } finally {
    isBusy = false;
    promptUser();
  }
}

async function handleUserPredictionCLI(input) {
  isBusy = true;
  console.log(`\n${C.yellow}⏳ Đang gửi nhận định của bạn cho Hội đồng AI thẩm định xác suất & săn bẫy...${C.reset}`);
  try {
    const raw = cleanInput(input);
    const isShort = raw.toLowerCase().includes('short') || raw.toLowerCase().includes('bán') || raw.toLowerCase().includes('giảm');
    const userAction = isShort ? 'SHORT' : 'LONG';
    const evalRes = await masterCouncil.evaluateUserPrediction(currentCoin, raw, userAction);

    console.log(`\n${C.bright}${C.bgMagenta} 🎯 KẾT QUẢ THẨM ĐỊNH TỪ HỘI ĐỒNG AI (${currentCoin}/USDT) ${C.reset}`);
    console.log(`${C.cyan}────────────────────────────────────────────────────────────────────────────────${C.reset}`);
    console.log(`• ${C.bright}Đánh giá     :${C.reset} ${evalRes.probability_pct >= 60 ? C.green : (evalRes.probability_pct >= 45 ? C.yellow : C.red)}${C.bright}${evalRes.verdict}${C.reset}`);
    console.log(`• ${C.bright}Xác suất     :${C.reset} ${C.green}${C.bright}${evalRes.probability_pct}% Khả Thi${C.reset} (Điểm rủi ro: ${evalRes.risk_score}/10)`);
    console.log(`• ${C.bright}Setup an toàn:${C.reset} Entry: ${C.cyan}${evalRes.suggested_setup.entry}${C.reset} | SL: ${C.red}${evalRes.suggested_setup.stop_loss}${C.reset} | TP: ${C.green}${evalRes.suggested_setup.take_profit}${C.reset} | Đòn bẩy: ${C.magenta}${evalRes.suggested_setup.leverage}${C.reset}`);
    console.log(`• ${C.bright}Điểm ủng hộ  :${C.reset} ${evalRes.pros.join('; ')}`);
    console.log(`• ${C.bright}Cảnh báo bẫy :${C.reset} ${C.yellow}${evalRes.cons.join('; ')}${C.reset}`);
    console.log(`• ${C.bright}Lời khuyên   :${C.reset} ${evalRes.advice}`);
    console.log(`${C.cyan}────────────────────────────────────────────────────────────────────────────────${C.reset}\n`);
  } catch (err) {
    console.error(`\n${C.red}[LỖI] ${err.message}${C.reset}\n`);
  } finally {
    isBusy = false;
    promptUser();
  }
}

async function handleUserChatCLI(question) {
  isBusy = true;
  console.log(`\n${C.yellow}⏳ Đang chuyển câu hỏi cho Hội đồng 4 Agent họp bàn...${C.reset}`);
  try {
    const raw = cleanInput(question);
    const chatRes = await masterCouncil.chatWithCouncil(raw, currentCoin);
    console.log(`\n${C.bright}${C.bgCyan} 💬 PHẢN HỒI HỘI ĐỒNG AI (${currentCoin}/USDT) ${C.reset}`);
    console.log(`${chatRes.output || chatRes.reply}\n`);
  } catch (err) {
    console.error(`\n${C.red}[LỖI] ${err.message}${C.reset}\n`);
  } finally {
    isBusy = false;
    promptUser();
  }
}

async function handleMarketScreenerCLI() {
  isBusy = true;
  console.log(`\n${C.yellow}⚡ Đang quét toàn sàn Binance 350+ cặp USDT...${C.reset}`);
  try {
    const screener = await marketScreenerService.runScreenerScan();
    console.log(`\n${C.bright}${C.bgGreen} 🚀 TOP 5 KÈO BÙNG NỔ VOLUME & CONFLUENCE CAO (Tổng quét: ${screener.totalScanned} Coin) ${C.reset}`);
    console.log(`${C.cyan}────────────────────────────────────────────────────────────────────────────────${C.reset}`);
    (screener.topBreakouts || []).slice(0, 5).forEach((item, idx) => {
      console.log(` ${idx + 1}. ${C.bright}${item.coin}/USDT${C.reset} | Giá: $${item.price} | 24h: ${C.green}+${item.change24h}%${C.reset} | Vol: ${item.volumeUsdFormatted} | ${C.bright}${C.yellow}Score: ${item.confluenceScore}/100${C.reset}`);
      console.log(`    👉 Entry: ${item.entryZone} | SL: ${item.stopLoss} | TP: ${item.takeProfit}`);
    });
    console.log(`${C.cyan}────────────────────────────────────────────────────────────────────────────────${C.reset}\n`);
  } catch (err) {
    console.error(`\n${C.red}[LỖI SCAN] ${err.message}${C.reset}\n`);
  } finally {
    isBusy = false;
    promptUser();
  }
}

function handleViewLogsCLI() {
  console.log(`\n${C.bright}${C.bgBlue} 📋 NHẬT KÝ QUÉT THỊ TRƯỜNG 24/7 GẦN NHẤT (logs/screener.log) ${C.reset}`);
  console.log(`${C.cyan}────────────────────────────────────────────────────────────────────────────────${C.reset}`);
  const logs = loggerService.getRecentLogs(8);
  if (!logs.length) {
    console.log(`${C.gray}Chưa có dữ liệu nhật ký mới. Tiến trình ngầm đang quét...${C.reset}`);
  } else {
    logs.forEach((l) => {
      let tagColor = C.blue;
      if (l.level === 'ALERT') tagColor = C.green;
      if (l.level === 'WARN') tagColor = C.yellow;
      if (l.level === 'ERROR') tagColor = C.red;
      console.log(`${C.gray}[${l.timestamp}]${C.reset} ${tagColor}[${l.level}]${C.reset} ${l.message}`);
    });
  }
  console.log(`${C.cyan}────────────────────────────────────────────────────────────────────────────────${C.reset}\n`);
  promptUser();
}

// 2. Interactive Line Processing (100% stable REPL)
rl.on('line', async (line) => {
  const input = cleanInput(line);

  // If user just pressed Enter, refresh the current coin's table cleanly
  if (!input) {
    await renderCouncilSession(currentCoin);
    return;
  }

  const upper = input.toUpperCase().replace('USDT', '');
  const lower = input.toLowerCase();

  // Quit
  if (lower === 'q' || lower === 'exit' || lower === 'quit') {
    rl.close();
    console.log(`\n${C.green}👋 Đã dừng Realtime Terminal. Chúc bạn giao dịch thành công!${C.reset}\n`);
    process.exit(0);
  }

  // Clear Screen
  if (lower === 'clear' || lower === 'cls') {
    console.clear();
    await renderCouncilSession(currentCoin);
    return;
  }

  // View 24/7 background logs
  if (lower === 'logs' || lower === 'log') {
    handleViewLogsCLI();
    return;
  }

  // Market Screener Radar
  if (lower === 'scan' || lower === 'radar') {
    await handleMarketScreenerCLI();
    return;
  }

  // Help
  if (lower === 'help') {
    console.log(`\n${C.bright}📖 DANH SÁCH LỆNH TERMINAL:${C.reset}`);
    console.log(`  • ${C.cyan}btc, eth, sol, sui, doge, near, avax, bnb, xrp, ada${C.reset} : Đổi coin theo dõi`);
    console.log(`  • ${C.cyan}eval <nhận định>${C.reset} : Thẩm định kế hoạch vào lệnh & tìm bẫy`);
    console.log(`  • ${C.cyan}chat <câu hỏi>${C.reset} : Trò chuyện trực tiếp với Hội đồng 4 Agent`);
    console.log(`  • ${C.cyan}scan${C.reset} : Quét 350+ coin tìm kèo đột biến volume`);
    console.log(`  • ${C.cyan}logs${C.reset} : Xem nhật ký hoạt động quét ngầm 24/7`);
    console.log(`  • ${C.cyan}Enter${C.reset} : Làm mới dữ liệu coin hiện tại`);
    console.log(`  • ${C.cyan}q${C.reset} : Thoát\n`);
    promptUser();
    return;
  }

  // Switch coin (matches 'btc', 'eth', 'BTCUSDT', etc. regardless of quotes)
  if (VALID_COINS.includes(upper)) {
    currentCoin = upper;
    console.log(`\n${C.green}🔄 Đang tải dữ liệu và phân tích cặp ${currentCoin}/USDT...${C.reset}`);
    await renderCouncilSession(currentCoin);
    return;
  }

  // Evaluation
  if (lower.startsWith('eval ') || lower.startsWith('dự đoán ')) {
    const hypothesis = input.replace(/^(eval|dự đoán)\s+/i, '').trim();
    await handleUserPredictionCLI(hypothesis);
    return;
  }

  // Chat
  if (lower.startsWith('chat ') || lower.startsWith('hỏi ')) {
    const question = input.replace(/^(chat|hỏi)\s+/i, '').trim();
    await handleUserChatCLI(question);
    return;
  }

  // Smart routing
  if (lower.includes('mua') || lower.includes('bán') || lower.includes('long') || lower.includes('short') || lower.includes('rút chân')) {
    await handleUserPredictionCLI(input);
  } else {
    await handleUserChatCLI(input);
  }
});

// Graceful SIGINT (Ctrl+C)
rl.on('SIGINT', () => {
  rl.close();
  console.log(`\n${C.yellow}👋 Đã thoát phiên làm việc. Hẹn gặp lại!${C.reset}\n`);
  process.exit(0);
});

// Startup Entrypoint
async function start() {
  console.log(`${C.bright}${C.green}🚀 Khởi động Realtime Multi-Agent Terminal Console...${C.reset}`);
  await renderCouncilSession(currentCoin);
}

start().catch(err => {
  console.error('[Startup Error]:', err);
});
