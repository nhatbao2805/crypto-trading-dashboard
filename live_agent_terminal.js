#!/usr/bin/env node
/**
 * ==============================================================================
 * 🏛️ REALTIME MULTI-AGENT COUNCIL TERMINAL DASHBOARD (BULLETPROOF VERSION)
 * HKUDS/AI-Trader Architecture for LyThuyetCoin
 * ==============================================================================
 */

// 1. Trap all TTY / stdin EIO errors globally at the very top
process.on('uncaughtException', (err) => {
  if (err.code === 'EIO' || err.syscall === 'read') {
    // Ignore benign TTY disconnect/background read signals on macOS
    return;
  }
  console.error('[System Error]:', err.message);
});

if (process.stdin && process.stdin.on) {
  process.stdin.on('error', (err) => {
    if (err.code === 'EIO') return;
  });
}

if (process.stdout && process.stdout.on) {
  process.stdout.on('error', (err) => {
    if (err.code === 'EPIPE') return;
  });
}

const readline = require('node:readline');
const masterCouncil = require('./server/agents/MasterCouncil');
const binanceService = require('./server/services/binance.service');

// ANSI Color Codes
const C = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
};

let currentCoin = 'BTC';
let isBusy = false;

// Create readline interface upfront synchronously
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${C.bright}${C.cyan}👉 AI-Trader [BTC] > ${C.reset}`
});

rl.on('error', (err) => {
  if (err.code === 'EIO') return;
});

function formatPrice(p) {
  const val = Number(p) || 0;
  if (val >= 1000) {
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${val.toFixed(4)}`;
}

function cleanInput(str) {
  if (!str) return '';
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z~]/g, '').trim();
}

