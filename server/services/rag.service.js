/**
 * RAG Service (server/services/rag.service.js)
 * Indexes local knowledge base:
 * 1. 12-Chapter Crypto Master Manual (Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md)
 * 2. SQLite Trade Journal History (User discipline & habit tracker)
 */

const fs = require('node:fs');
const path = require('node:path');
const CONSTANTS = require('../config/constants');
const db = require('../config/database');

class RagService {
  constructor() {
    this.knowledgeSnippets = [];
    this.isIndexed = false;
    this.initKnowledgeBase();
  }

  /**
   * Parse and index the Markdown manual into structured chunks
   */
  initKnowledgeBase() {
    try {
      const manualPath = path.join(CONSTANTS.ROOT_DIR, 'Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md');
      if (!fs.existsSync(manualPath)) {
        console.warn('[RagService] Manual markdown file not found at:', manualPath);
        return;
      }

      const content = fs.readFileSync(manualPath, 'utf8');
      const sections = content.split(/^## /gm);

      this.knowledgeSnippets = sections.map((sec, idx) => {
        const lines = sec.trim().split('\n');
        const title = lines[0] || `Chương ${idx}`;
        const text = lines.slice(1).join('\n').trim();

        // Categorize by keywords
        const lower = (title + ' ' + text).toLowerCase();
        const tags = [];
        if (lower.includes('nến') || lower.includes('candlestick') || lower.includes('pinbar')) tags.push('candlestick');
        if (lower.includes('smc') || lower.includes('fvg') || lower.includes('order block') || lower.includes('liquidity')) tags.push('smc');
        if (lower.includes('quản lý vốn') || lower.includes('stop loss') || lower.includes('r:r') || lower.includes('1-2%')) tags.push('risk');
        if (lower.includes('tâm lý') || lower.includes('fomo') || lower.includes('revenge') || lower.includes('cooldown')) tags.push('psychology');
        if (lower.includes('đa khung') || lower.includes('timeframe') || lower.includes('4h')) tags.push('multitimeframe');
        if (lower.includes('bẫy') || lower.includes('fakeout') || lower.includes('trap')) tags.push('trap');

        return {
          id: idx,
          title,
          tags,
          content: text.slice(0, 1500), // condensed excerpt
          fullText: text
        };
      });

      this.isIndexed = true;
      console.log(`[RagService] Successfully indexed ${this.knowledgeSnippets.length} knowledge modules.`);
    } catch (err) {
      console.error('[RagService] Error indexing knowledge:', err.message);
    }
  }

  /**
   * Search knowledge base for relevant textbook excerpts
   */
  retrieveKnowledge(query, limit = 2) {
    if (!this.knowledgeSnippets.length) return '';
    const qLower = (query || '').toLowerCase();

    // Score snippets by match density
    const scored = this.knowledgeSnippets.map(snip => {
      let score = 0;
      const text = (snip.title + ' ' + snip.content).toLowerCase();
      
      const keywords = qLower.split(/\s+/).filter(w => w.length > 2);
      keywords.forEach(kw => {
        if (text.includes(kw)) score += 10;
        if (snip.tags.some(t => t.includes(kw))) score += 15;
      });

      return { ...snip, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, limit);

    return top.map(item => `[Trích đoạn Giáo trình - ${item.title}]:\n${item.content}`).join('\n\n');
  }

  /**
   * Retrieve User Trading Habits & Discipline History from SQLite
   */
  retrieveUserHabitContext() {
    try {
      const rows = db.prepare(`
        SELECT id, coin, type, entry_price, exit_price, stop_loss, take_profit, pnl_amount, status, created_at, emotions, notes
        FROM journal_entries
        ORDER BY id DESC
        LIMIT 15
      `).all();

      if (!rows || rows.length === 0) {
        return 'Người dùng chưa có lịch sử giao dịch trong nhật ký.';
      }

      const total = rows.length;
      let missingSlCount = 0;
      let consecutiveLosses = 0;
      let revengeCount = 0;

      rows.forEach((r, idx) => {
        if (!r.stop_loss || Number(r.stop_loss) === 0) {
          missingSlCount++;
        }
        if (Number(r.pnl_amount) < 0 && idx < 3) {
          consecutiveLosses++;
        }
        const note = (r.notes || '') + ' ' + (r.emotions || '');
        if (note.toLowerCase().includes('cay') || note.toLowerCase().includes('gỡ') || note.toLowerCase().includes('fomo')) {
          revengeCount++;
        }
      });

      return `[Hồ sơ Kỷ luật Trader từ SQLite]:
- Tổng số lệnh gần đây: ${total}
- Lệnh vi phạm KHÔNG cài Stop Loss: ${missingSlCount}/${total}
- Chuỗi lệnh thua gần nhất: ${consecutiveLosses} lệnh liên tiếp
- Dấu hiệu tâm lý cay cú / gỡ lệnh (Revenge trading): ${revengeCount} lần
- Lệnh gần nhất: ${rows[0].type} ${rows[0].coin} (${rows[0].pnl_amount >= 0 ? '+' : ''}${rows[0].pnl_amount}$)`;
    } catch (err) {
      return 'Không thể trích xuất hồ sơ giao dịch từ database.';
    }
  }

  /**
   * Assembles the complete RAG context for AI Council & AI Coach
   */
  buildRagContext({ coin = 'BTC', topic = 'smc trap candlestick', includeHabits = true }) {
    const textbookContext = this.retrieveKnowledge(topic, 2);
    const habitContext = includeHabits ? this.retrieveUserHabitContext() : '';

    return {
      textbookContext,
      habitContext,
      combinedPromptText: `
=== TÀI LIỆU QUY CHUẨN ĐỐI CHIẾU (RAG) ===
${textbookContext}

=== HỒ SƠ THỰC TẾ CỦA TRADER ===
${habitContext}
==========================================`
    };
  }
}

module.exports = new RagService();
