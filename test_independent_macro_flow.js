/**
 * ==============================================================================
 * 🧪 INDEPENDENT E2E TEST: MACRO FLOW & SYSTEM INTEGRITY
 * 
 * Target Verifications:
 * 1. GET /api/news?source=investing returns only Investing.com articles.
 * 2. GET /api/news?source=forexfactory returns only Forex Factory articles.
 * 3. GET /api/news/daily-brief verifies:
 *    - macroHeadline references macro themes & Investing / Forex Factory.
 *    - actionableTradeSetups contains BOTH 'LONG' and 'SHORT' setups.
 *    - shortTermHolds contains at least 3-4 coins with complete required fields:
 *      (coin, holdingPeriod, accumulationZone, targetPrice, invalidationLevel, catalyst).
 *    - focusCoins contains at least 6-9 coins (BTC, ETH, SOL, SUI, NEAR...).
 * 4. LLM & MasterCouncil Macro ingestion verification.
 * 5. SQLite database integrity & zero-data-loss verification (PRAGMA integrity_check & row counts).
 * ==============================================================================
 */

const assert = require('node:assert');
const url = require('node:url');
const routeDispatcher = require('./server/routes/index');
const sqliteDb = require('./server/config/database');
const masterCouncil = require('./server/agents/MasterCouncil');
const dailyNewsAgentService = require('./server/services/daily-news-agent.service');
const newsService = require('./server/services/news.service');

// Test runner helper
let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function executeCheck(title, fn) {
  totalChecks++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${title}`);
    passedChecks++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${title}`);
    console.error(`         Chi tiết lỗi: ${err.message}`);
    failedChecks++;
  }
}

async function executeAsyncCheck(title, fn) {
  totalChecks++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${title}`);
    passedChecks++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${title}`);
    console.error(`         Chi tiết lỗi: ${err.message}`);
    failedChecks++;
  }
}

// Helper to simulate request via routeDispatcher
function mockDispatch(pathname, method = 'GET', body = {}, query = {}) {
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
    async run() {
      const handled = await routeDispatcher(req, res, parsedUrl, body);
      let json = null;
      if (responseData) {
        try {
          json = JSON.parse(responseData);
        } catch (e) {
          json = responseData;
        }
      }
      return {
        handled,
        statusCode: res.statusCode || statusCode,
        headers,
        data: json
      };
    }
  };
}

