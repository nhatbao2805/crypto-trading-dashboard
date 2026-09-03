const BaseAgent = require('./BaseAgent');
const llmService = require('../services/llm.service');
const ragService = require('../services/rag.service');

class ValidatorAgent extends BaseAgent {
  constructor() {
    super(
      'agent_validator',
      'Agent Sentinel (Luật Sư Của Quỷ & Phản Biện Săn Bẫy)',
      '⚖️',
      'Chuyên gia phản biện 4 lớp, thực hiện Pre-Mortem và phát hiện Thiên kiến nhận thức (FOMO/Revenge)'
    );
  }

  /**
   * 4-Layer Adversarial Critical Analysis + Pre-Mortem + Cognitive Bias Scan
   */
  async analyze(coin, liveMarket, technicalView) {
    const isBullish = technicalView.signal.includes('BULLISH');
    const isBearish = technicalView.signal.includes('BEARISH');

    const rag = ragService.buildRagContext({ coin, topic: 'bẫy fakeout bull trap bear trap tâm lý fomo revenge', includeHabits: true });

    let trapWarning = '';
    let criticalQuestion = '';
    let preMortemFailures = [];
    let detectedBiases = [];

    try {
      const prompt = `
Bạn là Agent Sentinel - "Luật Sư Của Quỷ" (Devil's Advocate) kiêm Trưởng ban Giám định Rủi ro.
Nhiệm vụ: Tìm mọi lý do chứng minh kế hoạch vào lệnh ${coin} của Kỹ thuật là SAI và BẢO VỆ TIỀN CHO TRADER!

DỮ LIỆU ĐẦU VÀO ĐÃ XỬ LÝ (Server Pre-calculated):
- Xu hướng Kỹ thuật: ${technicalView.signal} (RSI: ${technicalView.estimatedRsi})
- Vùng Hỗ trợ: ${technicalView.support_zone} | Kháng cự: ${technicalView.resistance_zone}
- Đề xuất: ${technicalView.summary}

${rag.combinedPromptText}

ÁP DỤNG BỘ KHUNG PHẢN BIỆN 4 LỚP:
1. Điểm vô hiệu (Invalidation): Giá chạm mốc nào thì cấu trúc này bị gãy hoàn toàn?
2. Bẫy thanh khoản (Liquidity Trap): Cá mập đang quét thanh khoản ở đâu?
3. Biến số ẩn: Funding rate hoặc tin tức bất lợi tiềm tàng.
4. Tỷ lệ R:R: Có đạt chuẩn tối thiểu 1:2 hay không?

KỸ THUẬT PRE-MORTEM (Khám nghiệm trước thất bại):
"Giả định 24h sau lệnh này bị quét dính Stop Loss hoặc cháy tài khoản. Hãy chỉ ra 3 nguyên nhân trực tiếp dẫn đến thất bại này."

BỘ LỌC THIÊN KIẾN NHẬN THỨC (Cognitive Bias Detector):
Chỉ ra các bẫy tâm lý có thể gặp (Confirmation Bias, FOMO, Revenge Trading, Sunk Cost).

Trả về định dạng JSON:
{
  "trap_warning": "Cảnh báo bẫy giá cốt lõi (1-2 câu)",
  "critical_question": "Câu hỏi chất vấn thử thách trader",
  "pre_mortem_failures": [
    "Nguyên nhân 1 khiến lệnh có thể dính Stop Loss",
    "Nguyên nhân 2 (bẫy thanh khoản / cản lớn)",
    "Nguyên nhân 3 (biến động vĩ mô / funding)"
  ],
  "detected_biases": ["FOMO Mua Đuổi", "Confirmation Bias (Thiên kiến xác nhận)"]
}`;

      const aiRes = await llmService.generateCompletion({
        systemPrompt: 'Bạn là Agent Sentinel (Luật sư của Quỷ). Luôn trả về JSON hợp lệ.',
        userPrompt: prompt,
        jsonMode: true
      });

      const parsed = JSON.parse(aiRes);
      if (parsed.trap_warning) trapWarning = parsed.trap_warning;
      if (parsed.critical_question) criticalQuestion = parsed.critical_question;
      if (Array.isArray(parsed.pre_mortem_failures)) preMortemFailures = parsed.pre_mortem_failures;
      if (Array.isArray(parsed.detected_biases)) detectedBiases = parsed.detected_biases;
    } catch (_) {
      // Fallback 4-layer heuristic
      if (isBullish) {
        trapWarning = `Cảnh báo bẫy Bull Trap! Giá tiến sát vùng kháng cự ${technicalView.resistance_zone} nhưng lực mua có nguy cơ suy kiệt. Khả năng cá mập quét thanh khoản đỉnh rồi xả hàng theo Chương 8.`;
        criticalQuestion = `Nếu giá tạo nến Pinbar đảo chiều quét râu tại ${technicalView.resistance_zone}, bạn có Stop Loss bảo vệ hay sẽ gồng lỗ trong vô vọng?`;
        preMortemFailures = [
          `Đu đỉnh tại vùng kháng cự mạnh ${technicalView.resistance_zone} khung 4H`,
          'Bị quét râu thanh lý (Liquidity Sweep) trước khi giá chạy thật',
          'Tâm lý FOMO khi thấy vài cây nến xanh 15m'
        ];
        detectedBiases = ['FOMO Mua Đuổi', 'Confirmation Bias (Chỉ nhìn nến xanh)'];
      } else {
        trapWarning = `Cảnh báo bẫy Bear Trap! Vùng hỗ trợ ${technicalView.support_zone} có thể xuất hiện mô hình Spring Wyckoff rút chân cực nhanh.`;
        criticalQuestion = `Bạn có đang bán tháo theo cảm xúc khi giá đã giảm một đoạn dài về hỗ trợ ${technicalView.support_zone}?`;
        preMortemFailures = [
          'Bán ngay tại vùng hỗ trợ cứng (Order Block)',
          'Không chờ nến đóng cửa xác nhận phá vỡ cấu trúc',
          'Tâm lý cay cú gỡ lệnh sau lệnh trước đó'
        ];
        detectedBiases = ['Bán Tháo Theo Cảm Xúc', 'Revenge Trading'];
      }
    }

    return {
      agent_id: this.id,
      agent_name: this.name,
      avatar: this.avatar,
      trap_warning: trapWarning,
      critical_question: criticalQuestion,
      pre_mortem_failures: preMortemFailures.length ? preMortemFailures : [
        'Vào lệnh khi chưa có xác nhận nến đóng cửa',
        'Stop Loss đặt quá sát vùng biến động của thị trường',
        'Tâm lý nôn nóng muốn có lệnh chạy ngay'
      ],
      detected_biases: detectedBiases.length ? detectedBiases : ['Thiên Kiến Xác Nhận'],
      invalidation_level: isBullish ? technicalView.support_zone : technicalView.resistance_zone
    };
  }
}

module.exports = new ValidatorAgent();
