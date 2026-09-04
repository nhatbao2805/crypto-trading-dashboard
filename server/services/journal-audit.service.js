const journalRepository = require('../models/JournalRepository');
const llmService = require('./llm.service');
const ragService = require('./rag.service');

class JournalAuditService {
  /**
   * Filter entries according to periodType (TODAY, WEEK, MONTH, YEAR, ALL, CUSTOM) and coinFilter
   */
  filterEntries(entries = [], options = {}) {
    let { periodType = 'WEEK', coinFilter = 'ALL', startDate, endDate } = options;
    let normalizedPeriod = (periodType || 'ALL').toUpperCase();
    if (normalizedPeriod === 'WEEKLY') normalizedPeriod = 'WEEK';
    if (normalizedPeriod === 'DAILY') normalizedPeriod = 'TODAY';
    if (normalizedPeriod === 'MONTHLY') normalizedPeriod = 'MONTH';
    if (normalizedPeriod === 'YEARLY') normalizedPeriod = 'YEAR';

    const now = new Date();
    const formatYMD = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const todayStr = formatYMD(now);
    let calcStartDate = null;
    let calcEndDate = null;

    if (normalizedPeriod === 'TODAY') {
      calcStartDate = todayStr;
      calcEndDate = todayStr;
    } else if (normalizedPeriod === 'WEEK') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      calcStartDate = formatYMD(past);
    } else if (normalizedPeriod === 'MONTH') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      calcStartDate = formatYMD(past);
    } else if (normalizedPeriod === 'YEAR') {
      calcStartDate = `${now.getFullYear()}-01-01`;
    } else if (normalizedPeriod === 'CUSTOM') {
      calcStartDate = startDate || null;
      calcEndDate = endDate || null;
    }

    if (startDate && normalizedPeriod !== 'TODAY') calcStartDate = startDate;
    if (endDate && normalizedPeriod !== 'TODAY') calcEndDate = endDate;

    let filtered = [...entries];

    // 1. Filter by Coin
    if (coinFilter && coinFilter !== 'ALL') {
      filtered = filtered.filter(e => (e.coin || '').toUpperCase() === coinFilter.toUpperCase());
    }

    // 2. Filter by Date Range
    if (calcStartDate) {
      filtered = filtered.filter(e => {
        const eDate = (e.date || '').split('T')[0];
        return eDate >= calcStartDate;
      });
    }
    if (calcEndDate) {
      filtered = filtered.filter(e => {
        const eDate = (e.date || '').split('T')[0];
        return eDate <= calcEndDate;
      });
    }

    return {
      filteredEntries: filtered,
      startDate: calcStartDate,
      endDate: calcEndDate,
      periodType: normalizedPeriod
    };
  }

  /**
   * Calculate summary trading statistics on filtered entries
   */
  calculateStatsForEntries(entries = []) {
    const totalTrades = entries.length;
    const closedTrades = entries.filter(e => e.status !== 'OPEN');
    const winningTrades = closedTrades.filter(e => e.status === 'WIN' || Number(e.pnl_amount) > 0);
    const losingTrades = closedTrades.filter(e => e.status === 'LOSS' || Number(e.pnl_amount) < 0);
    const beTrades = closedTrades.filter(e => e.status === 'BREAKEVEN' || (Number(e.pnl_amount) === 0 && e.status !== 'WIN' && e.status !== 'LOSS'));
    const openTrades = entries.filter(e => e.status === 'OPEN');

    const totalPnL = entries.reduce((acc, cur) => acc + (Number(cur.pnl_amount) || 0), 0);
    const winRate = closedTrades.length > 0 ? Number(((winningTrades.length / closedTrades.length) * 100).toFixed(1)) : 0;
    
    const grossProfit = winningTrades.reduce((acc, cur) => acc + (Number(cur.pnl_amount) || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((acc, cur) => acc + (Number(cur.pnl_amount) || 0), 0));
    const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : (grossProfit > 0 ? 'MAX' : 0);

    return {
      totalTrades,
      closedTrades: closedTrades.length,
      openTrades: openTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      beTrades: beTrades.length,
      winRate,
      totalPnL: Number(totalPnL.toFixed(2)),
      totalPnl: Number(totalPnL.toFixed(2)),
      grossProfit: Number(grossProfit.toFixed(2)),
      grossLoss: Number(grossLoss.toFixed(2)),
      profitFactor
    };
  }

  /**
   * Audit trades against rule-based expert discipline guidelines
   */
  auditTrades(entries = []) {
    if (!entries || entries.length === 0) {
      const emptyChecklist = {
        missingSlCount: 0,
        badRrCount: 0,
        overtradingDays: 0,
        revengeTradeCount: 0,
        missing_sl_count: 0,
        bad_rr_count: 0,
        overtrading_days: 0,
        revenge_trade_count: 0
      };

      return {
        disciplineScore: 100,
        discipline_score: 100,
        missingSlTrades: [],
        missing_sl_trades: [],
        badRrTrades: [],
        bad_rr_trades: [],
        revengeTrades: [],
        revenge_trades: [],
        overtradingDays: [],
        overtrading_days: [],
        checklistAnalysis: emptyChecklist,
        checklist_analysis: emptyChecklist,
        confluenceSummary: {},
        confluence_summary: {},
        recommendations: ['Chưa có đủ dữ liệu giao dịch trong khoảng thời gian này để phân tích. Hãy ghi nhật ký các lệnh mới để hệ thống chẩn đoán kỷ luật.'],
        detailedTradeAudits: [],
        detailed_trade_audits: []
      };
    }

    const missingSlTrades = [];
    const badRrTrades = [];
    const revengeTrades = [];
    const tradesByDate = {};
    const confluences = {};

    // Sort entries chronologically
    const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach((e, idx) => {
      const entryPrice = Number(e.entry_price) || 0;
      const stopLoss = Number(e.stop_loss) || 0;
      const takeProfit = Number(e.take_profit) || 0;

      // 1. Check Missing Stop Loss (Chương 9)
      if (!stopLoss || stopLoss === 0) {
        missingSlTrades.push(e);
      } else {
        // 2. Check Bad Risk:Reward ratio (< 1:2 hoặc < 1.8) (Chương 9.2)
        let rrRatio = 0;
        let isBadRr = false;

        if (entryPrice > 0) {
          const risk = Math.abs(entryPrice - stopLoss);
          if (takeProfit > 0) {
            const reward = Math.abs(takeProfit - entryPrice);
            rrRatio = risk > 0 ? (reward / risk) : 0;
            if (rrRatio < 2.0) { // Tỷ lệ R:R < 1:2 (hoặc < 1.8)
              isBadRr = true;
            }
          } else {
            // Có SL nhưng không cài TP mục tiêu (không xác định được R:R >= 1:2)
            isBadRr = true;
          }
        }

        if (isBadRr) {
          badRrTrades.push({
            id: e.id,
            coin: e.coin,
            date: e.date,
            rrRatio: Number(rrRatio.toFixed(2)),
            entry_price: entryPrice,
            stop_loss: stopLoss,
            take_profit: takeProfit
          });
        }
      }

      // 3. Check Overtrading (> 3 trades per day)
      const day = (e.date || '').split('T')[0] || 'Unknown';
      tradesByDate[day] = (tradesByDate[day] || 0) + 1;

      // 4. Check Revenge / Tilted Trading (Chương 9.3)
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

      // 5. Track confluences
      if (Array.isArray(e.setup_confluences)) {
        e.setup_confluences.forEach(c => {
          confluences[c] = (confluences[c] || 0) + 1;
        });
      }
    });

    const overtradingDays = Object.keys(tradesByDate).filter(d => tradesByDate[d] > 3);

    // Calculate Discipline Score (Max 100)
    let penalty = 0;
    penalty += missingSlTrades.length * 15; // Phạt nặng thiếu SL (Chương 9)
    penalty += revengeTrades.length * 20;   // Phạt rất nặng Revenge trade (Chương 9.3)
    penalty += overtradingDays.length * 10; // Phạt Overtrading (>3 lệnh/ngày)
    penalty += badRrTrades.length * 5;      // Phạt vi phạm tỷ lệ R:R < 1:2 (Chương 9.2)

    const disciplineScore = Math.max(20, Math.min(100, 100 - penalty));

    const recommendations = [];
    if (missingSlTrades.length > 0) {
      recommendations.push(`Phát hiện ${missingSlTrades.length} lệnh KHÔNG cài Stop Loss. Quy tắc sống còn (Chương 9): Tuyệt đối không mở vị thế mà không xác định điểm cắt lỗ.`);
    }
    if (badRrTrades.length > 0) {
      recommendations.push(`Phát hiện ${badRrTrades.length} lệnh có tỷ lệ R:R < 1:2 (hoặc < 1.8). Toán học giao dịch (Chương 9.2): Chỉ vào lệnh khi tiềm năng lợi nhuận tối thiểu gấp đôi rủi ro.`);
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

    const checklistAnalysis = {
      missingSlCount: missingSlTrades.length,
      badRrCount: badRrTrades.length,
      overtradingDays: overtradingDays.length,
      revengeTradeCount: revengeTrades.length,
      // snake_case aliases
      missing_sl_count: missingSlTrades.length,
      bad_rr_count: badRrTrades.length,
      overtrading_days: overtradingDays.length,
      revenge_trade_count: revengeTrades.length
    };

    const detailedTradeAudits = sorted.map(t => {
      const issues = [];
      const ep = Number(t.entry_price) || 0;
      const sl = Number(t.stop_loss) || 0;
      const tp = Number(t.take_profit) || 0;

      if (!sl || sl <= 0) {
        issues.push('Không cài Stop Loss');
      }

      let rr = 0;
      if (ep > 0 && sl > 0 && tp > 0) {
        const risk = Math.abs(ep - sl);
        const reward = Math.abs(tp - ep);
        rr = risk > 0 ? Number((reward / risk).toFixed(2)) : 0;
        if (rr < 2.0) {
          issues.push(`Tỷ lệ R:R vi phạm (${rr} < 1:2)`);
        }
      } else if (sl > 0 && (!tp || tp <= 0)) {
        issues.push('Chưa đặt Take Profit mục tiêu');
      }

      if (revengeTrades.some(rt => rt.id === t.id)) {
        issues.push('Dấu hiệu Revenge Trading / Vào lệnh gỡ');
      }

      const tDay = (t.date || '').split('T')[0];
      if (overtradingDays.includes(tDay)) {
        issues.push('Vào lệnh vào ngày Overtrading (>3 lệnh/ngày)');
      }

      const isCompliant = issues.length === 0;

      return {
        id: t.id,
        coin: t.coin,
        type: t.type,
        pnlAmount: Number(t.pnl_amount) || 0,
        pnl_amount: Number(t.pnl_amount) || 0,
        issues,
        isCompliant,
        is_compliant: isCompliant,
        rrRatio: rr,
        rr_ratio: rr
      };
    });

    return {
      disciplineScore,
      discipline_score: disciplineScore,
      missingSlTrades: missingSlTrades.map(t => ({ id: t.id, coin: t.coin, date: t.date })),
      missing_sl_trades: missingSlTrades.map(t => ({ id: t.id, coin: t.coin, date: t.date })),
      badRrTrades: badRrTrades.map(t => ({ id: t.id, coin: t.coin, date: t.date, rrRatio: t.rrRatio })),
      bad_rr_trades: badRrTrades.map(t => ({ id: t.id, coin: t.coin, date: t.date, rrRatio: t.rrRatio })),
      revengeTrades: revengeTrades.map(t => ({ id: t.id, coin: t.coin, date: t.date })),
      revenge_trades: revengeTrades.map(t => ({ id: t.id, coin: t.coin, date: t.date })),
      overtradingDays,
      overtrading_days: overtradingDays,
      checklistAnalysis,
      checklist_analysis: checklistAnalysis,
      confluenceSummary: confluences,
      confluence_summary: confluences,
      recommendations,
      detailedTradeAudits,
      detailed_trade_audits: detailedTradeAudits
    };
  }

  /**
   * Generate AI Coach Review with dual camelCase & snake_case compatibility
   */
  async generateAiCoachReview(periodOrOptions = 'WEEK', coinFilterParam = 'ALL') {
    let periodType = 'WEEK';
    let coinFilter = 'ALL';
    let startDate = null;
    let endDate = null;
    let livePrices = {};

    if (typeof periodOrOptions === 'object' && periodOrOptions !== null) {
      periodType = periodOrOptions.periodType || periodOrOptions.period || 'WEEK';
      coinFilter = periodOrOptions.coinFilter || 'ALL';
      startDate = periodOrOptions.startDate || null;
      endDate = periodOrOptions.endDate || null;
      livePrices = periodOrOptions.livePrices || {};
    } else {
      periodType = periodOrOptions || 'WEEK';
      coinFilter = coinFilterParam || 'ALL';
    }

    const allEntries = journalRepository.getAllEntries();
    const { filteredEntries: entries, startDate: actualStart, endDate: actualEnd, periodType: normalizedPeriod } = this.filterEntries(allEntries, {
      periodType,
      coinFilter,
      startDate,
      endDate
    });

    const audit = this.auditTrades(entries);
    const stats = this.calculateStatsForEntries(entries);

    // RAG Context from Textbook & Trader history
    let aiCoachCommentary = '';
    try {
      const rag = ragService.buildRagContext({ topic: 'quản trị vốn tâm lý fomo revenge trading cooldown', includeHabits: true });
      const prompt = `
Bạn là Giám định viên Kỷ luật Giao dịch & AI Coach cấp cao.
Hãy đánh giá hồ sơ giao dịch của Trader trong kỳ (${normalizedPeriod}):
- Điểm kỷ luật: ${audit.disciplineScore}/100
- Tỷ lệ thắng (Win rate): ${stats.winRate}% (Tổng PnL: $${stats.totalPnL})
- Số lệnh rà soát: ${entries.length}
- Số lệnh thiếu Stop Loss: ${audit.missingSlTrades.length}
- Số lệnh R:R < 1:2: ${audit.badRrTrades.length}
- Số lệnh Revenge Trading: ${audit.revengeTrades.length}
- Số ngày Overtrading: ${audit.overtradingDays.length}

${rag.combinedPromptText}

YÊU CẦU:
Viết 1 nhận xét đánh giá tâm lý & kỷ luật thẳng thắn, tâm huyết (khoảng 3-4 câu). Chỉ rõ lỗi sai lặp đi lặp lại và đưa ra phác đồ khắc phục cụ thể theo Chương 9.`;

      aiCoachCommentary = await llmService.generateCompletion({
        systemPrompt: 'Bạn là Senior Risk & Discipline Coach.',
        userPrompt: prompt,
        modelTier: 'standard',
        maxTokens: 400,
        temperature: 0.3
      });
    } catch (_) {
      if (entries.length === 0) {
        aiCoachCommentary = `[AI Coach]: Chưa có lệnh giao dịch nào trong mốc thời gian ${normalizedPeriod}. Hãy luôn tuân thủ nguyên tắc cài Stop Loss và kiểm soát tỷ lệ R:R ≥ 1:2 khi vào lệnh.`;
      } else {
        aiCoachCommentary = `[AI Coach]: Điểm kỷ luật hiện tại đạt ${audit.disciplineScore}/100 với ${entries.length} lệnh được rà soát. Cần đặc biệt chú ý loại bỏ thói quen vào lệnh theo cảm xúc sau các lệnh thua lỗ, luôn duy trì Stop Loss bắt buộc theo Chương 9 và đảm bảo tỷ lệ R:R tối thiểu 1:2.`;
      }
    }

    const reviewData = {
      // CamelCase for Frontend AuditorTab.tsx
      periodType: normalizedPeriod,
      totalTrades: entries.length,
      disciplineScore: audit.disciplineScore,
      winRate: stats.winRate,
      totalPnl: stats.totalPnL,
      totalPnL: stats.totalPnL,
      profitFactor: stats.profitFactor,
      summary: aiCoachCommentary,
      checklistAnalysis: audit.checklistAnalysis,
      recommendations: audit.recommendations,
      detailedTradeAudits: audit.detailedTradeAudits,
      startDate: actualStart,
      endDate: actualEnd,
      coinFilter: coinFilter,

      // Snake_case for legacy tests & DB compatibility
      period_type: normalizedPeriod,
      total_trades: entries.length,
      discipline_score: audit.disciplineScore,
      win_rate: stats.winRate,
      total_pnl: stats.totalPnL,
      profit_factor: stats.profitFactor,
      checklist_analysis: audit.checklistAnalysis,
      detailed_trade_audits: audit.detailedTradeAudits,
      start_date: actualStart,
      end_date: actualEnd,
      coin_filter: coinFilter,
      ai_coach_commentary: aiCoachCommentary,
      commentary: aiCoachCommentary,
      audit,
      stats,
      generated_at: new Date().toISOString()
    };

    try {
      const savedRecord = journalRepository.saveTradeReview({
        period_type: normalizedPeriod,
        start_date: actualStart,
        end_date: actualEnd,
        coin_filter: coinFilter,
        total_trades: entries.length,
        discipline_score: audit.disciplineScore,
        analysis_data: reviewData
      });
      reviewData.savedRecord = savedRecord;
      reviewData.saved_record = savedRecord;
    } catch (saveErr) {
      console.warn('[JournalAuditService] Auto save review notice:', saveErr.message);
    }

    return reviewData;
  }
}

module.exports = new JournalAuditService();
