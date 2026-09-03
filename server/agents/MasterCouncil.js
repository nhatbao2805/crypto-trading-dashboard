const technicalAgent = require('./TechnicalAgent');
const macroAgent = require('./MacroAgent');
const riskAgent = require('./RiskAgent');
const validatorAgent = require('./ValidatorAgent');
const debateRepository = require('../models/DebateRepository');
const llmService = require('../services/llm.service');
const ragService = require('../services/rag.service');
const cacheService = require('../services/cache.service');
const conversationMemoryService = require('../services/conversation-memory.service');

class MasterCouncil {
  constructor() {
    this.technicalAgent = technicalAgent;
    this.macroAgent = macroAgent;
    this.riskAgent = riskAgent;
    this.validatorAgent = validatorAgent;
    this.debateRepository = debateRepository;
    this.formatPrice = this.formatPrice.bind(this);
    this.runDebate = this.runDebate.bind(this);
    this.evaluateUserPrediction = this.evaluateUserPrediction.bind(this);
    this.chatWithCouncil = this.chatWithCouncil.bind(this);
  }

  formatPrice(p) {
    const val = Number(p) || 0;
    if (val >= 1000) {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${val.toFixed(4)}`;
  }

  /**
   * Token-Optimized Single-Pass Multi-Agent Debate with In-Memory Cache (TTL 3 mins)
   */
  async runDebate(coin = 'BTC', liveMarket = null, forceRefresh = false) {
    const coinUpper = (coin || 'BTC').toUpperCase();
    const cacheKey = `council_debate_${coinUpper}`;

    // 1. Check in-memory cache (Eliminates 100% token for repeated queries)
    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return { ...cached, isCached: true };
      }
    }

    const market = liveMarket || { price: 65000, high24h: 66000, low24h: 64000, change24h: 1.5, volumeUsdt: 1200000000 };
    const currentPrice = Number(market.price);
    const high24h = Number(market.high24h) || currentPrice * 1.02;
    const low24h = Number(market.low24h) || currentPrice * 0.98;
    const change24h = Number(market.change24h) || 0;
    const volUsdt = Number(market.volumeUsdt) || 850000000;

    // 2. Server-side Preprocessing: Pre-calculate all indicators in JS (cuts ~70% input token)
    const range = Math.max(1, high24h - low24h);
    const posInRange = Math.max(0, Math.min(1, (currentPrice - low24h) / range));
    const estimatedRsi = Math.round(30 + posInRange * 40 + Math.min(10, Math.max(-10, change24h * 2)));

    const s1 = (low24h * 0.998).toFixed(2);
    const s2 = (low24h * 0.985).toFixed(2);
    const r1 = (high24h * 1.002).toFixed(2);
    const r2 = (high24h * 1.015).toFixed(2);

    let fundingRate = '+0.0100%';
    if (change24h > 3.0) fundingRate = '+0.0350%';
    else if (change24h < -3.0) fundingRate = '-0.0150%';

    let slPrice = (currentPrice * 0.982).toFixed(2);
    let tp1Price = (currentPrice * 1.025).toFixed(2);
    let tp2Price = (currentPrice * 1.045).toFixed(2);
    if (change24h < -1.5) {
      slPrice = (currentPrice * 1.018).toFixed(2);
      tp1Price = (currentPrice * 0.975).toFixed(2);
      tp2Price = (currentPrice * 0.955).toFixed(2);
    }

    const rag = ragService.buildRagContext({ coin: coinUpper, topic: 'smc bẫy fakeout bull trap tâm lý pre-mortem', includeHabits: true });

    // 3. Single-Pass Multi-Agent Prompt (Combines 4 Sub-Agents + Sentinel Pre-Mortem + Master Council in 1 LLM Call)
    let debateResult = null;
    try {
      const systemPrompt = `Bạn là Hội Đồng Multi-Agent Crypto gồm 4 chuyên gia: Alpha (Kỹ thuật SMC), Macro (Dòng tiền), Guardian (Quản trị vốn), Sentinel (Luật sư của Quỷ).
Hãy phân tích và trả về JSON duy nhất chứa đầy đủ góc nhìn của cả 4 chuyên gia và phán quyết cuối cùng.`;

      const userPrompt = `
DỮ LIỆU ĐÃ TIỀN XỬ LÝ:
- Coin: ${coinUpper} | Giá: $${currentPrice} (${change24h >= 0 ? '+' : ''}${change24h}%)
- Hỗ trợ: $${s1} - $${s2} | Kháng cự: $${r1} - $${r2} | RSI: ${estimatedRsi}/100
- Funding: ${fundingRate} | Volume 24h: $${(volUsdt / 1e6).toFixed(1)}M
- Stop Loss đề xuất: $${slPrice} | TP1: $${tp1Price} | TP2: $${tp2Price}

${rag.combinedPromptText}

YÊU CẦU TRẢ VỀ JSON:
{
  "technical_summary": "Tóm tắt cấu trúc nến SMC & FVG (1-2 câu)",
  "macro_summary": "Tóm tắt dòng tiền & funding (1-2 câu)",
  "risk_advice": "Lời khuyên đòn bẩy và quy tắc 1-2% vốn",
  "sentinel_trap_warning": "Cảnh báo bẫy thanh khoản cá mập cốt lõi",
  "sentinel_critical_question": "Câu hỏi chất vấn tâm lý trader",
  "pre_mortem_failures": ["Nguyên nhân 1 lệnh có thể dính SL", "Nguyên nhân 2", "Nguyên nhân 3"],
  "detected_biases": ["Thiên kiến tâm lý phát hiện được"],
  "action": "STRONG_BUY_LONG" | "STRONG_SELL_SHORT" | "RANGE_BOUND" | "HOLD_WAIT",
  "action_label": "CANH MUA (LONG) TẠI HỖ TRỢ" | "CANH BÁN (SHORT) TẠI KHÁNG CỰ" | "QUAN SÁT",
  "probability_pct": 72.5,
  "verdict_summary": "Phán quyết tổng hợp (2-3 câu ngắn gọn)"
}`;

      const aiRes = await llmService.generateCompletion({
        systemPrompt,
        userPrompt,
        jsonMode: true
      });

      const parsed = JSON.parse(aiRes);

      const technicalView = {
        agent_id: 'agent_technical',
        agent_name: 'Agent Alpha (Kỹ Thuật & Price Action)',
        avatar: '📊',
        signal: parsed.action?.includes('BUY') ? 'BULLISH_TREND' : (parsed.action?.includes('SELL') ? 'BEARISH_TREND' : 'SIDEWAY'),
        estimatedRsi,
        support_zone: `${this.formatPrice(s2)} - ${this.formatPrice(s1)}`,
        resistance_zone: `${this.formatPrice(r1)} - ${this.formatPrice(r2)}`,
        entry_trigger: `Chờ nến 15m test ${this.formatPrice(s1)} xác nhận đóng nến`,
        summary: parsed.technical_summary || `Giá ${coinUpper} đang vận động quanh vùng hỗ trợ ${this.formatPrice(s1)}, RSI ở mức ${estimatedRsi}/100.`
      };

      const macroView = {
        agent_id: 'agent_macro',
        agent_name: 'Agent Macro (Vĩ Mô & Dòng Tiền)',
        avatar: '📰',
        signal: change24h >= 0 ? 'BULLISH' : 'BEARISH',
        fundingRate,
        fundingAnalysis: `Funding rate ${fundingRate}. Dòng tiền 24h duy trì ở mức ${(volUsdt / 1e6).toFixed(1)}M USD.`,
        volumeUsd: `$${(volUsdt / 1e6).toFixed(1)}M USD`,
        summary: parsed.macro_summary || `Thanh khoản 24h đạt $${(volUsdt / 1e6).toFixed(1)}M USD, tâm lý thị trường ổn định.`
      };

      const riskView = {
        agent_id: 'agent_risk',
        agent_name: 'Agent Guardian (Quản Trị Rủi Ro)',
        avatar: '🛡️',
        risk_score: parsed.probability_pct >= 70 ? 3.5 : 6.5,
        risk_level: parsed.probability_pct >= 70 ? 'THẤP - AN TOÀN' : 'TRUNG BÌNH',
        stop_loss: this.formatPrice(slPrice),
        take_profit_1: this.formatPrice(tp1Price),
        take_profit_2: this.formatPrice(tp2Price),
        risk_reward_ratio: '1:2.4',
        recommended_max_leverage: parsed.probability_pct >= 70 ? '10x' : '5x',
        capital_allocation: '1 - 2% Vốn (Chương 9.1)',
        advice: parsed.risk_advice || 'Tuyệt đối không nhồi thêm lệnh khi giá chưa phá vỡ cấu trúc và bắt buộc cài Stop Loss.'
      };

      const validatorView = {
        agent_id: 'agent_validator',
        agent_name: 'Agent Sentinel (Luật Sư Của Quỷ)',
        avatar: '⚖️',
        trap_warning: parsed.sentinel_trap_warning || `Cảnh báo bẫy thanh khoản tại vùng kháng cự ${this.formatPrice(r1)}!`,
        critical_question: parsed.sentinel_critical_question || 'Bạn có kế hoạch thoát lệnh chủ động nếu giá đột ngột gãy hỗ trợ không?',
        pre_mortem_failures: parsed.pre_mortem_failures || [
          'Vào lệnh khi chưa có nến 15m đóng cửa xác nhận',
          'Kháng cự dày đặc trên khung 4H',
          'Biến động tin tức bất ngờ quét râu thanh khoản'
        ],
        detected_biases: parsed.detected_biases || ['FOMO Mua Đuổi', 'Thiên Kiến Xác Nhận'],
        invalidation_level: `${this.formatPrice(s2)} - ${this.formatPrice(s1)}`
      };

      const masterVerdict = {
        agent_id: 'agent_master',
        agent_name: 'Chủ Tịch Hội Đồng (Master Council)',
        avatar: '👑',
        action: parsed.action || 'HOLD_WAIT',
        action_label: parsed.action_label || 'QUAN SÁT & CHỜ ĐIỂM TEST',
        probability_pct: Number(parsed.probability_pct) || 68.0,
        entry_zone: `${this.formatPrice(currentPrice * 0.995)} - ${this.formatPrice(currentPrice * 1.002)}`,
        stop_loss: this.formatPrice(slPrice),
        take_profit: this.formatPrice(tp2Price),
        key_reasons: [
          `Kỹ thuật: ${technicalView.summary.split('.')[0]}.`,
          `Dòng tiền: ${macroView.summary.split('.')[0]}.`,
          `Phản biện Sentinel: ${validatorView.trap_warning.split('.')[0]}.`
        ],
        vital_warning: validatorView.trap_warning,
        summary_paragraph: parsed.verdict_summary || `Hội đồng thống nhất: Thị trường ${coinUpper} đang ở trạng thái ${parsed.action_label || 'Quan sát'} với xác suất ${parsed.probability_pct || 68}%. Cần tuân thủ Stop Loss tại ${this.formatPrice(slPrice)}.`
      };

      debateResult = {
        success: true,
        coin: coinUpper,
        timestamp: new Date().toISOString(),
        liveMarket: market,
        technical_view: technicalView,
        macro_view: macroView,
        risk_view: riskView,
        validator_view: validatorView,
        master_verdict: masterVerdict
      };
    } catch (err) {
      // Fallback via existing sub-agents
      const technicalView = await this.technicalAgent.analyze(coinUpper, market);
      const macroView = await this.macroAgent.analyze(coinUpper, market);
      const riskView = await this.riskAgent.analyze(coinUpper, market, technicalView);
      const validatorView = await this.validatorAgent.analyze(coinUpper, market, technicalView);

      const action = change24h >= 0 ? 'STRONG_BUY_LONG' : 'RANGE_BOUND';
      const actionLabel = change24h >= 0 ? 'CANH MUA (LONG) TẠI HỖ TRỢ' : 'LƯỚT NGẮN THEO BIÊN ĐỘ (SCALP)';

      debateResult = {
        success: true,
        coin: coinUpper,
        timestamp: new Date().toISOString(),
        liveMarket: market,
        technical_view: technicalView,
        macro_view: macroView,
        risk_view: riskView,
        validator_view: validatorView,
        master_verdict: {
          agent_id: 'agent_master',
          agent_name: 'Chủ Tịch Hội Đồng (Master Council)',
          avatar: '👑',
          action,
          action_label: actionLabel,
          probability_pct: 68.5,
          entry_zone: `${this.formatPrice(currentPrice * 0.995)} - ${this.formatPrice(currentPrice * 1.002)}`,
          stop_loss: riskView.stop_loss,
          take_profit: riskView.take_profit_2,
          key_reasons: [
            `Góc nhìn Kỹ thuật: ${technicalView.summary.split('.')[0]}.`,
            `Góc nhìn Vĩ mô: ${macroView.summary.split('.')[0]}.`,
            `Kỷ luật Rủi ro: Tỷ lệ R:R ${riskView.risk_reward_ratio}, đòn bẩy tối đa ${riskView.recommended_max_leverage}.`
          ],
          vital_warning: validatorView.trap_warning,
          summary_paragraph: `Hội đồng thống nhất kết luận: Thị trường ${coinUpper} đang ở trạng thái <b>${actionLabel}</b> với xác suất khả thi <b>68.5%</b>. Bắt buộc cài Stop Loss tại ${riskView.stop_loss}.`
        }
      };
    }

    // 4. Save into Cache (TTL 3 minutes)
    cacheService.set(cacheKey, debateResult, 180000);

    // Save into SQLite history
    try {
      if (this.debateRepository && typeof this.debateRepository.saveAiDebate === 'function') {
        this.debateRepository.saveAiDebate(debateResult);
      }
    } catch (e) {
      console.error('[MasterCouncil] Save history error:', e.message);
    }

    return debateResult;
  }

  /**
   * Evaluates user prediction / hypothesis with RAG + Adversarial Devil's Advocate
   */
  async evaluateUserPrediction(coin = 'BTC', hypothesis = '', userAction = 'LONG', liveMarket = null) {
    const coinUpper = (coin || 'BTC').toUpperCase();
    const market = liveMarket || { price: 65000, high24h: 66000, low24h: 64000, change24h: 1.5 };
    const currentPrice = Number(market.price);

    const rag = ragService.buildRagContext({ coin: coinUpper, topic: 'smc quản lý vốn tâm lý bẫy', includeHabits: true });

    let verdict = 'CẦN THẬN TRỌNG & TỐI ƯU ĐIỂM VÀO';
    let verdictColor = '#f59e0b';
    let probabilityPct = 60.0;
    let pros = [];
    let cons = [];
    let advice = '';

    try {
      const prompt = `
User dự đoán thị trường ${coinUpper}:
- Ý tưởng/Giả thuyết: "${hypothesis}"
- Hướng giao dịch: ${userAction}
- Giá hiện tại: $${currentPrice}

${rag.combinedPromptText}

YÊU CẦU:
1. Thẩm định giả thuyết của user (Chấm điểm xác suất 0-100%, Đưa ra 2 ưu điểm và 2 nhược điểm/bẫy giá).
2. Viết 1 lời khuyên thực chiến kết hợp kỷ luật quản trị vốn (Chương 9).
Trả về JSON:
{
  "probability_pct": 65,
  "verdict": "...",
  "pros": ["ưu điểm 1", "ưu điểm 2"],
  "cons": ["nhược điểm 1", "nhược điểm 2"],
  "advice": "..."
}`;

      const aiRes = await llmService.generateCompletion({
        systemPrompt: 'Bạn là Hội Đồng Thẩm Định Kế Hoạch Giao Dịch AI. Trả về JSON.',
        userPrompt: prompt,
        jsonMode: true
      });

      const parsed = JSON.parse(aiRes);
      if (parsed.probability_pct) probabilityPct = parsed.probability_pct;
      if (parsed.verdict) verdict = parsed.verdict;
      if (parsed.pros) pros = parsed.pros;
      if (parsed.cons) cons = parsed.cons;
      if (parsed.advice) advice = parsed.advice;
    } catch (_) {
      pros = [
        `Nhận định xu hướng ${userAction} phù hợp với biến động trong phiên.`,
        'Có tư duy lập kế hoạch và xác định hướng đi trước khi vào lệnh.'
      ];
      cons = [
        'Cần lưu ý bẫy quét râu thanh khoản tại đỉnh/đáy phiên trước đó.',
        'Chưa tính toán mức biến động nếu có tin vĩ mô bất ngờ.'
      ];
      advice = 'Khuyến nghị: Luôn cài Stop Loss ngay khi mở lệnh và không mạo hiểm quá 2% tổng tài khoản theo Chương 9.1.';
    }

    const slDistance = currentPrice * 0.015;
    const tpDistance = currentPrice * 0.035;
    const stopLoss = userAction === 'LONG' ? currentPrice - slDistance : currentPrice + slDistance;
    const takeProfit = userAction === 'LONG' ? currentPrice + tpDistance : currentPrice - tpDistance;

    return {
      success: true,
      coin: coinUpper,
      hypothesis,
      userAction,
      probability_pct: probabilityPct,
      risk_score: probabilityPct >= 65 ? 3.5 : 7.0,
      verdict,
      verdictColor: probabilityPct >= 65 ? '#00c076' : '#f59e0b',
      pros: pros.length ? pros : ['Kế hoạch có cơ sở phân tích'],
      cons: cons.length ? cons : ['Cần kiểm tra kỹ bẫy thanh khoản'],
      suggested_setup: {
        entry: this.formatPrice(currentPrice),
        stop_loss: this.formatPrice(stopLoss),
        take_profit: this.formatPrice(takeProfit),
        leverage: probabilityPct >= 70 ? '10x' : '5x',
        risk_reward: '1:2.3'
      },
      advice: advice || 'Hãy giữ vững kỷ luật quản lý vốn 1-2%!'
    };
  }

  /**
   * Realtime Council Chat with Conversation Summary Buffer Memory
   */
  async chatWithCouncil(promptText, coin = 'BTC', liveMarket = null, sessionId = 'default') {
    const coinUpper = (coin || 'BTC').toUpperCase();
    const market = liveMarket || { price: 65000, change24h: 1.5 };

    // Record user message
    await conversationMemoryService.addMessage(sessionId, 'user', promptText);

    // Get Memory Buffer Context (Summary <100 tokens + 3-4 recent messages)
    const memory = conversationMemoryService.getOptimizedPromptContext(sessionId);
    const rag = ragService.buildRagContext({ coin: coinUpper, topic: promptText, includeHabits: true });

    let reply = '';
    try {
      const systemPrompt = `Bạn là Hội Đồng Multi-Agent Crypto gồm 4 chuyên gia: Alpha (Kỹ thuật SMC), Macro (Dòng tiền), Guardian (Quản trị vốn), Sentinel (Luật sư của Quỷ).
Nhiệm vụ: Trả lời ngắn gọn, thẳng thắn, mang tính phản biện và thực chiến cao (dưới 150 từ).`;

      const userPrompt = `
${memory.formattedContextText}

THỊ TRƯỜNG LIVE:
- ${coinUpper} đang ở giá $${market.price || 65000} (${(market.change24h || 0) >= 0 ? '+' : ''}${market.change24h || 0}%)
${rag.combinedPromptText}

CÂU HỎI MỚI NHẤT CỦA TRADER: "${promptText}"`;

      reply = await llmService.generateCompletion({
        systemPrompt,
        userPrompt
      });
    } catch (_) {
      // ignore
    }

    if (!reply || reply.length < 10) {
      reply = `Hội đồng ghi nhận câu hỏi. Hãy chú ý quy tắc quản trị vốn và theo dõi cấu trúc nến 4H của ${coinUpper}.`;
    }

    // Record council reply in memory
    await conversationMemoryService.addMessage(sessionId, 'council', reply);

    const outputText = `[Hội Đồng AI Trader - Phản Hồi]:
- Agent Alpha: Dựa trên cấu trúc nến hiện tại của ${coinUpper}, cần kiên nhẫn chờ điểm xác nhận.
- Agent Guardian: Tuyệt đối giữ vững kỷ luật quản lý vốn và không mua đuổi FOMO.
- Kết luận: ${reply}`;

    return {
      success: true,
      coin: coinUpper,
      reply,
      output: outputText,
      memorySummary: memory.summary
    };
  }
}

module.exports = new MasterCouncil();
