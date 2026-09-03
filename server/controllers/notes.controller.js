const notesRepository = require('../models/NotesRepository');

class NotesController {
  getNotes(req, res, query) {
    const notes = notesRepository.getAllNotes(query);
    return res.json({ notes });
  }

  getNoteById(req, res, params) {
    const note = notesRepository.getNoteById(params.id);
    if (!note) return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
    return res.json({ note });
  }

  createNote(req, res, body) {
    try {
      const note = notesRepository.createNote(body);
      return res.status(201).json({ success: true, note });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  updateNote(req, res, params, body) {
    try {
      const note = notesRepository.updateNote(params.id, body);
      if (!note) return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
      return res.json({ success: true, note });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  deleteNote(req, res, params) {
    const success = notesRepository.deleteNote(params.id);
    if (!success) return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
    return res.json({ success: true });
  }

  togglePin(req, res, params) {
    const note = notesRepository.togglePinNote(params.id);
    if (!note) return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
    return res.json({ success: true, note });
  }
}

module.exports = new NotesController();
