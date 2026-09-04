const journalRepository = require('../models/JournalRepository');
const journalAuditService = require('../services/journal-audit.service');
const binanceService = require('../services/binance.service');

class JournalController {
  getEntries(req, res, query) {
    const entries = journalRepository.getAllEntries(query);
    try {
      const paperTradeRepository = require('../models/PaperTradeRepository');
      const openPositions = paperTradeRepository.getOpenPositions(query?.coin || null);
      const openEntries = (openPositions || []).map(pos => ({
        id: `live_${pos.id}`,
        date: pos.date || new Date().toISOString().split('T')[0],
        coin: pos.coin,
        type: pos.type,
        entry_price: pos.entry_price,
        exit_price: null,
        stop_loss: pos.stop_loss,
        take_profit: pos.take_profit,
        position_size: pos.position_size || (pos.margin * pos.leverage),
        leverage: pos.leverage,
        margin: pos.margin,
        pnl_amount: 0,
        pnl_percent: 0,
        status: 'OPEN',
        notes: pos.notes,
        is_paper_live: true,
        paper_trade_id: pos.id,
        images: [],
        setup_confluences: [],
        rules_checked: []
      }));
      return res.json({ entries: [...openEntries, ...entries], stats: journalRepository.getStats() });
    } catch (_) {
      return res.json({ entries, stats: journalRepository.getStats() });
    }
  }

  getEntryById(req, res, params) {
    const entry = journalRepository.getEntryById(params.id);
    if (!entry) return res.status(404).json({ error: 'Không tìm thấy lệnh' });
    return res.json({ entry });
  }

