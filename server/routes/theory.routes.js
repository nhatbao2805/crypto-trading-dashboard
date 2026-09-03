const theoryController = require('../controllers/theory.controller');

function handleTheoryRoutes(req, res, pathname, method, query, body) {
  if (pathname === '/api/theory' && method === 'GET') {
    return theoryController.getTheoryData(req, res);
  }

  if (pathname === '/api/theory/glossary' && method === 'GET') {
    return theoryController.getGlossary(req, res);
  }

  if (pathname.startsWith('/api/theory/chapter/') && method === 'GET') {
    const id = pathname.replace('/api/theory/chapter/', '');
    return theoryController.getChapterById(req, res, { id });
  }

  if ((pathname === '/api/theory/practice/progress' || pathname === '/api/practice/progress') && method === 'GET') {
    return theoryController.getPracticeProgress(req, res);
  }

  if ((pathname === '/api/theory/practice/progress' || pathname === '/api/practice/progress') && method === 'POST') {
    return theoryController.savePracticeProgress(req, res, body);
  }

  return false;
}

module.exports = handleTheoryRoutes;
