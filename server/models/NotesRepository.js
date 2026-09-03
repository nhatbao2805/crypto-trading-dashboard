const db = require('../config/database');

class NotesRepository {
  getAllNotes(filters = {}) {
    let query = 'SELECT * FROM notes WHERE 1=1';
    const params = [];

    if (filters.category && filters.category !== 'ALL') {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters.search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY is_pinned DESC, date DESC, id DESC';
    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    return rows.map(r => ({
      ...r,
      is_pinned: Boolean(r.is_pinned),
      images: JSON.parse(r.images || '[]')
    }));
  }

  getNoteById(id) {
    const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    const row = stmt.get(Number(id));
    if (!row) return null;
    return {
      ...row,
      is_pinned: Boolean(row.is_pinned),
      images: JSON.parse(row.images || '[]')
    };
  }

  createNote(data) {
    const now = new Date().toISOString();
    const date = data.date || now.split('T')[0];
    const title = data.title || 'Ghi Chú Mới';
    const category = data.category || 'Ghi Chú Chung';
    const content = data.content || '';
    const is_pinned = data.is_pinned ? 1 : 0;
    const images = JSON.stringify(data.images || []);

    const stmt = db.prepare(`
      INSERT INTO notes (
        title, category, content, is_pinned, images, date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(title, category, content, is_pinned, images, date, now, now);
    return this.getNoteById(result.lastInsertRowid);
  }

  updateNote(id, data) {
    const current = this.getNoteById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    const title = data.title !== undefined ? data.title : current.title;
    const category = data.category !== undefined ? data.category : current.category;
    const content = data.content !== undefined ? data.content : current.content;
    const is_pinned = data.is_pinned !== undefined ? (data.is_pinned ? 1 : 0) : current.is_pinned;
    const images = data.images !== undefined ? JSON.stringify(data.images) : JSON.stringify(current.images);
    const date = data.date !== undefined ? data.date : current.date;

    const stmt = db.prepare(`
      UPDATE notes SET
        title = ?, category = ?, content = ?, is_pinned = ?,
        images = ?, date = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(title, category, content, is_pinned, images, date, now, Number(id));
    return this.getNoteById(id);
  }

  deleteNote(id) {
    const current = this.getNoteById(id);
    if (!current) return false;
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    stmt.run(Number(id));
    return true;
  }

  togglePinNote(id) {
    const note = this.getNoteById(id);
    if (!note) return null;

    const nextState = note.is_pinned ? 0 : 1;
    const now = new Date().toISOString();

    const stmt = db.prepare('UPDATE notes SET is_pinned = ?, updated_at = ? WHERE id = ?');
    stmt.run(nextState, now, Number(id));
    return this.getNoteById(id);
  }
}

module.exports = new NotesRepository();
