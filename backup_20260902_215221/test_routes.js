const http = require('node:http');

// Helper to make local requests
function makeRequest(path, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: data ? JSON.parse(data) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function testHttpRoutes() {
  console.log('Testing HTTP Endpoints...');
  
  // Test 1: GET /api/theory
  const resTheory = await makeRequest('/api/theory');
  console.log('GET /api/theory ->', resTheory.status, resTheory.body?.totalChapters ? `(${resTheory.body.totalChapters} chaps)` : 'FAIL');

  // Test 2: GET /api/theory/chapter/1
  const resChap1 = await makeRequest('/api/theory/chapter/1');
  console.log('GET /api/theory/chapter/1 ->', resChap1.status, resChap1.body?.id === 1 ? 'OK' : 'FAIL');

  // Test 3: GET /api/theory/chapter/999 (404 expected)
  const resChap999 = await makeRequest('/api/theory/chapter/999');
  console.log('GET /api/theory/chapter/999 ->', resChap999.status, '(Expected 404)');

  // Test 4: GET /api/journal
  const resJournal = await makeRequest('/api/journal');
  console.log('GET /api/journal ->', resJournal.status, `(${resJournal.body?.entries?.length} entries)`);

  // Test 5: GET /api/journal/stats
  const resStats = await makeRequest('/api/journal/stats');
  console.log('GET /api/journal/stats ->', resStats.status, `(Winrate: ${resStats.body?.stats?.winRate}%)`);

  // Test 6: POST /api/journal (Valid)
  const resCreate = await makeRequest('/api/journal', { method: 'POST' }, {
    coin: 'SOL', type: 'LONG', entry_price: 130, position_size: 500, date: '2026-09-02'
  });
  console.log('POST /api/journal ->', resCreate.status, `(Created trade ID: ${resCreate.body?.entry?.id})`);

  // Test 7: GET /api/notes
  const resNotes = await makeRequest('/api/notes');
  console.log('GET /api/notes ->', resNotes.status, `(${resNotes.body?.notes?.length} notes)`);

  // Test 8: POST /api/news/analyze
  const resAnalyze = await makeRequest('/api/news/analyze', { method: 'POST' }, { coin: 'BTC' });
  console.log('POST /api/news/analyze ->', resAnalyze.status, `(Score: ${resAnalyze.body?.analysis?.sentiment_score}%)`);

  // Test 9: POST /api/agy/exec
  const resAgy = await makeRequest('/api/agy/exec', { method: 'POST' }, { prompt: 'Phân tích nhanh BTC' });
  console.log('POST /api/agy/exec ->', resAgy.status, resAgy.body?.success ? 'OK' : 'FAIL');

  // Clean up test trade
  if (resCreate.body?.entry?.id) {
    await makeRequest(`/api/journal/${resCreate.body.entry.id}`, { method: 'DELETE' });
  }

  console.log('Route tests finished.');
}

testHttpRoutes().catch(console.error);
