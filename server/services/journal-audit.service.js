const journalRepository = require('../models/JournalRepository');
const llmService = require('./llm.service');
const ragService = require('./rag.service');

class JournalAuditService {
  auditTrades(entries = []) {
    if (!entries || entries.length === 0) {
      return {
        disciplineScore: 100,
        missingSlTrades: [],
        revengeTrades: [],
        overtradingDays: [],
        confluenceSummary: {},
        recommendations: ['Chưa có đủ dữ liệu giao dịch để phân tích. Hãy ghi nhật ký ít nhất 5 lệnh.']
      };
    }

    const missingSlTrades = [];
    const revengeTrades = [];
    const tradesByDate = {};
    const confluences = {};

    // Sort entries chronologically
    const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach((e, idx) => {
      // 1. Check Missing Stop Loss (Chương 9)
      if (!e.stop_loss || Number(e.stop_loss) === 0) {
        missingSlTrades.push(e);
      }

      // 2. Check Overtrading (> 3 trades per day)
      const day = (e.date || '').split('T')[0] || 'Unknown';
      tradesByDate[day] = (tradesByDate[day] || 0) + 1;

      // 3. Check Revenge / Tilted Trading
      const noteLower = (e.notes || '').toLowerCase() + ' ' + (e.emotions || '').toLowerCase();
      const hasTiltKeywords = noteLower.includes('cay cú') || noteLower.includes('gỡ') || noteLower.includes('tức') || noteLower.includes('all in') || noteLower.includes('revenge') || noteLower.includes('fomo');

      if (hasTiltKeywords) {
        revengeTrades.push(e);
      } else if (idx > 0) {
        const prev = sorted[idx - 1];
        const prevDay = (prev.date || '').split('T')[0];
        const currDay = (e.date || '').split('T')[0];
        if ((Number(prev.pnl_amount) < 0 || prev.status === 'LOSS') && prevDay === currDay) {
          revengeTrades.push(e);
        }
      }

      // 4. Track confluences
      if (Array.isArray(e.setup_confluences)) {
        e.setup_confluences.forEach(c => {
          confluences[c] = (confluences[c] || 0) + 1;
        });
      }
    });

    const overtradingDays = Object.keys(tradesByDate).filter(d => tradesByDate[d] > 3);

    // Calculate Discipline Score (Max 100)
    let penalty = 0;
    penalty += missingSlTrades.length * 15; // Phạt nặng thiếu SL
    penalty += revengeTrades.length * 20;   // Phạt rất nặng Revenge trade
    penalty += overtradingDays.length * 10; // Phạt Overtrading

    const disciplineScore = Math.max(20, Math.min(100, 100 - penalty));

    const recommendations = [];
    if (missingSlTrades.length > 0) {
      recommendations.push(`Phát hiện ${missingSlTrades.length} lệnh KHÔNG cài Stop Loss. Quy tắc sống còn (Chương 9): Tuyệt đối không mở vị thế mà không xác định điểm cắt lỗ.`);
    }
    if (revengeTrades.length > 0) {
      recommendations.push(`Cảnh báo ${revengeTrades.length} trường hợp Revenge Trading (vào lệnh ngay sau khi thua). Áp dụng Quy tắc Cooldown 24h & Khóa màn hình (Chương 9.3).`);
    }
    if (overtradingDays.length > 0) {
      recommendations.push(`Có ${overtradingDays.length} ngày giao dịch quá 3 lệnh. Nên giới hạn 1-2 setup chất lượng cao mỗi ngày.`);
    }
    if (recommendations.length === 0) {
      recommendations.push('Kỷ luật vào lệnh rất tốt! Hãy tiếp tục duy trì nhật ký và kiểm soát khối lượng 1-2% vốn.');
    }

    return {
      disciplineScore,
      missingSlTrades: missingSlTrades.map(t => ({ id: t.id, coin: t.coin, date: t.date })),
      revengeTrades: revengeTrades.map(t => ({ id: t.id, coin: t.coin, date: t.date })),
      overtradingDays,
      confluenceSummary: confluences,
      recommendations
    };
  }

  async generateAiCoachReview(period = 'WEEKLY', coinFilter = 'ALL') {
    let entries = journalRepository.getAllEntries();
    if (coinFilter && coinFilter !== 'ALL') {
      entries = entries.filter(e => e.coin.toUpperCase() === coinFilter.toUpperCase());
    }

    const audit = this.auditTrades(entries);
    const stats = journalRepository.getStats();

    // RAG Context from Textbook & Trader history
    const rag = ragService.buildRagContext({ topic: 'quản trị vốn tâm lý fomo revenge trading cooldown', includeHabits: true });

    let aiCoachCommentary = '';
    try {
      const prompt = `
Bạn là Giám định viên Kỷ luật Giao dịch & AI Coach cấp cao.
Hãy đánh giá hồ sơ giao dịch của Trader:
- Điểm kỷ luật: ${audit.disciplineScore}/100
- Tỷ lệ thắng (Win rate): ${stats.winRate}% (Tổng PnL: $${stats.totalPnL})
- Số lệnh thiếu Stop Loss: ${audit.missingSlTrades.length}
- Số lệnh Revenge Trading: ${audit.revengeTrades.length}
- Số ngày Overtrading: ${audit.overtradingDays.length}

${rag.combinedPromptText}

YÊU CẦU:
Viết 1 nhận xét đánh giá tâm lý & kỷ luật thẳng thắn, tâm huyết (khoảng 3-4 câu). Chỉ rõ lỗi sai lặp đi lặp lại và đưa ra phác đồ khắc phục cụ thể theo Chương 9.`;

      aiCoachCommentary = await llmService.generateCompletion({
        systemPrompt: 'Bạn là Senior Risk & Discipline Coach.',
        userPrompt: prompt
      });
    } catch (_) {
      aiCoachCommentary = `[AI Coach]: Điểm kỷ luật hiện tại đạt ${audit.disciplineScore}/100. Cần đặc biệt chú ý loại bỏ thói quen vào lệnh theo cảm xúc sau các lệnh thua lỗ, luôn duy trì Stop Loss bắt buộc theo Chương 9.`;
    }

    const reviewData = {
      period_type: period,
      total_trades: entries.length,
      discipline_score: audit.disciplineScore,
      win_rate: stats.winRate,
      total_pnl: stats.totalPnL,
      audit,
      stats,
      ai_coach_commentary: aiCoachCommentary,
      generated_at: new Date().toISOString()
    };

    journalRepository.saveTradeReview({
      period_type: period,
      coin_filter: coinFilter,
      total_trades: entries.length,
      discipline_score: audit.disciplineScore,
      analysis_data: reviewData
    });

    return reviewData;
  }
}

module.exports = new JournalAuditService();
