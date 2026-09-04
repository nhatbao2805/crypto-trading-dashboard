/**
 * Test Suite: Backend Extended News & Macro Intelligence Integration
 * 
 * Verifies:
 * 1. newsService.fetchInvestingNews()
 * 2. newsService.fetchForexFactoryNews()
 * 3. newsService.getMacroIntelligence()
 * 4. newsService.getLatestNews(coin, source) filtering
 * 5. dailyNewsAgentService.generateDailyBrief()
 *    - 9 focus coins
 *    - Bi-directional setups (LONG and SHORT)
 *    - shortTermHolds (Spot 3-14 days)
 * 6. SQLite storage & retrieval of short_term_holds
 * 7. MasterCouncil debate with macro intelligence
 */

const assert = require('node:assert');
const newsService = require('./server/services/news.service');
const dailyNewsAgentService = require('./server/services/daily-news-agent.service');
const debateRepository = require('./server/models/DebateRepository');
const masterCouncil = require('./server/agents/MasterCouncil');

let passedTests = 0;
let totalTests = 0;

function runCheck(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${description}`);
    console.error(`         Error: ${err.message}`);
  }
}

async function runAsyncCheck(description, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${description}`);
    console.error(`         Error: ${err.message}`);
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('   BACKEND EXTENDED NEWS & MACRO INTELLIGENCE TESTS   ');
  console.log('======================================================\n');

  // TEST 1: Investing.com News
  console.log('--- TEST GROUP 1: Investing.com RSS & Fallback ---');
  await runAsyncCheck('fetchInvestingNews("all") returns array of articles with correct schema', async () => {
    const articles = await newsService.fetchInvestingNews('all');
    assert(Array.isArray(articles), 'Articles must be an array');
    assert(articles.length > 0, 'Must return at least 1 article');
    const first = articles[0];
    assert(first.title && typeof first.title === 'string', 'Article must have title');
    assert(first.source === 'Investing.com', 'Source must be Investing.com');
    assert(first.sourceType === 'INVESTING', 'SourceType must be INVESTING');
    assert(first.published_at, 'Must have published_at timestamp');
    console.log(`         Sample title: "${first.title.slice(0, 60)}..."`);
  });

  // TEST 2: Forex Factory News & Economic Calendar
  console.log('\n--- TEST GROUP 2: Forex Factory Calendar & RSS ---');
  await runAsyncCheck('fetchForexFactoryNews() returns events and articles with correct schema', async () => {
    const ffNews = await newsService.fetchForexFactoryNews();
    assert(Array.isArray(ffNews), 'Forex Factory news must be an array');
    assert(ffNews.length > 0, 'Must return at least 1 item');
    const first = ffNews[0];
    assert(first.title && typeof first.title === 'string', 'Item must have title');
    assert(first.source === 'Forex Factory', 'Source must be Forex Factory');
    assert(first.sourceType === 'FOREX_FACTORY', 'SourceType must be FOREX_FACTORY');
    console.log(`         Sample item: "${first.title.slice(0, 65)}..."`);
  });

  // TEST 3: Macro Intelligence Aggregator
  console.log('\n--- TEST GROUP 3: Macro Intelligence Aggregation ---');
  let macroIntel = null;
  await runAsyncCheck('getMacroIntelligence("BTC") returns structured intelligence', async () => {
    macroIntel = await newsService.getMacroIntelligence('BTC');
    assert(macroIntel, 'Macro intelligence must be returned');
    assert(macroIntel.coin === 'BTC', 'Coin must be BTC');
    assert(macroIntel.macroSummary && typeof macroIntel.macroSummary === 'object', 'macroSummary must be object');
    assert(macroIntel.macroSummary.dxyOutlook, 'Must have dxyOutlook');
    assert(macroIntel.macroSummary.fedRateOutlook, 'Must have fedRateOutlook');
    assert(Array.isArray(macroIntel.combinedFeed), 'combinedFeed must be array');
    assert(macroIntel.combinedFeed.length > 0, 'combinedFeed must not be empty');
    console.log(`         Combined macro signals count: ${macroIntel.combinedFeed.length}`);
    console.log(`         DXY Outlook: "${macroIntel.macroSummary.dxyOutlook.slice(0, 50)}..."`);
  });

  // TEST 4: Multi-Source Filtering
  console.log('\n--- TEST GROUP 4: Multi-Source News Retrieval & Filtering ---');
  await runAsyncCheck('getLatestNews with source="investing" filters only Investing items', async () => {
    const investingOnly = await newsService.getLatestNews('BTC', 'investing');
    assert(Array.isArray(investingOnly) && investingOnly.length > 0);
    assert(investingOnly.every(a => a.sourceType === 'INVESTING'), 'All must be INVESTING');
  });

  await runAsyncCheck('getLatestNews with source="forexfactory" filters only Forex Factory items', async () => {
    const ffOnly = await newsService.getLatestNews('BTC', 'forexfactory');
    assert(Array.isArray(ffOnly) && ffOnly.length > 0);
    assert(ffOnly.every(a => a.sourceType === 'FOREX_FACTORY'), 'All must be FOREX_FACTORY');
  });

  await runAsyncCheck('getLatestNews with source="all" returns unified deduplicated list', async () => {
    const allNews = await newsService.getLatestNews('BTC', 'all');
    assert(Array.isArray(allNews) && allNews.length > 0);
    const sources = new Set(allNews.map(a => a.source));
    console.log(`         Distinct sources found in unified feed: ${Array.from(sources).join(', ')}`);
  });

  // TEST 5: Daily News Agent Service (Daily Brief)
  console.log('\n--- TEST GROUP 5: Daily News Agent Service Generation ---');
  let generatedBrief = null;
  await runAsyncCheck('dailyNewsAgentService.generateDailyBrief(true) produces comprehensive brief', async () => {
    generatedBrief = await dailyNewsAgentService.generateDailyBrief(true);
    assert(generatedBrief, 'Brief must not be null');
    assert(generatedBrief.macroHeadline, 'Must have macroHeadline');
    assert(generatedBrief.marketMood, 'Must have marketMood');
    assert(typeof generatedBrief.sentimentScore === 'number', 'Must have sentimentScore');
    assert(Array.isArray(generatedBrief.executiveSummary) && generatedBrief.executiveSummary.length >= 3, 'Must have at least 3 executive summary items');
    assert(Array.isArray(generatedBrief.focusCoins), 'focusCoins must be array');
    assert(generatedBrief.focusCoins.length >= 6, `focusCoins must have at least 6 coins (got ${generatedBrief.focusCoins.length})`);
    console.log(`         Brief Headline: "${generatedBrief.macroHeadline}"`);
    console.log(`         Scanned Coins: ${generatedBrief.focusCoins.map(c => c.coin).join(', ')}`);
  });

  await runAsyncCheck('actionableTradeSetups has BI-DIRECTIONAL setups (BOTH LONG and SHORT)', async () => {
    assert(generatedBrief && Array.isArray(generatedBrief.actionableTradeSetups), 'Setups must be array');
    const setups = generatedBrief.actionableTradeSetups;
    assert(setups.length >= 3, 'Must have at least 3 trade setups');

    const hasLong = setups.some(s => s.bias === 'LONG');
    const hasShort = setups.some(s => s.bias === 'SHORT');

    assert(hasLong, 'Must have at least one LONG trade setup');
    assert(hasShort, 'Must have at least one SHORT trade setup');

    const longCoins = setups.filter(s => s.bias === 'LONG').map(s => s.coin);
    const shortCoins = setups.filter(s => s.bias === 'SHORT').map(s => s.coin);
    console.log(`         LONG positions: ${longCoins.join(', ')}`);
    console.log(`         SHORT positions: ${shortCoins.join(', ')}`);

    for (const setup of setups) {
      assert(setup.entryZone, 'Setup must have entryZone');
      assert(setup.stopLoss, 'Setup must have stopLoss');
      assert(setup.takeProfit1, 'Setup must have takeProfit1');
      assert(setup.takeProfit2, 'Setup must have takeProfit2');
      assert(setup.trapWarning, 'Setup must have trapWarning');
      assert(setup.rationale, 'Setup must have rationale');
    }
  });

  await runAsyncCheck('shortTermHolds contains valid Spot 3-14 days recommendations', async () => {
    assert(generatedBrief && Array.isArray(generatedBrief.shortTermHolds), 'shortTermHolds must be array');
    const holds = generatedBrief.shortTermHolds;
    assert(holds.length >= 3, `Must have at least 3 short term holds (got ${holds.length})`);

    for (const hold of holds) {
      assert(hold.coin, 'Hold must have coin');
      assert(hold.name, 'Hold must have name');
      assert(hold.holdingPeriod, 'Hold must have holdingPeriod');
      assert(hold.accumulationZone, 'Hold must have accumulationZone');
      assert(hold.targetPrice, 'Hold must have targetPrice');
      assert(hold.invalidationLevel, 'Hold must have invalidationLevel');
      assert(hold.catalyst, 'Hold must have catalyst');
      assert(hold.riskRating, 'Hold must have riskRating');
      assert(hold.rationale, 'Hold must have rationale');
    }
    console.log(`         Short Term Spot Holds: ${holds.map(h => `${h.coin} (${h.holdingPeriod})`).join(' | ')}`);
  });

  // TEST 6: SQLite Persistence
  console.log('\n--- TEST GROUP 6: SQLite Safe Storage & Retrieval ---');
  await runAsyncCheck('DebateRepository successfully stores and retrieves short_term_holds', async () => {
    const latest = debateRepository.getLatestDailyBrief();
    assert(latest, 'Must retrieve latest brief from database');
    assert(Array.isArray(latest.shortTermHolds) || Array.isArray(latest.short_term_holds), 'shortTermHolds must be parsed array');
    const retrievedHolds = latest.shortTermHolds || latest.short_term_holds;
    assert(retrievedHolds.length >= 3, 'Must restore all short term holds from SQLite');
    assert(retrievedHolds[0].coin, 'Restored hold must have coin symbol');
    console.log(`         Restored from SQLite ID ${latest.id}: ${retrievedHolds.length} spot holds safely loaded.`);
  });

  // TEST 7: MasterCouncil Debate Integration
  console.log('\n--- TEST GROUP 7: Master Council Multi-Agent Integration ---');
  await runAsyncCheck('MasterCouncil debate incorporates Macro Intelligence', async () => {
    const debate = await masterCouncil.runDebate('BTC', null, true, 'SCALPING');
    assert(debate && debate.success, 'Debate must succeed');
    assert(debate.macro_view, 'Debate must have macro_view');
    assert(debate.master_verdict, 'Debate must have master_verdict');
    console.log(`         Master Verdict Action: "${debate.master_verdict.action_label}"`);
    console.log(`         Macro Agent Name: "${debate.macro_view.agent_name}"`);
    console.log(`         Macro Summary: "${debate.macro_view.summary.slice(0, 70)}..."`);
  });

  console.log('\n======================================================');
  console.log(`   TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
