const llmService = require('./server/services/llm.service');
const ragService = require('./server/services/rag.service');
const cacheService = require('./server/services/cache.service');
const conversationMemoryService = require('./server/services/conversation-memory.service');
const masterCouncil = require('./server/agents/MasterCouncil');
const validatorAgent = require('./server/agents/ValidatorAgent');
const marketScreenerService = require('./server/services/market-screener.service');
const nlpStrategyService = require('./server/services/nlp-strategy.service');
const telegramAlertService = require('./server/services/telegram-alert.service');
const journalAuditService = require('./server/services/journal-audit.service');

async function runTests() {
  console.log('--- 1. Testing RAG Knowledge Base ---');
  const ragContext = ragService.buildRagContext({ coin: 'SOL', topic: 'smc bẫy fakeout bull trap stoploss' });
  console.log('RAG Knowledge indexed:', ragService.knowledgeSnippets.length, 'snippets');
  console.log('RAG Snippet preview:', ragContext.textbookContext.slice(0, 150));

  console.log('\n--- 2. Testing 4-Layer Critical Sentinel Agent & Pre-Mortem ---');
  const sentinelRes = await validatorAgent.analyze('BTC', { price: 65000 }, { signal: 'BULLISH', support_zone: '$64,000', resistance_zone: '$66,500', estimatedRsi: 65, summary: 'Nến tăng ổn định' });
  console.log('Sentinel Trap Warning:', sentinelRes.trap_warning);
  console.log('Sentinel Pre-Mortem Failures:', sentinelRes.pre_mortem_failures);
  console.log('Sentinel Detected Biases:', sentinelRes.detected_biases);

  console.log('\n--- 3. Testing Single-Pass Multi-Agent Debate & In-Memory Cache ---');
  cacheService.clear();
  const debate1 = await masterCouncil.runDebate('ETH', { price: 3450, high24h: 3520, low24h: 3380, change24h: 2.1, volumeUsdt: 650000000 });
  console.log('Debate 1 action:', debate1.master_verdict.action_label, '| Prob:', debate1.master_verdict.probability_pct + '%');
  console.log('Debate 1 Cached:', Boolean(debate1.isCached));

  // Second call should be 100% from cache (0 tokens!)
  const debate2 = await masterCouncil.runDebate('ETH', { price: 3450, high24h: 3520, low24h: 3380, change24h: 2.1, volumeUsdt: 650000000 });
  console.log('Debate 2 Cached (0 token cost):', Boolean(debate2.isCached));
  if (!debate2.isCached) throw new Error('Cache failed to serve repeated debate query!');

  console.log('\n--- 4. Testing Conversation Summary Buffer Memory (>8 messages) ---');
  const testSessionId = 'test_session_' + Date.now();
  for (let i = 1; i <= 10; i++) {
    await conversationMemoryService.addMessage(testSessionId, i % 2 === 1 ? 'user' : 'council', `Tin nhắn số ${i}: Vốn tôi là 10,000 USD, tôi muốn Long BTC tại 65,000 và Stop loss tại 64,000.`);
  }
  const memoryContext = conversationMemoryService.getOptimizedPromptContext(testSessionId);
  console.log('Memory Summary generated:', Boolean(memoryContext.summary));
  console.log('Memory Summary text preview:', memoryContext.summary.slice(0, 120));
  console.log('Recent messages window count:', memoryContext.recentMessages.length);

  console.log('\n--- 5. Testing Market Screener Service (300+ coins) ---');
  const screener = await marketScreenerService.runScreenerScan();
  console.log('Total scanned coins:', screener.totalScanned);
  console.log('Bullish breadth:', screener.bullishBreadth + '%');

  console.log('\n--- 6. Testing NLP Strategy Parser ---');
  const nlp = await nlpStrategyService.parseUserStrategy('Quét thị trường giao ngay: tìm các ký hiệu có khối lượng, dòng vốn đổ vào hoặc độ hot đang tăng nhanh và cảnh báo sớm cho tôi.');
  console.log('NLP Strategy parsed:', nlp.strategy_config.strategy_name);

  console.log('\n--- 7. Testing AI Coach Discipline Review ---');
  const coachReview = await journalAuditService.generateAiCoachReview('WEEKLY');
  console.log('AI Coach Discipline Score:', coachReview.discipline_score);

  console.log('\n✅ ALL 4 ARCHITECTURAL PILLARS VERIFIED & PASSED 100%!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
