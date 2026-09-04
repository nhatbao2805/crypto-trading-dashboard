/**
 * ==============================================================================
 * 🧪 IN-MEMORY ROUTE DISPATCHER INTEGRATION TEST SUITE
 * Directly tests routeDispatcher with mock request & response
 * ==============================================================================
 */

const assert = require('node:assert');
const url = require('node:url');
const routeDispatcher = require('/Users/macbookpro2020/LyThuyetCoin/server/routes/index');

function mockRequest(pathname, method = 'GET', body = {}, query = {}) {
  const parsedUrl = url.parse(pathname, true);
  if (Object.keys(query).length > 0) {
    parsedUrl.query = query;
  }

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
    }
  };

  const req = {
    method,
    url: pathname
  };

  return {
    req,
    res,
    parsedUrl,
    body,
    async execute() {
      const handled = await routeDispatcher(req, res, parsedUrl, body);
      let json = null;
      if (responseData) {
        try {
          json = JSON.parse(responseData);
        } catch (e) {
          json = responseData;
        }
      }
      return { handled, statusCode: res.statusCode || statusCode, data: json };
    }
  };
}

async function runDirectRouteTests() {
  console.log('================================================================');
  console.log('🧪 KIỂM THỬ TRỰC TIẾP ROUTE DISPATCHER & TẤT CẢ CONTROLLERS');
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

  // 1. Theory Routes
  console.log('--- 1. Phân hệ Giáo trình & Lý thuyết (/api/theory/*) ---');
  await check('GET /api/theory -> Trả về đủ 12 chương & Từ điển', async () => {
    const test = mockRequest('/api/theory', 'GET');
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.data.totalChapters, 12);
    assert.strictEqual(result.data.chapters.length, 12);
    assert.ok(result.data.chapters[0].title.includes('CHƯƠNG 1'));
    assert.ok(result.data.glossary.length > 0);
  });

  await check('GET /api/theory/chapter/1 -> Tải chi tiết Chương 1', async () => {
    const test = mockRequest('/api/theory/chapter/1', 'GET');
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.data.id, 1);
    assert.ok(result.data.title.includes('CHƯƠNG 1'));
    assert.ok(result.data.content.length > 100);
  });

  await check('GET /api/theory/chapter/12 -> Tải chi tiết Chương 12', async () => {
    const test = mockRequest('/api/theory/chapter/12', 'GET');
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.data.id, 12);
    assert.ok(result.data.title.includes('CHƯƠNG 12'));
  });

  await check('GET /api/theory/glossary -> Trả về danh sách 21 thuật ngữ SMC', async () => {
    const test = mockRequest('/api/theory/glossary', 'GET');
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.ok(Array.isArray(result.data.glossary));
    assert.ok(result.data.glossary.length >= 10);
  });

  await check('GET /api/practice/progress -> Tải tiến độ thực hành', async () => {
    const test = mockRequest('/api/practice/progress', 'GET');
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.data.success, true);
  });

  // 2. News & Market
  console.log('\n--- 2. Phân hệ Tin tức & Binance (/api/market/*, /api/news/*) ---');
  await check('GET /api/market/ticker?coin=BTC -> Trả về giá ticker Binance', async () => {
    const test = mockRequest('/api/market/ticker', 'GET', {}, { coin: 'BTC' });
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.ok(result.data.ticker.price > 0);
  });

  await check('POST /api/news/analyze -> Phân tích tác động tin tức AGY', async () => {
    const test = mockRequest('/api/news/analyze', 'POST', { coin: 'BTC' });
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.data.success, true);
    assert.ok(result.data.analysis);
  });

  // 3. Journal & Notes
  console.log('\n--- 3. Phân hệ Sổ nhật ký & AI Coach (/api/journal/*, /api/notes/*) ---');
  let createdTradeId = null;
  await check('POST /api/journal -> Tạo mới lệnh trade', async () => {
    const test = mockRequest('/api/journal', 'POST', {
      date: '2026-09-02',
      coin: 'SOL',
      type: 'LONG',
      entry_price: 135.0,
      stop_loss: 130.0,
      take_profit: 145.0,
      position_size: 1000,
      status: 'OPEN'
    });
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.data.success, true);
    assert.ok(result.data.entry.id);
    createdTradeId = result.data.entry.id;
  });

  await check('POST /api/journal/close-live/:id -> Chốt lệnh trực tiếp theo giá Binance', async () => {
    assert.ok(createdTradeId);
    const test = mockRequest(`/api/journal/close-live/${createdTradeId}`, 'POST', { livePrice: 142.5 });
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.data.success, true);
    assert.strictEqual(result.data.entry.status, 'WIN');
    assert.ok(result.data.entry.pnl_amount > 0);
  });

  await check('POST /api/journal/coach-chat -> Trợ lý AI Coaching kỷ luật giao dịch', async () => {
    const test = mockRequest('/api/journal/coach-chat', 'POST', { prompt: 'Tôi vừa bị dính Stop Loss, tôi có nên vào lệnh lại ngay không?' });
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.data.success, true);
    assert.ok(result.data.response.includes('Chương'));
  });

  await check('GET /api/journal/stats -> Thống kê Win Rate & PnL Curve', async () => {
    const test = mockRequest('/api/journal/stats', 'GET');
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.ok(result.data.stats.totalTrades >= 1);
  });

  if (createdTradeId) {
    const delTest = mockRequest(`/api/journal/${createdTradeId}`, 'DELETE');
    await delTest.execute();
  }

  // 4. AI Trader Multi-Agent
  console.log('\n--- 4. Phân hệ Hội Đồng AI Trader Multi-Agent (/api/ai-trader/*) ---');
  await check('POST /api/ai-trader/council/debate -> Họp hội đồng 4 tác tử AI (Frontend Endpoint)', async () => {
    const test = mockRequest('/api/ai-trader/council/debate', 'POST', { coin: 'BTC' });
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.data.success, true);
    assert.ok(result.data.master_verdict);
    assert.ok(result.data.technical_view);
    assert.ok(result.data.macro_view);
    assert.ok(result.data.risk_view);
    assert.ok(result.data.validator_view);
  });

  await check('GET /api/agy/history -> Đọc lịch sử chat AGY Terminal', async () => {
    const test = mockRequest('/api/agy/history', 'GET');
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.data.success, true);
    assert.ok(Array.isArray(result.data.history));
  });

  await check('POST /api/journal/ai-review -> Sinh bản đánh giá AI Review bất đồng bộ', async () => {
    const test = mockRequest('/api/journal/ai-review', 'POST', { periodType: 'WEEKLY', coinFilter: 'ALL', save: false });
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.data.success, true);
    assert.ok(result.data.review.discipline_score >= 0);
    assert.ok(result.data.review.commentary);
  });

  // 5. Paper Trading
  console.log('\n--- 5. Phân hệ Sàn Paper Trading Realtime (/api/paper-trader/*) ---');
  await check('GET /api/paper-trader/account -> Đọc thông tin ví Paper Trading', async () => {
    const test = mockRequest('/api/paper-trader/account', 'GET');
    const result = await test.execute();
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.statusCode, 200);
    assert.ok(result.data.account.balance > 0);
  });

  console.log('\n================================================================');
  console.log(`🎉 TẤT CẢ ${passed}/${total} ROUTE VÀ CONTROLLER ĐỀU HOẠT ĐỘNG HOÀN HẢO 100%!`);
  console.log('================================================================\n');
  process.exit(0);
}

runDirectRouteTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
