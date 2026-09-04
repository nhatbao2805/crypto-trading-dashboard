/**
 * Test Suite: Daily News Agent Backend (test_daily_news_agent.js)
 * Verifies:
 * 1. DebateRepository (saveDailyBrief, getLatestDailyBrief)
 * 2. DailyNewsAgentService (Agent intelligence, LLM & Heuristic fallback, Schema compliance)
 * 3. Route Dispatcher integration (GET /api/news/daily-brief, POST /api/news/daily-brief/generate)
 */

const assert = require('node:assert');
const url = require('node:url');

async function runTests() {
  console.log('================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ BACKEND BẢN TIN NGÀY CHUYÊN SÂU');
  console.log('================================================================\n');

  // Test 1: Import modules and check syntax
  console.log('▶ [1/4] Kiểm tra cú pháp và load các module Backend...');
  const debateRepository = require('./server/models/DebateRepository');
  const dailyNewsAgentService = require('./server/services/daily-news-agent.service');
  const routeDispatcher = require('./server/routes/index');
  console.log('  ✅ Load thành công: DebateRepository, DailyNewsAgentService, RouteDispatcher\n');

  // Test 2: Test DebateRepository Daily Brief methods
  console.log('▶ [2/4] Kiểm thử DebateRepository (saveDailyBrief, getLatestDailyBrief)...');
  const sampleBrief = {
    date: 'Thứ Sáu, Ngày 04/09/2026',
    macroHeadline: 'Thị trường phản ứng tích cực trước dữ liệu lạm phát, dòng vốn ETF dồi dào',
    marketMood: 'BULLISH',
    sentimentScore: 0.65,
    executiveSummary: [
      'Dòng vốn Spot ETF mua ròng mạnh mẽ.',
      'DXY hạ nhiệt hỗ trợ thị trường tiền số.',
      'Tỷ trọng BTC.D duy trì trên 58%.'
    ],
    focusCoins: [
      {
        coin: 'BTC',
        currentPrice: 88500,
        change24h: 2.1,
        impactHeadline: 'BlackRock IBIT ghi nhận dòng tiền vào kỷ lục',
        sentiment: 'BULLISH',
        analysis: 'BTC phá vỡ kháng cự tạo cấu trúc BOS tăng giá rõ rệt.'
      },
      {
        coin: 'ETH',
        currentPrice: 2750,
        change24h: 1.8,
        impactHeadline: 'Hoạt động giao dịch Layer 2 đạt mốc mới',
        sentiment: 'BULLISH',
        analysis: 'Cặp ETH/BTC kiểm tra thành công hỗ trợ kênh giá.'
      }
    ],
    actionableTradeSetups: [
      {
        coin: 'BTC',
        bias: 'LONG',
        entryZone: '$87,200 - $87,800',
        stopLoss: '$85,900',
        takeProfit1: '$89,800',
        takeProfit2: '$92,500',
        riskRewardRatio: '1:2.5',
        trapWarning: 'Cảnh báo Judas Swing phiên London quét râu trước giờ Mỹ.',
        rationale: 'Retest FVG Discount và khối Bullish Order Block.'
      }
    ],
    riskNotice: 'Tuân thủ nghiêm ngặt quy tắc cắt lỗ, không mạo hiểm quá 2% tài khoản.',
    rawData: { source: 'unit-test' }
  };

  const saved = debateRepository.saveDailyBrief(sampleBrief);
  assert(saved && saved.id, 'saveDailyBrief phải trả về bản ghi có id hợp lệ');
  assert.strictEqual(saved.macroHeadline, sampleBrief.macroHeadline);
  assert.strictEqual(saved.marketMood, 'BULLISH');
  assert.strictEqual(saved.sentimentScore, 0.65);
  assert(Array.isArray(saved.executiveSummary) && saved.executiveSummary.length === 3);
  assert(Array.isArray(saved.focusCoins) && saved.focusCoins.length === 2);
  assert(Array.isArray(saved.actionableTradeSetups) && saved.actionableTradeSetups.length === 1);
  console.log(`  ✅ saveDailyBrief thành công! ID vừa tạo: #${saved.id}`);

  const latest = debateRepository.getLatestDailyBrief();
  assert(latest, 'getLatestDailyBrief phải trả về bản tin vừa lưu');
  assert.strictEqual(latest.id, saved.id);
  assert.strictEqual(latest.macroHeadline, sampleBrief.macroHeadline);
  console.log(`  ✅ getLatestDailyBrief lấy đúng bản ghi ID #${latest.id}\n`);

  // Test 3: DailyNewsAgentService Generation & Heuristic Fallback
  console.log('▶ [3/4] Kiểm thử DailyNewsAgentService (Thu thập giá Live, tạo bản tin & Fallback Heuristic)...');
  console.log(`  - Tên Agent: "${dailyNewsAgentService.agentName}" (${dailyNewsAgentService.agentTitle})`);
  
  const dateStr = dailyNewsAgentService.getVietnameseDateString();
  console.log(`  - Ngày tạo định dạng tiếng Việt: "${dateStr}"`);
  assert(dateStr.includes('Ngày'), 'Date string phải có định dạng tiếng Việt chuẩn');

  const generatedBrief = await dailyNewsAgentService.generateDailyBrief(true);
  assert(generatedBrief, 'Bản tin sinh ra không được null');
  assert(typeof generatedBrief.macroHeadline === 'string' && generatedBrief.macroHeadline.length > 0, 'Phải có macroHeadline');
  assert(['BULLISH', 'BEARISH', 'NEUTRAL', 'GREED', 'FEAR'].includes(generatedBrief.marketMood), `marketMood "${generatedBrief.marketMood}" phải hợp lệ`);
  assert(typeof generatedBrief.sentimentScore === 'number' && generatedBrief.sentimentScore >= -1.0 && generatedBrief.sentimentScore <= 1.0, 'sentimentScore phải từ -1.0 đến 1.0');
  assert(Array.isArray(generatedBrief.executiveSummary) && generatedBrief.executiveSummary.length >= 3, 'executiveSummary phải có ít nhất 3 ý');
  assert(Array.isArray(generatedBrief.focusCoins) && generatedBrief.focusCoins.length >= 6, 'focusCoins phải có ít nhất 6 đồng coin');
  
  // Verify focusCoins coins list
  const coinCodes = generatedBrief.focusCoins.map(c => c.coin);
  ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'SUI'].forEach(sym => {
    assert(coinCodes.includes(sym), `focusCoins phải chứa coin ${sym}`);
  });

  // Verify actionableTradeSetups
  assert(Array.isArray(generatedBrief.actionableTradeSetups) && generatedBrief.actionableTradeSetups.length >= 3, 'actionableTradeSetups phải có từ 3 setup trở lên');
  const btcSetup = generatedBrief.actionableTradeSetups.find(s => s.coin === 'BTC');
  assert(btcSetup, 'Phải có trade setup cho BTC');
  assert(btcSetup.entryZone, 'Trade setup phải có entryZone');
  assert(btcSetup.stopLoss, 'Trade setup phải có stopLoss');
  assert(btcSetup.takeProfit1, 'Trade setup phải có takeProfit1');
  assert(btcSetup.takeProfit2, 'Trade setup phải có takeProfit2');
  assert(btcSetup.riskRewardRatio, 'Trade setup phải có riskRewardRatio');
  assert(btcSetup.trapWarning, 'Trade setup phải có trapWarning');
  assert(btcSetup.rationale, 'Trade setup phải có rationale');

  assert(typeof generatedBrief.riskNotice === 'string' && generatedBrief.riskNotice.length > 0, 'Phải có riskNotice');
  console.log(`  ✅ Bản tin tạo thành công:`);
  console.log(`     + Headline: ${generatedBrief.macroHeadline}`);
  console.log(`     + Mood: ${generatedBrief.marketMood} (Score: ${generatedBrief.sentimentScore})`);
  console.log(`     + Focus Coins: ${generatedBrief.focusCoins.map(c => `${c.coin} ($${c.currentPrice})`).join(', ')}`);
  console.log(`     + Setups: ${generatedBrief.actionableTradeSetups.map(s => `${s.coin} (${s.bias})`).join(', ')}\n`);

  // Test 4: Route Dispatcher Endpoints
  console.log('▶ [4/4] Kiểm thử API Routes: GET & POST /api/news/daily-brief...');
  
  function mockReqRes(pathname, method = 'GET', body = {}) {
    const parsedUrl = url.parse(pathname, true);
    let statusCode = 200;
    let headers = {};
    let responseData = null;

    const res = {
      statusCode: 200,
      writeHead(code, h) {
        statusCode = code;
        headers = { ...headers, ...h };
      },
      end(data) {
        responseData = data;
      }
    };

    const req = { method, url: pathname };

    return {
      async execute() {
        const handled = await routeDispatcher(req, res, parsedUrl, body);
        let parsedJson = null;
        if (responseData) {
          try {
            parsedJson = JSON.parse(responseData);
          } catch (e) {
            parsedJson = responseData;
          }
        }
        return { handled, statusCode: res.statusCode || statusCode, json: parsedJson };
      }
    };
  }

  // 4a. GET /api/news/daily-brief
  const getReq = mockReqRes('/api/news/daily-brief', 'GET');
  const getResult = await getReq.execute();
  assert(getResult.handled, 'Route GET /api/news/daily-brief phải được xử lý');
  assert.strictEqual(getResult.statusCode, 200);
  assert(getResult.json && getResult.json.success === true, 'Response phải trả về success: true');
  assert(getResult.json.brief && getResult.json.brief.macroHeadline, 'Response phải có brief hợp lệ');
  console.log(`  ✅ GET /api/news/daily-brief [200 OK] - Trả về bản tin ID #${getResult.json.brief.id}`);

  // 4b. POST /api/news/daily-brief/generate
  const postReq = mockReqRes('/api/news/daily-brief/generate', 'POST');
  const postResult = await postReq.execute();
  assert(postResult.handled, 'Route POST /api/news/daily-brief/generate phải được xử lý');
  assert.strictEqual(postResult.statusCode, 200);
  assert(postResult.json && postResult.json.success === true, 'Response POST phải trả về success: true');
  assert(postResult.json.brief && postResult.json.brief.macroHeadline, 'Response POST phải có brief mới sinh ra');
  console.log(`  ✅ POST /api/news/daily-brief/generate [200 OK] - Sinh mới thành công bản tin ID #${postResult.json.brief.id}`);

  console.log('\n================================================================');
  console.log('🎉 TẤT CẢ 4 BƯỚC KIỂM THỬ BACKEND ĐỀU PASS 100%!');
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