async function renderCouncilSession(coin = currentCoin) {
  if (isBusy) return;
  isBusy = true;

  try {
    const liveMarket = await binanceService.getTicker24h(coin);
    const debate = await masterCouncil.runDebate(coin, liveMarket);
    const now = new Date().toLocaleTimeString('vi-VN');

    const p = liveMarket.price;
    const chg = liveMarket.change24h || 0;
    const isPos = chg >= 0;
    const chgStr = `${isPos ? '+' : ''}${chg.toFixed(2)}%`;

    console.log(`\n${C.bright}${C.bgBlue} 🏛️  HỘI ĐỒNG MULTI-AGENT AI-TRADER — REALTIME LIVE STREAM ${C.reset}`);
    console.log(`${C.cyan}╔══════════════════════════════════════════════════════════════════════════════════════════╗${C.reset}`);
    console.log(`${C.cyan}║${C.reset} ${C.bright}⚡ THỊ TRƯỜNG:${C.reset} ${C.yellow}${coin}/USDT${C.reset} | ${C.bright}GIÁ LIVE:${C.reset} ${C.white}${formatPrice(p)}${C.reset} | ${C.bright}24H:${C.reset} ${isPos ? C.green : C.red}${chgStr}${C.reset} | ${C.bright}VOL:${C.reset} ${C.white}${debate.macro_view.volumeUsd}${C.reset} | ${C.dim}[${now}]${C.reset}`);
    console.log(`${C.cyan}╠══════════════════════════════════════════════════════════════════════════════════════════╣${C.reset}`);

    // Sub-Agent 1: Technical
    console.log(`${C.cyan}║${C.reset} ${C.magenta}📊 [AGENT ALPHA - KỸ THUẬT & PRICE ACTION]:${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   • Tín hiệu : ${debate.technical_view.signal.includes('BULLISH') ? C.green : (debate.technical_view.signal.includes('BEARISH') ? C.red : C.yellow)}${debate.technical_view.signal}${C.reset} (RSI: ${debate.technical_view.estimatedRsi}/100)`);
    console.log(`${C.cyan}║${C.reset}   • Hỗ trợ   : ${C.green}${debate.technical_view.support_zone}${C.reset} | Kháng cự: ${C.red}${debate.technical_view.resistance_zone}${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   • Nhận định: ${C.white}${debate.technical_view.summary}${C.reset}`);
    console.log(`${C.cyan}╟──────────────────────────────────────────────────────────────────────────────────────────╢${C.reset}`);

    // Sub-Agent 2: Macro & News
    console.log(`${C.cyan}║${C.reset} ${C.blue}📰 [AGENT MACRO - VĨ MÔ & DÒNG TIỀN]:${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   • Tín hiệu : ${debate.macro_view.signal === 'BULLISH' ? C.green : (debate.macro_view.signal === 'BEARISH' ? C.red : C.yellow)}${debate.macro_view.signal}${C.reset} | Funding Rate: ${C.yellow}${debate.macro_view.fundingRate}${C.reset}`);
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
    console.log(`${C.cyan}║${C.reset}   • Câu hỏi lật : ${C.dim}"${debate.validator_view.critical_question}"${C.reset}`);
    console.log(`${C.cyan}╠══════════════════════════════════════════════════════════════════════════════════════════╣${C.reset}`);

    // Master Verdict
    console.log(`${C.cyan}║${C.reset} ${C.bright}${C.bgMagenta} 👑 KẾT LUẬN CHỦ TỊCH HỘI ĐỒNG (MASTER COUNCIL VERDICT) ${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   👉 ${C.bright}QUYẾT ĐỊNH :${C.reset} ${debate.master_verdict.action.includes('BUY') ? C.green : (debate.master_verdict.action.includes('SELL') ? C.red : C.yellow)}${C.bright}${debate.master_verdict.action_label}${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   🎯 ${C.bright}XÁC SUẤT   :${C.reset} ${C.bright}${C.green}${debate.master_verdict.probability_pct}% KHẢ THI${C.reset}`);
    console.log(`${C.cyan}║${C.reset}   📍 ${C.bright}VÙNG ENTRY :${C.reset} ${C.cyan}${debate.master_verdict.entry_zone}${C.reset} | ${C.bright}SL:${C.reset} ${C.red}${debate.master_verdict.stop_loss}${C.reset} | ${C.bright}TP:${C.reset} ${C.green}${debate.master_verdict.take_profit}${C.reset}`);
    console.log(`${C.cyan}╚══════════════════════════════════════════════════════════════════════════════════════════╝${C.reset}`);

    console.log(`\n${C.dim}💡 [HƯỚNG DẪN GÕ]: Gõ 'eth', 'sol' để đổi coin | 'eval <ý kiến>' | 'chat <câu hỏi>' | 'q' để thoát.${C.reset}`);

  } catch (err) {
    console.error(`${C.red}[LỖI] Không thể quét Hội đồng AI: ${err.message}${C.reset}`);
  } finally {
    isBusy = false;
  }
}

