const http = require('http');
const { createApp } = require('./server/app.js');

const app = createApp();
const server = app.listen(3456, async () => {
  console.log('Test server running on port 3456');

  function getUrl(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const opt = {
        hostname: '127.0.0.1',
        port: 3456,
        path,
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      const req = http.request(opt, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, data: raw, contentType: res.headers['content-type'] });
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  try {
    console.log('--- 1. Testing GET /api/theory ---');
    const r1 = await getUrl('/api/theory');
    console.log('Status:', r1.status, 'Type:', r1.contentType);
    console.log('Data preview:', r1.data.slice(0, 150));

    console.log('\n--- 2. Testing GET /api/theory/chapter/1 ---');
    const r2 = await getUrl('/api/theory/chapter/1');
    console.log('Status:', r2.status, 'Type:', r2.contentType);
    console.log('Data preview:', r2.data.slice(0, 150));

    console.log('\n--- 3. Testing GET /api/ai-trader/screener/live ---');
    const r3 = await getUrl('/api/ai-trader/screener/live');
    console.log('Status:', r3.status, 'Type:', r3.contentType);
    console.log('Data preview:', r3.data.slice(0, 150));

    console.log('\n--- 4. Testing POST /api/ai-trader/nlp/parse-strategy ---');
    const r4 = await getUrl('/api/ai-trader/nlp/parse-strategy', 'POST', { prompt: 'Quét thị trường giao ngay' });
    console.log('Status:', r4.status, 'Type:', r4.contentType);
    console.log('Data preview:', r4.data.slice(0, 150));

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
