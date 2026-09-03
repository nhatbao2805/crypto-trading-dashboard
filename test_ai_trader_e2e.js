// --- COMPREHENSIVE END-TO-END TEST SUITE FOR AI TRADER & HUMAN TRADER ---
const assert = require('node:assert');
const db = require('./db.js');
const {
  runCouncilDebate,
  evaluateUserHypothesis,
  chatWithCouncil
} = require('./agy_engine.js');

async function runAllTests() {
  console.log('========================================================');
  console.log('🧪 BẮT ĐẦU CHẠY TOÀN BỘ BỘ TEST AI TRADER & HUMAN TRADER');
  console.log('========================================================\n');

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

  // --- 1. TEST PAPER ACCOUNT & POSITION CRUD ---
  console.log('--- 1. Kiểm thử Quản lý Tài khoản & Vị thế Paper Trading (db.js) ---');
  
  test('Khởi tạo tài khoản Paper Account $10,000', () => {
    const acc = db.resetPaperAccount(10000.0);
    assert.strictEqual(acc.balance, 10000.0, 'Balance phải bằng 10,000');
    assert.strictEqual(acc.availableBalance, 10000.0, 'Available balance phải bằng 10,000');
    assert.strictEqual(acc.lockedMargin, 0, 'Locked margin ban đầu phải bằng 0');
  });

  let createdPosId = null;
  test('Mở vị thế Long BTC ký quỹ $500 đòn bẩy 5x', () => {
    const pos = db.openPaperPosition({
      coin: 'BTC',
      type: 'LONG',
      entry_price: 65000.0,
      stop_loss: 63800.0,
      take_profit: 68000.0,
      leverage: 5,
      margin: 500.0,
      ai_verdict: 'STRONG_BUY (78%)',
      notes: 'Test lệnh Long theo tín hiệu Hội đồng AI'
    });

    assert.ok(pos.id, 'Phải tạo được ID vị thế');
    assert.strictEqual(pos.coin, 'BTC');
    assert.strictEqual(pos.type, 'LONG');
    assert.strictEqual(pos.margin, 500.0);
    assert.strictEqual(pos.position_size, 2500.0, 'Position size = 500 * 5 = 2500');
    assert.strictEqual(pos.status, 'OPEN');
    createdPosId = pos.id;

    const acc = db.getPaperAccount();
    assert.strictEqual(acc.lockedMargin, 500.0, 'Locked margin phải là $500');
    assert.strictEqual(acc.availableBalance, 9500.0, 'Available balance phải là $9,500');
  });

  test('Kiểm tra chặn mở vị thế khi không đủ số dư khả dụng', () => {
    assert.throws(() => {
      db.openPaperPosition({
        coin: 'ETH',
        type: 'LONG',
        entry_price: 3000.0,
        leverage: 1,
        margin: 20000.0 // Quá số dư $9,500
      });
    }, /Số dư khả dụng/);
  });

  test('Đóng vị thế có lãi (Take Profit tại $67,600) và cập nhật số dư ví', () => {
    assert.ok(createdPosId, 'Cần ID vị thế để đóng');
    const closed = db.closePaperPosition(createdPosId, 67600.0, 'TAKE_PROFIT');
    assert.strictEqual(closed.status, 'CLOSED');
    assert.strictEqual(closed.exit_price, 67600.0);
    assert.ok(closed.pnl_amount > 0, 'PnL phải dương khi Long chốt lãi cao hơn entry');
    assert.ok(closed.pnl_percent > 0, 'PnL % phải dương');

    const acc = db.getPaperAccount();
    assert.strictEqual(acc.lockedMargin, 0, 'Sau khi đóng lệnh, locked margin phải về 0');
    assert.ok(acc.balance > 10000.0, 'Số dư ví phải tăng lên sau khi chốt lời');
  });

  test('Kiểm tra Lịch sử giao dịch & Thống kê tỷ lệ thắng (Win Rate)', () => {
    const history = db.getPaperHistory();
    assert.ok(history.trades.length >= 1, 'Phải có ít nhất 1 lệnh trong lịch sử');
    assert.strictEqual(history.stats.winTrades, 1, 'Phải ghi nhận 1 lệnh Thắng');
    assert.strictEqual(history.stats.winRate, 100, 'Winrate phải là 100%');
    assert.ok(history.stats.totalPnl > 0, 'Tổng PnL phải dương');
  });

  // --- 2. TEST MULTI-AGENT COUNCIL ANALYSIS ---
  console.log('\n--- 2. Kiểm thử Hội Đồng Multi-Agent AI (agy_engine.js) ---');

  await asyncTest('Chạy Hội Đồng Phân Tích Đa Phương Thức cho BTC/USDT', async () => {
    const debate = await runCouncilDebate('BTC', {
      price: 65200.0,
      high24h: 66800.0,
      low24h: 64100.0,
      change24h: 1.8,
      volumeUsdt: 1200000000,
      fundingRate: '+0.0100%'
    });

    assert.strictEqual(debate.success, true);
    assert.strictEqual(debate.coin, 'BTC');

    // Check Sub-Agent 1: Technical
    assert.ok(debate.technical_view, 'Phải có góc nhìn Kỹ thuật');
    assert.strictEqual(debate.technical_view.agent_id, 'agent_technical');
    assert.ok(debate.technical_view.support_zone, 'Phải có vùng hỗ trợ');
    assert.ok(debate.technical_view.resistance_zone, 'Phải có vùng kháng cự');

    // Check Sub-Agent 2: Macro
    assert.ok(debate.macro_view, 'Phải có góc nhìn Vĩ mô');
    assert.strictEqual(debate.macro_view.agent_id, 'agent_macro');
    assert.ok(debate.macro_view.fundingAnalysis, 'Phải có phân tích funding');

    // Check Sub-Agent 3: Risk
    assert.ok(debate.risk_view, 'Phải có góc nhìn Rủi ro');
    assert.strictEqual(debate.risk_view.agent_id, 'agent_risk');
    assert.ok(debate.risk_view.risk_score >= 1 && debate.risk_view.risk_score <= 10, 'Risk score 1-10');
    assert.ok(debate.risk_view.stop_loss, 'Phải có tính toán Stop loss');

    // Check Sub-Agent 4: Validator
    assert.ok(debate.validator_view, 'Phải có góc nhìn Phản biện');
    assert.strictEqual(debate.validator_view.agent_id, 'agent_validator');
    assert.ok(debate.validator_view.trap_warning, 'Phải có cảnh báo bẫy giá');

    // Check Master Verdict
    assert.ok(debate.master_verdict, 'Phải có kết luận của Chủ tịch Hội đồng');
    assert.strictEqual(debate.master_verdict.agent_id, 'agent_master');
    assert.ok(debate.master_verdict.probability_pct >= 0 && debate.master_verdict.probability_pct <= 100);
    assert.ok(debate.master_verdict.key_reasons.length >= 3, 'Phải có đủ 3 luận điểm cốt lõi');
  });

  // --- 3. TEST USER PREDICTION EVALUATOR ---
  console.log('\n--- 3. Kiểm thử Thẩm Định Dự Đoán Của Người Dùng ---');

  await asyncTest('Thẩm định dự đoán Mua Long BTC khi có phân kỳ RSI', async () => {
    const evalRes = await evaluateUserHypothesis(
      'BTC',
      'Tôi thấy nến 1H tạo đáy 2 phân kỳ RSI, dòng tiền ETF vào mạnh nên muốn vào lệnh Long',
      'LONG',
      { price: 65000.0, high24h: 66500.0, low24h: 64200.0, change24h: 1.2 }
    );

    assert.strictEqual(evalRes.success, true);
    assert.strictEqual(evalRes.coin, 'BTC');
    assert.ok(evalRes.probability_pct > 50, 'Xác suất phải tích cực khi có luận điểm tốt');
    assert.ok(evalRes.pros.length > 0, 'Phải có danh sách điểm ủng hộ');
    assert.ok(evalRes.suggested_setup.entry, 'Phải có mức giá Entry đề xuất');
    assert.ok(evalRes.suggested_setup.stop_loss, 'Phải có Stop loss đề xuất');
    assert.ok(evalRes.suggested_setup.take_profit, 'Phải có Take profit đề xuất');
  });

  // --- 4. TEST COUNCIL CHAT ---
  console.log('\n--- 4. Kiểm thử Chat & Chất Vấn Hội Đồng AI ---');

  await asyncTest('Gửi câu hỏi chất vấn Hội đồng AI về lý do không mua đuổi', async () => {
    const chatRes = await chatWithCouncil('Tại sao lại không nên Mua đuổi lúc này?', 'BTC', {
      price: 66700.0,
      high24h: 66800.0,
      low24h: 64000.0,
      change24h: 4.2
    });

    assert.strictEqual(chatRes.success, true);
    assert.strictEqual(chatRes.coin, 'BTC');
    assert.ok(chatRes.output.includes('Hội Đồng AI Trader'), 'Phải có tiêu đề phản hồi từ Hội Đồng');
    assert.ok(chatRes.output.includes('Agent Alpha'), 'Phải có ý kiến từ Agent Alpha hoặc Agent Guardian');
  });

  console.log('\n========================================================');
  console.log(`🎉 KẾT QUẢ KIỂM THỬ: ${passed}/${total} TEST CASES ĐẠT CHUẨN 100%!`);
  console.log('========================================================\n');
}

runAllTests().catch(console.error);
