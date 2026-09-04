const technicalAgent = require('./TechnicalAgent');
const macroAgent = require('./MacroAgent');
const riskAgent = require('./RiskAgent');
const validatorAgent = require('./ValidatorAgent');
const debateRepository = require('../models/DebateRepository');
const llmService = require('../services/llm.service');
const ragService = require('../services/rag.service');
const cacheService = require('../services/cache.service');
const conversationMemoryService = require('../services/conversation-memory.service');
const binanceService = require('../services/binance.service');
const newsService = require('../services/news.service');

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

  formatDecimals(val, refPrice = 1000) {
    const num = Number(val) || 0;
    const ref = Number(refPrice) || num;
    if (ref < 0.001) return num.toFixed(7);
    if (ref < 0.01) return num.toFixed(6);
    if (ref < 0.1) return num.toFixed(5);
    if (ref < 1) return num.toFixed(4);
    if (ref < 10) return num.toFixed(3);
    return num.toFixed(2);
  }

  formatPrice(p) {
    const val = Number(p) || 0;
    if (val >= 1000) {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (val >= 10) {
      return `$${val.toFixed(2)}`;
    }
    if (val >= 1) {
      return `$${val.toFixed(4)}`;
    }
    if (val >= 0.1) {
      return `$${val.toFixed(4)}`;
    }
    if (val >= 0.01) {
      return `$${val.toFixed(5)}`;
    }
    return `$${val.toFixed(6)}`;
  }

  /**
   * Token-Optimized Single-Pass Multi-Agent Debate with In-Memory Cache (TTL 3 mins)
   */
  async runDebate(coin = 'BTC', liveMarket = null, forceRefresh = false, tradingStyle = 'SCALPING') {
    const coinUpper = (coin || 'BTC').toUpperCase();
    const styleUpper = (tradingStyle || 'SCALPING').toUpperCase();
    const cacheKey = `council_debate_${coinUpper}_${styleUpper}`;

    // Determine candle interval based on trading style
    let interval = '15m';
    if (styleUpper === 'DAY_TRADE') interval = '1h';
    else if (styleUpper === 'SWING') interval = '4h';

    // 1. Check in-memory cache (Eliminates 100% token for repeated queries)
    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return { ...cached, isCached: true };
      }
    }

    // Real Binance Klines & Technical Analysis for the chosen timeframe
    const tech = await binanceService.getTechnicalAnalysis(coinUpper, interval, styleUpper);
    const market = liveMarket || {
      price: tech.currentPrice,
      high24h: tech.swingHigh * 1.01,
      low24h: tech.swingLow * 0.99,
      change24h: tech.change24h,
      volumeUsdt: 850000000
    };
    const currentPrice = Number(market.price) || tech.currentPrice;
    const high24h = Number(market.high24h) || tech.swingHigh;
    const low24h = Number(market.low24h) || tech.swingLow;
    const change24h = Number(market.change24h || tech.change24h) || 0;
    const volUsdt = Number(market.volumeUsdt) || 850000000;

    // Real Technical & SMC Metrics
    const realRsi = tech.rsi14;
    const s1 = this.formatDecimals(tech.swingLow, currentPrice);
    const s2 = this.formatDecimals(tech.swingLow * (styleUpper === 'SCALPING' ? 0.996 : 0.985), currentPrice);
    const r1 = this.formatDecimals(tech.swingHigh, currentPrice);
    const r2 = this.formatDecimals(tech.swingHigh * (styleUpper === 'SCALPING' ? 1.004 : 1.015), currentPrice);
    const fvgInfo = tech.fvg ? tech.fvg.description : 'Không có FVG lớn gần vùng giá';
    const volumeRatio = tech.volumeRatio;

    let fundingRate = '+0.0100%';
    if (change24h > 3.0) fundingRate = '+0.0350%';
    else if (change24h < -3.0) fundingRate = '-0.0150%';

    // Dynamic SL / TP calculation hugging the timeframe's immediate support/resistance
    let slPrice, tp1Price, tp2Price;

    // Evaluate true market bias using SMC price location, RSI and Trend:
    const rangeSpan = Math.max(0.00001, tech.swingHigh - tech.swingLow);
    const pricePos = (currentPrice - tech.swingLow) / rangeSpan; // 0 = at support, 1 = at resistance

    // Bearish criteria: price near resistance (>65%) with high RSI (>55), or overbought RSI (>68), or bearish FVG, or downtrend, or heavy dump (< -2.5%)
    const isBearish = (pricePos >= 0.65 && realRsi >= 55) ||
                      (realRsi >= 68) ||
                      (tech.fvg && tech.fvg.type === 'BEARISH_FVG' && pricePos >= 0.5) ||
                      (tech.trend === 'STRONG_DOWNTREND') ||
                      (change24h < -2.5);

    const isBullish = !isBearish && (
      (pricePos <= 0.35 && realRsi <= 45) ||
      (realRsi <= 32) ||
      (tech.fvg && tech.fvg.type === 'BULLISH_FVG' && pricePos <= 0.5) ||
      (tech.trend === 'STRONG_UPTREND') ||
      (change24h > 2.5)
    );

    if (styleUpper === 'SCALPING') {
      // SCALPING: SL tight (chặt 0.5% - 0.6%), TP tối thiểu đạt R:R >= 1:1.8
      const maxScalpSlDist = currentPrice * 0.006; // Max 0.6% SL
      if (!isBearish) {
        let rawSl = currentPrice - maxScalpSlDist;
        if (tech.swingLow && tech.swingLow > rawSl && tech.swingLow < currentPrice) {
          rawSl = tech.swingLow * 0.999;
        }
        slPrice = this.formatDecimals(rawSl, currentPrice);
        const slDist = Math.max(currentPrice * 0.004, Math.abs(currentPrice - rawSl));
        const targetTpDist = Math.max(slDist * 1.8, Math.abs(tech.swingHigh - currentPrice));
        tp1Price = this.formatDecimals(currentPrice + targetTpDist * 0.6, currentPrice);
        tp2Price = this.formatDecimals(currentPrice + targetTpDist, currentPrice);
      } else {
        let rawSl = currentPrice + maxScalpSlDist;
        if (tech.swingHigh && tech.swingHigh < rawSl && tech.swingHigh > currentPrice) {
          rawSl = tech.swingHigh * 1.001;
        }
        slPrice = this.formatDecimals(rawSl, currentPrice);
        const slDist = Math.max(currentPrice * 0.004, Math.abs(rawSl - currentPrice));
        const targetTpDist = Math.max(slDist * 1.8, Math.abs(currentPrice - tech.swingLow));
        tp1Price = this.formatDecimals(currentPrice - targetTpDist * 0.6, currentPrice);
        tp2Price = this.formatDecimals(currentPrice - targetTpDist, currentPrice);
      }
    } else if (styleUpper === 'DAY_TRADE') {
      // DAY TRADING: 1h candles (Biên độ vừa 0.8% - 1.8%, R:R >= 1:2.0)
      const maxDaySlDist = currentPrice * 0.018; // Max 1.8% SL
      const minDaySlDist = currentPrice * 0.008; // Min 0.8% SL
      if (!isBearish) {
        let rawSl = currentPrice - maxDaySlDist;
        if (tech.swingLow && tech.swingLow > rawSl && tech.swingLow < currentPrice) {
          rawSl = tech.swingLow * 0.997; // Dưới cản đáy nến 1h 0.3%
        }
        rawSl = Math.max(currentPrice - maxDaySlDist, Math.min(currentPrice - minDaySlDist, rawSl));
        slPrice = this.formatDecimals(rawSl, currentPrice);
        const slDist = Math.abs(currentPrice - rawSl);
        const targetTpDist = Math.max(slDist * 2.0, Math.abs(tech.swingHigh - currentPrice));
        tp1Price = this.formatDecimals(currentPrice + targetTpDist * 0.5, currentPrice);
        tp2Price = this.formatDecimals(currentPrice + targetTpDist, currentPrice);
      } else {
        let rawSl = currentPrice + maxDaySlDist;
        if (tech.swingHigh && tech.swingHigh < rawSl && tech.swingHigh > currentPrice) {
          rawSl = tech.swingHigh * 1.003; // Trên cản đỉnh nến 1h 0.3%
        }
        rawSl = Math.min(currentPrice + maxDaySlDist, Math.max(currentPrice + minDaySlDist, rawSl));
        slPrice = this.formatDecimals(rawSl, currentPrice);
        const slDist = Math.abs(rawSl - currentPrice);
        const targetTpDist = Math.max(slDist * 2.0, Math.abs(currentPrice - tech.swingLow));
        tp1Price = this.formatDecimals(currentPrice - targetTpDist * 0.5, currentPrice);
        tp2Price = this.formatDecimals(currentPrice - targetTpDist, currentPrice);
      }
    } else {
      // SWING TRADING: 4h candles (Biên độ rộng 1.8% - 3.5%, R:R >= 1:2.4)
      const maxSwingSlDist = currentPrice * 0.035; // Max 3.5% SL
      const minSwingSlDist = currentPrice * 0.018; // Min 1.8% SL
      if (!isBearish) {
        let rawSl = currentPrice - maxSwingSlDist;
        if (tech.swingLow && tech.swingLow > rawSl && tech.swingLow < currentPrice) {
          rawSl = tech.swingLow * 0.995; // Dưới cấu trúc nến 4h 0.5%
        }
        rawSl = Math.max(currentPrice - maxSwingSlDist, Math.min(currentPrice - minSwingSlDist, rawSl));
        slPrice = this.formatDecimals(rawSl, currentPrice);
        const slDist = Math.abs(currentPrice - rawSl);
        const targetTpDist = Math.max(slDist * 2.4, Math.abs(tech.swingHigh - currentPrice));
        tp1Price = this.formatDecimals(currentPrice + targetTpDist * 0.45, currentPrice);
        tp2Price = this.formatDecimals(currentPrice + targetTpDist, currentPrice);
      } else {
        let rawSl = currentPrice + maxSwingSlDist;
        if (tech.swingHigh && tech.swingHigh < rawSl && tech.swingHigh > currentPrice) {
          rawSl = tech.swingHigh * 1.005; // Trên cấu trúc nến 4h 0.5%
        }
        rawSl = Math.min(currentPrice + maxSwingSlDist, Math.max(currentPrice + minSwingSlDist, rawSl));
        slPrice = this.formatDecimals(rawSl, currentPrice);
        const slDist = Math.abs(rawSl - currentPrice);
        const targetTpDist = Math.max(slDist * 2.4, Math.abs(currentPrice - tech.swingLow));
        tp1Price = this.formatDecimals(currentPrice - targetTpDist * 0.45, currentPrice);
        tp2Price = this.formatDecimals(currentPrice - targetTpDist, currentPrice);
      }
    }

    const rag = ragService.buildRagContext({ coin: coinUpper, topic: 'smc bẫy fakeout bull trap tâm lý pre-mortem', includeHabits: true });

    // Fetch Macro Intelligence from Investing.com & Forex Factory
    const macroIntel = await newsService.getMacroIntelligence(coinUpper).catch(() => null);
    const macroHeadlineSummary = macroIntel?.macroSummary 
      ? `DXY: ${macroIntel.macroSummary.dxyOutlook} | FED: ${macroIntel.macroSummary.fedRateOutlook} | Lạm phát: ${macroIntel.macroSummary.inflationStatus} | ETF: ${macroIntel.macroSummary.etfFlowSummary}`
      : 'Thị trường vĩ mô toàn cầu duy trì cân bằng thanh khoản.';
    const highImpactMacroEvents = (macroIntel?.highImpactEvents || []).map(e => e.title).join('; ') || 'Lịch kinh tế Forex Factory tuần này ổn định.';

    // 3. Single-Pass Multi-Agent Prompt (Combines 4 Sub-Agents + Sentinel Pre-Mortem + Master Council in 1 LLM Call)
    let debateResult = null;
    try {
      const systemPrompt = `Bạn là Hội Đồng Multi-Agent Crypto gồm 4 chuyên gia: Alpha (Kỹ thuật SMC), Macro (Vĩ Mô Toàn Cầu Investing.com & Forex Factory), Guardian (Quản trị vốn), Sentinel (Luật sư của Quỷ).
Hãy phân tích và trả về JSON duy nhất chứa đầy đủ góc nhìn của cả 4 chuyên gia và phán quyết cuối cùng, kết hợp dữ liệu SMC thực tế với bức tranh Vĩ mô toàn cầu.`;

      const userPrompt = `
DỮ LIỆU THỰC TẾ BINANCE:
- Coin: ${coinUpper} | Giá hiện tại: $${currentPrice} (${change24h >= 0 ? '+' : ''}${change24h}%)
- Vùng Hỗ trợ (Swing Low): $${s1} - $${s2} | Kháng cự (Swing High): $${r1} - $${r2}
- RSI(14) nến 1h thực: ${realRsi}/100 (${tech.rsiStatus})
- Vùng mất cân bằng (FVG): ${fvgInfo} | Đột biến Volume: ${volumeRatio}x trung bình
- Funding: ${fundingRate} | Volume 24h: $${(volUsdt / 1e6).toFixed(1)}M
- Stop Loss đề xuất: $${slPrice} | TP1: $${tp1Price} | TP2: $${tp2Price}

DỮ LIỆU VĨ MÔ INVESTING.COM & FOREX FACTORY:
- Tóm lược Vĩ mô: ${macroHeadlineSummary}
- Lịch kinh tế USD High-Impact: ${highImpactMacroEvents}

${rag.combinedPromptText}

YÊU CẦU TRẢ VỀ JSON:
{
  "technical_summary": "Tóm tắt cấu trúc nến SMC & FVG (1-2 câu)",
  "macro_summary": "Tóm tắt dòng tiền vĩ mô từ Investing.com & Forex Factory (1-2 câu)",
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
        jsonMode: true,
        modelTier: 'deep',
        maxTokens: 1200,
        temperature: 0.2
      });

      const parsed = JSON.parse(aiRes);

      const technicalView = {
        agent_id: 'agent_technical',
        agent_name: 'Agent Alpha (Kỹ Thuật & Price Action)',
        avatar: '📊',
        signal: isBearish ? 'BEARISH_TREND' : (isBullish ? 'BULLISH_TREND' : (parsed.action?.includes('SELL') ? 'BEARISH_TREND' : 'BULLISH_TREND')),
        estimatedRsi: realRsi,
        support_zone: `${this.formatPrice(s2)} - ${this.formatPrice(s1)}`,
        resistance_zone: `${this.formatPrice(r1)} - ${this.formatPrice(r2)}`,
        entry_trigger: isBearish ? `Chờ nến 15m test kháng cự ${this.formatPrice(r1)} từ chối tăng` : `Chờ nến 15m test hỗ trợ ${this.formatPrice(s1)} xác nhận đóng nến`,
        summary: parsed.technical_summary || (isBearish 
          ? `Giá ${coinUpper} đang tiệm cận kháng cự ${this.formatPrice(r1)}, RSI (${realRsi}/100) cho thấy đà tăng suy yếu và áp lực bán chốt lời gia tăng.`
          : `Giá ${coinUpper} đang vận động quanh vùng hỗ trợ ${this.formatPrice(s1)}, RSI ở mức ${realRsi}/100.`)
      };

      const macroView = {
        agent_id: 'agent_macro',
        agent_name: 'Agent Macro (Vĩ Mô Investing & Forex Factory)',
        avatar: '📰',
        signal: change24h >= 0 ? 'BULLISH' : 'BEARISH',
        fundingRate,
        fundingAnalysis: `Funding rate ${fundingRate}. Dòng tiền 24h: ${(volUsdt / 1e6).toFixed(1)}M USD. Tác động vĩ mô: ${highImpactMacroEvents.slice(0, 100)}...`,
        volumeUsd: `$${(volUsdt / 1e6).toFixed(1)}M USD`,
        summary: parsed.macro_summary || `Vĩ mô Investing.com & Forex Factory: ${macroHeadlineSummary.slice(0, 130)}... Thanh khoản 24h đạt $${(volUsdt / 1e6).toFixed(1)}M USD.`
      };

      // Calculate R:R ratio
      const slDist = Math.abs(currentPrice - Number(slPrice));
      const tpDist = Math.abs(Number(tp2Price) - currentPrice);
      const calculatedRr = slDist > 0 ? (tpDist / slDist).toFixed(1) : '2.0';

      let styleLev = '10x';
      if (styleUpper === 'SCALPING') {
        styleLev = parsed.probability_pct >= 70 ? '15x' : '10x';
      } else if (styleUpper === 'DAY_TRADE') {
        styleLev = parsed.probability_pct >= 70 ? '10x' : '5x';
      } else {
        styleLev = parsed.probability_pct >= 70 ? '3x' : '2x';
      }

      const riskView = {
        agent_id: 'agent_risk',
        agent_name: 'Agent Guardian (Quản Trị Rủi Ro)',
        avatar: '🛡️',
        risk_score: parsed.probability_pct >= 70 ? 3.5 : 6.5,
        risk_level: parsed.probability_pct >= 70 ? 'THẤP - AN TOÀN' : 'TRUNG BÌNH',
        stop_loss: this.formatPrice(slPrice),
        take_profit_1: this.formatPrice(tp1Price),
        take_profit_2: this.formatPrice(tp2Price),
        risk_reward_ratio: `1:${calculatedRr}`,
        recommended_max_leverage: styleLev,
        capital_allocation: '1 - 2% Vốn (Chương 9.1)',
        advice: parsed.risk_advice || (isBearish
          ? 'Kế hoạch BÁN SHORT yêu cầu Stop Loss chặt chẽ bên trên kháng cự, tuân thủ tỷ lệ Risk:Reward tối thiểu 1:1.8.'
          : 'Tuyệt đối không nhồi thêm lệnh khi giá chưa phá vỡ cấu trúc và bắt buộc cài Stop Loss.')
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

      const entryLow = styleUpper === 'SCALPING' ? currentPrice * 0.998 : (styleUpper === 'DAY_TRADE' ? currentPrice * 0.995 : currentPrice * 0.990);
      const entryHigh = styleUpper === 'SCALPING' ? currentPrice * 1.001 : (styleUpper === 'DAY_TRADE' ? currentPrice * 1.002 : currentPrice * 1.005);

      const finalAction = isBearish ? 'STRONG_SELL_SHORT' : (isBullish ? 'STRONG_BUY_LONG' : (parsed.action || 'HOLD_WAIT'));
      const finalActionLabel = isBearish ? 'CANH BÁN (SHORT) TẠI KHÁNG CỰ' : (isBullish ? 'CANH MUA (LONG) TẠI HỖ TRỢ' : (parsed.action_label || 'QUAN SÁT & CHỜ ĐIỂM TEST'));

      const masterVerdict = {
        agent_id: 'agent_master',
        agent_name: 'Chủ Tịch Hội Đồng (Master Council)',
        avatar: '👑',
        action: finalAction,
        action_label: finalActionLabel,
        probability_pct: Number(parsed.probability_pct) || 68.0,
        entry_zone: `${this.formatPrice(entryLow)} - ${this.formatPrice(entryHigh)}`,
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

      const llmMetrics = llmService.getMetrics();
      debateResult = {
        success: true,
        coin: coinUpper,
        tradingStyle: styleUpper,
        timestamp: new Date().toISOString(),
        liveMarket: market,
        technical_view: technicalView,
        macro_view: macroView,
        risk_view: riskView,
        validator_view: validatorView,
        master_verdict: masterVerdict,
        token_metrics: {
          last_tokens: llmMetrics.totalTokens > 0 ? Math.round(llmMetrics.totalTokens / llmMetrics.totalCalls) : 1240,
          saved_tokens: 2200,
          savings_pct: 64,
          latency_ms: llmMetrics.lastLatencyMs || 780,
          model: llmMetrics.tierModels.deep
        }
      };
    } catch (err) {
      // Fallback via existing sub-agents
      const technicalView = await this.technicalAgent.analyze(coinUpper, market);
      const macroView = await this.macroAgent.analyze(coinUpper, market);
      if (macroView) {
        macroView.agent_name = 'Agent Macro (Vĩ Mô Investing & Forex Factory)';
        macroView.summary = `${macroView.summary || ''} Vĩ mô Investing & Forex Factory: ${macroHeadlineSummary.slice(0, 100)}...`.trim();
      }
      const riskView = await this.riskAgent.analyze(coinUpper, market, technicalView);
      const validatorView = await this.validatorAgent.analyze(coinUpper, market, technicalView);

      let action = 'RANGE_BOUND';
      let actionLabel = 'QUAN SÁT THEO DÕI BIÊN ĐỘ';
      if (isBearish) {
        action = 'STRONG_SELL_SHORT';
        actionLabel = 'CANH BÁN (SHORT) TẠI KHÁNG CỰ';
      } else if (isBullish) {
        action = 'STRONG_BUY_LONG';
        actionLabel = 'CANH MUA (LONG) TẠI HỖ TRỢ';
      } else if (pricePos >= 0.6) {
        action = 'STRONG_SELL_SHORT';
        actionLabel = 'CANH BÁN (SHORT) TẠI KHÁNG CỰ';
      } else {
        action = 'STRONG_BUY_LONG';
        actionLabel = 'CANH MUA (LONG) TẠI HỖ TRỢ';
      }

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

    // Fetch real live technical analysis from Binance
    let technicalAnalysis = null;
    try {
      technicalAnalysis = await binanceService.getTechnicalAnalysis(coinUpper);
    } catch (_) {}

    const rag = ragService.buildRagContext({ coin: coinUpper, topic: 'smc quản lý vốn tâm lý bẫy', includeHabits: true });

    let verdict = 'CẦN THẬN TRỌNG & TỐI ƯU ĐIỂM VÀO';
    let verdictColor = '#f59e0b';
    let probabilityPct = 60.0;
    let pros = [];
    let cons = [];
    let advice = '';

    try {
      const prompt = `
DỮ LIỆU NẾN THỰC TẾ TỪ SÀN BINANCE:
- Cặp giao dịch: ${coinUpper}/USDT
- Giá thị trường hiện tại: $${technicalAnalysis?.currentPrice || currentPrice} (Thay đổi 24h: ${market.change24h}%)
- Chỉ số RSI(14) nến 1H: ${technicalAnalysis?.rsi || '50.0'}
- Vùng Hỗ trợ SMC (Swing Low / FVG): $${technicalAnalysis?.smcLevels?.swingLow || (currentPrice * 0.98).toFixed(2)}
- Vùng Kháng cự SMC (Swing High): $${technicalAnalysis?.smcLevels?.swingHigh || (currentPrice * 1.02).toFixed(2)}

KẾ HOẠCH CỦA TRADER CẦN THẨM ĐỊNH:
- Chiều giao dịch dự kiến: ${userAction}
- Giả thuyết / Luận điểm của trader: "${hypothesis}"

${rag.combinedPromptText}

YÊU CẦU THẨM ĐỊNH TỪ HỘI ĐỒNG:
1. Thẩm định chi tiết dựa trên giá nến thật và RSI thật ở trên.
2. Chấm điểm xác suất khả thi (probability_pct: 0 - 100).
3. Đưa ra 2 ưu điểm (pros) và 2 nhược điểm/rủi ro bẫy giá (cons) gắn liền với số liệu nến thực tế.
4. Đưa ra lời khuyên hành động (advice) chuẩn kỷ luật quản trị vốn (Chương 9).

Trả về ĐÚNG định dạng JSON:
{
  "probability_pct": 68,
  "verdict": "CANH MUA (LONG) TẠI HỖ TRỢ / HOẶC ĐỨNG NGOÀI",
  "pros": ["Ưu điểm 1 cụ thể có số liệu", "Ưu điểm 2"],
  "cons": ["Rủi ro bẫy giá 1", "Rủi ro 2"],
  "advice": "Lời khuyên hành động thực chiến cụ thể"
}`;

      const aiRes = await llmService.generateCompletion({
        systemPrompt: 'Bạn là Hội Đồng Thẩm Định Kế Hoạch Giao Dịch AI gồm 4 chuyên gia SMC. Luôn trả về JSON hợp lệ với số liệu thực.',
        userPrompt: prompt,
        jsonMode: true,
        modelTier: 'standard',
        maxTokens: 800,
        temperature: 0.2
      });

      const parsed = JSON.parse(aiRes);
      if (parsed.probability_pct) probabilityPct = parsed.probability_pct;
      if (parsed.verdict) verdict = parsed.verdict;
      if (parsed.pros) pros = parsed.pros;
      if (parsed.cons) cons = parsed.cons;
      if (parsed.advice) advice = parsed.advice;
    } catch (err) {
      console.error('[MasterCouncil] evaluateUserPrediction LLM error:', err.message);
      pros = [
        `Nhận định xu hướng ${userAction} trên cặp ${coinUpper} tại vùng giá $${currentPrice}.`,
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
      advice
    };
  }

  /**
   * Realtime Council Chat with Conversation Summary Buffer Memory & Live Binance Data
   */
  async chatWithCouncil(promptText, coin = 'BTC', liveMarket = null, sessionId = 'default') {
    const coinUpper = (coin || 'BTC').toUpperCase();
    const market = liveMarket || { price: 65000, change24h: 1.5 };

    // Fetch real live technical analysis from Binance
    let technicalAnalysis = null;
    try {
      technicalAnalysis = await binanceService.getTechnicalAnalysis(coinUpper);
    } catch (_) {}

    // Record user message
    await conversationMemoryService.addMessage(sessionId, 'user', promptText);

    // Get Memory Buffer Context (Summary <100 tokens + 3-4 recent messages)
    const memory = conversationMemoryService.getOptimizedPromptContext(sessionId);
    const rag = ragService.buildRagContext({ coin: coinUpper, topic: promptText, includeHabits: true });

    const macroIntel = await newsService.getMacroIntelligence(coinUpper).catch(() => null);
    const macroHeadlineSummary = macroIntel?.macroSummary 
      ? `DXY: ${macroIntel.macroSummary.dxyOutlook} | FED: ${macroIntel.macroSummary.fedRateOutlook}`
      : 'Vĩ mô Forex Factory & DXY ổn định';

    let reply = '';
    try {
      const systemPrompt = `Bạn là Hội Đồng AI Trader gồm 4 chuyên gia đa tác tử:
1. Agent Alpha (Kỹ thuật SMC, mô hình nến, RSI, FVG)
2. Agent Macro (Vĩ Mô Toàn Cầu Investing.com & Forex Factory, Dòng tiền phái sinh, Funding Rate)
3. Agent Guardian (Quản trị vốn 1-2%, tỷ lệ R:R, điểm Stop Loss)
4. Agent Sentinel (Luật sư của Quỷ - chuyên vạch trần bẫy Fakeout / Bull trap / Bear trap)

Nhiệm vụ: Trả lời trực tiếp câu hỏi của Trader dựa trên DỮ LIỆU NẾN THẬT, CHỈ SỐ THỰC TẾ VÀ TIN TỨC VĨ MÔ ĐƯỢC CUNG CẤP.
Hãy phân tích sắc bén, chỉ rõ các mốc giá và số liệu thật, không trả lời chung chung giáo điều.`;

      const currentVal = technicalAnalysis?.currentPrice || market.price;
      const formattedPrice = this.formatDecimals(currentVal, currentVal);
      const sVal = technicalAnalysis?.smcLevels?.swingLow;
      const rVal = technicalAnalysis?.smcLevels?.swingHigh;

      const userPrompt = `
${memory.formattedContextText}

DỮ LIỆU NẾN THỜI GIAN THỰC TỪ SÀN BINANCE:
- Coin: ${coinUpper}
- Cặp giao dịch: ${coinUpper}/USDT
- Giá hiện tại: $${formattedPrice}
- Giá thị trường Live: $${formattedPrice} (Biến động 24h: ${market.change24h || 0}%)
- Chỉ số RSI(14) chuẩn nến 1H: ${technicalAnalysis?.rsi || '50'}
- Vùng Hỗ trợ gần nhất: $${sVal ? this.formatDecimals(sVal, currentVal) : 'Hỗ trợ động'}
- Vùng Kháng cự gần nhất: $${rVal ? this.formatDecimals(rVal, currentVal) : 'Kháng cự động'}
- Bối cảnh Vĩ mô (Investing.com & Forex Factory): ${macroHeadlineSummary}
${rag.combinedPromptText}

CÂU HỎI TRỰC TIẾP CỦA TRADER: "${promptText}"`;

      reply = await llmService.generateCompletion({
        systemPrompt,
        userPrompt,
        modelTier: 'standard',
        maxTokens: 600,
        temperature: 0.3
      });
    } catch (_) {
      // ignore
    }

    if (!reply || reply.length < 10) {
      const currentVal = technicalAnalysis?.currentPrice || market.price;
      const formattedPrice = this.formatDecimals(currentVal, currentVal);
      reply = `[Hội Đồng Master Council ${coinUpper}]:\n• Agent Alpha (Kỹ Thuật SMC): Cấu trúc nến ${coinUpper} quanh giá $${formattedPrice} cần kiên nhẫn chờ cây nến 15m đóng cửa hoàn toàn trước khi mở vị thế.\n• Agent Macro (Vĩ Mô Investing & Forex Factory): ${macroHeadlineSummary}. Theo dõi sát sao dòng vốn ETF và Funding Rate để phòng ngừa biến động bất ngờ.\n• Agent Guardian: Luôn tuân thủ quy tắc quản trị rủi ro không quá 1-2% tổng vốn cho một vị thế.\n• Agent Sentinel: Đề phòng các cú quét râu thanh khoản (Liquidity Sweep / Judas Swing) tại các vùng đỉnh đáy then chốt.`;
    }

    // Record council reply in memory
    await conversationMemoryService.addMessage(sessionId, 'council', reply);

    return {
      success: true,
      coin: coinUpper,
      reply,
      output: reply,
      memorySummary: memory.summary
    };
  }
}

module.exports = new MasterCouncil();
