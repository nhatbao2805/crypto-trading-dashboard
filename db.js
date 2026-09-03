/**
 * Database Facade Wrapper
 * Delegates all database operations to modular repositories in server/models/
 */

const journalRepository = require('./server/models/JournalRepository');
const notesRepository = require('./server/models/NotesRepository');
const paperTradeRepository = require('./server/models/PaperTradeRepository');
const debateRepository = require('./server/models/DebateRepository');
const sqliteDb = require('./server/config/database');

module.exports = {
  db: sqliteDb,

  // Journal aliases
  getAllJournalEntries: (filters) => journalRepository.getAllEntries(filters),
  getJournalEntryById: (id) => journalRepository.getEntryById(id),
  createJournalEntry: (data) => journalRepository.createEntry(data),
  updateJournalEntry: (id, data) => journalRepository.updateEntry(id, data),
  deleteJournalEntry: (id) => journalRepository.deleteEntry(id),
  getJournalStats: () => journalRepository.getStats(),
  createEntry: (data) => journalRepository.createEntry(data),
  getEntryById: (id) => journalRepository.getEntryById(id),
  updateEntry: (id, data) => journalRepository.updateEntry(id, data),
  deleteEntry: (id) => journalRepository.deleteEntry(id),

  // Reviews
  saveTradeReview: (data) => journalRepository.saveTradeReview(data),
  getTradeReviews: (limit) => journalRepository.getTradeReviews(limit),
  getTradeReviewById: (id) => journalRepository.getTradeReviewById(id),
  deleteTradeReview: (id) => journalRepository.deleteTradeReview(id),

  // Notes
  getAllNotes: (filters) => notesRepository.getAllNotes(filters),
  getNoteById: (id) => notesRepository.getNoteById(id),
  createNote: (data) => notesRepository.createNote(data),
  updateNote: (id, data) => notesRepository.updateNote(id, data),
  deleteNote: (id) => notesRepository.deleteNote(id),
  togglePinNote: (id) => notesRepository.togglePinNote(id),

  // Paper Trading
  getPaperAccount: () => paperTradeRepository.getAccount(),
  resetPaperAccount: (capital) => paperTradeRepository.resetAccount(capital),
  updatePaperBalance: (delta) => paperTradeRepository.updateBalance(delta),
  getOpenPaperPositions: (coin) => paperTradeRepository.getOpenPositions(coin),
  getPaperPositionById: (id) => paperTradeRepository.getPositionById(id),
  openPaperPosition: (data) => paperTradeRepository.openPosition(data),
  closePaperPosition: (id, exitPrice, closeReason) => paperTradeRepository.closePosition(id, exitPrice, closeReason),
  getPaperHistory: (filters) => paperTradeRepository.getHistory(filters),

  // AI Debates & Predictions & Chats
  saveAiDebate: (data) => debateRepository.saveAiDebate(data),
  getAiDebates: (coin, limit) => debateRepository.getAiDebates(coin, limit),
  getAiDebateById: (id) => debateRepository.getAiDebateById(id),
  saveUserPrediction: (data) => debateRepository.saveUserPrediction(data),
  getUserPredictions: (coin, limit) => debateRepository.getUserPredictions(coin, limit),
  saveChat: (coin, prompt, response) => debateRepository.saveChat(coin, prompt, response),
  getChats: (coin, limit) => debateRepository.getChats(coin, limit),
  clearChats: (coin) => debateRepository.clearChats(coin),
  saveChatMessage: (coin, prompt, response) => debateRepository.saveChat(coin, prompt, response),
  getChatHistory: (coin) => debateRepository.getChats(coin),
  clearChatHistory: (coin) => debateRepository.clearChats(coin),
  saveNewsAnalysis: (coin, analysis) => debateRepository.saveNewsAnalysis(coin, analysis),
  getLatestNewsAnalysis: (coin) => debateRepository.getLatestNewsAnalysis(coin),
  savePracticeProgress: (stats) => debateRepository.savePracticeProgress(stats),
  getPracticeProgress: () => debateRepository.getPracticeProgress()
};
