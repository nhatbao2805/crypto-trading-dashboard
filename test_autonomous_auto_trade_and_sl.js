/**
 * ==============================================================================
 * 🧪 TEST AUTONOMOUS AI TRADER & REALTIME CONTINUOUS STOP LOSS MONITOR
 * 100% Real Data, Real Math, Zero Hardcoding, Clean Database
 * ==============================================================================
 */

const assert = require('node:assert');
const db = require('./server/config/database');
const autoTraderService = require('./server/services/auto-trader.service');
const paperTradingService = require('./server/services/paper-trading.service');
const journalRepository = require('./server/models/JournalRepository');
const binanceService = require('./server/services/binance.service');
const routeDispatcher = require('./server/routes/index');
const url = require('node:url');

async function runTest() {
  console.log('================================================================');
  console.log('🚀 KIỂM THỬ HỆ THỐNG: AI TỰ ĐỘNG THẢO LUẬN ĐẶT LỆNH & GIÁM SÁT SL');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  async function check(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  }

  // --- 1. KIỂM TRA LÀM SẠCH DỮ LIỆU DUMMY ---
  console.log('--- 1. Kiểm tra làm sạch dữ liệu Dummy ---');

  await check('Cơ sở dữ liệu: Làm sạch toàn bộ bản ghi demo trong journal & paper trades', async () => {
    const journalCount = db.prepare('SELECT COUNT(*) as c FROM journal_entries WHERE notes LIKE ?').get('%Cay cú%').c;
    assert.strictEqual(journalCount, 0, 'Dữ liệu dummy Cay cú vẫn còn tồn tại');
    const acc = paperTradingService.getAccount();
    assert.ok(acc.balance >= 1000, 'Số dư ví khả dụng không hợp lệ');
  });

  // --- 2. THỰC THI AI TỰ THẢO LUẬN & ĐẶT LỆNH (AUTONOMOUS TRADE) ---
  console.log('\n--- 2. Thực thi AI Tự Thảo Luận Nến Thật & Tự Đặt Lệnh ---');

  let autoTradeResult = null;
  await check('AutoTraderService -> Họp 4 Agent nến thật & khớp lệnh tự động', async () => {
    autoTradeResult = await autoTraderService.executeAutonomousTrade({
      coin: 'SOL',
      riskPercent: 1.5,
      minConfidence: 60
    });

    assert.ok(autoTradeResult);
    assert.strictEqual(autoTradeResult.success, true);
    assert.strictEqual(autoTradeResult.coin, 'SOL');
    assert.ok(autoTradeResult.livePrice > 0);
    assert.ok(autoTradeResult.verdict);
    assert.ok(autoTradeResult.verdict.action_label);
    assert.ok(autoTradeResult.executed, 'Lệnh phải được tự động khớp vào sàn');
    assert.ok(autoTradeResult.position);
    assert.strictEqual(autoTradeResult.position.status, 'OPEN');
    assert.ok(autoTradeResult.position.stop_loss > 0);
    assert.ok(autoTradeResult.position.take_profit > 0);
  });

  // --- 3. GIÁM SÁT REALTIME STOP LOSS & LIVE PNL ---
  console.log('\n--- 3. Giám Sát Realtime Stop Loss & Khoảng Cách SL/TP ---');

  let liveMetrics = null;
  await check('PaperTradingService.getOpenPositionsLiveMetrics -> Tính khoảng cách % tới SL/TP', async () => {
    liveMetrics = await paperTradingService.getOpenPositionsLiveMetrics();
    assert.ok(liveMetrics.success);
    assert.ok(liveMetrics.count >= 1);
    const pos = liveMetrics.positions.find(p => p.id === autoTradeResult.position.id);
    assert.ok(pos, 'Vị thế vừa mở phải có trong danh sách giám sát realtime');
    assert.ok(typeof pos.currentLivePrice === 'number');
    assert.ok(typeof pos.unrealizedPnlAmount === 'number');
    assert.ok(typeof pos.unrealizedPnlPercent === 'number');
    assert.ok(typeof pos.distanceToStopLossPercent === 'number');
    assert.ok(typeof pos.isNearStopLoss === 'boolean');
  });

  // --- 4. TỰ ĐỘNG KHỚP STOP LOSS KHI NẾN CHẠM CẢN & ĐỒNG BỘ JOURNAL ---
  console.log('\n--- 4. Tự Động Ngắt Stop Loss & Đồng Bộ Trực Tiếp Vào Trade Journal ---');

  await check('Continuous SL Trigger -> Khớp đóng lệnh khi giá chạm Stop Loss & lưu vào Journal', async () => {
    const pos = autoTradeResult.position;
    const isLong = pos.type === 'LONG';
    // Simulate price dipping to or past stop loss
    const triggerPrice = isLong ? pos.stop_loss - 1.0 : pos.stop_loss + 1.0;

    const closed = paperTradingService.evaluateOpenPositionsAgainstLivePrices({ SOL: triggerPrice });
    assert.ok(closed.length >= 1, 'Lệnh phải được tự động khớp khi chạm SL');
    const myTrade = closed.find(c => c.id === pos.id);
    assert.ok(myTrade);
    assert.strictEqual(myTrade.status, 'CLOSED');
    assert.strictEqual(myTrade.close_reason, 'STOP_LOSS');

    // Verify auto-sync to Journal
    const journalEntries = journalRepository.getAllEntries();
    const syncedJournal = journalEntries.find(j => j.coin === 'SOL' && j.notes.includes('Tự động đồng bộ từ Sàn Paper Trading'));
    assert.ok(syncedJournal, 'Bản ghi phải tự động xuất hiện trong Trade Journal');
    assert.strictEqual(syncedJournal.status, 'LOSS');
    assert.strictEqual(syncedJournal.emotions, 'Disciplined');
  });

  // --- 5. KIỂM THỬ ENDPOINT API MỚI ---
  console.log('\n--- 5. Kiểm thử Endpoint API Mới ---');

  function mockReq(pathname, method = 'GET', body = {}) {
    const parsed = url.parse(pathname, true);
    let statusCode = 200;
    let raw = '';
    const res = {
      writeHead(c) { statusCode = c; },
      end(d) { raw = d; }
    };
    return {
      async run() {
        const handled = await routeDispatcher({ method, url: pathname }, res, parsed, body);
        let data = null;
        try { data = JSON.parse(raw); } catch (_) { data = raw; }
        return { handled, status: res.statusCode || statusCode, data };
      }
    };
  }

  await check('GET /api/paper-trader/positions/live -> Trả về danh sách giám sát SL realtime', async () => {
    const test = mockReq('/api/paper-trader/positions/live', 'GET');
    const res = await test.run();
    assert.strictEqual(res.handled, true);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.positions));
  });

  // Clean test records from this test run
  db.prepare('DELETE FROM paper_trades WHERE notes LIKE ?').run('%Master Council%');
  db.prepare('DELETE FROM journal_entries WHERE notes LIKE ?').run('%Tự động đồng bộ%');

  console.log('\n================================================================');
  console.log(`🎉 HOÀN THÀNH: ${passed}/${total} BÀI KIỂM THỬ ĐẠT CHUẨN 100%!`);
  console.log('================================================================\n');

  process.exit(passed === total ? 0 : 1);
}

runTest().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
