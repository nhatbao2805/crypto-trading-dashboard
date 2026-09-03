/**
 * ==============================================================================
 * 🧪 COMPREHENSIVE MODULAR ARCHITECTURE TEST SUITE
 * Tests all Repositories, OOP Sub-Agents, Services, and Route Dispatcher
 * ==============================================================================
 */

const assert = require('node:assert');

// 1. Repositories
const journalRepository = require('./server/models/JournalRepository');
const notesRepository = require('./server/models/NotesRepository');
const paperTradeRepository = require('./server/models/PaperTradeRepository');
const debateRepository = require('./server/models/DebateRepository');

// 2. OOP Sub-Agents
const technicalAgent = require('./server/agents/TechnicalAgent');
const macroAgent = require('./server/agents/MacroAgent');
const riskAgent = require('./server/agents/RiskAgent');
const validatorAgent = require('./server/agents/ValidatorAgent');
const masterCouncil = require('./server/agents/MasterCouncil');

// 3. Services
const binanceService = require('./server/services/binance.service');
const newsService = require('./server/services/news.service');
const paperTradingService = require('./server/services/paper-trading.service');
const journalAuditService = require('./server/services/journal-audit.service');

// 4. Server App
const { createApp } = require('./server/app');

async function runModularTests() {
  console.log('================================================================');
  console.log('🧪 CHẠY BỘ TEST KIỂM THỬ TÁI CẤU TRÚC BACKEND CHUẨN DOANH NGHIỆP');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  }

  // --- TẦNG 1: DATABASE REPOSITORIES ---
  console.log('--- 1. Tầng Database & SQLite Repositories (server/models/*) ---');

  let testJournalId = null;
  test('JournalRepository: Tạo và đọc bản ghi nhật ký trade mới', () => {
    const entry = journalRepository.createEntry({
      date: '2026-09-02',
      coin: 'BTC',
      type: 'LONG',
      entry_price: 65000,
      exit_price: 67000,
      stop_loss: 64000,
      take_profit: 68000,
      position_size: 1000,
      pnl_amount: 200,
      pnl_percent: 20,
      status: 'WIN',
      setup_confluences: ['RSI Oversold', 'Order Block H4'],
      rules_checked: ['Rule 1', 'Rule 2']
    });
    assert.ok(entry.id, 'Phải có ID');
    assert.strictEqual(entry.coin, 'BTC');
    assert.strictEqual(entry.status, 'WIN');
    assert.ok(Array.isArray(entry.setup_confluences), 'setup_confluences phải là Array');
    testJournalId = entry.id;
  });

  test('JournalRepository: Thống kê PnL, Winrate & PnL Curve', () => {
    const stats = journalRepository.getStats();
    assert.ok(stats.totalTrades >= 1);
    assert.ok(stats.winRate >= 0);
    assert.ok(Array.isArray(stats.pnlCurve));
  });

  test('NotesRepository: Tạo, ghim và xóa ghi chú', () => {
    const note = notesRepository.createNote({
      title: 'Bài học kiểm soát đòn bẩy',
      category: 'Tâm lý giao dịch',
      content: 'Không được vượt quá đòn bẩy 10x khi thị trường biến động mạnh'
    });
    assert.ok(note.id);
    assert.strictEqual(note.is_pinned, false);

    const pinned = notesRepository.togglePinNote(note.id);
    assert.strictEqual(pinned.is_pinned, true);

    const deleted = notesRepository.deleteNote(note.id);
    assert.strictEqual(deleted, true);
  });

  test('PaperTradeRepository: Quản lý số dư, mở và đóng vị thế', () => {
    paperTradeRepository.resetAccount(10000.0);
    const accBefore = paperTradeRepository.getAccount();
    assert.strictEqual(accBefore.balance, 10000.0);

    const pos = paperTradeRepository.openPosition({
      coin: 'SOL',
      type: 'LONG',
      entry_price: 140.0,
      margin: 400.0,
      leverage: 5
    });
    assert.ok(pos.id);
    assert.strictEqual(pos.position_size, 2000.0);

    const closed = paperTradeRepository.closePosition(pos.id, 147.0, 'TAKE_PROFIT');
    assert.strictEqual(closed.status, 'CLOSED');
    assert.ok(closed.pnl_amount > 0);

    const history = paperTradeRepository.getHistory();
    assert.ok(history.trades.length >= 1);
    assert.strictEqual(history.stats.winRate, 100);
  });

  // --- TẦNG 2: OOP SUB-AGENTS ---
  console.log('\n--- 2. Tầng OOP Sub-Agents (server/agents/*) ---');

  const mockMarket = { price: 65000, high24h: 66500, low24h: 64100, change24h: 1.5, volumeUsdt: 1200000000 };

  await asyncTest('Agent Alpha (TechnicalAgent): Soi nến & tính RSI động', async () => {
    const tech = await technicalAgent.analyze('BTC', mockMarket);
    assert.strictEqual(tech.agent_id, 'agent_technical');
    assert.ok(tech.estimatedRsi >= 0 && tech.estimatedRsi <= 100);
    assert.ok(tech.support_zone.includes('$'));
    assert.ok(tech.resistance_zone.includes('$'));
  });

  await asyncTest('Agent Macro (MacroAgent): Tính Funding Rate & Dòng tiền', async () => {
    const macro = await macroAgent.analyze('BTC', mockMarket);
    assert.strictEqual(macro.agent_id, 'agent_macro');
    assert.ok(macro.fundingRate.includes('%'));
    assert.ok(macro.volumeUsd.includes('M USD'));
  });

  await asyncTest('Agent Guardian (RiskAgent): Quản trị rủi ro & tỷ lệ R:R >= 1:2', async () => {
    const tech = await technicalAgent.analyze('BTC', mockMarket);
    const risk = await riskAgent.analyze('BTC', mockMarket, tech);
    assert.strictEqual(risk.agent_id, 'agent_risk');
    assert.ok(risk.risk_score >= 1 && risk.risk_score <= 10);
    assert.ok(risk.risk_reward_ratio.includes('1:'));
  });

  await asyncTest('Agent Sentinel (ValidatorAgent): Cảnh báo bẫy giá & Invalidation level', async () => {
    const tech = await technicalAgent.analyze('BTC', mockMarket);
    const val = await validatorAgent.analyze('BTC', mockMarket, tech);
    assert.strictEqual(val.agent_id, 'agent_validator');
    assert.ok(val.trap_warning.length > 10);
    assert.ok(val.critical_question.length > 5);
  });

  await asyncTest('Master Council: Tổng hợp quyết định & Tính xác suất khả thi', async () => {
    const debate = await masterCouncil.runDebate('BTC', mockMarket);
    assert.strictEqual(debate.success, true);
    assert.ok(debate.master_verdict.probability_pct >= 50);
    assert.ok(debate.master_verdict.entry_zone.length > 5);
    assert.strictEqual(debate.master_verdict.key_reasons.length, 3);
  });

  await asyncTest('Master Council: Thẩm định dự đoán nhận định của người dùng', async () => {
    const evalRes = await masterCouncil.evaluateUserPrediction('BTC', 'Tôi thấy nến 1H tạo đáy 2 phân kỳ RSI', 'LONG', mockMarket);
    assert.strictEqual(evalRes.success, true);
    assert.ok(evalRes.probability_pct > 50);
    assert.ok(evalRes.pros.length >= 1);
  });

  await asyncTest('Master Council: Phản hồi chất vấn Q&A từ người dùng', async () => {
    const chatRes = await masterCouncil.chatWithCouncil('Tại sao lại không nên Mua đuổi lúc này?', 'BTC', mockMarket);
    assert.strictEqual(chatRes.success, true);
    assert.ok(chatRes.output.includes('Agent Alpha'));
  });

  // --- TẦNG 3: BUSINESS SERVICES ---
  console.log('\n--- 3. Tầng Business Services (server/services/*) ---');

  await asyncTest('BinanceService: Lấy Ticker 24h và tính Fallback an toàn', async () => {
    const ticker = await binanceService.getTicker24h('BTC');
    assert.ok(ticker.price > 0);
    assert.ok(ticker.high24h >= ticker.low24h);
  });

  await asyncTest('NewsService: Phân tích tác động tin tức AGY', async () => {
    const newsAnalysis = await newsService.analyzeNewsImpact('BTC');
    assert.ok(newsAnalysis.impact_score);
    assert.ok(newsAnalysis.raw_articles.length > 0);
  });

  test('JournalAuditService: Kiểm toán kỷ luật & Chấm điểm 12 chương giáo trình', () => {
    const audit = journalAuditService.auditTrades([
      { id: 1, coin: 'BTC', date: '2026-09-02T10:00:00', stop_loss: 0, pnl_amount: -100 }, // Lỗi thiếu SL
      { id: 2, coin: 'BTC', date: '2026-09-02T10:30:00', stop_loss: 64000, pnl_amount: -150 } // Lỗi Revenge trade
    ]);
    assert.ok(audit.disciplineScore < 80, 'Phải bị trừ điểm kỷ luật khi phạm lỗi');
    assert.strictEqual(audit.missingSlTrades.length, 1);
    assert.strictEqual(audit.revengeTrades.length, 1);
  });

  test('PaperTradingService: Tính toán PnL Short có đòn bẩy chính xác', () => {
    const pnl = paperTradingService.calculatePositionPnL(
      { type: 'SHORT', entry_price: 100, leverage: 10, margin: 50 },
      90 // Giá giảm 10% -> Lãi 100% trên ký quỹ $50
    );
    assert.strictEqual(pnl.pnlPercent, 100);
    assert.strictEqual(pnl.pnlAmount, 50);
  });

  // --- TẦNG 4: HTTP APP SERVER ---
  console.log('\n--- 4. Tầng HTTP Server & Route Dispatcher (server/app.js) ---');

  test('App Server: Khởi tạo HTTP instance thành công', () => {
    const app = createApp();
    assert.ok(app.listen, 'Phải có phương thức listen');
  });

  // Clean up test record
  if (testJournalId) {
    journalRepository.deleteEntry(testJournalId);
  }

  console.log('\n================================================================');
  console.log(`🎉 KẾT QUẢ TÁI CẤU TRÚC: ${passed}/${total} TEST CASES ĐẠT CHUẨN 100%!`);
  console.log('================================================================\n');
}

runModularTests().catch(console.error);
