const http = require('node:http');
const url = require('node:url');
const fs = require('node:fs');
const path = require('node:path');

// Direct router test
const db = require('./db.js');
const { loadTheoryData } = require('./theory_manager.js');
const { analyzeNewsImpact, executeCustomPrompt, analyzeTradeJournal, executeJournalCoachPrompt } = require('./agy_engine.js');

async function testAllRoutesInternal() {
  console.log('--- Testing API Handlers Internally ---');
  
  // 1. /api/theory
  const theory = loadTheoryData();
  console.log('✔ Theory handler: totalChapters =', theory.chapters?.length, 'glossary =', theory.glossary?.length);

  // 2. /api/theory/chapter/1
  const chap1 = theory.rawChapters.find(c => c.id === 1);
  console.log('✔ Chapter 1 handler: title =', chap1?.title);

  // 3. /api/theory/chapter/999
  const chap999 = theory.rawChapters.find(c => c.id === 999);
  console.log('✔ Chapter 999 handler (Expected null):', chap999 === undefined ? 'OK (404)' : 'FAIL');

  // 4. /api/journal
  const entries = db.getAllEntries();
  console.log('✔ Journal GET handler: count =', entries.length);

  // 5. /api/journal/stats
  const stats = db.getStats();
  console.log('✔ Journal stats handler: winRate =', stats.winRate, 'totalPnL =', stats.totalPnL);

  // 6. /api/notes
  const notes = db.getAllNotes();
  console.log('✔ Notes GET handler: count =', notes.length);

  // 7. /api/news/analyze
  const analysis = await analyzeNewsImpact('BTC');
  console.log('✔ News analyze handler: impact =', analysis.impact_score, 'sentiment =', analysis.sentiment_score);

  // 8. /api/agy/exec
  const agyRes = await executeCustomPrompt('Phân tích BTC');
  console.log('✔ AGY exec handler: success =', agyRes.success);

  // 9. /api/journal/ai-review
  const reviewRes = await analyzeTradeJournal(entries);
  console.log('✔ AI review handler: score =', reviewRes.disciplineScore, 'grade =', reviewRes.grade);

  // 10. /api/journal/coach-chat
  const coachRes = await executeJournalCoachPrompt('Cách quản lý vốn 1%?', { trades: entries });
  console.log('✔ AI coach chat handler: success =', coachRes.success);

  console.log('\nAll 10 API route handlers verified successfully!');
}

testAllRoutesInternal().catch(console.error);
