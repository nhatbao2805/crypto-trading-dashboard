const journalController = require('../controllers/journal.controller');

async function handleJournalRoutes(req, res, pathname, method, query, body) {
  // 1. Stats
  if (pathname === '/api/journal/stats' && method === 'GET') {
    return journalController.getStats(req, res);
  }

  // 2. AI Review Endpoints
  if (pathname === '/api/journal/ai-review' && method === 'POST') {
    return await journalController.generateAiReview(req, res, body);
  }

  if ((pathname === '/api/journal/ai-review/history' || pathname === '/api/journal/reviews') && method === 'GET') {
    return journalController.getTradeReviews(req, res, query);
  }

  if (pathname.startsWith('/api/journal/ai-review/') && method === 'DELETE') {
    const id = pathname.replace('/api/journal/ai-review/', '');
    return journalController.deleteTradeReview(req, res, { id });
  }

  if (pathname.startsWith('/api/journal/reviews/') && method === 'DELETE') {
    const id = pathname.replace('/api/journal/reviews/', '');
    return journalController.deleteTradeReview(req, res, { id });
  }

  // 3. AI Coach Chat
  if (pathname === '/api/journal/coach-chat' && method === 'POST') {
    return await journalController.sendCoachChat(req, res, body);
  }

  // 4. Quick Close Live Trade at Binance Price
  if (pathname.startsWith('/api/journal/close-live/') && method === 'POST') {
    const id = pathname.replace('/api/journal/close-live/', '');
    return await journalController.closeLiveTrade(req, res, { id }, body);
  }

  // 5. General Journal List & Create
  if ((pathname === '/api/journal' || pathname === '/api/journal/entries') && method === 'GET') {
    return journalController.getEntries(req, res, query);
  }

  if (pathname === '/api/journal' && method === 'POST') {
    return journalController.createEntry(req, res, body);
  }

  // 6. Individual Entry CRUD
  if (pathname.startsWith('/api/journal/') && method === 'GET') {
    const id = pathname.replace('/api/journal/', '');
    return journalController.getEntryById(req, res, { id });
  }

  if (pathname.startsWith('/api/journal/') && method === 'PUT') {
    const id = pathname.replace('/api/journal/', '');
    return journalController.updateEntry(req, res, { id }, body);
  }

  if (pathname.startsWith('/api/journal/') && method === 'DELETE') {
    const id = pathname.replace('/api/journal/', '');
    return journalController.deleteEntry(req, res, { id });
  }

  return false;
}

module.exports = handleJournalRoutes;
