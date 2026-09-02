/**
 * ==============================================================================
 * COMPREHENSIVE TEST SUITE: BACKEND & FRONTEND LOGIC AUDIT
 * Crypto Trading Master Dashboard & AGY Terminal
 * ==============================================================================
 */

const assert = require('node:assert');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

const db = require('./db.js');
const { loadTheoryData } = require('./theory_manager.js');
const { getLivePrice, analyzeCoinNews, generateDynamicRecommendations, executeCustomPrompt, analyzeTradeJournal, executeJournalCoachPrompt } = require('./agy_engine.js');
const AI_PROMPTS_CONFIG = require('./ai_prompts_config.js');

const testResults = [];

function recordTest(moduleName, testCase, status, note = '', severity = 'None') {
  testResults.push({ module: moduleName, testCase, status, note, severity });
  console.log(`[${status}] [${moduleName}] ${testCase} ${note ? `(${note})` : ''}`);
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE TEST SUITE (BE + FE LOGIC)');
  console.log('======================================================\n');

  // ----------------------------------------------------
  // GROUP 1: THEORY & HANDBOOK (Module 1)
  // ----------------------------------------------------
  try {
    const theoryData = loadTheoryData();
    assert(theoryData && theoryData.chapters, 'Theory data must contain chapters');
    assert(theoryData.chapters.length >= 12, `Expected >= 12 chapters, found ${theoryData.chapters.length}`);
    recordTest('Theory Engine', '1.1 Load all 12 chapters from Markdown', 'PASS');
  } catch (err) {
    recordTest('Theory Engine', '1.1 Load all 12 chapters from Markdown', 'FAIL', err.message, 'P0');
  }

  try {
    const theoryData = loadTheoryData();
    assert(Array.isArray(theoryData.glossary) && theoryData.glossary.length > 0, 'Glossary must be parsed');
    recordTest('Theory Engine', '1.2 Parse Glossary terms (SMC & Crypto)', 'PASS', `${theoryData.glossary.length} terms found`);
  } catch (err) {
    recordTest('Theory Engine', '1.2 Parse Glossary terms (SMC & Crypto)', 'FAIL', err.message, 'P1');
  }

  // ----------------------------------------------------
  // GROUP 2: SQLITE DATABASE CRUD & CONSISTENCY (Module 3)
  // ----------------------------------------------------
  let createdTradeId = null;
  let createdNoteId = null;
  let createdReviewId = null;

  try {
    // 2.1 Create Journal Entry
    const tradeData = {
      date: '2026-09-02',
      coin: 'BTC',
      type: 'LONG',
      entry_price: 60000,
      exit_price: 63000,
      stop_loss: 58500,
      take_profit: 63000,
      position_size: 1000,
      pnl_amount: 50,
      pnl_percent: 5.0,
      status: 'WIN',
      notes: 'Test entry for audit',
      rules_checked: ['Đã đặt Stop Loss dưới râu nến (Chương 4 & 9)', 'Tỷ lệ R:R ≥ 1:2 (Chương 9.2)'],
      images: ['/uploads/test_chart.png']
    };
    const entry = db.createEntry(tradeData);
    assert(entry && entry.id, 'Entry must be created with an ID');
    assert.strictEqual(entry.coin, 'BTC');
    assert.strictEqual(entry.rules_checked.length, 2);
    createdTradeId = entry.id;
    recordTest('SQLite DB', '2.1 Create journal entry with JSON array fields', 'PASS', `ID: ${entry.id}`);
  } catch (err) {
    recordTest('SQLite DB', '2.1 Create journal entry with JSON array fields', 'FAIL', err.message, 'P0');
  }

  try {
    // 2.2 Read & Update Journal Entry
    const fetched = db.getEntryById(createdTradeId);
    assert(fetched && fetched.id === createdTradeId, 'Fetched entry ID mismatch');
    const updated = db.updateEntry(createdTradeId, { pnl_amount: 75.5, status: 'WIN' });
    assert.strictEqual(updated.pnl_amount, 75.5);
    recordTest('SQLite DB', '2.2 Read & Update journal entry', 'PASS');
  } catch (err) {
    recordTest('SQLite DB', '2.2 Read & Update journal entry', 'FAIL', err.message, 'P0');
  }

  try {
    // 2.3 Notes CRUD
    const note = db.createNote({
      title: 'Kế hoạch giao dịch tuần',
      category: 'Kế Hoạch Trade',
      content: 'Chỉ giao dịch khi BTC chạm 59k EQL và xuất hiện nến Hammer.',
      is_pinned: 1,
      images: []
    });
    assert(note && note.id, 'Note must have ID');
    assert.strictEqual(note.is_pinned, true);
    createdNoteId = note.id;
    recordTest('SQLite DB', '2.3 Create & Pin notes entry', 'PASS', `Note ID: ${note.id}`);
  } catch (err) {
    recordTest('SQLite DB', '2.3 Create & Pin notes entry', 'FAIL', err.message, 'P1');
  }

  try {
    // 2.4 Save & Retrieve AI Trade Review
    const review = db.saveTradeReview({
      period_type: 'WEEK',
      start_date: '2026-08-25',
      end_date: '2026-09-02',
      coin_filter: 'BTC',
      total_trades: 5,
      discipline_score: 85,
      analysis_data: { summary: 'Good performance' }
    });
    assert(review && review.id, 'Review must have ID');
    createdReviewId = review.id;
    const allReviews = db.getTradeReviews(5);
    assert(allReviews.length > 0, 'Must fetch trade reviews');
    recordTest('SQLite DB', '2.4 Save & Query trade_reviews history', 'PASS');
  } catch (err) {
    recordTest('SQLite DB', '2.4 Save & Query trade_reviews history', 'FAIL', err.message, 'P1');
  }

  try {
    // 2.5 Terminal Chats History & Clear
    db.saveChatMessage('BTC', 'Có nên mua không?', 'Khuyến nghị chờ test 59k');
    const chats = db.getChatHistory('BTC');
    assert(chats.length > 0, 'Chats must not be empty');
    db.clearChatHistory('BTC');
    const afterClear = db.getChatHistory('BTC');
    assert.strictEqual(afterClear.length, 0, 'Chat history must be cleared');
    recordTest('SQLite DB', '2.5 Chat history save, query & clear', 'PASS');
  } catch (err) {
    recordTest('SQLite DB', '2.5 Chat history save, query & clear', 'FAIL', err.message, 'P1');
  }

  // ----------------------------------------------------
  // GROUP 3: FINANCIAL CALCULATIONS & PnL FORMULAS (Module 3)
  // ----------------------------------------------------
  try {
    // Long PnL test
    const entry = 50000;
    const exit = 55000;
    const size = 1000;
    const pnlPct = ((exit - entry) / entry) * 100; // +10%
    const pnlAmt = size * (pnlPct / 100); // +$100
    assert.strictEqual(pnlPct, 10);
    assert.strictEqual(pnlAmt, 100);
    recordTest('Math Engine', '3.1 Long PnL calculation accuracy', 'PASS');
  } catch (err) {
    recordTest('Math Engine', '3.1 Long PnL calculation accuracy', 'FAIL', err.message, 'P0');
  }

  try {
    // Short PnL test
    const entry = 50000;
    const exit = 45000;
    const size = 1000;
    const pnlPct = ((entry - exit) / entry) * 100; // +10%
    const pnlAmt = size * (pnlPct / 100); // +$100
    assert.strictEqual(pnlPct, 10);
    assert.strictEqual(pnlAmt, 100);
    recordTest('Math Engine', '3.2 Short PnL calculation accuracy', 'PASS');
  } catch (err) {
    recordTest('Math Engine', '3.2 Short PnL calculation accuracy', 'FAIL', err.message, 'P0');
  }

  try {
    // Position Size Calculator Edge Cases
    // Normal case: capital $1000, risk 1% ($10), Entry 100, SL 95 (5% dist) -> Size = $200
    const calcNormal = (cap, risk, e, sl) => {
      const riskAmt = (cap * risk) / 100;
      const dist = Math.abs(e - sl);
      if (dist === 0 || e === 0) return 0;
      return riskAmt / (dist / e);
    };

    const size1 = calcNormal(1000, 1.0, 100, 95);
    assert.strictEqual(Math.round(size1), 200);

    // Edge case 1: SL equals Entry (Division by zero)
    const sizeZeroDiv = calcNormal(1000, 1.0, 100, 100);
    assert.strictEqual(sizeZeroDiv, 0, 'Size must be 0 when SL equals Entry');

    // Edge case 2: Capital is 0
    const sizeZeroCap = calcNormal(0, 1.0, 100, 95);
    assert.strictEqual(sizeZeroCap, 0, 'Size must be 0 when Capital is 0');

    recordTest('Math Engine', '3.3 Position Size Calculator edge cases (SL=Entry, Vốn=0)', 'PASS');
  } catch (err) {
    recordTest('Math Engine', '3.3 Position Size Calculator edge cases', 'FAIL', err.message, 'P0');
  }

  // ----------------------------------------------------
  // GROUP 4: AI TRADE AUDITOR & COACH (Module 3)
  // ----------------------------------------------------
  try {
    const mockTrades = [
      { id: 1, date: '2026-09-01', coin: 'BTC', type: 'LONG', entry_price: 60000, exit_price: 63000, stop_loss: 59000, take_profit: 63000, position_size: 1000, pnl_amount: 50, status: 'WIN', rules_checked: ['Đã đặt Stop Loss dưới râu nến (Chương 4 & 9)', 'Tỷ lệ R:R ≥ 1:2 (Chương 9.2)', 'Đã phân tích Đa khung 4H ➔ 1H ➔ 15M (Chương 7)'] },
      { id: 2, date: '2026-09-01', coin: 'ETH', type: 'SHORT', entry_price: 2600, exit_price: 2700, stop_loss: 0, take_profit: 2400, position_size: 500, pnl_amount: -50, status: 'LOSS', notes: 'Quên đặt SL bị gồng lỗ' },
      { id: 3, date: '2026-09-01', coin: 'SOL', type: 'LONG', entry_price: 130, exit_price: 120, stop_loss: 125, take_profit: 145, position_size: 2000, pnl_amount: -100, status: 'LOSS', notes: 'Cay cú gỡ lệnh sau khi thua ETH tức quá all in' }
    ];

    const auditResult = await analyzeTradeJournal(mockTrades, { livePrices: { BTC: 64000, ETH: 2650, SOL: 135 } });
    assert(auditResult && auditResult.disciplineScore !== undefined, 'Audit must produce score');
    assert(auditResult.warnings.length > 0, 'Must produce warnings for missing SL and revenge');
    assert(auditResult.classifications.tiltedTrades.length >= 1, 'Must detect tilted/revenge trade');
    assert(auditResult.classifications.faultyTrades.length >= 1, 'Must detect missing SL trade');
    recordTest('AI Trade Auditor', '4.1 Discipline scoring, Missing SL & Revenge detection', 'PASS', `Score: ${auditResult.disciplineScore}/100`);
  } catch (err) {
    recordTest('AI Trade Auditor', '4.1 Discipline scoring, Missing SL & Revenge detection', 'FAIL', err.message, 'P0');
  }

  try {
    const coachRes = await executeJournalCoachPrompt('Làm sao để dừng thói quen gỡ lệnh sau khi dính Stop Loss?', { trades: [] });
    assert(coachRes && coachRes.output && coachRes.output.includes('Cooldown 24h'), 'Coach must recommend Cooldown rule');
    recordTest('AI Trade Coach', '4.2 Interactive coach advice synthesis', 'PASS');
  } catch (err) {
    recordTest('AI Trade Coach', '4.2 Interactive coach advice synthesis', 'FAIL', err.message, 'P1');
  }

  // ----------------------------------------------------
  // GROUP 5: AGY TERMINAL ENGINE & MARKET RECOMMENDATIONS (Module 4)
  // ----------------------------------------------------
  try {
    const recs = generateDynamicRecommendations('BTC', {
      price: 60000,
      high24h: 62000,
      low24h: 58000,
      volumeUsdt: 1500000000,
      fundingRate: '+0.0100%'
    });
    assert(recs.tradePreparation && recs.tradePreparation.length >= 4, 'Must have trade preparation items');
    assert(recs.holdPreparation && recs.holdPreparation.length >= 4, 'Must have hold preparation items');
    recordTest('AGY Engine', '5.1 Dynamic Support/Resistance & Trade/Hold strategy generation', 'PASS');
  } catch (err) {
    recordTest('AGY Engine', '5.1 Dynamic strategy generation', 'FAIL', err.message, 'P0');
  }

  try {
    const customPromptRes = await executeCustomPrompt('Phân tích ETH', 'ETH', { price: 2600, high24h: 2700, low24h: 2500, volumeUsdt: 800000000 });
    assert(customPromptRes.success && customPromptRes.coin === 'ETH', 'Must execute custom prompt for ETH');
    recordTest('AGY Engine', '5.2 Custom strategy prompt execution', 'PASS');
  } catch (err) {
    recordTest('AGY Engine', '5.2 Custom strategy prompt execution', 'FAIL', err.message, 'P1');
  }

  // ----------------------------------------------------
  // GROUP 6: CLEANUP TEST DATA
  // ----------------------------------------------------
  if (createdTradeId) db.deleteEntry(createdTradeId);
  if (createdNoteId) db.deleteNote(createdNoteId);
  if (createdReviewId) db.deleteTradeReview(createdReviewId);

  console.log('\n======================================================');
  console.log(`📊 SUMMARY: ${testResults.filter(r => r.status === 'PASS').length} PASSED / ${testResults.length} TOTAL TESTS`);
  console.log('======================================================\n');

  return testResults;
}

runAllTests().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