async function handleUserPredictionCLI(input) {
  isBusy = true;
  console.log(`\n${C.yellow}⏳ Đang gửi nhận định của bạn cho Hội đồng AI thẩm định xác suất...${C.reset}`);
  try {
    const raw = cleanInput(input);
    const isShort = raw.toLowerCase().includes('short') || raw.toLowerCase().includes('bán') || raw.toLowerCase().includes('giảm');
    const userAction = isShort ? 'SHORT' : 'LONG';
    const evalRes = await masterCouncil.evaluateUserPrediction(currentCoin, raw, userAction);

    console.log(`\n${C.bright}${C.bgMagenta} 🎯 KẾT QUẢ THẨM ĐỊNH TỪ HỘI ĐỒNG AI (${currentCoin}/USDT) ${C.reset}`);
    console.log(`${C.cyan}--------------------------------------------------------------------------------${C.reset}`);
    console.log(`• ${C.bright}Đánh giá   :${C.reset} ${evalRes.probability_pct >= 60 ? C.green : (evalRes.probability_pct >= 45 ? C.yellow : C.red)}${C.bright}${evalRes.verdict}${C.reset}`);
    console.log(`• ${C.bright}Xác suất   :${C.reset} ${C.green}${C.bright}${evalRes.probability_pct}% Khả Thi${C.reset} (Điểm rủi ro: ${evalRes.risk_score}/10)`);
    console.log(`• ${C.bright}Setup an toàn:${C.reset} Entry: ${C.cyan}${evalRes.suggested_setup.entry}${C.reset} | SL: ${C.red}${evalRes.suggested_setup.stop_loss}${C.reset} | TP: ${C.green}${evalRes.suggested_setup.take_profit}${C.reset} | Đòn bẩy: ${C.magenta}${evalRes.suggested_setup.leverage}${C.reset}`);
    console.log(`• ${C.bright}Điểm ủng hộ:${C.reset} ${evalRes.pros.join('; ')}`);
    console.log(`• ${C.bright}Cảnh báo   :${C.reset} ${C.yellow}${evalRes.cons.join('; ')}${C.reset}`);
    console.log(`${C.cyan}--------------------------------------------------------------------------------${C.reset}\n`);
  } catch (err) {
    console.error(`${C.red}[LỖI] ${err.message}${C.reset}`);
  } finally {
    isBusy = false;
  }
}

async function handleUserChatCLI(question) {
  isBusy = true;
  console.log(`\n${C.yellow}⏳ Đang chuyển câu hỏi cho Hội đồng AI họp bàn...${C.reset}`);
  try {
    const raw = cleanInput(question);
    const chatRes = await masterCouncil.chatWithCouncil(raw, currentCoin);
    console.log(`\n${chatRes.output}\n`);
  } catch (err) {
    console.error(`${C.red}[LỖI] ${err.message}${C.reset}`);
  } finally {
    isBusy = false;
  }
}

// Handler for each line entered
rl.on('line', async (line) => {
  const input = cleanInput(line);

  if (!input) {
    await renderCouncilSession(currentCoin);
    rl.prompt();
    return;
  }

  const lower = input.toLowerCase();

  if (lower === 'q' || lower === 'exit' || lower === 'quit') {
    rl.close();
    console.log(`\n${C.green}👋 Đã dừng Realtime Terminal. Chúc bạn giao dịch thành công!${C.reset}\n`);
    process.exit(0);
  }

  if (['btc', 'eth', 'sol', 'bnb', 'sui', 'doge', 'xrp', 'near', 'ada', 'avax'].includes(lower)) {
    currentCoin = lower.toUpperCase();
    console.log(`\n${C.green}🔄 Đã chuyển sang theo dõi cặp ${currentCoin}/USDT...${C.reset}`);
    await renderCouncilSession(currentCoin);
    rl.setPrompt(`${C.bright}${C.cyan}👉 AI-Trader [${currentCoin}] > ${C.reset}`);
    rl.prompt();
    return;
  }

  if (lower.startsWith('eval ')) {
    const hypothesis = input.slice(5).trim();
    await handleUserPredictionCLI(hypothesis);
    rl.prompt();
    return;
  }

  if (lower.startsWith('chat ')) {
    const question = input.slice(5).trim();
    await handleUserChatCLI(question);
    rl.prompt();
    return;
  }

  if (lower.includes('mua') || lower.includes('bán') || lower.includes('long') || lower.includes('short') || lower.includes('dự đoán') || lower.includes('rút chân')) {
    await handleUserPredictionCLI(input);
  } else {
    await handleUserChatCLI(input);
  }

  rl.prompt();
});

// Start Initial Render
async function start() {
  console.log(`${C.bright}${C.green}🚀 Khởi động Realtime Multi-Agent Terminal Stream...${C.reset}`);
  await renderCouncilSession(currentCoin);
  rl.setPrompt(`${C.bright}${C.cyan}👉 AI-Trader [${currentCoin}] > ${C.reset}`);
  rl.prompt();
}

start().catch(console.error);
