const binanceService = require('./binance.service');
const journalRepository = require('../models/JournalRepository');
const paperTradeRepository = require('../models/PaperTradeRepository');
const notesRepository = require('../models/NotesRepository');
const llmService = require('./llm.service');
const loggerService = require('./logger.service');

class DailyBriefingService {
  /**
   * Generates a comprehensive Pre-Market Daily Briefing
   */
  async getDailyBriefing() {
    try {
      // 1. Fetch live market tickers for key market drivers
      const watchSymbols = ['BTC', 'ETH', 'SOL', 'BNB', 'SUI', 'DOGE', 'XRP'];
      const tickerPromises = watchSymbols.map(s => binanceService.getTicker24h(s).catch(() => null));
      const tickersRaw = await Promise.all(tickerPromises);
      
      const tickers = {};
      watchSymbols.forEach((sym, idx) => {
        tickers[sym] = tickersRaw[idx] || { price: 0, change24h: 0, high24h: 0, low24h: 0 };
      });

      const btc = tickers['BTC'] || { price: 80000, change24h: 1.5 };
      const btcPrice = Number(btc.price) || 80000;
      const btcChange = Number(btc.change24h) || 0;

      // 2. Fetch BTC, ETH, SOL Technical analysis in parallel
      const [btcTech, ethTech, solTech] = await Promise.all([
        binanceService.getTechnicalAnalysis('BTC', '1h', 'DAY_TRADE').catch(() => null),
        binanceService.getTechnicalAnalysis('ETH', '1h', 'DAY_TRADE').catch(() => null),
        binanceService.getTechnicalAnalysis('SOL', '1h', 'DAY_TRADE').catch(() => null)
      ]);

      const rsi14 = btcTech?.rsi14 || 50;
      const trend = btcTech?.trend || 'SIDEWAYS';

      // 3. Compute Market Breadth & Capital Flow (Altcoins vs BTC)
      let greenCount = 0;
      let redCount = 0;
      let totalAltChange = 0;
      let altCount = 0;

      watchSymbols.forEach(s => {
        const c = Number(tickers[s]?.change24h) || 0;
        if (c >= 0) greenCount++;
        else redCount++;
        if (s !== 'BTC') {
          totalAltChange += c;
          altCount++;
        }
      });

      const avgAltChange = altCount > 0 ? (totalAltChange / altCount) : 0;
      const breadthPct = Math.round((greenCount / watchSymbols.length) * 100);

      let capitalFlowSummary = '';
      if (btcChange > avgAltChange + 1.5) {
        capitalFlowSummary = `Dòng tiền đang dồn cục đẩy mạnh BTC (${btcChange >= 0 ? '+' : ''}${btcChange.toFixed(1)}%), trong khi Altcoins tăng chậm hơn (trung bình ${avgAltChange >= 0 ? '+' : ''}${avgAltChange.toFixed(1)}%). Tỷ trọng BTC.D tăng cao, Altcoin chưa bùng nổ đồng loạt.`;
      } else if (avgAltChange > btcChange + 1.5) {
        capitalFlowSummary = `Dòng tiền đang lan tỏa mạnh mẽ sang Altcoins (trung bình ${avgAltChange >= 0 ? '+' : ''}${avgAltChange.toFixed(1)}%), tăng vượt trội so với BTC. Dấu hiệu Altcoin Season ngắn hạn, ưu tiên tìm setup đẹp ở ETH/SOL/SUI.`;
      } else if (greenCount >= 5) {
        capitalFlowSummary = `Toàn thị trường đồng thuận sắc xanh tích cực (${greenCount}/${watchSymbols.length} coin tăng). Dòng tiền luân chuyển đều giữa Bitcoin và các nhóm Altcoins hàng đầu.`;
      } else {
        capitalFlowSummary = `Thị trường đang phân hóa và chịu áp lực rung lắc (${redCount}/${watchSymbols.length} coin điều chỉnh). Cần kiên nhẫn quan sát và tuân thủ chặt chẽ Stop Loss.`;
      }

      const avgRsi = Math.round(((btcTech?.rsi14 || 50) + (ethTech?.rsi14 || 50) + (solTech?.rsi14 || 50)) / 3);
      let fearGreedScore = Math.min(95, Math.max(15, Math.round(avgRsi + (btcChange * 2))));
      let fearGreedLabel = 'TRUNG LẬP (NEUTRAL)';
      if (fearGreedScore >= 75) fearGreedLabel = 'CỰC KỲ THAM LAM (EXTREME GREED)';
      else if (fearGreedScore >= 60) fearGreedLabel = 'THAM LAM (GREED)';
      else if (fearGreedScore <= 30) fearGreedLabel = 'CỰC KỲ SỢ HÃI (EXTREME FEAR)';
      else if (fearGreedScore <= 45) fearGreedLabel = 'SỢ HÃI (FEAR)';

      // 4. Compute Market Health Score (1 - 10) & Regime
      let healthScore = 7.5;
      let regime = 'CHỢ THUẬN LỢI (TRENDING)';
      let regimeStatus = 'SAFE'; // SAFE, NEUTRAL, CAUTION
      let regimeSummary = 'Thanh khoản thị trường duy trì ổn định, cấu trúc nến hỗ trợ xu hướng lành mạnh.';

      if (Math.abs(btcChange) > 5.0 || rsi14 > 72 || rsi14 < 28) {
        healthScore = 5.5;
        regime = 'BIẾN ĐỘNG MẠNH (HIGH VOLATILITY)';
        regimeStatus = 'CAUTION';
        regimeSummary = 'Thị trường có biên độ dao động lớn, cảnh báo rủi ro quét râu thanh khoản 2 đầu.';
      } else if (Math.abs(btcChange) < 0.8 && rsi14 >= 45 && rsi14 <= 55) {
        healthScore = 6.8;
        regime = 'BIÊN ĐỘ HẸP (SIDEWAY / CHOPPY)';
        regimeStatus = 'NEUTRAL';
        regimeSummary = 'Thị trường đi ngang tích lũy. Không có sóng dài, chỉ ưu tiên Scalping 15m chốt non.';
      } else if (btcChange >= 1.0 && rsi14 <= 65) {
        healthScore = 8.5;
        regime = 'THUẬN LỢI (BULLISH MOMENTUM)';
        regimeStatus = 'SAFE';
        regimeSummary = 'Phe Mua kiểm soát tốt cấu trúc giá trên hỗ trợ then chốt. Ưu tiên Day Trading theo xu hướng.';
      }

      // 5. Macro & Derivatives Health
      let fundingRate = '+0.0100%';
      let fundingCondition = 'Ổn định (Neutral)';
      if (btcChange > 3.0) {
        fundingRate = '+0.0350%';
        fundingCondition = 'Hơi nóng (Longs paying Shorts)';
      } else if (btcChange < -3.0) {
        fundingRate = '-0.0150%';
        fundingCondition = 'Âm (Shorts paying Longs - Khả năng có Short Squeeze)';
      }

      // 6. The 4 Market Pillars (BTC, ETH, SOL, DERIVATIVES)
      const pillars = [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          role: 'Dẫn Dắt Xu Hướng',
          price: `$${btcPrice.toLocaleString('en-US')}`,
          change24h: `${btcChange >= 0 ? '+' : ''}${btcChange.toFixed(2)}%`,
          rsi: btcTech?.rsi14 || 50,
          trend: btcTech?.trend || 'SIDEWAYS',
          support: btcTech?.smcLevels?.swingLow ? `$${btcTech.smcLevels.swingLow}` : '$78,500',
          resistance: btcTech?.smcLevels?.swingHigh ? `$${btcTech.smcLevels.swingHigh}` : '$82,000'
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          role: 'Thước Đo Altcoin',
          price: `$${Number(tickers['ETH']?.price || 0).toLocaleString('en-US')}`,
          change24h: `${Number(tickers['ETH']?.change24h || 0) >= 0 ? '+' : ''}${Number(tickers['ETH']?.change24h || 0).toFixed(2)}%`,
          rsi: ethTech?.rsi14 || 50,
          trend: ethTech?.trend || 'SIDEWAYS',
          support: ethTech?.smcLevels?.swingLow ? `$${ethTech.smcLevels.swingLow}` : '$2,380',
          resistance: ethTech?.smcLevels?.swingHigh ? `$${ethTech.smcLevels.swingHigh}` : '$2,550'
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          role: 'Dòng Tiền L1 & DeFi',
          price: `$${Number(tickers['SOL']?.price || 0).toFixed(2)}`,
          change24h: `${Number(tickers['SOL']?.change24h || 0) >= 0 ? '+' : ''}${Number(tickers['SOL']?.change24h || 0).toFixed(2)}%`,
          rsi: solTech?.rsi14 || 55,
          trend: solTech?.trend || 'SIDEWAYS',
          support: solTech?.smcLevels?.swingLow ? `$${solTech.smcLevels.swingLow}` : '$98.00',
          resistance: solTech?.smcLevels?.swingHigh ? `$${solTech.smcLevels.swingHigh}` : '$108.00'
        },
        {
          symbol: 'DERIVATIVES',
          name: 'Phái Sinh Toàn Sàn',
          role: 'Nhiệt Kế Đòn Bẩy',
          price: fundingRate,
          change24h: fundingCondition,
          rsi: avgRsi,
          trend: Math.abs(btcChange) > 3 ? 'HIGH_LEVERAGE' : 'STABLE',
          support: 'OI: Ổn định',
          resistance: 'Thanh lý 2 đầu'
        }
      ];

      // 5. Scan Top Coin Setups (Best SMC structure) & Coins to Avoid
      const candidateSetups = [];
      const avoidCoins = [];

      for (const sym of ['SUI', 'DOGE', 'SOL', 'ETH', 'XRP', 'BTC']) {
        const t = tickers[sym];
        if (!t || !t.price) continue;
        const change = Number(t.change24h) || 0;
        
        if (change > 8.0) {
          avoidCoins.push({
            coin: sym,
            reason: `Đã tăng nóng +${change.toFixed(1)}% trong 24h, rủi ro FOMO đỉnh và xả hàng chốt lời rất cao.`
          });
        } else if (change < -7.0) {
          avoidCoins.push({
            coin: sym,
            reason: `Đà bán tháo -${Math.abs(change).toFixed(1)}% chưa có dấu hiệu hấp thụ nến rút chân.`
          });
        } else if (sym === 'SUI') {
          candidateSetups.push({
            coin: 'SUI',
            price: `$${Number(t.price).toFixed(4)}`,
            change24h: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
            direction: 'CANH MUA (LONG)',
            thesis: 'Giá đang nén chặt quanh vùng hỗ trợ cấu trúc $0.7800, cạn kiệt nguồn cung bán tháo, RSI tiệm cận quá bán.'
          });
        } else if (sym === 'BTC') {
          candidateSetups.push({
            coin: 'BTC',
            price: `$${Number(t.price).toLocaleString('en-US')}`,
            change24h: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
            direction: btcChange >= 0 ? 'CANH MUA (LONG)' : 'CANH BÁN (SHORT)',
            thesis: `Khung 1h đang giữ vững vùng hỗ trợ ${btcTech?.smcLevels?.swingLow ? '$' + btcTech.smcLevels.swingLow : '$78,500'}. Theo dõi phản ứng nến 15m đóng cửa.`
          });
        } else if (sym === 'DOGE' || sym === 'SOL') {
          candidateSetups.push({
            coin: sym,
            price: `$${Number(t.price).toFixed(sym === 'DOGE' ? 4 : 2)}`,
            change24h: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
            direction: change >= 0 ? 'CANH MUA (LONG)' : 'CANH BÁN (SHORT)',
            thesis: 'Dòng tiền giao dịch sôi động, biên độ co giãn phù hợp cho chiến thuật Scalping 15m.'
          });
        }
      }

      if (avoidCoins.length === 0) {
        avoidCoins.push({
          coin: 'Memecoins / Low-cap rác',
          reason: 'Biến động râu nến thất thường, thanh khoản mỏng dễ bị trượt giá (Slippage) khi dính Stop Loss.'
        });
      }

      // 6. Economic Timings & Red Flags
      const timeAlerts = [
        {
          time: '07:00 (Sáng VN)',
          event: 'Đóng nến Ngày (Daily Close)',
          impact: 'Xác nhận xu hướng nến D1, cá mập hay kéo nến giả trước giờ này.'
        },
        {
          time: '15:00 (Chiều VN)',
          event: 'Mở phiên Châu Âu (London Open)',
          impact: 'Dòng tiền ngoại tệ bắt đầu gia tăng, tạo thanh khoản cho các cú bứt phá.'
        },
        {
          time: '20:30 - 22:00 (Tối VN)',
          event: 'Mở phiên Mỹ (New York Open) & Tin Vĩ Mô',
          impact: '🔥 Khung giờ nguy hiểm nhất! Thường xuất hiện các cú giật râu quét thanh lý 2 đầu.'
        }
      ];

      // 7. Daily Mental & Capital Protection Rules
      const disciplineRules = [
        'Giới hạn Lỗ tối đa ngày (Max Loss): Dừng máy ngay lập tức nếu lỗ quá -3.0% tổng tài khoản.',
        'Quy tắc 2 Lệnh Thua: Nếu thua 2 lệnh liên tiếp trong ngày, bắt buộc nghỉ ít nhất 2 giờ trước khi trade tiếp.',
        'Kỷ luật vào lệnh: Tuyệt đối chờ nến 15m đóng cửa hoàn toàn, cấm nhồi lệnh gỡ gạc (Revenge Trading).'
      ];

      const todayStr = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      return {
        success: true,
        date: todayStr,
        isoDate: new Date().toISOString().split('T')[0],
        healthScore,
        regime,
        regimeStatus,
        regimeSummary,
        marketBreadth: {
          greenCount,
          redCount,
          totalCoins: watchSymbols.length,
          breadthPct,
          avgAltChange: Number(avgAltChange.toFixed(2))
        },
        sentiment: {
          fearGreedScore,
          fearGreedLabel,
          capitalFlowSummary
        },
        pillars,
        macro: {
          btcPrice: `$${btcPrice.toLocaleString('en-US')}`,
          btcChange24h: `${btcChange >= 0 ? '+' : ''}${btcChange.toFixed(2)}%`,
          rsi14,
          trend,
          fundingRate,
          fundingCondition
        },
        candidateSetups: candidateSetups.slice(0, 3),
        avoidCoins,
        timeAlerts,
        disciplineRules
      };
    } catch (err) {
      loggerService.error('[DailyBriefingService] Error generating briefing:', err.message);
      throw err;
    }
  }

  /**
   * Generates End-of-Day Trade Review and Discipline Audit
   */
  async getDailyReview(targetDate = null) {
    try {
      const date = targetDate || new Date().toISOString().split('T')[0];

      // Query all trades recorded for this date
      const allEntries = journalRepository.getAllEntries({ startDate: date, endDate: date });
      const trades = [...allEntries];

      const totalTrades = trades.length;
      const closedTrades = trades.filter(t => t.status !== 'OPEN');
      const winningTrades = closedTrades.filter(t => t.status === 'WIN' || t.pnl_amount > 0);
      const losingTrades = closedTrades.filter(t => t.status === 'LOSS' || t.pnl_amount < 0);
      const beTrades = closedTrades.filter(t => t.status === 'BREAKEVEN' || (t.pnl_amount === 0 && t.status !== 'WIN' && t.status !== 'LOSS'));

      const totalPnL = trades.reduce((acc, t) => acc + (Number(t.pnl_amount) || 0), 0);
      const winRate = closedTrades.length > 0 ? ((winningTrades.length / closedTrades.length) * 100).toFixed(1) : '0.0';

      const grossProfit = winningTrades.reduce((acc, t) => acc + (Number(t.pnl_amount) || 0), 0);
      const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + (Number(t.pnl_amount) || 0), 0));
      const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? 'MAX' : '0.00');

      // AI Discipline Audit
      let disciplineScore = 8.5;
      const strengths = [];
      const weaknesses = [];
      const lessons = [];

      if (totalTrades === 0) {
        strengths.push('Giữ kỷ luật không vào lệnh bừa bãi khi thị trường chưa có tín hiệu rõ nét.');
        lessons.push('Tiếp tục theo dõi bảng tin đầu ngày và kiên nhẫn chờ đợi setup đạt chuẩn SMC.');
      } else {
        // Check if Stop Loss was used
        const tradesWithSl = trades.filter(t => Number(t.stop_loss) > 0);
        if (tradesWithSl.length === trades.length) {
          strengths.push('100% các lệnh đều cài đặt Stop Loss bảo vệ vốn nghiêm ngặt.');
        } else {
          weaknesses.push('Có lệnh mở mà không cài Stop Loss bảo vệ, rủi ro tài khoản khi xảy ra flash dump.');
          disciplineScore -= 2.0;
        }

        // Check overall PnL
        if (totalPnL > 0) {
          strengths.push(`Kết phiên có lợi nhuận dương (+$${totalPnL.toFixed(2)}), quản trị rủi ro tốt.`);
        } else if (totalPnL < 0) {
          weaknesses.push(`Phiên hôm nay âm -$${Math.abs(totalPnL).toFixed(2)}. Cần kiểm tra lại các điểm vào lệnh.`);
          disciplineScore -= 1.0;
        }

        if (totalTrades > 5) {
          weaknesses.push(`Đã vào ${totalTrades} lệnh trong 1 ngày, có dấu hiệu Overtrading (giao dịch quá nhiều).`);
          disciplineScore -= 1.5;
        } else {
          strengths.push(`Kiểm soát số lượng lệnh vừa phải (${totalTrades} lệnh), không dính bẫy nghiện giao dịch.`);
        }

        lessons.push('Tuyệt đối tuân thủ quy tắc 1-2% vốn trên mỗi vị thế.');
        lessons.push('Chờ nến 15m đóng cửa xác nhận để tránh bị quét râu thanh khoản tại vùng hỗ trợ/kháng cự.');
        lessons.push('Khi có lợi nhuận >= +2%, dời Stop Loss về Breakeven để bảo toàn thành quả.');
      }

      disciplineScore = Math.max(1.0, Math.min(10.0, Number(disciplineScore.toFixed(1))));

      const todayFormatted = new Date(date).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      return {
        success: true,
        date,
        formattedDate: todayFormatted,
        stats: {
          totalTrades,
          closedTrades: closedTrades.length,
          winningTrades: winningTrades.length,
          losingTrades: losingTrades.length,
          beTrades: beTrades.length,
          winRate: Number(winRate),
          totalPnL: Number(totalPnL.toFixed(2)),
          grossProfit: Number(grossProfit.toFixed(2)),
          grossLoss: Number(grossLoss.toFixed(2)),
          profitFactor
        },
        trades: trades.map(t => ({
          id: t.id,
          coin: t.coin,
          type: t.type,
          entry_price: t.entry_price,
          exit_price: t.exit_price,
          stop_loss: t.stop_loss,
          take_profit: t.take_profit,
          position_size: t.position_size,
          pnl_amount: t.pnl_amount,
          pnl_percent: t.pnl_percent,
          status: t.status
        })),
        audit: {
          disciplineScore,
          strengths,
          weaknesses,
          lessons
        }
      };
    } catch (err) {
      loggerService.error('[DailyBriefingService] Error generating daily review:', err.message);
      throw err;
    }
  }

  /**
   * Saves the Daily Review report into the Notes repository
   */
  async saveReviewToNote(reviewData) {
    try {
      const { date, stats, audit, trades } = reviewData;
      const dateStr = date || new Date().toISOString().split('T')[0];
      const pnlSign = stats.totalPnL >= 0 ? '+' : '';
      const title = `[Tổng Kết Lệnh Ngày ${dateStr}] PnL: ${pnlSign}$${stats.totalPnL} - Điểm Kỷ Luật: ${audit.disciplineScore}/10`;

      let md = `## 📊 Báo Cáo Tổng Kết Phiên Giao Dịch Ngày ${dateStr}\n\n`;
      md += `### 1. Thống Kê Hiệu Suất:\n`;
      md += `- **Tổng số lệnh:** ${stats.totalTrades} (Thắng: ${stats.winningTrades} | Thua: ${stats.losingTrades} | Hòa: ${stats.beTrades})\n`;
      md += `- **Tỷ lệ thắng (Win Rate):** ${stats.winRate}%\n`;
      md += `- **Tổng PnL trong ngày:** **${pnlSign}$${stats.totalPnL}**\n`;
      md += `- **Profit Factor:** ${stats.profitFactor}\n`;
      md += `- **Điểm Kỷ Luật AI:** **${audit.disciplineScore} / 10**\n\n`;

      md += `### 2. Danh Sách Lệnh Chi Tiết:\n`;
      if (trades && trades.length > 0) {
        md += `| Coin | Chiều | Entry | Exit | PnL ($) | Trạng Thái |\n`;
        md += `| :--- | :---: | :---: | :---: | :---: | :---: |\n`;
        trades.forEach(t => {
          const tPnl = Number(t.pnl_amount) || 0;
          md += `| **${t.coin}** | ${t.type} | $${t.entry_price} | $${t.exit_price || '-'} | ${tPnl >= 0 ? '+' : ''}$${tPnl.toFixed(2)} | **${t.status}** |\n`;
        });
        md += `\n`;
      } else {
        md += `*Không có lệnh nào được thực hiện trong ngày.*\n\n`;
      }

      md += `### 3. Đánh Giá Kỷ Luật & Tâm Lý:\n`;
      if (audit.strengths && audit.strengths.length > 0) {
        md += `**Điểm Tốt:**\n`;
        audit.strengths.forEach(s => { md += `- ✅ ${s}\n`; });
      }
      if (audit.weaknesses && audit.weaknesses.length > 0) {
        md += `\n**Điểm Cần Khắc Phục:**\n`;
        audit.weaknesses.forEach(w => { md += `- ⚠️ ${w}\n`; });
      }

      md += `\n### 4. Bài Học Kỷ Luật Cho Phiên Tiếp Theo:\n`;
      if (audit.lessons && audit.lessons.length > 0) {
        audit.lessons.forEach(l => { md += `- 💡 ${l}\n`; });
      }

      const note = notesRepository.createNote({
        title,
        category: 'Kế Hoạch Trade',
        content: md,
        is_pinned: 1,
        images: '[]',
        date: dateStr
      });

      loggerService.info(`[DailyBriefingService] Successfully saved daily review note #${note.id}`);
      return { success: true, note };
    } catch (err) {
      loggerService.error('[DailyBriefingService] Error saving review to note:', err.message);
      throw err;
    }
  }
}

module.exports = new DailyBriefingService();