  createEntry(req, res, body) {
    try {
      const entry = journalRepository.createEntry(body);
      const stats = journalRepository.getStats();
      return res.status(201).json({ success: true, entry, stats });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  updateEntry(req, res, params, body) {
    try {
      const entry = journalRepository.updateEntry(params.id, body);
      if (!entry) return res.status(404).json({ error: 'Không tìm thấy lệnh' });
      const stats = journalRepository.getStats();
      return res.json({ success: true, entry, stats });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  deleteEntry(req, res, params) {
    const success = journalRepository.deleteEntry(params.id);
    if (!success) return res.status(404).json({ error: 'Không tìm thấy lệnh' });
    const stats = journalRepository.getStats();
    return res.json({ success: true, stats });
  }

  getStats(req, res) {
    const stats = journalRepository.getStats();
    return res.json({ stats });
  }

  async closeLiveTrade(req, res, params, body) {
    try {
      const entry = journalRepository.getEntryById(params.id);
      if (!entry) return res.status(404).json({ error: 'Không tìm thấy lệnh giao dịch' });

      const coin = (entry.coin || 'BTC').toUpperCase();
      let livePrice = Number(body?.livePrice);

      if (!livePrice || livePrice <= 0) {
        const ticker = await binanceService.getTicker24h(coin);
        livePrice = ticker.price;
      }

      if (!livePrice || livePrice <= 0) {
        return res.status(400).json({ error: 'Không thể lấy giá Binance thời gian thực' });
      }

      const isShort = entry.type?.toUpperCase().includes('SHORT') || entry.type?.toUpperCase().includes('SELL');
      let pnlPct = 0;
      let pnlAmt = 0;

      if (entry.entry_price > 0) {
        if (isShort) {
          pnlPct = ((entry.entry_price - livePrice) / entry.entry_price) * 100;
        } else {
          pnlPct = ((livePrice - entry.entry_price) / entry.entry_price) * 100;
        }
        pnlAmt = entry.position_size > 0 ? (entry.position_size * (pnlPct / 100)) : 0;
      }

      let newStatus = 'BREAKEVEN';
      if (pnlAmt > 0) newStatus = 'WIN';
      else if (pnlAmt < 0) newStatus = 'LOSS';

      const updated = journalRepository.updateEntry(params.id, {
        exit_price: Number(livePrice.toFixed(4)),
        status: newStatus,
        pnl_amount: Number(pnlAmt.toFixed(2)),
        pnl_percent: Number(pnlPct.toFixed(2)),
        notes: (entry.notes || '') + `\n[Chốt lệnh Live Binance tại giá $${livePrice} vào lúc ${new Date().toLocaleString('vi-VN')}]`
      });

      const stats = journalRepository.getStats();
      return res.json({ success: true, entry: updated, stats });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async generateAiReview(req, res, body) {
    try {
      const {
        period = 'WEEK',
        periodType = 'WEEK',
        coinFilter = 'ALL',
        startDate = null,
        endDate = null,
        save = false,
        livePrices = {}
      } = body || {};

      const activePeriod = periodType || period || 'WEEK';
      const review = await journalAuditService.generateAiCoachReview({
        periodType: activePeriod,
        coinFilter,
        startDate,
        endDate,
        save,
        livePrices
      });

      let savedRecord = review?.savedRecord || null;
      if (save && !savedRecord && review) {
        savedRecord = journalRepository.saveTradeReview({
          period_type: review.periodType || review.period_type || activePeriod,
          start_date: startDate || review.start_date || null,
          end_date: endDate || review.end_date || null,
          coin_filter: coinFilter,
          total_trades: review.totalTrades ?? review.total_trades ?? 0,
          discipline_score: review.disciplineScore ?? review.discipline_score ?? 0,
          analysis_data: review
        });
      }
      return res.json({ success: true, review, savedRecord });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  getTradeReviews(req, res, query) {
    const limit = query?.limit ? parseInt(query.limit, 10) : 50;
    const history = journalRepository.getTradeReviews(limit);
    return res.json({ success: true, history, reviews: history });
  }

  deleteTradeReview(req, res, params) {
    const success = journalRepository.deleteTradeReview(params.id);
    if (!success) return res.status(404).json({ error: 'Không tìm thấy bản review' });
    return res.json({ success: true, id: params.id });
  }

  async sendCoachChat(req, res, body) {
    try {
      const { prompt = '', livePrices = {} } = body || {};
      const stats = journalRepository.getStats();
      const entries = journalRepository.getAllEntries();
      const audit = journalAuditService.auditTrades(entries);

      let responseText = '';
      if (prompt.toLowerCase().includes('tâm lý') || prompt.toLowerCase().includes('revenge') || prompt.toLowerCase().includes('gỡ')) {
        responseText = `🧠 **Lời Khuyên Từ AI Discipline Coach (Chương 10 & 11):**\n- Hiện tại điểm kỷ luật của bạn là **${audit.disciplineScore}/100**.\n- Khi gặp lệnh thua, hệ thống dopamine thúc đẩy bạn muốn vào lệnh ngay để "gỡ". Quy tắc vàng: Đóng màn hình, nghỉ ít nhất 60-120 phút.\n- Luôn nhớ: Thị trường tồn tại hàng ngày, việc bảo toàn vốn quan trọng hơn việc tìm kiếm lợi nhuận ngay lập tức.`;
      } else if (prompt.toLowerCase().includes('sl') || prompt.toLowerCase().includes('stop loss') || prompt.toLowerCase().includes('cắt lỗ')) {
        responseText = `🛡️ **Chiến Lược Quản Trị Rủi Ro (Chương 9):**\n- Đã ghi nhận ${audit.missingSlTrades.length} lệnh chưa có Stop Loss.\n- Quy tắc 1%: Tuyệt đối không để một lệnh thua vượt quá 1-2% tổng quy mô tài khoản.\n- Hãy đặt SL ngay tại thời điểm đặt lệnh (Order Block/Đỉnh đáy gần nhất), không bao giờ dời xa SL khi giá đi ngược hướng.`;
      } else {
        responseText = `🎯 **Đánh Giá Tổng Quan Từ AI Trading Coach:**\n- Tổng số lệnh đã ghi nhật ký: **${stats.totalTrades}** lệnh (Tỷ lệ thắng: **${stats.winRate}%**, PnL: **${stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL} USD**).\n- Điểm tuân thủ kỷ luật: **${audit.disciplineScore}/100**.\n- Khuyến nghị: ${audit.recommendations.join(' ')}\n- Hãy duy trì thói quen viết nhật ký chi tiết sau mỗi lệnh để tối ưu hóa Win Rate và R:R!`;
      }

      return res.json({
        success: true,
        response: responseText,
        output: responseText
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new JournalController();
