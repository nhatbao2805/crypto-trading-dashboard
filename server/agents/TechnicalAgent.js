const BaseAgent = require('./BaseAgent');
const llmService = require('../services/llm.service');
const ragService = require('../services/rag.service');
const binanceService = require('../services/binance.service');

class TechnicalAgent extends BaseAgent {
  constructor() {
    super(
      'agent_technical',
      'Agent Alpha (Kỹ Thuật & Price Action)',
      '📊',
      'Chuyên gia phân tích mô hình nến SMC, kháng cự hỗ trợ, Order Block và RSI'
    );
  }

  async analyze(coin, liveMarket) {
    const tech = await binanceService.getTechnicalAnalysis(coin);
    const currentPrice = Number(liveMarket?.price || tech.currentPrice) || 60000;
    const high24h = Number(liveMarket?.high24h) || currentPrice * 1.02;
    const low24h = Number(liveMarket?.low24h) || currentPrice * 0.98;
    const change24h = Number(liveMarket?.change24h || tech.change24h) || 0;

    const realRsi = tech.rsi14;
    const estimatedRsi = realRsi;
    const s1 = tech.swingLow.toFixed(2);
    const s2 = (tech.swingLow * 0.985).toFixed(2);
    const r1 = tech.swingHigh.toFixed(2);
    const r2 = (tech.swingHigh * 1.015).toFixed(2);

    let signal = 'NEUTRAL';
    if (realRsi < 35 && change24h >= -4) {
      signal = 'BULLISH_OVERSOLD_REBOUND';
    } else if (realRsi > 70) {
      signal = 'BEARISH_OVERBOUGHT';
    } else if (tech.trend === 'STRONG_UPTREND' || change24h > 2.0) {
      signal = 'BULLISH_MOMENTUM';
    } else if (tech.trend === 'STRONG_DOWNTREND' || change24h < -2.5) {
      signal = 'BEARISH_BREAKDOWN';
    } else {
      signal = 'SIDEWAY_CONSOLIDATION';
    }

    // Retrieve RAG Context for SMC & Candlestick patterns
    const rag = ragService.buildRagContext({ coin, topic: 'smc nến order block fvg rsi', includeHabits: false });

    // Try calling LLM for rich technical reasoning
    let summary = '';
    let entryTrigger = '';

    try {
      const prompt = `
Bạn là Agent Alpha - Chuyên gia Kỹ thuật & SMC. Hãy phân tích coin ${coin}:
- Giá hiện tại: $${currentPrice} (Biến động 24h: ${change24h}%)
- Vùng Hỗ trợ: $${s1} - $${s2} | Kháng cự: $${r1} - $${r2}
- RSI ước tính: ${estimatedRsi}
- Tín hiệu sơ bộ: ${signal}

${rag.combinedPromptText}

YÊU CẦU:
1. Viết 2 câu tóm tắt góc nhìn kỹ thuật theo cấu trúc nến & vùng mất cân bằng FVG / Order Block.
2. Đưa ra 1 điều kiện kích hoạt vào lệnh (entry trigger) rõ ràng.
Trả về định dạng JSON: { "summary": "...", "entry_trigger": "..." }`;

      const aiRes = await llmService.generateCompletion({
        systemPrompt: 'Bạn là Agent Alpha (Kỹ Thuật). Luôn trả về JSON hợp lệ.',
        userPrompt: prompt,
        jsonMode: true,
        modelTier: 'standard',
        maxTokens: 600,
        temperature: 0.2
      });

      const parsed = JSON.parse(aiRes);
      if (parsed.summary) summary = parsed.summary;
      if (parsed.entry_trigger) entryTrigger = parsed.entry_trigger;
    } catch (_) {
      // Fallback
      summary = signal.includes('BULLISH')
        ? `Cấu trúc giá ${coin} đang giữ vững hỗ trợ $${s1}, RSI (${estimatedRsi}/100) tạo phân kỳ tăng ngắn hạn. Lực cầu quanh Order Block đáy phiên phản ứng tích cực.`
        : `Giá ${coin} tiếp cận kháng cự $${r1} với dấu hiệu suy kiệt đà tăng, RSI (${estimatedRsi}/100) vùng quá mua. Cần lưu ý phản ứng tại vùng mất cân bằng cung.`;
      entryTrigger = signal.includes('BULLISH')
        ? `Chờ nến 15m test lại $${s1} rút chân xác nhận đảo chiều`
        : `Chờ nến 15m chạm cản $${r1} xuất hiện râu nến từ chối giá`;
    }

    return {
      agent_id: this.id,
      agent_name: this.name,
      avatar: this.avatar,
      signal,
      estimatedRsi,
      support_zone: `${this.formatPrice(s2)} - ${this.formatPrice(s1)}`,
      resistance_zone: `${this.formatPrice(r1)} - ${this.formatPrice(r2)}`,
      entry_trigger: entryTrigger || (signal.includes('BULLISH') ? `Chờ nến 15m test ${this.formatPrice(s1)} rút râu` : `Chờ nến 15m chạm cản ${this.formatPrice(r1)} đảo chiều`),
      summary
    };
  }
}

module.exports = new TechnicalAgent();
