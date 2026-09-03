const notesController = require('../controllers/notes.controller');

function handleNotesRoutes(req, res, pathname, method, query, body) {
  if (pathname === '/api/notes' && method === 'GET') {
    return notesController.getNotes(req, res, query);
  }

  if (pathname === '/api/notes' && method === 'POST') {
    return notesController.createNote(req, res, body);
  }

  if (pathname.startsWith('/api/notes/') && pathname.endsWith('/pin') && method === 'POST') {
    const id = pathname.replace('/api/notes/', '').replace('/pin', '');
    return notesController.togglePin(req, res, { id });
  }

  if (pathname.startsWith('/api/notes/') && method === 'GET') {
    const id = pathname.replace('/api/notes/', '');
    return notesController.getNoteById(req, res, { id });
  }

  if (pathname.startsWith('/api/notes/') && method === 'PUT') {
    const id = pathname.replace('/api/notes/', '');
    return notesController.updateNote(req, res, { id }, body);
  }

  if (pathname.startsWith('/api/notes/') && method === 'DELETE') {
    const id = pathname.replace('/api/notes/', '');
    return notesController.deleteNote(req, res, { id });
  }

  return false;
}

module.exports = handleNotesRoutes;
