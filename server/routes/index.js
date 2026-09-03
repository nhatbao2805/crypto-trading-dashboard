const handleTheoryRoutes = require('./theory.routes');
const handleJournalRoutes = require('./journal.routes');
const handleNotesRoutes = require('./notes.routes');
const handleNewsRoutes = require('./news.routes');
const handleAiTraderRoutes = require('./ai-trader.routes');
const handlePaperTraderRoutes = require('./paper-trader.routes');

async function routeDispatcher(req, res, parsedUrl, body) {
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const query = parsedUrl.query;

  // Enhance res with helper methods
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };

  res.json = function(data) {
    this.writeHead(this.statusCode || 200, { 'Content-Type': 'application/json; charset=utf-8' });
    this.end(JSON.stringify(data));
  };

  // 1. Theory & Practice Module Routes
  if (pathname.startsWith('/api/theory') || pathname.startsWith('/api/practice')) {
    const handled = await handleTheoryRoutes(req, res, pathname, method, query, body);
    if (handled !== false) return true;
  }

  // 2. Journal Module Routes
  if (pathname.startsWith('/api/journal')) {
    const handled = await handleJournalRoutes(req, res, pathname, method, query, body);
    if (handled !== false) return true;
  }

  // 3. Notes Module Routes
  if (pathname.startsWith('/api/notes')) {
    const handled = await handleNotesRoutes(req, res, pathname, method, query, body);
    if (handled !== false) return true;
  }

  // 4. News & AGY Routes
  if (pathname.startsWith('/api/news') || pathname.startsWith('/api/market') || pathname.startsWith('/api/agy')) {
    const handled = await handleNewsRoutes(req, res, pathname, method, query, body);
    if (handled !== false) return true;
  }

  // 5. AI Trader Multi-Agent Council Routes
  if (pathname.startsWith('/api/ai-trader') || pathname.startsWith('/api/agy/history')) {
    const handled = await handleAiTraderRoutes(req, res, pathname, method, query, body);
    if (handled !== false) return true;
  }

  // 6. Human Paper Trader Routes
  if (pathname.startsWith('/api/paper-trader')) {
    const handled = await handlePaperTraderRoutes(req, res, pathname, method, query, body);
    if (handled !== false) return true;
  }

  // Fallback for unhandled API routes
  if (pathname.startsWith('/api/')) {
    res.status(404).json({ error: `API endpoint không tồn tại: ${method} ${pathname}` });
    return true;
  }

  return false;
}

module.exports = routeDispatcher;
