const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');
const { spawn } = require('node:child_process');

const db = require('./db.js');
const { loadTheoryData } = require('./theory_manager.js');
const { getLivePrice, fetchLatestCryptoNews, analyzeNewsImpact, runAgyTerminalStream, executeCustomPrompt, analyzeTradeJournal, executeJournalCoachPrompt } = require('./agy_engine.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// MIME types mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

// Helper: send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Helper: parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) { // 50MB max
        reject(new Error('Body payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

// Helper: parse raw multipart or base64 uploads
function handleImageUpload(body) {
  if (body.base64Data) {
    const matches = body.base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let ext = '.png';
    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
      else if (mime.includes('webp')) ext = '.webp';
      else if (mime.includes('gif')) ext = '.gif';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(body.base64Data, 'base64');
    }

    const filename = `chart_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return {
      success: true,
      url: `/uploads/${filename}`,
      filename,
      size: buffer.length
    };
  }
  return { success: false, error: 'No image data provided' };
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // --- API ROUTES ---

  // 1. Module 1: Theory APIs
  if (pathname === '/api/theory' && method === 'GET') {
    const data = loadTheoryData();
    return sendJson(res, 200, data);
  }

  if (pathname.startsWith('/api/theory/chapter/') && method === 'GET') {
    const chapId = parseInt(pathname.split('/')[4], 10);
    const data = loadTheoryData();
    const chapter = data.rawChapters ? data.rawChapters.find(c => c.id === chapId) : null;
    if (chapter) {
      return sendJson(res, 200, chapter);
    }
    return sendJson(res, 404, { error: 'Chapter not found' });
  }

  if (pathname === '/api/theory/glossary' && method === 'GET') {
    const data = loadTheoryData();
    return sendJson(res, 200, { glossary: data.glossary || [] });
  }

  // 2. Module 2: Journal APIs
  if (pathname === '/api/journal' && method === 'GET') {
    const entries = db.getAllEntries(parsedUrl.query);
    return sendJson(res, 200, { entries });
  }

  if (pathname === '/api/journal' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const entry = db.createEntry(body);
      return sendJson(res, 201, { success: true, entry });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // AI Review Endpoints
  if (pathname === '/api/journal/ai-review' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const { periodType = 'ALL', startDate, endDate, coinFilter = 'ALL', save = true, livePrices = {} } = body;

      // Filter entries according to criteria
      const filters = {};
      if (coinFilter && coinFilter !== 'ALL') filters.coin = coinFilter;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const entries = db.getAllEntries(filters);
      const reviewResult = await analyzeTradeJournal(entries, { periodType, startDate, endDate, coinFilter, livePrices });

      let savedRecord = null;
      if (save && entries.length > 0) {
        savedRecord = db.saveTradeReview({
          period_type: periodType,
          start_date: startDate,
          end_date: endDate,
          coin_filter: coinFilter,
          total_trades: reviewResult.totalTrades,
          discipline_score: reviewResult.disciplineScore,
          analysis_data: reviewResult
        });
      }

      return sendJson(res, 200, { success: true, review: reviewResult, savedRecord });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // AI Journal Coach Chat Assistant Endpoint
  if (pathname === '/api/journal/coach-chat' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const { prompt, livePrices = {} } = body;
      const trades = db.getAllEntries();
      const review = await analyzeTradeJournal(trades, { livePrices });
      const coachRes = await executeJournalCoachPrompt(prompt, { trades, review, livePrices });
      return sendJson(res, 200, coachRes);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Quick close trade at live Binance price
  if (pathname.startsWith('/api/journal/close-live/') && method === 'POST') {
    try {
      const id = pathname.split('/')[4];
      const entry = db.getEntryById(id);
      if (!entry) return sendJson(res, 404, { error: 'Trade not found' });

      const body = await parseBody(req);
      const coin = (entry.coin || 'BTC').toUpperCase();
      let livePrice = Number(body.livePrice);

      if (!livePrice || livePrice <= 0) {
        const liveMarket = await getLivePrice(coin);
        livePrice = liveMarket.price;
      }

      if (!livePrice || livePrice <= 0) {
        return sendJson(res, 400, { error: 'Cannot determine live Binance price' });
      }

      const isShort = entry.type.includes('SHORT') || entry.type.includes('SELL');
      let pnlPct = 0;
      let pnlAmt = 0;

      if (entry.entry_price > 0) {
        if (isShort) {
          pnlPct = ((entry.entry_price - livePrice) / entry.entry_price) * 100;
        } else {
          pnlPct = ((livePrice - entry.entry_price) / entry.entry_price) * 100;
        }
        pnlAmt = entry.position_size > 0 ? (entry.position_size * (pnlPct / 100)) : 0;
      }

      let newStatus = 'BREAKEVEN';
      if (pnlAmt > 0) newStatus = 'WIN';
      else if (pnlAmt < 0) newStatus = 'LOSS';

      const updated = db.updateEntry(id, {
        ...entry,
        exit_price: Number(livePrice.toFixed(4)),
        status: newStatus,
        pnl_amount: Number(pnlAmt.toFixed(2)),
        pnl_percent: Number(pnlPct.toFixed(2)),
        notes: (entry.notes || '') + `\n[Chốt lệnh Live Binance tại giá $${livePrice} vào lúc ${new Date().toLocaleString('vi-VN')}]`
      });

      return sendJson(res, 200, { success: true, entry: updated });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/journal/ai-review/history' && method === 'GET') {
    const history = db.getTradeReviews();
    return sendJson(res, 200, { history });
  }

  // Practice Progress Sync API (Bug 5 fix)
  if (pathname === '/api/practice/progress' && method === 'GET') {
    const progress = db.getPracticeProgress();
    return sendJson(res, 200, { success: true, progress });
  }

  if (pathname === '/api/practice/progress' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      db.savePracticeProgress(body);
      return sendJson(res, 200, { success: true });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname.startsWith('/api/journal/ai-review/') && method === 'DELETE') {
    const id = pathname.split('/')[4];
    const deleted = db.deleteTradeReview(id);
    return sendJson(res, 200, { success: deleted, id });
  }

  if (pathname.startsWith('/api/journal/') && pathname.split('/').length === 4) {
    const id = pathname.split('/')[3];

    if (id === 'stats' && method === 'GET') {
      const stats = db.getStats();
      return sendJson(res, 200, { stats });
    }

    if (method === 'GET') {
      const entry = db.getEntryById(id);
      if (!entry) return sendJson(res, 404, { error: 'Entry not found' });
      return sendJson(res, 200, { entry });
    }

    if (method === 'PUT') {
      try {
        const body = await parseBody(req);
        const updated = db.updateEntry(id, body);
        if (!updated) return sendJson(res, 404, { error: 'Entry not found' });
        return sendJson(res, 200, { success: true, entry: updated });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (method === 'DELETE') {
      const deleted = db.deleteEntry(id);
      if (!deleted) return sendJson(res, 404, { error: 'Entry not found' });
      return sendJson(res, 200, { success: true, id });
    }
  }


  // --- TRADING & PSYCHOLOGY NOTES APIS ---
  if (pathname === '/api/notes' && method === 'GET') {
    const notes = db.getAllNotes(parsedUrl.query);
    return sendJson(res, 200, { notes });
  }

  if (pathname === '/api/notes' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const note = db.createNote(body);
      return sendJson(res, 201, { success: true, note });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  if (pathname.startsWith('/api/notes/') && pathname.split('/').length >= 4) {
    const segments = pathname.split('/');
    const id = segments[3];
    const action = segments[4];

    if (action === 'pin' && method === 'POST') {
      const updated = db.togglePinNote(id);
      if (!updated) return sendJson(res, 404, { error: 'Note not found' });
      return sendJson(res, 200, { success: true, note: updated });
    }

    if (method === 'GET') {
      const note = db.getNoteById(id);
      if (!note) return sendJson(res, 404, { error: 'Note not found' });
      return sendJson(res, 200, { note });
    }

    if (method === 'PUT') {
      try {
        const body = await parseBody(req);
        const updated = db.updateNote(id, body);
        if (!updated) return sendJson(res, 404, { error: 'Note not found' });
        return sendJson(res, 200, { success: true, note: updated });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (method === 'DELETE') {
      const deleted = db.deleteNote(id);
      if (!deleted) return sendJson(res, 404, { error: 'Note not found' });
      return sendJson(res, 200, { success: true, id });
    }
  }

  // Image Upload API (Supports Base64 and Clipboard pastes)
  if (pathname === '/api/upload' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const result = handleImageUpload(body);
      return sendJson(res, result.success ? 200 : 400, result);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 3. Module 3: News & AGY Terminal Integration APIs
  if (pathname === '/api/news/stream' && method === 'GET') {
    const coin = (parsedUrl.query.coin || 'BTC').toUpperCase();
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const sendData = (payload) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    sendData({ type: 'start', coin, time: new Date().toISOString() });

    runAgyTerminalStream(
      coin,
      (logChunk) => {
        sendData({ type: 'log', data: logChunk });
      },
      (err, finalAnalysis) => {
        if (finalAnalysis) {
          db.saveNewsAnalysis(finalAnalysis);
          sendData({ type: 'complete', data: finalAnalysis });
        } else {
          sendData({ type: 'error', data: err ? err.message : 'Analysis failed' });
        }
        res.end();
      }
    );
    return;
  }

  if (pathname === '/api/news/analyze' && (method === 'GET' || method === 'POST')) {
    try {
      let coin = 'BTC';
      let marketOverride = null;
      let articlesOverride = null;

      if (method === 'POST') {
        const body = await parseBody(req);
        coin = body.coin || 'BTC';
        marketOverride = body.marketOverride || null;
        articlesOverride = body.articlesOverride || null;
      } else {
        coin = parsedUrl.query.coin || 'BTC';
      }
      coin = coin.toUpperCase();
      
      const analysis = await analyzeNewsImpact(coin, articlesOverride, marketOverride);
      db.saveNewsAnalysis(analysis);

      return sendJson(res, 200, { success: true, analysis });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/news/history' && method === 'GET') {
    const coin = parsedUrl.query.coin || null;
    const history = db.getNewsHistory(coin);
    return sendJson(res, 200, { history });
  }

  if (pathname === '/api/market/ticker' && method === 'GET') {
    const coin = parsedUrl.query.coin || 'BTC';
    const ticker = await getLivePrice(coin);
    return sendJson(res, 200, { ticker });
  }

  // Custom AGY Prompt Execution & Chat History APIs
  if (pathname === '/api/agy/exec' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const prompt = body.prompt || '';
      const coin = body.coin || 'BTC';
      const clientMarket = body.clientMarket || null;
      
      if (!prompt) {
        return sendJson(res, 400, { error: 'Prompt is required' });
      }

      const result = await executeCustomPrompt(prompt, coin, clientMarket);
      if (result.success && result.output) {
        db.saveChatMessage(result.coin || coin, prompt, result.output);
      }

      return sendJson(res, 200, result);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/agy/history' && method === 'GET') {
    const coin = parsedUrl.query.coin || null;
    const history = db.getChatHistory(coin);
    return sendJson(res, 200, { history });
  }

  if (pathname === '/api/agy/history/clear' && method === 'POST') {
    const coin = parsedUrl.query.coin || null;
    db.clearChatHistory(coin);
    return sendJson(res, 200, { success: true });
  }

  // --- STATIC FILE SERVING ---
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  let filePath;

  if (reqPath.startsWith('/uploads/')) {
    filePath = path.join(UPLOADS_DIR, reqPath.replace('/uploads/', ''));
  } else {
    filePath = path.join(PUBLIC_DIR, reqPath);
  }

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR) && !filePath.startsWith(UPLOADS_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback for SPA routing to index.html if not an API or asset
      if (!reqPath.includes('.')) {
        const fallbackPath = path.join(PUBLIC_DIR, 'index.html');
        fs.readFile(fallbackPath, (readErr, content) => {
          if (readErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          return res.end(content);
        });
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('File Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Crypto Trading Dashboard Server is running!`);
  console.log(`🌐 Dashboard URL: http://localhost:${PORT}`);
  console.log(`📂 Database: data/dashboard.sqlite`);
  console.log(`📁 Uploads : uploads/`);
  console.log(`⚡ AGY Engine: /opt/homebrew/bin/agy ready`);
  console.log(`======================================================\n`);
});
