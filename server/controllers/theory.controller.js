const theoryManager = require('../../theory_manager');
const debateRepository = require('../models/DebateRepository');

class TheoryController {
  getTheoryData(req, res) {
    try {
      const data = theoryManager.loadTheoryData();
      if (data.error) {
        return res.status(500).json({ error: data.error });
      }

      return res.json({
        totalChapters: data.totalChapters,
        chapters: data.chapters,
        glossary: data.glossary
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  getChapterById(req, res, params) {
    try {
      const id = parseInt(params.id, 10);
      const data = theoryManager.loadTheoryData();
      if (data.error) {
        return res.status(500).json({ error: data.error });
      }

      const chapter = (data.rawChapters || []).find(c => c.id === id);
      if (!chapter) {
        return res.status(404).json({ error: `Không tìm thấy chương ${id}` });
      }

      return res.json({
        id: chapter.id,
        filename: 'Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md',
        title: chapter.title,
        content: chapter.content,
        sections: chapter.sections || []
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  getGlossary(req, res) {
    try {
      const data = theoryManager.loadTheoryData();
      return res.json({ glossary: data.glossary || [] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  getPracticeProgress(req, res) {
    try {
      const progress = debateRepository.getPracticeProgress();
      return res.json({ success: true, progress: progress || { completedCases: [], scores: {} } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  savePracticeProgress(req, res, body) {
    try {
      const progress = debateRepository.savePracticeProgress(body);
      return res.json({ success: true, progress });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new TheoryController();
