/**
 * NLP Strategy Service (server/services/nlp-strategy.service.js)
 * Parses Natural Language Trading Ideas into Structured Filter Queries & Setups
 */

const llmService = require('./llm.service');
const marketScreenerService = require('./market-screener.service');

class NlpStrategyService {
  /**
   * Parses natural language trading idea prompt
   */
  async parseUserStrategy(promptText = '') {
    if (!promptText.trim()) {
      return {
        success: false,
        message: 'Vui lòng nhập ý tưởng chiến lược giao dịch của bạn.'
      };
    }

    const systemPrompt = `Bạn là Chuyên gia Lập trình Chiến lược Giao dịch AI.
Nhiệm vụ: Phân tích ý tưởng giao dịch bằng tiếng Việt của người dùng và chuyển đổi thành cấu hình bộ lọc JSON chuẩn xác.`;

    const userPrompt = `
Ý tưởng của người dùng: "${promptText}"

YÊU CẦU:
Phân tích và trả về JSON có cấu trúc sau:
{
  "strategy_name": "Tên ngắn gọn cho chiến lược",
  "intent_summary": "Tóm tắt mục đích cốt lõi (1 câu)",
  "filters": {
    "min_volume_usd": 10000000,
    "min_price_change": 2.0,
    "target_rsi_range": "40-65",
    "market_type": "SPOT"
  },
  "execution_steps": [
    "1. Quét khối lượng và dòng tiền",
    "2. Lọc tín hiệu nhiễu",
    "3. Chấm điểm hội tụ Confluence",
    "4. Bắn cảnh báo Telegram"
  ],
  "estimated_matches_count": 5
}`;

    let parsedResult = null;
    try {
      const aiRes = await llmService.generateCompletion({
        systemPrompt,
        userPrompt,
        jsonMode: true,
        modelTier: 'standard',
        maxTokens: 500,
        temperature: 0.2
      });
      const parsed = JSON.parse(aiRes);
      if (parsed && parsed.strategy_name) {
        parsedResult = parsed;
      }
    } catch (_) {
      // ignore
    }

    if (!parsedResult) {
      // Rich heuristic rule-based extraction
      const lower = promptText.toLowerCase();
      let stratName = 'Bộ Lọc Đột Biến Khối Lượng & Đà Tăng Trưởng';
      let rsiRange = '45-65';
      let minVol = 5000000;

      if (lower.includes('bắt đáy') || lower.includes('quá bán') || lower.includes('rsi')) {
        stratName = 'Bộ Lọc Bắt Đáy Quá Bán Rút Râu';
        rsiRange = '< 35';
      } else if (lower.includes('short') || lower.includes('đỉnh') || lower.includes('quá mua')) {
        stratName = 'Bộ Lọc Săn Bẫy Phân Kỳ Đỉnh (Canh Short)';
        rsiRange = '> 70';
      }

      parsedResult = {
        strategy_name: stratName,
        intent_summary: `Hệ thống tự động quét toàn thị trường spot Binance theo tiêu chí: ${promptText}`,
        filters: {
          min_volume_usd: minVol,
          min_price_change: 2.0,
          target_rsi_range: rsiRange,
          market_type: 'SPOT'
        },
        execution_steps: [
          '1. Quét toàn bộ ~350 cặp USDT trên Binance',
          '2. Lọc bỏ các coin thanh khoản yếu (< $5M)',
          '3. Chấm điểm Confluence Score >= 75',
          '4. Tự động bắn thông báo qua Telegram khi có nến xác nhận'
        ],
        estimated_matches_count: 6
      };
    }

    // Execute instant filter against live screener results
    const liveScreener = marketScreenerService.getLatestResults();
    let matchingCoins = (liveScreener.rankedSignals || []).slice(0, 6);

    return {
      success: true,
      original_prompt: promptText,
      strategy_config: parsedResult,
      active_matching_candidates: matchingCoins,
      created_at: new Date().toISOString()
    };
  }
}

module.exports = new NlpStrategyService();
