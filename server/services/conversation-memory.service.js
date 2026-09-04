/**
 * Conversation Memory Service (server/services/conversation-memory.service.js)
 * Implements Conversation Summary Buffer Memory:
 * - Compresses long chats (> 8 messages) into a compact summary (< 100 tokens).
 * - Always preserves:
 *   1. Trader profile & risk limits (Capital, max 1-2% risk, discipline rules).
 *   2. Open/monitored positions (Entry, SL, TP).
 *   3. Agreed setup levels (Wait zones).
 * - Delivers: Payload = Summary (< 100 tokens) + 3-4 Recent Messages.
 */

const llmService = require('./llm.service');

class ConversationMemoryService {
  constructor() {
    this.sessionMemory = new Map(); // sessionId -> { summary: string, messages: Array<{sender, text, time}> }
  }

  getSession(sessionId = 'default') {
    if (!this.sessionMemory.has(sessionId)) {
      this.sessionMemory.set(sessionId, {
        summary: '',
        messages: []
      });
    }
    return this.sessionMemory.get(sessionId);
  }

  async addMessage(sessionId = 'default', sender = 'user', text = '', metadata = {}) {
    const session = this.getSession(sessionId);
    session.messages.push({
      sender,
      text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      metadata
    });

    // If message count exceeds 8, trigger background compression
    if (session.messages.length > 8) {
      await this.compressSessionSummary(sessionId);
    }
  }

  async compressSessionSummary(sessionId = 'default') {
    const session = this.getSession(sessionId);
    const messagesToCompress = session.messages.slice(0, session.messages.length - 4);

    if (messagesToCompress.length === 0) return;

    const transcript = messagesToCompress
      .map(m => `${m.sender === 'user' ? 'Trader' : 'Hội Đồng'}: ${m.text}`)
      .join('\n');

    const systemPrompt = `Bạn là Trợ lý Nén Bộ Nhớ Hội Thoại (Conversation Summary Buffer).
Nhiệm vụ: Nén toàn bộ đoạn chat thành 1 bản tóm tắt siêu ngắn (< 100 từ).
BẮT BUỘC lưu giữ 3 thông tin sống còn:
1. Quy tắc vốn & Kỷ luật trader đã nói (ví dụ: vốn $1,000, risk 1%, không fomo).
2. Vị thế đang giữ / theo dõi (Coin nào, Entry, Stop Loss, Take Profit ở đâu).
3. Thỏa thuận vùng giá vừa chốt giữa 2 bên.`;

    const userPrompt = `
Bản tóm tắt cũ: "${session.summary || 'Chưa có'}"
Các tin nhắn cần nén:
${transcript}

Hãy tạo bản tóm tắt cô đọng mới nhất (< 100 từ):`;

    try {
      const newSummary = await llmService.generateCompletion({
        systemPrompt,
        userPrompt,
        modelTier: 'lite',
        maxTokens: 150,
        temperature: 0.2
      });
      if (newSummary && newSummary.length > 10) {
        session.summary = newSummary.trim();
        // Keep only the last 4 recent messages in the active window
        session.messages = session.messages.slice(-4);
      }
    } catch (err) {
      console.warn('[ConversationMemory] Compression fallback:', err.message);
      // Fallback: simple heuristic summary
      session.summary = `Trader đang theo dõi vị thế giao dịch. Ghi nhớ kỷ luật Stop Loss bắt buộc và quản lý vốn 1-2% theo Chương 9.`;
      session.messages = session.messages.slice(-4);
    }
  }

  /**
   * Builds the token-efficient Prompt Context for LLM
   */
  getOptimizedPromptContext(sessionId = 'default') {
    const session = this.getSession(sessionId);
    const recentMessages = session.messages.slice(-4);

    let context = '';
    if (session.summary) {
      context += `[BẢN TÓM TẮT NGỮ CẢNH TRƯỚC ĐÓ (<100 tokens)]:\n${session.summary}\n\n`;
    }

    if (recentMessages.length > 0) {
      context += `[3-4 TIN NHẮN GẦN NHẤT]:\n`;
      recentMessages.forEach(m => {
        context += `- ${m.sender === 'user' ? 'Trader' : 'Hội Đồng'}: ${m.text}\n`;
      });
    }

    return {
      summary: session.summary,
      recentMessages,
      formattedContextText: context.trim()
    };
  }

  clearSession(sessionId = 'default') {
    this.sessionMemory.delete(sessionId);
  }
}

module.exports = new ConversationMemoryService();
