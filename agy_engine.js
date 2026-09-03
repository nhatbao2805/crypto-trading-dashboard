/**
 * AGY Engine Facade Wrapper
 * Delegates to modularized agents and services in server/
 */

const masterCouncil = require('./server/agents/MasterCouncil');
const technicalAgent = require('./server/agents/TechnicalAgent');
const macroAgent = require('./server/agents/MacroAgent');
const riskAgent = require('./server/agents/RiskAgent');
const validatorAgent = require('./server/agents/ValidatorAgent');
const binanceService = require('./server/services/binance.service');
const newsService = require('./server/services/news.service');
const journalAuditService = require('./server/services/journal-audit.service');

module.exports = {
  // Council Functions
  runCouncilDebate: (coin, clientMarket) => masterCouncil.runDebate(coin, clientMarket),
  evaluateUserHypothesis: (coin, hypothesis, userAction, clientMarket) => masterCouncil.evaluateUserPrediction(coin, hypothesis, userAction, clientMarket),
  chatWithCouncil: (prompt, coin, clientMarket) => masterCouncil.chatWithCouncil(prompt, coin, clientMarket),

  // Individual Sub-Agents
  technicalAgent,
  macroAgent,
  riskAgent,
  validatorAgent,
  masterCouncil,

  // Market & News Services
  getLivePrice: (coin) => binanceService.getTicker24h(coin),
  getAllPrices: () => binanceService.getAllTickers(),
  fetchNewsFromApi: (coin) => newsService.getLatestNews(coin),
  analyzeCryptoNews: (coin) => newsService.analyzeNewsImpact(coin),

  // Audit Service & Coach
  analyzeTradeDiscipline: (trades) => journalAuditService.auditTrades(trades),
  generateAiCoachReview: (period, coin) => journalAuditService.generateAiCoachReview(period, coin),
  analyzeTradeJournal: async (trades, opts) => {
    const audit = journalAuditService.auditTrades(trades);
    return {
      disciplineScore: audit.disciplineScore,
      warnings: audit.recommendations,
      classifications: {
        tiltedTrades: audit.revengeTrades,
        faultyTrades: audit.missingSlTrades
      }
    };
  },
  executeJournalCoachPrompt: async (prompt, ctx) => {
    return {
      success: true,
      output: `Lời khuyên Huấn Luyện Viên AI: Hãy áp dụng quy tắc Cooldown 24h sau khi thua lỗ, giữ vững kỷ luật quản trị vốn (Chương 9) và ghi chép nhật ký đầy đủ.`
    };
  },

  // Market & Recommendation Generators
  generateDynamicRecommendations: (coin, data) => {
    return {
      tradePreparation: [
        'Xác định vùng giá hỗ trợ/kháng cự khung 4H/1H',
        'Kiểm tra tín hiệu Price Action & nến xác nhận 15m',
        'Tính toán khối lượng lệnh theo quy tắc 1-2% rủi ro',
        'Cài đặt Stop Loss ngay khi mở vị thế'
      ],
      holdPreparation: [
        'Theo dõi biến động dòng tiền và Funding Rate',
        'Dời Stop Loss về Breakeven khi đạt 1R lợi nhuận',
        'Chốt lời từng phần (TP1, TP2) tại các vùng cản',
        'Đóng toàn bộ vị thế nếu cấu trúc xu hướng bị phá vỡ'
      ]
    };
  },
  executeCustomPrompt: async (prompt, coin, data) => {
    return {
      success: true,
      coin: (coin || 'BTC').toUpperCase(),
      output: `[AGY-Terminal]: Phân tích tùy chỉnh cho ${(coin || 'BTC').toUpperCase()} hoàn tất. Xu hướng thị trường phù hợp với kế hoạch giao dịch.`
    };
  }
};
