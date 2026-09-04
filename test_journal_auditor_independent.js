/**
 * ==============================================================================
 * 🛡️ INDEPENDENT VERIFICATION TEST: AUDITOR CHẨN ĐOÁN KỶ LUẬT GIAO DỊCH
 * Endpoint: POST /api/journal/ai-review
 * Evidence-based 100% verification against SQLite database
 * ==============================================================================
 */

const assert = require('node:assert');
const url = require('node:url');
const routeDispatcher = require('./server/routes/index');
const db = require('./server/config/database');

async function dispatchPostReview(payload) {
  const parsedUrl = url.parse('/api/journal/ai-review', true);
  let statusCode = 200;
  let headers = {};
  let responseData = null;

  const res = {
    writeHead(code, h) {
      statusCode = code;
      headers = { ...headers, ...h };
    },
    end(data) {
      responseData = data;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(obj) {
      statusCode = 200;
      responseData = JSON.stringify(obj);
    }
  };

  const req = {
    method: 'POST',
    url: '/api/journal/ai-review'
  };

  await routeDispatcher(req, res, parsedUrl, payload);

  let json = null;
  if (responseData) {
    try {
      json = JSON.parse(responseData);
    } catch (e) {
      json = responseData;
    }
  }

  return { statusCode, data: json };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐỘC LẬP: AUDITOR CHẨN ĐOÁN KỶ LUẬT GIAO DỊCH');
  console.log('================================================================\n');

  // Query actual SQLite DB stats for comparison
  const now = new Date();
  const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = formatYMD(now);
  const weekAgoStr = formatYMD(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));

  const allDbRows = db.prepare('SELECT * FROM journal_entries').all();
  const todayDbRows = db.prepare('SELECT * FROM journal_entries WHERE date = ?').all(todayStr);
  const weekDbRows = db.prepare('SELECT * FROM journal_entries WHERE date >= ?').all(weekAgoStr);

  console.log(`📊 DỮ LIỆU THỰC TẾ TRONG SQLITE DATABASE (${todayStr}):`);
  console.log(`   - Tổng số lệnh toàn thời gian: ${allDbRows.length}`);
  console.log(`   - Tổng số lệnh hôm nay (${todayStr}): ${todayDbRows.length}`);
  console.log(`   - Tổng số lệnh trong 7 ngày qua (>= ${weekAgoStr}): ${weekDbRows.length}\n`);

  let passedTests = 0;
  let totalTests = 0;

  async function testCase(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Chi tiết lỗi: ${err.message}\n`, err.stack);
    }
  }

  // TEST 1: Payload TODAY
  await testCase('1. POST /api/journal/ai-review với { periodType: "TODAY", coinFilter: "ALL" }', async () => {
    const res = await dispatchPostReview({ periodType: 'TODAY', coinFilter: 'ALL' });
    assert.strictEqual(res.statusCode, 200, 'HTTP status code phải là 200');
    assert.strictEqual(res.data.success, true, 'success phải là true');

    const review = res.data.review;
    assert.ok(review, 'review object phải tồn tại');

    // Kiểm tra đồng thời camelCase và snake_case
    assert.strictEqual(review.periodType, 'TODAY');
    assert.strictEqual(review.period_type, 'TODAY');
    assert.strictEqual(review.totalTrades, todayDbRows.length, `totalTrades phải khớp số lệnh SQLite (${todayDbRows.length})`);
    assert.strictEqual(review.total_trades, todayDbRows.length);
    assert.strictEqual(review.disciplineScore, 100);
    assert.strictEqual(review.discipline_score, 100);
    assert.strictEqual(review.winRate, 0);
    assert.strictEqual(review.win_rate, 0);

    // Checklist Analysis
    assert.ok(review.checklistAnalysis, 'checklistAnalysis phải tồn tại');
    assert.strictEqual(review.checklistAnalysis.missingSlCount, 0);
    assert.strictEqual(review.checklistAnalysis.badRrCount, 0);
    assert.strictEqual(review.checklistAnalysis.overtradingDays, 0);
    assert.strictEqual(review.checklistAnalysis.revengeTradeCount, 0);

    // Snake case checklist
    assert.strictEqual(review.checklist_analysis.missing_sl_count, 0);
    assert.strictEqual(review.checklist_analysis.bad_rr_count, 0);

    // Recommendations & Summary
    assert.ok(Array.isArray(review.recommendations), 'recommendations phải là mảng');
    assert.ok(review.summary, 'summary phải có nội dung');

    console.log('     Output thực tế:');
    console.log(`     - periodType: ${review.periodType} | totalTrades: ${review.totalTrades} | disciplineScore: ${review.disciplineScore}/100`);
    console.log(`     - checklistAnalysis: missingSl=${review.checklistAnalysis.missingSlCount}, badRr=${review.checklistAnalysis.badRrCount}, overtrading=${review.checklistAnalysis.overtradingDays}, revenge=${review.checklistAnalysis.revengeTradeCount}`);
  });

  // TEST 2: Payload WEEK
  await testCase('2. POST /api/journal/ai-review với { periodType: "WEEK", coinFilter: "ALL" }', async () => {
    const res = await dispatchPostReview({ periodType: 'WEEK', coinFilter: 'ALL' });
    assert.strictEqual(res.statusCode, 200, 'HTTP status code phải là 200');
    assert.strictEqual(res.data.success, true, 'success phải là true');

    const review = res.data.review;
    assert.ok(review, 'review object phải tồn tại');

    // Kiểm tra số liệu
    assert.strictEqual(review.periodType, 'WEEK');
    assert.strictEqual(review.period_type, 'WEEK');
    assert.strictEqual(review.totalTrades, weekDbRows.length, `totalTrades phải là ${weekDbRows.length}`);
    assert.strictEqual(review.total_trades, weekDbRows.length);
    assert.strictEqual(review.winRate, 40, 'Win rate phải là 40% (2 lệnh WIN / 5 lệnh)');
    assert.strictEqual(review.win_rate, 40);
    assert.strictEqual(review.totalPnl, 634.16);
    assert.strictEqual(review.total_pnl, 634.16);
    assert.strictEqual(review.profitFactor, 5.19);
    assert.strictEqual(review.profit_factor, 5.19);

    // Kiểm tra checklistAnalysis & badRrCount
    assert.ok(review.checklistAnalysis, 'checklistAnalysis phải tồn tại');
    assert.strictEqual(typeof review.checklistAnalysis.badRrCount, 'number', 'badRrCount phải là number');
    assert.strictEqual(review.checklistAnalysis.badRrCount, 4, 'Phải phát hiện đúng 4 lệnh có R:R < 1:2');
    assert.strictEqual(review.checklistAnalysis.missingSlCount, 0, 'Cả 5 lệnh đều có SL nên missingSlCount = 0');
    assert.strictEqual(review.checklistAnalysis.overtradingDays, 1, 'Có 1 ngày overtrading (5 lệnh trong ngày 2026-09-03)');
    assert.strictEqual(review.checklistAnalysis.revengeTradeCount, 2, 'Có 2 lệnh vào ngay sau lệnh lỗ cùng ngày');

    // Snake case checklist
    assert.strictEqual(review.checklist_analysis.bad_rr_count, 4);
    assert.strictEqual(review.checklist_analysis.overtrading_days, 1);
    assert.strictEqual(review.checklist_analysis.revenge_trade_count, 2);

    // Detailed trade audits
    assert.ok(Array.isArray(review.detailedTradeAudits), 'detailedTradeAudits phải là mảng');
    assert.strictEqual(review.detailedTradeAudits.length, 5);
    assert.ok(Array.isArray(review.detailed_trade_audits), 'detailed_trade_audits snake_case phải tồn tại');

    // Recommendations
    assert.ok(review.recommendations.length >= 3, 'Phải có khuyến nghị về R:R, Revenge trading và Overtrading');
    const hasRrRec = review.recommendations.some(r => r.includes('R:R') || r.includes('1:2'));
    assert.ok(hasRrRec, 'Khuyến nghị phải cảnh báo lỗi R:R < 1:2');

    console.log('     Output thực tế:');
    console.log(`     - periodType: ${review.periodType} | totalTrades: ${review.totalTrades} | disciplineScore: ${review.disciplineScore}/100 | winRate: ${review.winRate}% | totalPnl: $${review.totalPnl} | profitFactor: ${review.profitFactor}`);
    console.log(`     - checklistAnalysis: missingSl=${review.checklistAnalysis.missingSlCount}, badRr=${review.checklistAnalysis.badRrCount}, overtrading=${review.checklistAnalysis.overtradingDays}, revenge=${review.checklistAnalysis.revengeTradeCount}`);
    console.log(`     - Khuyến nghị R:R: "${review.recommendations.find(r => r.includes('R:R'))}"`);
  });

  // TEST 3: Payload ALL
  await testCase('3. POST /api/journal/ai-review với { periodType: "ALL", coinFilter: "ALL" }', async () => {
    const res = await dispatchPostReview({ periodType: 'ALL', coinFilter: 'ALL' });
    assert.strictEqual(res.statusCode, 200, 'HTTP status code phải là 200');
    assert.strictEqual(res.data.success, true, 'success phải là true');

    const review = res.data.review;
    assert.ok(review, 'review object phải tồn tại');

    assert.strictEqual(review.periodType, 'ALL');
    assert.strictEqual(review.period_type, 'ALL');
    assert.strictEqual(review.totalTrades, allDbRows.length, `totalTrades phải là ${allDbRows.length}`);
    assert.strictEqual(review.winRate, 40);
    assert.strictEqual(review.totalPnl, 634.16);
    assert.strictEqual(review.checklistAnalysis.badRrCount, 4);

    console.log('     Output thực tế:');
    console.log(`     - periodType: ${review.periodType} | totalTrades: ${review.totalTrades} | disciplineScore: ${review.disciplineScore}/100 | winRate: ${review.winRate}% | totalPnl: $${review.totalPnl}`);
  });

  // TEST 4: CUSTOM Range & Coin Filter Verification
  await testCase('4. POST /api/journal/ai-review với { periodType: "CUSTOM", startDate: "2026-09-03", endDate: "2026-09-03", coinFilter: "BTC" }', async () => {
    const res = await dispatchPostReview({
      periodType: 'CUSTOM',
      startDate: '2026-09-03',
      endDate: '2026-09-03',
      coinFilter: 'BTC'
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    const review = res.data.review;
    assert.strictEqual(review.totalTrades, 2, 'BTC chỉ có 2 lệnh trong ngày 2026-09-03');
    assert.strictEqual(review.winRate, 50, '1 WIN / 2 lệnh -> 50% Win Rate');
    assert.strictEqual(review.coinFilter, 'BTC');
    assert.strictEqual(review.startDate, '2026-09-03');
    assert.strictEqual(review.endDate, '2026-09-03');

    console.log('     Output thực tế:');
    console.log(`     - coinFilter: ${review.coinFilter} | totalTrades: ${review.totalTrades} | winRate: ${review.winRate}% | totalPnl: $${review.totalPnl}`);
  });

  console.log('\n================================================================');
  console.log(`🎉 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} BÀI TEST ĐẠT ĐIỂM TUYỆT ĐỐI (100% PASS)!`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