async function runIndependentMacroFlowSuite() {
  console.log('==============================================================================');
  console.log('🧪 KIỂM THỬ ĐỘC LẬP TOÀN DIỆN E2E: MACRO FLOW, MULTI-AGENT VÀ TÍNH TOÀN VẸN DB');
  console.log('==============================================================================\n');

  // --------------------------------------------------------------------------
  // SECTION 1: ENDPOINT GET /api/news?source=investing
  // --------------------------------------------------------------------------
  console.log('--- 1. Kiểm thử Endpoint GET /api/news?source=investing ---');
  await executeAsyncCheck('GET /api/news?source=investing trả về mã 200 và chỉ chứa tin Investing.com', async () => {
    const caller = mockDispatch('/api/news', 'GET', {}, { source: 'investing', coin: 'BTC' });
    const response = await caller.run();

    assert.strictEqual(response.handled, true, 'Route /api/news phải được xử lý');
    assert.strictEqual(response.statusCode, 200, 'HTTP Status phải là 200');
    assert.strictEqual(response.data.success, true, 'API response phải success: true');
    assert(Array.isArray(response.data.articles), 'Articles phải là dạng mảng');
    assert(response.data.articles.length > 0, 'Phải trả về ít nhất 1 bài báo Investing');

    console.log(`     -> Số lượng bài viết Investing.com thu được: ${response.data.articles.length}`);
    for (const art of response.data.articles) {
      const isInvesting = (art.sourceType === 'INVESTING') ||
        (art.source && art.source.toLowerCase().includes('investing')) ||
        (art.url && art.url.toLowerCase().includes('investing.com'));
      assert(isInvesting, `Bài viết "${art.title}" (${art.source}) không phải từ Investing.com`);
    }
    console.log(`     -> Mẫu tiêu đề: "${response.data.articles[0].title.slice(0, 65)}..."`);
  });

  // --------------------------------------------------------------------------
  // SECTION 2: ENDPOINT GET /api/news?source=forexfactory
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Kiểm thử Endpoint GET /api/news?source=forexfactory ---');
  await executeAsyncCheck('GET /api/news?source=forexfactory trả về mã 200 và chỉ chứa tin Forex Factory', async () => {
    const caller = mockDispatch('/api/news', 'GET', {}, { source: 'forexfactory', coin: 'BTC' });
    const response = await caller.run();

    assert.strictEqual(response.handled, true, 'Route /api/news phải được xử lý');
    assert.strictEqual(response.statusCode, 200, 'HTTP Status phải là 200');
    assert.strictEqual(response.data.success, true, 'API response phải success: true');
    assert(Array.isArray(response.data.articles), 'Articles phải là dạng mảng');
    assert(response.data.articles.length > 0, 'Phải trả về ít nhất 1 bài báo Forex Factory');

    console.log(`     -> Số lượng bài viết Forex Factory thu được: ${response.data.articles.length}`);
    for (const art of response.data.articles) {
      const isForex = (art.sourceType === 'FOREX_FACTORY') ||
        (art.source && (art.source.toLowerCase().includes('forex') || art.source.toLowerCase().includes('factory'))) ||
        (art.url && art.url.toLowerCase().includes('forexfactory.com'));
      assert(isForex, `Bài viết "${art.title}" (${art.source}) không phải từ Forex Factory`);
    }
    console.log(`     -> Mẫu sự kiện/bản tin: "${response.data.articles[0].title.slice(0, 65)}..."`);
  });

  // --------------------------------------------------------------------------
  // SECTION 3: ENDPOINT GET /api/news/daily-brief
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Kiểm thử Endpoint GET /api/news/daily-brief ---');
  let dailyBrief = null;
  await executeAsyncCheck('GET /api/news/daily-brief trả về 200 OK và cấu trúc dữ liệu hoàn chỉnh', async () => {
    const caller = mockDispatch('/api/news/daily-brief', 'GET');
    const response = await caller.run();

    assert.strictEqual(response.handled, true, 'Route /api/news/daily-brief phải được xử lý');
    assert.strictEqual(response.statusCode, 200, 'HTTP Status phải là 200');
    assert.strictEqual(response.data.success, true, 'Response phải success: true');
    assert(response.data.brief, 'Bản tin brief phải tồn tại');
    dailyBrief = response.data.brief;
  });

  // 3.1: Macro Headline Check
  executeCheck('Bản tin Daily Brief có macroHeadline tham chiếu Investing.com / Forex Factory / Vĩ Mô', () => {
    assert(dailyBrief, 'DailyBrief phải tồn tại');
    const headline = dailyBrief.macroHeadline || dailyBrief.macro_headline;
    assert(typeof headline === 'string' && headline.length > 10, 'macroHeadline phải là chuỗi có độ dài > 10');

    console.log(`     -> Tiêu đề vĩ mô: "${headline}"`);
    const containsMacroRef = /investing|forex|vĩ mô|dxy|etf|lạm phát|thị trường|chính sách/i.test(headline);
    assert(containsMacroRef, 'macroHeadline phải phản ánh tin tức vĩ mô hoặc các kênh Investing / Forex Factory');
  });

  // 3.2: Bi-directional Trade Setups (BOTH LONG AND SHORT)
  executeCheck('actionableTradeSetups chứa lệnh 2 chiều (CẢ BIAS: LONG VÀ BIAS: SHORT)', () => {
    const setups = dailyBrief.actionableTradeSetups || dailyBrief.actionable_trade_setups;
    assert(Array.isArray(setups), 'actionableTradeSetups phải là một mảng');
    assert(setups.length >= 2, 'Cần ít nhất 2 setup giao dịch');

    const longSetups = setups.filter(s => s.bias && s.bias.toUpperCase() === 'LONG');
    const shortSetups = setups.filter(s => s.bias && s.bias.toUpperCase() === 'SHORT');

    console.log(`     -> Tổng số setup: ${setups.length} (LONG: ${longSetups.length} lệnh, SHORT: ${shortSetups.length} lệnh)`);
    console.log(`     -> Lệnh LONG: ${longSetups.map(s => s.coin).join(', ')}`);
    console.log(`     -> Lệnh SHORT: ${shortSetups.map(s => s.coin).join(', ')}`);

    assert(longSetups.length > 0, 'BẮT BUỘC phải có ít nhất 1 setup LONG');
    assert(shortSetups.length > 0, 'BẮT BUỘC phải có ít nhất 1 setup SHORT');

    // Kiểm tra cấu trúc từng setup
    for (const setup of setups) {
      assert(setup.coin, 'Mỗi setup phải có mã coin');
      assert(setup.entryZone, `Setup ${setup.coin} thiếu entryZone`);
      assert(setup.stopLoss, `Setup ${setup.coin} thiếu stopLoss`);
      assert(setup.takeProfit1, `Setup ${setup.coin} thiếu takeProfit1`);
    }
  });

  // 3.3: Short Term Spot Holds (Spot 3-14 days)
  executeCheck('shortTermHolds chứa ít nhất 3-4 coin với đầy đủ 6 trường bắt buộc', () => {
    const holds = dailyBrief.shortTermHolds || dailyBrief.short_term_holds;
    assert(Array.isArray(holds), 'shortTermHolds phải là mảng');
    assert(holds.length >= 3, `shortTermHolds phải có ít nhất 3 coin (hiện có: ${holds.length})`);

    console.log(`     -> Số lượng coin khuyến nghị Hold Ngắn Hạn: ${holds.length}`);
    for (const item of holds) {
      assert(item.coin, 'Hold item phải có trường "coin"');
      assert(item.holdingPeriod, `Hold item ${item.coin} thiếu "holdingPeriod"`);
      assert(item.accumulationZone, `Hold item ${item.coin} thiếu "accumulationZone"`);
      assert(item.targetPrice, `Hold item ${item.coin} thiếu "targetPrice"`);
      assert(item.invalidationLevel, `Hold item ${item.coin} thiếu "invalidationLevel"`);
      assert(item.catalyst, `Hold item ${item.coin} thiếu "catalyst"`);
      console.log(`        * [${item.coin}] Gom: ${item.accumulationZone} | Target: ${item.targetPrice} | Cắt lỗ: ${item.invalidationLevel} | Chu kỳ: ${item.holdingPeriod}`);
    }
  });

  // 3.4: Diverse Focus Coins (6 - 9+ coins)
  executeCheck('focusCoins bao quát danh mục coin đa dạng (tối thiểu 6 - 9 đồng coin)', () => {
    const coins = dailyBrief.focusCoins || dailyBrief.focus_coins;
    assert(Array.isArray(coins), 'focusCoins phải là mảng');
    assert(coins.length >= 6, `focusCoins phải có ít nhất 6 coin (hiện có: ${coins.length})`);

    const symbols = coins.map(c => c.coin || c.symbol);
    console.log(`     -> Danh sách ${symbols.length} coin quét vĩ mô: ${symbols.join(', ')}`);

    const keyCoins = ['BTC', 'ETH', 'SOL', 'SUI', 'NEAR'];
    for (const key of keyCoins) {
      assert(symbols.includes(key), `Danh mục thiếu coin quan trọng: ${key}`);
    }

    for (const c of coins) {
      assert(c.coin, 'Thiếu tên coin');
      assert(c.currentPrice !== undefined, `Thiếu currentPrice cho ${c.coin}`);
      assert(c.sentiment, `Thiếu sentiment cho ${c.coin}`);
      assert(c.analysis, `Thiếu analysis cho ${c.coin}`);
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 4: LLM & MULTI-AGENT MACRO INGESTION VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Kiểm tra nạp tin tức vĩ mô vào TẤT CẢ các AI Agent ---');
  await executeAsyncCheck('MacroAgent & MasterCouncil đều nạp & tích hợp tin tức Investing & Forex Factory', async () => {
    // 1. Kiểm tra DailyNewsAgentService
    assert(dailyNewsAgentService.focusCoinsList.length >= 9, 'DailyNewsAgentService phải theo dõi ít nhất 9 coin');
    
    // 2. Kiểm tra Macro Intelligence Service
    const macroIntel = await newsService.getMacroIntelligence('BTC');
    assert(macroIntel, 'newsService.getMacroIntelligence phải trả về kết quả');
    assert(Array.isArray(macroIntel.highImpactEvents), 'highImpactEvents phải là mảng (Forex Factory)');
    assert(Array.isArray(macroIntel.investingNews), 'investingNews phải là mảng (Investing.com)');
    console.log(`     -> Forex Factory Events count: ${macroIntel.highImpactEvents.length}`);
    console.log(`     -> Investing.com Macro items count: ${macroIntel.investingNews.length}`);

    // 3. Kiểm tra MacroAgent prompt và dữ liệu đầu vào
    const macroAgent = require('./server/agents/MacroAgent');
    assert(macroAgent.name.includes('Macro'), 'MacroAgent phải có tên đúng vai trò');
    
    // 4. Kiểm tra MasterCouncil debate có sử dụng tin tức vĩ mô
    const councilRes = await masterCouncil.runDebate('BTC', null, true, 'SCALPING');
    assert(councilRes && councilRes.success, 'MasterCouncil debate phải thành công');
    assert(councilRes.master_verdict, 'MasterCouncil phải đưa ra phán quyết master_verdict');
    assert(councilRes.macro_view, 'MasterCouncil phải có báo cáo từ MacroAgent (macro_view)');
    console.log(`     -> Macro Agent Name: "${councilRes.macro_view.agent_name}"`);
    console.log(`     -> MasterCouncil Macro view summary: "${councilRes.macro_view.summary.slice(0, 70)}..."`);
  });

  // --------------------------------------------------------------------------
  // SECTION 5: SQLITE DATABASE INTEGRITY & ZERO DATA LOSS
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Kiểm thử tính toàn vẹn Database SQLite & Không mất mát dữ liệu ---');
  executeCheck('SQLite PRAGMA integrity_check đạt trạng thái "ok"', () => {
    const check = sqliteDb.prepare('PRAGMA integrity_check').get();
    console.log(`     -> PRAGMA integrity_check: ${JSON.stringify(check)}`);
    assert.strictEqual(check.integrity_check, 'ok', 'Database integrity check phải trả về "ok"');
  });

  executeCheck('Tất cả 11 bảng chuẩn của hệ thống đều tồn tại và nguyên vẹn', () => {
    const tables = sqliteDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    const tableNames = tables.map(t => t.name);
    console.log(`     -> Các bảng hiện có (${tableNames.length} bảng): ${tableNames.join(', ')}`);

    const expectedTables = [
      'journal_entries',
      'notes',
      'trade_reviews',
      'news_analyses',
      'terminal_chats',
      'practice_progress',
      'paper_account',
      'paper_trades',
      'ai_debates',
      'user_predictions',
      'daily_market_briefs'
    ];

    for (const tbl of expectedTables) {
      assert(tableNames.includes(tbl), `Bảng cơ sở dữ liệu bị thiếu: ${tbl}`);
    }
  });

  executeCheck('Dữ liệu các bảng nghiệp vụ không bị mất mát hoặc rỗng', () => {
    const briefCount = sqliteDb.prepare('SELECT COUNT(*) as cnt FROM daily_market_briefs').get().cnt;
    const paperAccCount = sqliteDb.prepare('SELECT COUNT(*) as cnt FROM paper_account').get().cnt;
    const notesCount = sqliteDb.prepare('SELECT COUNT(*) as cnt FROM notes').get().cnt;
    const debatesCount = sqliteDb.prepare('SELECT COUNT(*) as cnt FROM ai_debates').get().cnt;

    console.log(`     -> Bảng daily_market_briefs: ${briefCount} bản ghi`);
    console.log(`     -> Bảng paper_account: ${paperAccCount} bản ghi`);
    console.log(`     -> Bảng notes: ${notesCount} bản ghi`);
    console.log(`     -> Bảng ai_debates: ${debatesCount} bản ghi`);

    assert(briefCount > 0, 'daily_market_briefs không được rỗng');
    assert(paperAccCount > 0, 'paper_account không được rỗng');

    // Kiểm tra cấu trúc cột short_term_holds trong daily_market_briefs
    const latestBriefRow = sqliteDb.prepare('SELECT * FROM daily_market_briefs ORDER BY id DESC LIMIT 1').get();
    assert(latestBriefRow, 'Phải có ít nhất 1 bản ghi daily brief');
    assert(latestBriefRow.short_term_holds !== undefined, 'Cột short_term_holds phải tồn tại trong SQLite');

    if (latestBriefRow.short_term_holds) {
      const parsedHolds = JSON.parse(latestBriefRow.short_term_holds);
      assert(Array.isArray(parsedHolds) && parsedHolds.length > 0, 'short_term_holds trong SQLite phải chứa mảng JSON hợp lệ');
      console.log(`     -> Kiểm tra SQLite ID #${latestBriefRow.id}: Cột short_term_holds lưu an toàn ${parsedHolds.length} coin hold ngắn hạn`);
    }
  });

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n==============================================================================');
  console.log(`📊 TỔNG KẾT KIỂM THỬ ĐỘC LẬP: ${passedChecks}/${totalChecks} CHECKS PASS (${failedChecks} FAIL)`);
  console.log('==============================================================================\n');

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runIndependentMacroFlowSuite().catch(err => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
