const fs = require('node:fs');

const practiceJsContent = `// --- MODULE 2: INTERACTIVE TRADING PRACTICE & CASE STUDIES (30 CASES ACROSS 12 CHAPTERS) ---
// 100% Comprehensive Practical Scenarios, Whale Manipulation Traps & SMC Framework
// Built directly from the official rules of 'Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md'

let practiceStats = {
  total: 0,
  correct: 0,
  streak: 0,
  answered: {},
  chapterStats: {} // chapterId -> { attempted: 0, correct: 0, failed: 0 }
};

const practiceScenarios = [
  // ==========================================
  // CHƯƠNG 1: BẢN CHẤT BLOCKCHAIN & SỔ CÁI
  // ==========================================
  {
    id: 11,
    chapterId: 1,
    level: 'basic',
    levelLabel: '🌱 Cơ Bản',
    category: 'blockchain_basics',
    categoryName: '⛓️ Bản Chất Blockchain (Chương 1)',
    title: 'Case Study 11: Nhận Diện Tính Bất Biến Của Sổ Cái & Giao Dịch Không Thể Thu Hồi',
    description: '<b>Bối cảnh:</b> Một người dùng mới chuyển 0.5 BTC từ sàn Binance về địa chỉ ví cá nhân nhưng vô tình điền sai địa chỉ đích (nhập địa chỉ của một người lạ trên mạng). Sau khi mạng Bitcoin xác nhận 3 Block, người này liên hệ đội ngũ hỗ trợ để yêu cầu hủy lệnh chuyển tiền và hoàn lại 0.5 BTC.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 60000, high: 61000, low: 59500, close: 60800, vol: 150, label: 'Block #101' },
        { open: 60800, high: 61500, low: 60400, close: 61200, vol: 210, label: 'Block #102 (Đã Khóa)' },
        { open: 61200, high: 62500, low: 61100, close: 62400, vol: 380, label: 'Block #103 (3 Xác Nhận) 🔒' }
      ]
    },
    question: 'Theo nguyên lý vận hành của công nghệ Blockchain, yêu cầu hoàn tiền này có thực hiện được không?',
    options: [
      { id: 'A', text: 'Có thể hủy được nếu gửi yêu cầu cho CEO sàn Binance trong vòng 24 giờ.', isCorrect: false },
      { id: 'B', text: 'KHÔNG THỂ HỦY HOẶC ĐẢO NGƯỢC: Khi giao dịch đã được ghi vào Block và các Node xác thực, tính bất biến (Immutability) của Blockchain khiến không ai (kể cả sàn hay lập trình viên) có quyền sửa đổi hay rút lại tài sản.', isCorrect: true },
      { id: 'C', text: 'Ngân hàng trung ương có thể can thiệp phong tỏa địa chỉ ví người nhận để thu hồi.', isCorrect: false },
      { id: 'D', text: 'Tắt kết nối Internet của điện thoại sẽ làm giao dịch tự động hoàn về.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 1.2 - Giáo Trình Crypto)</b><br>• Blockchain là cuốn sổ cái phân tán, bất biến và phi tập trung. Khi đã đạt xác nhận trên chuỗi, giao dịch là vĩnh viễn và không thể đảo ngược!'
  },
  {
    id: 12,
    chapterId: 1,
    level: 'intermediate',
    levelLabel: '⚡ Trung Bình',
    category: 'blockchain_basics',
    categoryName: '⛓️ Cơ Chế Đồng Thuận (Chương 1)',
    title: 'Case Study 12: Tấn Công 51% & Rủi Ro Double-Spending Trên Mạng Blockchain Nhỏ',
    description: '<b>Bối cảnh:</b> Một mạng blockchain PoW vốn hóa nhỏ có tổng hashrate thấp bị một nhóm đào lạ kiểm soát hơn 53% tổng công suất đào. Nhóm này âm thầm tạo một nhánh chuỗi riêng bí mật dài hơn để chi tiêu cùng một lượng coin 2 lần (Double-Spending) trên các sàn giao dịch.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 12, high: 14, low: 11, close: 13.5, vol: 180 },
        { open: 13.5, high: 14, low: 8.5, close: 9.0, vol: 890, label: '51% ATTACK 🩸', labelColor: '#ff3b69' },
        { open: 9.0, high: 9.5, low: 4.2, close: 4.8, vol: 650, label: 'MẤT NIỀM TIN' }
      ]
    },
    question: 'Biện pháp bảo vệ cốt lõi của người tham gia thị trường trước nguy cơ này là gì?',
    options: [
      { id: 'A', text: 'Chỉ giao dịch và nắm giữ các mạng Blockchain có quy mô hashrate khổng lồ và độ phi tập trung cao (như Bitcoin, Ethereum) hoặc yêu cầu số lượng Block xác nhận lớn (30-60 confirmations) với chain nhỏ.', isCorrect: true },
      { id: 'B', text: 'Nạp thêm tiền bắt đáy ngay khi giá coin bị tấn công 51%.', isCorrect: false },
      { id: 'C', text: 'Yêu cầu bồi thường từ chính phủ nước sở tại.', isCorrect: false },
      { id: 'D', text: 'Tấn công 51% chỉ là tin đồn vô hại.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ A (Theo Chương 1.2 & 2.1)</b><br>• Bitcoin sở hữu hashrate khổng lồ khiến chi phí tấn công 51% tiêu tốn hàng chục tỷ USD và bất khả thi về mặt kinh tế.'
  },

  // ==========================================
  // CHƯƠNG 2: PHÂN LOẠI COIN & VÍ LƯU TRỮ
  // ==========================================
  {
    id: 13,
    chapterId: 2,
    level: 'basic',
    levelLabel: '🌱 Cơ Bản',
    category: 'wallet_security',
    categoryName: '🛡️ Bảo Mật Ví & Seed Phrase (Chương 2)',
    title: 'Case Study 13: Bẫy Phishing Seed Phrase Giả Mạo Hỗ Trợ Kỹ Thuật',
    description: '<b>Bối cảnh:</b> Bạn vừa kết nối ví MetaMask vào một sàn DEX nhưng giao dịch bị lỗi mạng Pending. Một tài khoản Telegram tự xưng là "MetaMask Official Support Support_Agent_99" nhắn tin trực tiếp yêu cầu bạn cung cấp 12 từ khóa bí mật (Secret Recovery Phrase) hoặc nhập vào link "sync-wallet-validation.org" để mở khóa nút giao dịch.',
    chartConfig: null,
    question: 'Hành động đúng đắn và an toàn nhất là gì?',
    options: [
      { id: 'A', text: 'Nhập 12 từ khóa vào website để đội ngũ kỹ thuật sửa lỗi ví nhanh chóng.', isCorrect: false },
      { id: 'B', text: 'TUYỆT ĐỐI KHÔNG CUNG CẤP: Không có bất kỳ đội ngũ hỗ trợ hay admin nào được phép yêu cầu 12 từ khóa Seed Phrase. Đây là bẫy lừa đảo rút sạch 100% tài sản! Block ngay tài khoản đó.', isCorrect: true },
      { id: 'C', text: 'Chỉ gửi 6 từ đầu tiên của chuỗi 12 từ để kiểm tra.', isCorrect: false },
      { id: 'D', text: 'Chụp ảnh màn hình 12 từ gửi qua tin nhắn riêng.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 2.2 - Cảnh Báo Bảo Mật)</b><br>• 12 từ khóa Seed Phrase là chìa khóa chủ quyền tài sản. Cung cấp Seed Phrase = Chuyển toàn bộ tiền cho kẻ lừa đảo!'
  },
  {
    id: 14,
    chapterId: 2,
    level: 'intermediate',
    levelLabel: '⚡ Trung Bình',
    category: 'wallet_security',
    categoryName: '🪙 Spot vs Futures & Đòn Bẩy (Chương 2)',
    title: 'Case Study 14: Thảm Họa Đòn Bẩy Cao x50 Khi Giao Dịch Futures Thay Vì Spot',
    description: '<b>Bối cảnh:</b> Nhà đầu tư A có $2,000 vốn. Thay vì mua SPOT Bitcoin để nắm giữ an toàn khi giá $60,000, A mở vị thế Long Futures đòn bẩy x50 (Giá trị vị thế $100,000). Giá Bitcoin chỉ cần điều chỉnh giảm -1.8% trong nhịp giật râu quét sàn.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 60000, high: 60200, low: 58900, close: 59000, vol: 450, label: 'GIẢM -1.8% 🩸', labelColor: '#ff3b69' },
        { open: 59000, high: 64000, low: 58950, close: 63800, vol: 780, label: 'TĂNG LẠI $64K 🚀' }
      ]
    },
    question: 'Hậu quả tài khoản của nhà đầu tư A là gì?',
    options: [
      { id: 'A', text: 'Tài khoản vẫn an toàn và lãi lớn khi giá bật lên $64,000.', isCorrect: false },
      { id: 'B', text: 'BỊ THANH LÝ CHÁY SẠCH 100% VỐN ($2,000): Với đòn bẩy x50, khoảng cách giá cháy chỉ là 1.8% - 2.0%. Dù sau đó giá có bay lên $100k thì tài khoản đã về 0 từ trước!', isCorrect: true },
      { id: 'C', text: 'Sàn giao dịch sẽ tự động cho vay thêm tiền để gồng qua nhịp giảm.', isCorrect: false },
      { id: 'D', text: 'Chỉ bị trừ 1.8% số tiền ($36).', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 2.3 - Spot vs Futures)</b><br>• Đòn bẩy cao là con dao hai lưỡi. Với người mới, chỉ nên bắt đầu bằng SPOT hoặc Futures đòn bẩy tối đa x2 - x3 có Stop Loss chặt chẽ!'
  },

  // ==========================================
  // CHƯƠNG 3: ORDER BOOK, CUNG CẦU & BỂ THANH KHOẢN
  // ==========================================
  {
    id: 15,
    chapterId: 3,
    level: 'intermediate',
    levelLabel: '⚡ Trung Bình',
    category: 'orderbook_liquidity',
    categoryName: '📊 Khớp Lệnh & Bể Thanh Khoản (Chương 3)',
    title: 'Case Study 15: Phân Biệt Lệnh Limit vs Lệnh Market Trong Pha Biến Động Lớn',
    description: '<b>Bối cảnh:</b> Khi có tin tức đột biến, giá ETH đang biến động mạnh giữa $2,500 và $2,580 với thanh khoản sổ lệnh mỏng. Một trader bấm lệnh "Market Buy" $50,000 USD thay vì đặt lệnh Limit ở mức giá mong muốn.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 2500, high: 2595, low: 2495, close: 2580, vol: 620, label: 'TRƯỢT GIÁ MARKET ⚠️' }
      ]
    },
    question: 'Hậu quả trượt giá (Slippage) xảy ra đối với lệnh Market Buy này là gì?',
    options: [
      { id: 'A', text: 'Lệnh khớp chính xác ở mức giá $2,500 hiển thị ban đầu.', isCorrect: false },
      { id: 'B', text: 'Lệnh Market sẽ quét xuyên qua toàn bộ các tầng giá bán thấp và khớp ở các mức giá cao nhất ($2,570 - $2,590), dẫn đến việc mua đu đỉnh ngắn hạn với giá bất lợi do trượt giá.', isCorrect: true },
      { id: 'C', text: 'Sàn giao dịch tự động hoàn lại khoản chênh lệch giá.', isCorrect: false },
      { id: 'D', text: 'Lệnh bị treo vô thời hạn.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 3.1 - Cơ chế Khớp Lệnh Order Book)</b><br>• Lệnh Market ưu tiên tốc độ nhưng chấp nhận mọi mức giá trên sổ lệnh. Khi thị trường biến động mạnh, luôn ưu tiên dùng lệnh Limit!'
  },
  {
    id: 16,
    chapterId: 3,
    level: 'advanced',
    levelLabel: '🔥 Nâng Cao',
    category: 'orderbook_liquidity',
    categoryName: '📊 Bể Thanh Khoản BSL/SSL (Chương 3)',
    title: 'Case Study 16: Bẫy Bể Thanh Khoản Buy-Side Liquidity (BSL) Tại Đỉnh Cũ',
    description: '<b>Bối cảnh:</b> Vùng đỉnh $68,000 của BTC thu hút hàng triệu USD lệnh Buy Stop (Stop Loss của phe Short và lệnh Breakout Buy của retail trader). Cá mập đẩy giá vượt nhẹ lên $68,400 để khớp bể thanh khoản BSL này rồi lập tức xả hàng.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 66000, high: 67800, low: 65800, close: 67500, vol: 220 },
        { open: 67500, high: 68400, low: 67400, close: 67600, vol: 890, label: 'QUÉT BSL 💥', labelColor: '#f59e0b' },
        { open: 67600, high: 67700, low: 64200, close: 64500, vol: 720, label: 'XẢ SẬP 🩸', labelColor: '#ff3b69' }
      ],
      zones: [{ type: 'resistance', top: 68400, bottom: 67800, label: 'BÃI STOP LOSS PHE SHORT (BSL)' }]
    },
    question: 'Bản chất dòng tiền ở vùng $68,400 là gì?',
    options: [
      { id: 'A', text: 'Cá mập mua vào để đẩy giá lên $100k.', isCorrect: false },
      { id: 'B', text: 'Cá mập lợi dụng thanh khoản mua cưỡng bức của phe Short (Buy-Side Liquidity) để làm đối ứng cho các lệnh Bán chốt lời hàng trăm triệu USD ở vùng giá cao nhất!', isCorrect: true },
      { id: 'C', text: 'Do sàn lỗi đường truyền.', isCorrect: false },
      { id: 'D', text: 'Tín hiệu mua tất tay theo đà tăng.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 3.2 & Chương 9.4)</b><br>• Muốn bán khối lượng lớn giá cao, Nhà tạo lập buộc phải đẩy giá tới nơi có nhiều người muốn mua nhất (vùng BSL đỉnh cũ).'
  },

  // ==========================================
  // CHƯƠNG 4: MÔ HÌNH NẾN ĐẢO CHIỀU
  // ==========================================
  {
    id: 17,
    chapterId: 4,
    level: 'basic',
    levelLabel: '🌱 Cơ Bản',
    category: 'candlestick_patterns',
    categoryName: '🕯️ Mô Hình Nến Đảo Chiều (Chương 4)',
    title: 'Case Study 17: Cụm Nến Sao Mai (Morning Star) Tại Vùng Hỗ Trợ Khung 1H',
    description: '<b>Bối cảnh:</b> Sau chuỗi giảm mạnh, giá SOL xuất hiện Nến 1 đỏ dài, Nến 2 là Doji chuồn chuồn tại hỗ trợ $128, và Nến 3 là Nến xanh lớn đóng cửa vượt quá 65% thân nến đỏ thứ nhất.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 142, high: 143, low: 133, close: 134, vol: 190 },
        { open: 134, high: 135, low: 126, close: 127, vol: 240, label: 'N1: Đỏ Lớn' },
        { open: 127, high: 128.5, low: 124, close: 127.5, vol: 180, label: 'N2: Doji Đáy' },
        { open: 127.5, high: 138, low: 127, close: 137, vol: 480, label: 'N3: Xanh Lớn (Sao Mai) ⭐', labelColor: '#00c076' },
        { open: 137, high: 148, low: 136.5, close: 146, vol: 420 }
      ],
      zones: [{ type: 'support', top: 128, bottom: 124, label: 'HỖ TRỢ ĐÁY' }],
      tradeSetup: { entry: 137.5, sl: 123.5, tp: 155.0, startIndex: 3 }
    },
    question: 'Chiến lược vào lệnh chuẩn mực theo mô hình Morning Star là gì?',
    options: [
      { id: 'A', text: 'Vào Short ngay vì xu hướng trước đó là giảm.', isCorrect: false },
      { id: 'B', text: 'Mở vị thế Long khi Nến 3 đóng cửa xác nhận ($137.5), Stop Loss đặt dưới đáy nến Doji ($123.5), Take Profit tại kháng cự $155 (R:R ≈ 1 : 2.5).', isCorrect: true },
      { id: 'C', text: 'Chờ giá giảm thêm 50% mới vào lệnh.', isCorrect: false },
      { id: 'D', text: 'Không cài Stop Loss vì Morning Star có tỷ lệ đúng 100%.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 4.2.B - Giáo Trình Crypto)</b><br>• Morning Star là cụm 3 nến đảo chiều đáy kinh điển báo hiệu phe Bò đã giành lại toàn quyền kiểm soát.'
  },
  {
    id: 18,
    chapterId: 4,
    level: 'intermediate',
    levelLabel: '⚡ Trung Bình',
    category: 'candlestick_patterns',
    categoryName: '🕯️ Nến Shooting Star & Bẫy Đỉnh (Chương 4)',
    title: 'Case Study 18: Nến Shooting Star Xuất Hiện Sau Chuỗi Tăng Nóng Chạm Kháng Cự 4H',
    description: '<b>Bối cảnh:</b> Giá BNB tăng 7 cây nến xanh liên tiếp lên $620. Cây nến tiếp theo có râu trên dài gấp 3 lần thân nến, đóng cửa là nến đỏ nhỏ sát đáy phiên kèm Volume tăng đột biến.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 560, high: 585, low: 558, close: 580, vol: 150 },
        { open: 580, high: 605, low: 578, close: 600, vol: 210 },
        { open: 600, high: 625, low: 598, close: 602, vol: 540, label: 'SHOOTING STAR 🩸', labelColor: '#ff3b69' },
        { open: 602, high: 604, low: 565, close: 570, vol: 480, label: 'XÁC NHẬN SẬP' }
      ],
      zones: [{ type: 'resistance', top: 625, bottom: 615, label: 'KHÁNG CỰ 4H' }]
    },
    question: 'Tín hiệu trên cảnh báo điều gì và trader nên xử lý ra sao?',
    options: [
      { id: 'A', text: 'Tín hiệu mua đuổi vì râu trên nến chạm giá cao $625.', isCorrect: false },
      { id: 'B', text: 'Cảnh báo phe mua đã kiệt sức và bị phe bán xả hàng chặn đứng tại cản ➔ Chốt lời vị thế Mua hoặc canh mở vị thế Bán khống (Short) với SL trên đỉnh râu nến $626.', isCorrect: true },
      { id: 'C', text: 'Nến Shooting Star không có ý nghĩa khi thị trường đang tăng mạnh.', isCorrect: false },
      { id: 'D', text: 'Nạp thêm vốn mua gấp đôi ở đỉnh.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 4.1.B - Nến Shooting Star)</b><br>• Râu trên dài thể hiện áp lực từ chối giá cao kịch liệt từ phe Gấu tại vùng kháng cự.'
  },

  // ==========================================
  // CHƯƠNG 5: HỖ TRỢ & KHÁNG CỰ & SFP
  // ==========================================
  // (Case 1 & 5 từ danh sách gốc được tích hợp vào Chương 5 & 9)
  {
    id: 1,
    chapterId: 5,
    level: 'intermediate',
    levelLabel: '⚡ Trung Bình',
    category: 'whale_traps',
    categoryName: '🐋 Bẫy Cá Mập & Quét Sàn (Chương 5 & 9)',
    title: 'Case Study 1: Giải Mã Cú Quét Râu Đáy SFP (Swing Failure Pattern) Tại Vùng EQL',
    description: '<b>Bối cảnh:</b> Giá Bitcoin sau chuỗi ngày điều chỉnh đang tạo 2 đáy bằng phẳng (Equal Lows - EQL) tại $59,000. Đám đông mở Long và đặt Stop Loss tại $58,800. Cây nến 15m đâm thủng hỗ trợ xuống $57,600 rồi lập tức rút râu đóng nến bên trong biên tại $59,400 với Volume cực đại.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 63500, high: 63800, low: 60800, close: 61000, vol: 180 },
        { open: 61000, high: 61200, low: 58950, close: 59000, vol: 240, label: 'Đáy 1 ($59k)' },
        { open: 59000, high: 61200, low: 59100, close: 60800, vol: 200 },
        { open: 60800, high: 61000, low: 58980, close: 59020, vol: 220, label: 'Đáy 2 EQL ($59k)' },
        { open: 59020, high: 59600, low: 57600, close: 59400, vol: 780, label: 'QUÉT SFP 🩸⚡', labelColor: '#00c076' },
        { open: 59400, high: 62200, low: 59350, close: 62000, vol: 540, label: 'BÙNG NỔ TĂNG 🚀', labelColor: '#38bdf8' }
      ],
      zones: [{ type: 'support', top: 59150, bottom: 58850, label: 'BÃI STOP LOSS EQL (SSL)' }],
      tradeSetup: { entry: 59450, sl: 57500, tp: 64500, startIndex: 4 }
    },
    question: 'Bản chất hành vi của Cá mập và kế hoạch giao dịch chuẩn xác là gì?',
    options: [
      { id: 'A', text: 'Thủng đáy là sập ➔ Short đuổi theo đà giảm.', isCorrect: false },
      { id: 'B', text: 'Mô hình SFP (Quét thanh khoản gom hàng): Mở Long khi nến 15m đóng cửa ($59,450), SL $57,500 dưới râu nến quét, TP đỉnh cũ $64,500 (R:R ≈ 1 : 2.6).', isCorrect: true },
      { id: 'C', text: 'Đây là nến Doji lưỡng lự không có tín hiệu.', isCorrect: false },
      { id: 'D', text: 'Chờ giá về 0 mới mua.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 5.3, 5.4 & Chương 9.4)</b><br>• Dấu hiệu SFP: Nến chọc thủng đáy nhưng không đóng cửa dưới đáy kèm Volume đột biến.'
  },
  {
    id: 19,
    chapterId: 5,
    level: 'basic',
    levelLabel: '🌱 Cơ Bản',
    category: 'support_resistance',
    categoryName: '🏢 Chuyển Đổi Vai Trò Break & Retest (Chương 5)',
    title: 'Case Study 19: Vào Lệnh Mua Chuẩn Kỷ Luật Khi Kháng Cự Biến Thành Hỗ Trợ Mới',
    description: '<b>Bối cảnh:</b> Giá NEAR đi ngang dưới vùng cản $5.00 suốt 2 tuần. Một cây nến 4H tăng mạnh vượt $5.40 với Volume cao gấp đôi trung bình. Sau đó, giá điều chỉnh nhẹ nhàng về vùng $5.05 - $5.10 với Volume cạn kiệt và xuất hiện nến Hammer.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 4.6, high: 4.95, low: 4.5, close: 4.85, vol: 110 },
        { open: 4.85, high: 5.45, low: 4.80, close: 5.40, vol: 520, label: 'BREAKOUT 💥', labelColor: '#38bdf8' },
        { open: 5.40, high: 5.45, low: 5.05, close: 5.10, vol: 130, label: 'RETEST (VOL THẤP) 🎯', labelColor: '#00c076' },
        { open: 5.10, high: 6.20, low: 5.08, close: 6.10, vol: 490, label: 'TĂNG TIẾP 🚀' }
      ],
      zones: [{ type: 'resistance', top: 5.05, bottom: 4.95, label: 'KHÁNG CỰ CŨ ➔ HỖ TRỢ MỚI' }],
      tradeSetup: { entry: 5.15, sl: 4.85, tp: 6.20, startIndex: 2 }
    },
    question: 'Điểm vào lệnh tối ưu và an toàn nhất là ở đâu?',
    options: [
      { id: 'A', text: 'Mua đuổi ngay tại đỉnh cây nến Breakout $5.45.', isCorrect: false },
      { id: 'B', text: 'Vào lệnh Mua khi giá Retest thành công về vùng cản cũ ($5.10 - $5.15) có nến rút chân + Volume thấp, SL dưới vùng cản $4.85, TP tại đỉnh mục tiêu $6.20.', isCorrect: true },
      { id: 'C', text: 'Mở Short vì giá đang hồi giảm.', isCorrect: false },
      { id: 'D', text: 'Chờ giá thủng về $3.00.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 5.4 - Quy Tắc Chuyển Đổi Vai Trò)</b><br>• Mua tại nhịp Retest giúp tối ưu điểm vào và có Stop Loss cực kỳ ngắn!'
  },

  // ==========================================
  // CHƯƠNG 6: CẤU TRÚC THỊ TRƯỜNG & SMC
  // ==========================================
  {
    id: 20,
    chapterId: 6,
    level: 'basic',
    levelLabel: '🌱 Cơ Bản',
    category: 'market_structure_smc',
    categoryName: '📈 Cấu Trúc Xu Hướng HH/HL (Chương 6)',
    title: 'Case Study 20: Xác Định Xu Hướng Uptrend Còn Duy Trì Hay Đã Bị Bẻ Gãy',
    description: '<b>Bối cảnh:</b> Giá AVAX đang trong cấu trúc Uptrend với Đáy Higher Low (HL) gần nhất tại $24.00. Giá bất ngờ có nhịp giảm xuyên thủng qua mốc $24.00 và đóng nến 4H tại $22.50.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 20, high: 26, low: 19.5, close: 25.5, vol: 150 },
        { open: 25.5, high: 26.5, low: 23.8, close: 24.2, vol: 120, label: 'Đáy HL Gần Nhất ($24)' },
        { open: 24.2, high: 31, low: 24.0, close: 30.5, vol: 240, label: 'Đỉnh HH Mới ($31)' },
        { open: 30.5, high: 30.8, low: 22.0, close: 22.5, vol: 480, label: 'GÃY HL (CHOCH) ⚡', labelColor: '#ff3b69' }
      ]
    },
    question: 'Tín hiệu nến 4H đóng cửa dưới đáy HL $24.00 thông báo điều gì?',
    options: [
      { id: 'A', text: 'Cấu trúc Uptrend vẫn giữ nguyên, tiếp tục mua vào bắt đáy.', isCorrect: false },
      { id: 'B', text: 'Cấu trúc tăng đã chính thức BỊ BẺ GÃY (Tín hiệu Change of Character - CHoCH), thị trường có xác suất cao chuyển sang Downtrend hoặc Sideway rộng ➔ Ngừng mua gom, chờ kịch bản hồi test để canh Short.', isCorrect: true },
      { id: 'C', text: 'Thị trường chuẩn bị tăng gấp 10 lần.', isCorrect: false },
      { id: 'D', text: 'Chỉ là sự cố hiển thị của sàn.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 6.1 & 6.2 - Cấu Trúc Thị Trường)</b><br>• Khi đáy Higher Low tạo ra đỉnh cao nhất bị đục thủng và đóng nến dưới, cấu trúc tăng bị phá vỡ.'
  },
  {
    id: 7,
    chapterId: 6,
    level: 'advanced',
    levelLabel: '🔥 Nâng Cao',
    category: 'macro_cycle',
    categoryName: '⏱️ Đa Khung Thời Gian & SMC (Chương 6 & 7)',
    title: 'Case Study 7: Bẫy Phá Vỡ Cấu Trúc Khung Nhỏ (Minor ChoCH) Chạm Cản 4H',
    description: '<b>Bối cảnh:</b> Xu hướng 4H là Downtrend mạnh. Khung 15m bất ngờ vượt đỉnh gần nhất tạo Bullish ChoCH. Nhiều nhóm hô hào Uptrend và Long đuổi. Tuy nhiên ngay phía trên +0.8% là Bearish Order Block của khung 4H!',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 66000, high: 66200, low: 62000, close: 62200, vol: 350, label: 'Downtrend 4H' },
        { open: 62200, high: 63500, low: 62100, close: 63200, vol: 210 },
        { open: 63200, high: 64800, low: 63000, close: 64600, vol: 290, label: '15m ChoCH Tăng ⭐' },
        { open: 64600, high: 65100, low: 64400, close: 64500, vol: 480, label: 'Chạm Bearish OB 4H' },
        { open: 64500, high: 64600, low: 61000, close: 61200, vol: 810, label: 'SẬP THEO TREND 4H 🩸', labelColor: '#ff3b69' }
      ],
      zones: [{ type: 'resistance', top: 65200, bottom: 64700, label: 'BEARISH ORDER BLOCK 4H' }],
      tradeSetup: { entry: 64500, sl: 65400, tp: 60500, startIndex: 3 }
    },
    question: 'Tư duy đúng đắn của Pro Trader khi nhìn đa khung thời gian là gì?',
    options: [
      { id: 'A', text: '15m ChoCH tăng là thị trường đã tăng ➔ Long đuổi.', isCorrect: false },
      { id: 'B', text: 'Khung nhỏ phải phục tùng khung lớn. Nhịp tăng 15m chỉ là sóng hồi chạm vùng bán 4H ➔ Chờ nến đảo chiều 15m chạm cản 4H để MỞ SHORT thuận xu hướng lớn (Entry $64,500, SL $65,400, TP $60,500)!', isCorrect: true },
      { id: 'C', text: 'Tắt nến 4H đi chỉ đánh khung 1 phút.', isCorrect: false },
      { id: 'D', text: 'Đánh cả Long và Short cùng lúc.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 6.3 & 7.5 - Top-Down Strategy)</b><br>• Không bao giờ mở vị thế ngược xu hướng khung lớn 4H!'
  },

  // ==========================================
  // CHƯƠNG 7: ĐA KHUNG THỜI GIAN & KILLZONES
  // ==========================================
  {
    id: 21,
    chapterId: 7,
    level: 'intermediate',
    levelLabel: '⚡ Trung Bình',
    category: 'multi_timeframe',
    categoryName: '⏱️ Đa Khung Thời Gian & Killzones (Chương 7)',
    title: 'Case Study 21: Tận Dụng Khung Giờ Vàng (London / NY Killzones) Tránh Bẫy Sideway',
    description: '<b>Bối cảnh:</b> Trong phiên Á (06:00 - 12:00 VN), giá BTC đi ngang trong biên độ hẹp $300. Nhiều trader nôn nóng vào lệnh đòn bẩy cao và liên tục bị dính phí funding + trượt giá. Đến 14:30 (Mở phiên London), biến động bùng nổ quét sạch 2 đầu trước khi vào sóng đẩy chính.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 62100, high: 62200, low: 62000, close: 62050, vol: 50, label: 'Phiên Á (Sideway)' },
        { open: 62050, high: 62150, low: 61950, close: 62100, vol: 60 },
        { open: 62100, high: 62800, low: 61600, close: 62700, vol: 680, label: 'LONDON KILLZONE ⚡', labelColor: '#38bdf8' },
        { open: 62700, high: 64500, low: 62600, close: 64200, vol: 890, label: 'SÓNG ĐẨY MỸ 🚀' }
      ]
    },
    question: 'Quy tắc chọn thời gian giao dịch thông minh theo Giáo trình là gì?',
    options: [
      { id: 'A', text: 'Ngồi canh màn hình 24/24 và vào lệnh liên tục trong phiên Á.', isCorrect: false },
      { id: 'B', text: 'Hạn chế giao dịch trong phiên Á thanh khoản mỏng; Tập trung cao độ vào các khung giờ vàng: London Open (14:30 - 17:30 VN) và New York Open (19:30 - 23:00 VN) khi dòng tiền tổ chức tham gia mạnh mẽ nhất!', isCorrect: true },
      { id: 'C', text: 'Chỉ giao dịch vào lúc 3h sáng.', isCorrect: false },
      { id: 'D', text: 'Khung giờ nào cũng như nhau trong thị trường crypto.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 7.4 - Chuyên đề Khung Giờ Vàng Killzones)</b><br>• Giao dịch đúng khung giờ giúp tránh bẫy cưa chân bàn của thị trường đi ngang.'
  },
  {
    id: 2,
    chapterId: 7,
    level: 'advanced',
    levelLabel: '🔥 Nâng Cao',
    category: 'whale_traps',
    categoryName: '🐋 Bẫy Cá Mập & Quét Sàn (Chương 7 & 9)',
    title: 'Case Study 2: Bẫy Judas Swing & Bẫy Thanh Khoản Mua (BSL) Giờ Ra Tin CPI',
    description: '<b>Bối cảnh:</b> 19:30 tối công bố CPI tốt. Nến 5m giật từ $64,000 lên $65,800 qua đỉnh cũ. Đám đông bấm Buy đuổi theo. 5 phút sau OI sụt giảm và nến Bearish Engulfing khổng lồ xả thẳng về $63,600 nuốt trọn nến tăng.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 63600, high: 64200, low: 63500, close: 64000, vol: 140 },
        { open: 64000, high: 65000, low: 63900, close: 64800, vol: 210, label: 'Đỉnh Cũ $65k' },
        { open: 64800, high: 65800, low: 64700, close: 65600, vol: 490, label: 'BẪY DỤ LONG 💥', labelColor: '#f59e0b' },
        { open: 65600, high: 65700, low: 63500, close: 63700, vol: 890, label: 'JUDAS DUMP 🩸', labelColor: '#ff3b69' }
      ],
      zones: [{ type: 'resistance', top: 65200, bottom: 64800, label: 'VÙNG KHÁNG CỰ ĐỈNH (BSL)' }],
      tradeSetup: { entry: 63700, sl: 65900, tp: 59500, startIndex: 3 }
    },
    question: 'Hiện tượng trên là gì và trader tỉnh táo sẽ hành động như thế nào?',
    options: [
      { id: 'A', text: 'Tin tốt giá sẽ lên $100k ➔ Gồng lỗ lệnh Long.', isCorrect: false },
      { id: 'B', text: 'Bẫy Judas Swing: Cá mập lợi dụng tin tốt để kích hoạt lòng tham đám đông nhằm xả hàng ở đỉnh ➔ Tuyệt đối KHÔNG FOMO; Chờ nến xác nhận đóng cửa dưới đỉnh cũ để mở Short (Entry $63,700, SL $65,900, TP $59,500).', isCorrect: true },
      { id: 'C', text: 'Do sàn bị lỗi hiển thị.', isCorrect: false },
      { id: 'D', text: 'Hủy toàn bộ tài khoản nghỉ chơi.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 3.2, 7.4 & 9.4)</b><br>• Quy tắc vàng: Không bao giờ vào lệnh trong 15 phút đầu tiên sau tin tức vĩ mô!'
  },

  // ==========================================
  // CHƯƠNG 8: VOLUME VSA, RSI & PHÁI SINH
  // ==========================================
  {
    id: 22,
    chapterId: 8,
    level: 'intermediate',
    levelLabel: '⚡ Trung Bình',
    category: 'volume_vsa',
    categoryName: '📊 Khối Lượng VSA & Phân Kỳ (Chương 8)',
    title: 'Case Study 22: Nhận Diện Phân Kỳ Tăng Giá RSI (Bullish Divergence) Khung 4H',
    description: '<b>Bối cảnh:</b> Giá Bitcoin sau chuỗi ngày giảm liên tục tạo Đáy mới thấp hơn (LL: $56,000 rơi về $53,500). Tuy nhiên, chỉ báo RSI trên khung 4H lại tạo Đáy sau cao hơn rõ rệt (HL: từ 26 điểm dâng lên 33 điểm).',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 60000, high: 60200, low: 55800, close: 56000, vol: 240, label: 'Đáy 1 ($56k - RSI 26)' },
        { open: 56000, high: 57500, low: 55900, close: 57000, vol: 190 },
        { open: 57000, high: 57200, low: 53400, close: 53500, vol: 310, label: 'Đáy 2 ($53.5k - RSI 33) ⭐', labelColor: '#00c076' },
        { open: 53500, high: 58000, low: 53450, close: 57800, vol: 620, label: 'PHÂN KỲ BÙNG NỔ 🚀' }
      ]
    },
    question: 'Tín hiệu phân kỳ RSI trên báo hiệu điều gì?',
    options: [
      { id: 'A', text: 'Giá tạo đáy mới thấp hơn nghĩa là đà giảm đang mạnh hơn ➔ Short đuổi.', isCorrect: false },
      { id: 'B', text: 'Tín hiệu Phân kỳ tăng giá (Bullish Divergence): Lực bán đã suy kiệt nghiêm trọng mặc dù giá rơi sâu hơn, dự báo xác suất đảo chiều tăng giá rất cao ➔ Canh mở vị thế Long khi xuất hiện nến rút chân xác nhận.', isCorrect: true },
      { id: 'C', text: 'RSI không có tác dụng trong thị trường crypto.', isCorrect: false },
      { id: 'D', text: 'Bán tháo toàn bộ danh mục.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 8.2 - Chỉ báo RSI & Phân Kỳ)</b><br>• Phân kỳ đáy RSI là một trong những chỉ báo sớm uy tín nhất của phân tích kỹ thuật.'
  },
  {
    id: 3,
    chapterId: 8,
    level: 'advanced',
    levelLabel: '🔥 Nâng Cao',
    category: 'derivatives_data',
    categoryName: '📊 Dữ Liệu Phái Sinh & Squeeze (Chương 8 & 9)',
    title: 'Case Study 3: Bẫy Funding Rate Âm Kỷ Lục & Tín Hiệu Săn Sóng Short Squeeze',
    description: '<b>Bối cảnh:</b> SOL đi ngang $130 - $132 sau đợt sập. Mạng xã hội FUD hoảng loạn, đám đông Short x20-x50. Funding Rate rớt sâu -0.18%/8h, Open Interest (OI) tăng vọt +$200M nhưng giá SOL không thủng $130!',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 152, high: 154, low: 138, close: 140, vol: 220 },
        { open: 140, high: 142, low: 130, close: 132, vol: 310, label: 'Funding -0.18% ⚠️' },
        { open: 132, high: 133.5, low: 129.5, close: 131, vol: 340, label: 'OI Tăng Đột Biến' },
        { open: 131, high: 149, low: 130.8, close: 147, vol: 920, label: 'SHORT SQUEEZE 🚀', labelColor: '#00c076' },
        { open: 147, high: 164, low: 146, close: 162, vol: 780 }
      ],
      zones: [{ type: 'support', top: 132, bottom: 129, label: 'VÙNG NÉN ĐÒN BẨY SHORT' }],
      tradeSetup: { entry: 132.5, sl: 128.5, tp: 160.0, startIndex: 2 }
    },
    question: 'Dữ liệu phái sinh trên dự báo điều gì?',
    options: [
      { id: 'A', text: 'Funding âm chứng tỏ phe Short mạnh ➔ Short tất tay theo.', isCorrect: false },
      { id: 'B', text: 'Tín hiệu nén lò xo chuẩn bị SHORT SQUEEZE: Chuỗi thanh lý Short sẽ tự động kích hoạt lệnh Market Buy đẩy giá bay thẳng đứng ➔ Mở Long đón đầu quanh $132, SL $128.5, TP $158 - $162 (R:R = 1 : 6.8)!', isCorrect: true },
      { id: 'C', text: 'Do sàn thu phí vô lý không nên quan tâm.', isCorrect: false },
      { id: 'D', text: 'Chờ SOL về 0 USD.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 8.3 & 9.4)</b><br>• Cơ chế Short Squeeze: Khi phe Short bị thanh lý, lệnh cắt lỗ của họ là lệnh Market Buy đẩy giá bay như tên lửa!'
  },

  // ==========================================
  // CHƯƠNG 9: CÁ MẬP, WYCKOFF & CHU KỲ DÒNG TIỀN
  // ==========================================
  {
    id: 4,
    chapterId: 9,
    level: 'intermediate',
    levelLabel: '⚡ Trung Bình',
    category: 'macro_cycle',
    categoryName: '🌊 Vĩ Mô & Chu Kỳ Dòng Tiền (Chương 9.2)',
    title: 'Case Study 4: Xử Lý Danh Mục Khi Bitcoin Dominance (BTC.D) Đột Phá Kháng Cự',
    description: '<b>Bối cảnh:</b> Bitcoin phá đỉnh tăng từ $65k lên $75k. Cùng lúc BTC Dominance (BTC.D) vượt cản 55% lên 62%. Danh mục của bạn có 80% Altcoin và đang bị bốc hơi -15% dù toàn bộ bảng điện BTC xanh ngát.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 65000, high: 68000, low: 64500, close: 67500, vol: 310 },
        { open: 67500, high: 71000, low: 67000, close: 70500, vol: 450, label: 'BTC.D VƯỢT 55% ⚠️' },
        { open: 70500, high: 75500, low: 70000, close: 75000, vol: 680, label: 'BTC.D 62% (HÚT MÁU)' },
        { open: 75000, high: 76000, low: 73500, close: 74200, vol: 410, label: 'Altcoin Đỏ Lửa 🩸' }
      ]
    },
    question: 'Thị trường đang ở giai đoạn nào và cách tái cơ cấu danh mục tối ưu là gì?',
    options: [
      { id: 'A', text: 'Thị trường đang ở Altseason ➔ Vay tiền mua thêm Altcoin.', isCorrect: false },
      { id: 'B', text: 'Pha 1 (Dòng tiền chỉ tập trung vào BTC, Altcoin bị hút máu) ➔ Giữ chặt BTC/USDT; Tuyệt đối không FOMO Altcoin; Chờ BTC đi ngang lập đỉnh và BTC.D bắt đầu gãy giảm mới luân chuyển vốn sang đón MÙA ALTCOIN (Pha 3)!', isCorrect: true },
      { id: 'C', text: 'Bán sạch tài sản nghỉ chơi.', isCorrect: false },
      { id: 'D', text: 'Đánh Futures x100 gỡ lỗ.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.2 - Chu Kỳ Dòng Tiền 5 Pha)</b><br>• Tiền từ các quỹ ETF luôn đổ vào BTC đầu tiên. Chỉ khi BTC.D giảm thì Altcoin mới bùng nổ!'
  },
  {
    id: 5,
    chapterId: 9,
    level: 'advanced',
    levelLabel: '🔥 Nâng Cao',
    category: 'whale_traps',
    categoryName: '🐋 Bẫy Cá Mập & Quét Sàn (Chương 3 & 9)',
    title: 'Case Study 5: Bóc Trần Chiêu Trò Kê Lệnh Ảo (Spoofing) & Phân Kỳ Tích Lũy CVD',
    description: '<b>Bối cảnh:</b> Tường Buy Limit 2,500 BTC xuất hiện tại $61,000. Khi giá rơi sát $61,020, tường 2,500 BTC đột ngột bị hủy khiến giá trượt rơi tự do về $60,400. Đám đông bán tháo Market nhưng chỉ báo CVD lại tạo Đáy cao hơn (HL).',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 62800, high: 63000, low: 61800, close: 62000, vol: 190 },
        { open: 62000, high: 62200, low: 60950, close: 61050, vol: 240, label: 'Tường Ảo $61k' },
        { open: 61050, high: 61100, low: 60300, close: 60400, vol: 690, label: 'RÚT TƯỜNG SẬP 🩸', labelColor: '#ff3b69' },
        { open: 60400, high: 62500, low: 60350, close: 62300, vol: 580, label: 'CVD TĂNG (ABSORPTION) ⭐', labelColor: '#00c076' }
      ],
      zones: [{ type: 'support', top: 60600, bottom: 60200, label: 'VÙNG CÁ MẬP HẤP THỤ GOM HÀNG' }],
      tradeSetup: { entry: 62350, sl: 60200, tp: 65500, startIndex: 3 }
    },
    question: 'Bản chất sự kết hợp giữa Spoofing và Phân kỳ CVD ở đây là gì?',
    options: [
      { id: 'A', text: 'Cá mập phá sản sắp về 0.', isCorrect: false },
      { id: 'B', text: 'Tường $61k là bẫy Spoofing để xả hàng; Cú rơi về $60,400 kèm phân kỳ CVD tăng chứng minh Cá mập đang dùng lệnh Limit hấp thụ toàn bộ lực bán tháo của retail ➔ Tín hiệu gom hàng đáy uy tín, canh Mua.', isCorrect: true },
      { id: 'C', text: 'CVD tăng là sàn in thêm coin.', isCorrect: false },
      { id: 'D', text: 'Short tại $60,400.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 3.1 & 9.4 - Dấu hiệu 4 & 5)</b><br>• Phân kỳ CVD (Absorption) phản ánh dòng tiền thông minh đang gom sạch lực bán hoảng loạn.'
  },
  {
    id: 9,
    chapterId: 9,
    level: 'advanced',
    levelLabel: '🔥 Nâng Cao',
    category: 'macro_cycle',
    categoryName: '🌊 Cấu Trúc Wyckoff & Tích Lũy (Chương 9.3)',
    title: 'Case Study 9: Nhận Diện Pha Rũ Bỏ Cuối Cùng Wyckoff Spring (Phase C)',
    description: '<b>Bối cảnh:</b> Đồng coin Layer 1 đi ngang trong hộp Trading Range $20 - $25 suốt 4 tuần. Cây nến đỏ đâm thủng hỗ trợ $20 về $17.80 ép cắt lỗ. Ngay sau đó nến xanh Marubozu kéo ngược trở lại bên trong hộp tích lũy ($21.80) với Volume bùng nổ!',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 22, high: 24, low: 21, close: 23, vol: 140 },
        { open: 23, high: 25, low: 22.5, close: 24.5, vol: 160, label: 'Kháng Cự $25' },
        { open: 24.5, high: 24.8, low: 20.2, close: 20.4, vol: 190, label: 'Hỗ Trợ $20' },
        { open: 20.4, high: 20.8, low: 17.8, close: 18.2, vol: 680, label: 'SPRING RŨ BỎ 🩸', labelColor: '#ef4444' },
        { open: 18.2, high: 22.2, low: 18.1, close: 21.8, vol: 720, label: 'QUAY LẠI HỘP ⭐', labelColor: '#00c076' },
        { open: 21.8, high: 28.5, low: 21.5, close: 28.0, vol: 890, label: 'MARKUP 🚀' }
      ],
      zones: [{ type: 'support', top: 21.0, bottom: 20.0, label: 'BIÊN DƯỚI TRADING RANGE' }],
      tradeSetup: { entry: 22.0, sl: 17.5, tp: 32.0, startIndex: 4 }
    },
    question: 'Đây là hiện tượng gì theo Wyckoff và điểm vào lệnh tối ưu ở đâu?',
    options: [
      { id: 'A', text: 'Thủng $20 là tích lũy thất bại ➔ Mở Short đuổi.', isCorrect: false },
      { id: 'B', text: 'Pha SPRING (Wyckoff Phase C): Cú rũ bỏ toàn bộ tay yếu trước sóng Markup ➔ Mở Long khi nến tái tích lũy đóng lại trong TR ($21.8 - $22.0), SL $17.5 (dưới đáy Spring), TP $25 và TP2 $32 (R:R >= 1:5)!', isCorrect: true },
      { id: 'C', text: 'Thị trường chuyển sang mùa đông.', isCorrect: false },
      { id: 'D', text: 'Wyckoff không đúng trong crypto.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.3 - Chu Kỳ Wyckoff)</b><br>• Spring là cơ hội săn lệnh Long có tỷ lệ Risk/Reward vượt trội nhất trong toàn bộ chu kỳ tích lũy!'
  },
  {
    id: 27,
    chapterId: 9,
    level: 'intermediate',
    levelLabel: '⚡ Trung Bình',
    category: 'macro_cycle',
    categoryName: '🌊 Nhận Diện Đỉnh Chu Kỳ Memecoin (Chương 9.2)',
    title: 'Case Study 27: Dấu Hiệu Đỉnh Sóng Khi Memecoin Vốn Hóa Nhỏ Tăng Hàng Trăm Lần',
    description: '<b>Bối cảnh:</b> Bitcoin và Ethereum đi ngang 3 tuần. Thị trường tràn ngập các đồng Memecoin vô giá trị tăng x50 - x200 trong vài ngày. Báo chí đại chúng và người không chuyên bắt đầu bàn tán rủ nhau nghỉ việc để chơi coin.',
    chartConfig: null,
    question: 'Theo chu kỳ luân chuyển dòng tiền 5 Pha, thị trường đang ở pha nào và hành động an toàn là gì?',
    options: [
      { id: 'A', text: 'Thị trường mới bắt đầu chu kỳ ➔ Vay mượn mua tất tay các đồng memecoin.', isCorrect: false },
      { id: 'B', text: 'Thị trường đang ở Pha 4 (Sóng Memecoin cuối cùng & Cực độ tham lam) chuẩn bị bước vào Pha 5 (Xả về USDT & Sập Downtrend) ➔ Lập tức chốt lời từng phần (DCA Out) ra USDT để bảo toàn lợi nhuận!', isCorrect: true },
      { id: 'C', text: 'Memecoin sẽ thay thế Bitcoin làm đồng tiền toàn cầu.', isCorrect: false },
      { id: 'D', text: 'Không cần làm gì cả.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.2 - Pha 4 & 5 Chu Kỳ Dòng Tiền)</b><br>• Khi Memecoin rác bay điên cuồng là tín hiệu dòng tiền thông minh đang âm thầm xả hàng rút về USDT.'
  },

  // ==========================================
  // CHƯƠNG 10: QUẢN TRỊ VỐN & TÂM LÝ
  // ==========================================
  {
    id: 6,
    chapterId: 10,
    level: 'intermediate',
    levelLabel: '⚡ Trung Bình',
    category: 'risk_execution',
    categoryName: '🛡️ Quản Trị Rủi Ro Futures (Chương 9.4 & 10)',
    title: 'Case Study 6: Xử Lý Bẫy Giãn Spread & Quét Râu Ảo Futures Ban Đêm',
    description: '<b>Bối cảnh:</b> Bạn Long ETH tại $2,600, SL $2,540. Lúc 03:30 sáng, giá Spot chỉ giảm về $2,548 rồi bay lên $2,800. Tuy nhiên tài khoản Futures bị cắn SL do biểu đồ Futures giật râu ảo cục bộ về $2,532!',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 2680, high: 2700, low: 2590, close: 2600, vol: 120 },
        { open: 2600, high: 2610, low: 2548, close: 2580, vol: 140, label: 'Spot Đáy $2,548' },
        { open: 2580, high: 2590, low: 2532, close: 2575, vol: 390, label: 'FUTURES QUÉT $2,532 🩸', labelColor: '#ff3b69' },
        { open: 2575, high: 2740, low: 2570, close: 2720, vol: 480, label: 'BAY $2,800 🚀' }
      ]
    },
    question: 'Giải pháp phòng vệ sống còn trên sàn Futures là gì?',
    options: [
      { id: 'A', text: 'Sàn hack tài khoản.', isCorrect: false },
      { id: 'B', text: 'Chuyển chế độ kích hoạt Stop Loss sang GIÁ ĐÁNH DẤU (MARK PRICE - chỉ số tổng hợp nhiều sàn Spot lớn) và đặt SL lùi xa mốc số tròn 0.5% để tránh bị quét râu ảo khi thanh khoản mỏng!', isCorrect: true },
      { id: 'C', text: 'Không cài Stop Loss nữa.', isCorrect: false },
      { id: 'D', text: 'Đánh đòn bẩy x100.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.4 & Chương 10)</b><br>• Mark Price chống thao túng giá nội bộ trên sàn phái sinh.'
  },
  {
    id: 8,
    chapterId: 10,
    level: 'basic',
    levelLabel: '🌱 Cơ Bản',
    category: 'risk_execution',
    categoryName: '🧮 Quản Trị Vốn & Trượt Giá (Chương 10)',
    title: 'Case Study 8: Bài Toán Xử Lý Khủng Hoảng Trượt Giá (Slippage) Altcoin Rác',
    description: '<b>Bối cảnh:</b> Vốn $5,000. Long Memecoin đòn bẩy x15 (Vị thế $30,000), SL 3% ($900 dự kiến). Khi xả hàng, lệnh Market SL bị trượt giá sâu tới 8.5% mới khớp được khiến tài khoản lỗ -$2,550 (mất hơn 51% vốn)!',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 0.120, high: 0.128, low: 0.118, close: 0.125, vol: 200, label: 'Entry $0.125' },
        { open: 0.125, high: 0.126, low: 0.121, close: 0.122, vol: 180, label: 'SL Dự Tính (-3%)' },
        { open: 0.122, high: 0.123, low: 0.110, close: 0.114, vol: 950, label: 'TRƯỢT KHỚP (-8.5%) 🩸', labelColor: '#ff3b69' }
      ]
    },
    question: 'Lỗi sai chí mạng và công thức khắc phục chuẩn xác là gì?',
    options: [
      { id: 'A', text: 'Lỗi do sàn lừa đảo.', isCorrect: false },
      { id: 'B', text: 'Vi phạm quy tắc quản lý vốn 1-2% và dùng đòn bẩy quá cao (x15) trên coin thanh khoản mỏng ➔ Với coin rác: Giảm rủi ro tối đa xuống 0.5% vốn ($25); Đòn bẩy tối đa x2-x3 hoặc chỉ mua SPOT!', isCorrect: true },
      { id: 'C', text: 'Lần sau đánh x50 gỡ.', isCorrect: false },
      { id: 'D', text: 'Chỉ chơi theo admin VIP.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 10.1 & 10.3)</b><br>• Trượt giá (Slippage) có thể làm bạn mất gấp 2-3 lần số tiền dự tính nếu vào khối lượng quá lớn!'
  },
  {
    id: 10,
    chapterId: 10,
    level: 'basic',
    levelLabel: '🌱 Cơ Bản',
    category: 'risk_execution',
    categoryName: '🧮 Quản Trị Vị Thế & Tâm Lý (Chương 10.5)',
    title: 'Case Study 10: Xây Dựng Kế Hoạch Chốt Lời Từng Phần (DCA Out) & Trailing Stop',
    description: '<b>Bối cảnh:</b> Mua BTC tại $54,000, giá tăng lên $96,000 (lãi +77.7%). Fear & Greed đạt 92 (Cực kỳ tham lam). Mạng xã hội hô hào "$150k trong tuần, ai bán là mất hàng". Bạn phân vân không biết nên làm gì?',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 54000, high: 58000, low: 53500, close: 57000, vol: 240, label: 'Entry $54k' },
        { open: 57000, high: 82000, low: 56500, close: 81000, vol: 480 },
        { open: 81000, high: 96000, low: 80500, close: 95500, vol: 780, label: 'ĐỈNH $96K ⚠️', labelColor: '#f59e0b' }
      ]
    },
    question: 'Chiến lược quản trị vị thế và chốt lời thông minh nhất là gì?',
    options: [
      { id: 'A', text: 'Gồng 100% không chốt đồng nào, vay thêm mua tiếp ở $96k.', isCorrect: false },
      { id: 'B', text: 'Bán tháo sạch 100% tài sản ra tiền mặt ngay lập tức.', isCorrect: false },
      { id: 'C', text: 'Kế hoạch DCA Out 3 Bước: Chốt trước 40% ở $96k đút túi tiền thật; Dời SL bảo vệ cho 60% còn lại về mức $88,000 (đáy 4H gần nhất) để thả trôi lợi nhuận không rủi ro!', isCorrect: true },
      { id: 'D', text: 'Chuyển toàn bộ lãi sang chơi memecoin rác.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ C (Theo Chương 10.4 & 10.5 - Khóa Lợi Nhuận)</b><br>• Lãi trên màn hình chỉ là con số ảo cho đến khi bạn bấm nút chốt lời!'
  },
  {
    id: 28,
    chapterId: 10,
    level: 'intermediate',
    levelLabel: '⚡ Trung Bình',
    category: 'risk_execution',
    categoryName: '🧠 Kiểm Soát Tâm Lý Cay Cú (Chương 10.5)',
    title: 'Case Study 28: Ngăn Chặn Chuỗi Thua Lỗ Liên Tiếp Bằng Quy Tắc Cooldown 24H',
    description: '<b>Bối cảnh:</b> Một trader vừa dính 2 lệnh Stop Loss liên tiếp trong buổi sáng (mất -$200). Tâm lý bắt đầu ức chế, muốn mở ngay lệnh thứ 3 với khối lượng gấp đôi để "gỡ lại số tiền đã mất trước giờ ăn trưa".',
    chartConfig: null,
    question: 'Quy tắc kỷ luật chuẩn mực của Pro Trader trong tình huống này là gì?',
    options: [
      { id: 'A', text: 'Tiếp tục vào lệnh ngay lập tức vì cơ hội thị trường không chờ đợi.', isCorrect: false },
      { id: 'B', text: 'Áp dụng Quy tắc Cooldown 24H: Lập tức tắt máy tính, rời khỏi bàn làm việc ít nhất 24 giờ. Trạng thái "Revenge Trading" làm tê liệt tư duy logic và là nguyên nhân số 1 dẫn đến cháy tài khoản!', isCorrect: true },
      { id: 'C', text: 'Nâng đòn bẩy lên x100 để gỡ trong 1 cây nến.', isCorrect: false },
      { id: 'D', text: 'Hỏi ý kiến bạn bè trên mạng xã hội.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.3 & 10.5 - Tâm Lý Giao Dịch)</b><br>• Sau 2 lệnh thua liên tiếp, cảm xúc đã lấn át hoàn toàn lý trí. Tắt máy là hành động dũng cảm nhất của một Master Trader.'
  },

  // ==========================================
  // CHƯƠNG 11: SMART MONEY CONCEPTS (SMC) & FVG
  // ==========================================
  {
    id: 29,
    chapterId: 11,
    level: 'advanced',
    levelLabel: '🔥 Nâng Cao',
    category: 'market_structure_smc',
    categoryName: '🏛️ Khối Lệnh Order Block & FVG (Chương 11)',
    title: 'Case Study 29: Phục Kích Điểm Vào Lệnh Tại Vùng Imbalance FVG Khung 1H',
    description: '<b>Bối cảnh:</b> Giá ETH sau tin tức bùng nổ để lại một khoảng trống giá trị Fair Value Gap (FVG) giữa Râu Nến 1 ($2,420) và Râu Nến 3 ($2,480). Giá tăng lên $2,650 rồi bắt đầu có nhịp hồi kiểm tra lại.',
    chartConfig: {
      width: 620, height: 260,
      candles: [
        { open: 2380, high: 2420, low: 2370, close: 2410, vol: 180, label: 'Nến 1 (Đỉnh $2,420)' },
        { open: 2410, high: 2580, low: 2405, close: 2570, vol: 920, label: 'Nến 2 (Đột Biến)' },
        { open: 2570, high: 2650, low: 2480, close: 2640, vol: 450, label: 'Nến 3 (Đáy $2,480)' },
        { open: 2640, high: 2650, low: 2440, close: 2460, vol: 280, label: 'LẤP FVG RETEST 🎯', labelColor: '#00c076' }
      ],
      zones: [{ type: 'support', top: 2480, bottom: 2420, label: 'KHOẢNG TRỐNG GIÁ FVG ($2,420 - $2,480)' }],
      tradeSetup: { entry: 2450, sl: 2390, tp: 2750, startIndex: 3 }
    },
    question: 'Chiến lược giao dịch SMC chuẩn xác khi giá rơi về vùng FVG là gì?',
    options: [
      { id: 'A', text: 'Mở Short vì giá đang rơi mạnh từ $2,650.', isCorrect: false },
      { id: 'B', text: 'Vào lệnh Mua khi giá lấp đầy vùng FVG ($2,440 - $2,460) và xuất hiện nến rút chân xác nhận, SL dưới đáy Nến 1 ($2,390), TP đỉnh cũ $2,750 (R:R ≈ 1 : 5.0)!', isCorrect: true },
      { id: 'C', text: 'FVG là vùng không có ý nghĩa kỹ thuật.', isCorrect: false },
      { id: 'D', text: 'Đợi giá rơi về $1,000.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 11 - Smart Money Concepts)</b><br>• Vùng FVG đóng vai trò như một thỏi nam châm hút giá quay lại lấp thanh khoản trước khi tiếp tục sóng đẩy!'
  },

  // ==========================================
  // CHƯƠNG 12: LỘ TRÌNH 5 BƯỚC & NHẬT KÝ
  // ==========================================
  {
    id: 30,
    chapterId: 12,
    level: 'basic',
    levelLabel: '🌱 Cơ Bản',
    category: 'trading_roadmap',
    categoryName: '🗺️ Lộ Trình 5 Bước Trader (Chương 12)',
    title: 'Case Study 30: Tầm Quan Trọng Của Việc Ghi Nhật Ký Giao Dịch & Backtesting',
    description: '<b>Bối cảnh:</b> Hai trader mới bắt đầu: Trader A giao dịch theo cảm tính, thắng không biết tại sao thắng, thua không rõ nguyên nhân. Trader B ghi chép đầy đủ từng lệnh vào Trade Journal (kèm ảnh chụp chart trước/sau lệnh, lý do SL/TP, cảm xúc).',
    chartConfig: null,
    question: 'Sau 6 tháng, sự khác biệt lớn nhất giữa Trader A và Trader B là gì?',
    options: [
      { id: 'A', text: 'Cả hai đều có kết quả ngẫu nhiên như nhau.', isCorrect: false },
      { id: 'B', text: 'Trader B tích lũy được dữ liệu thống kê khách quan, nhận diện được điểm yếu (overtrading, dời SL) và từng bước trở thành Trader có lợi nhuận nhất quán (Consistent Profitable Trader); trong khi Trader A dễ dàng cháy tài khoản do lặp lại các sai lầm cũ.', isCorrect: true },
      { id: 'C', text: 'Viết nhật ký chỉ tốn thời gian không có ích lợi.', isCorrect: false },
      { id: 'D', text: 'Trader A sẽ giỏi hơn vì không bị gò bó kỷ luật.', isCorrect: false }
    ],
    explanation: '<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 12 - Lộ Trình 5 Bước Trở Thành Trader Độc Lập)</b><br>• "Cái gì đo lường được thì cái đó mới cải thiện được!" Nhật ký giao dịch là chiếc gương phản chiếu kỷ luật của chính bạn.'
  }
];

let currentScenarioIndex = 0;
let currentFilterCategory = 'all';
let currentFilterLevel = 'all';
let currentFilterChapter = 'all';

function initPracticeModule() {
  renderPracticeStats();
  renderPracticeCategoryFilters();
  loadCurrentScenario();
}

function renderPracticeStats() {
  const totalQuestions = practiceScenarios.length;
  const answeredCount = Object.keys(practiceStats.answered).length;
  const correctCount = practiceStats.correct;
  const acc = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const totalEl = document.getElementById('practice-stat-total');
  const correctEl = document.getElementById('practice-stat-correct');
  const accEl = document.getElementById('practice-stat-acc');
  const streakEl = document.getElementById('practice-stat-streak');

  if (totalEl) totalEl.innerText = `${answeredCount} / ${totalQuestions}`;
  if (correctEl) correctEl.innerText = correctCount;
  if (accEl) accEl.innerText = `${acc}%`;
  if (streakEl) streakEl.innerText = `🔥 ${practiceStats.streak}`;
}

function renderPracticeCategoryFilters() {
  const container = document.getElementById('practice-category-pills');
  if (!container) return;

  const categories = [
    { id: 'all', name: `🎯 Tất Cả (${practiceScenarios.length} Case)` },
    { id: 'whale_traps', name: '🐋 Bẫy Cá Mập & Quét Sàn' },
    { id: 'derivatives_data', name: '📊 Phái Sinh & Squeeze' },
    { id: 'macro_cycle', name: '🌊 Vĩ Mô & Chu Kỳ' },
    { id: 'market_structure_smc', name: '🏛️ SMC & Cấu Trúc' },
    { id: 'candlestick_patterns', name: '🕯️ Mô Hình Nến' },
    { id: 'risk_execution', name: '🛡️ Quản Trị Rủi Ro' },
    { id: 'wallet_security', name: '🔒 Bảo Mật Ví' }
  ];

  container.innerHTML = `
    <!-- Top Filter Bar: Category + Level + Chapter Dropdowns -->
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        ${categories.map(cat => `
          <button class="coin-pill-btn ${currentFilterCategory === cat.id ? 'active' : ''}" onclick="filterPracticeCategory('${cat.id}')">
            ${cat.name}
          </button>
        `).join('')}
      </div>

      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">Độ khó:</span>
          <select class="select-field" style="width: 140px; padding: 4px 8px; font-size: 12px;" onchange="filterPracticeLevel(this.value)">
            <option value="all" ${currentFilterLevel === 'all' ? 'selected' : ''}>Tất cả cấp độ</option>
            <option value="basic" ${currentFilterLevel === 'basic' ? 'selected' : ''}>🌱 Cơ Bản</option>
            <option value="intermediate" ${currentFilterLevel === 'intermediate' ? 'selected' : ''}>⚡ Trung Bình</option>
            <option value="advanced" ${currentFilterLevel === 'advanced' ? 'selected' : ''}>🔥 Nâng Cao</option>
          </select>
        </div>

        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">Ôn tập theo chương:</span>
          <select class="select-field" style="width: 220px; padding: 4px 8px; font-size: 12px;" onchange="filterPracticeChapter(this.value)">
            <option value="all" ${currentFilterChapter === 'all' ? 'selected' : ''}>Tất cả 12 Chương</option>
            <option value="1" ${currentFilterChapter === '1' ? 'selected' : ''}>Chương 1: Bản Chất Blockchain</option>
            <option value="2" ${currentFilterChapter === '2' ? 'selected' : ''}>Chương 2: Phân Loại Coin & Ví</option>
            <option value="3" ${currentFilterChapter === '3' ? 'selected' : ''}>Chương 3: Order Book & Cung Cầu</option>
            <option value="4" ${currentFilterChapter === '4' ? 'selected' : ''}>Chương 4: Các Mô Hình Nến</option>
            <option value="5" ${currentFilterChapter === '5' ? 'selected' : ''}>Chương 5: Hỗ Trợ & Kháng Cự</option>
            <option value="6" ${currentFilterChapter === '6' ? 'selected' : ''}>Chương 6: Cấu Trúc Thị Trường</option>
            <option value="7" ${currentFilterChapter === '7' ? 'selected' : ''}>Chương 7: Đa Khung 4H-1H-15m</option>
            <option value="8" ${currentFilterChapter === '8' ? 'selected' : ''}>Chương 8: Volume, RSI, Phái Sinh</option>
            <option value="9" ${currentFilterChapter === '9' ? 'selected' : ''}>Chương 9: Bẫy Cá Mập & Wyckoff</option>
            <option value="10" ${currentFilterChapter === '10' ? 'selected' : ''}>Chương 10: Quản Lý Vốn 1% & R:R</option>
            <option value="11" ${currentFilterChapter === '11' ? 'selected' : ''}>Chương 11: SMC & FVG</option>
            <option value="12" ${currentFilterChapter === '12' ? 'selected' : ''}>Chương 12: Lộ Trình & Nhật Ký</option>
          </select>
        </div>

        <span style="margin-left: auto; font-size: 11.5px; color: #38bdf8; font-weight: 700;">
          Khớp: ${getFilteredScenarios().length} Case Study
        </span>
      </div>
    </div>
  `;
}

function filterPracticeCategory(catId) {
  currentFilterCategory = catId;
  renderPracticeCategoryFilters();
  currentScenarioIndex = 0;
  loadCurrentScenario();
}

function filterPracticeLevel(lvl) {
  currentFilterLevel = lvl;
  renderPracticeCategoryFilters();
  currentScenarioIndex = 0;
  loadCurrentScenario();
}

function filterPracticeChapter(chap) {
  currentFilterChapter = chap;
  renderPracticeCategoryFilters();
  currentScenarioIndex = 0;
  loadCurrentScenario();
}

function getFilteredScenarios() {
  return practiceScenarios.filter(s => {
    const matchCat = currentFilterCategory === 'all' || s.category === currentFilterCategory;
    const matchLvl = currentFilterLevel === 'all' || s.level === currentFilterLevel;
    const matchChap = currentFilterChapter === 'all' || String(s.chapterId) === String(currentFilterChapter);
    return matchCat && matchLvl && matchChap;
  });
}

function loadCurrentScenario() {
  const filtered = getFilteredScenarios();
  const container = document.getElementById('practice-card-container');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = \`
      <div class="card" style="padding: 40px; text-align: center; color: var(--text-muted);">
        <div style="font-size: 32px; margin-bottom: 10px;">🔍</div>
        <div style="font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 6px;">Không tìm thấy bài tập phù hợp với bộ lọc</div>
        <div style="font-size: 12.5px; margin-bottom: 14px;">Hãy thử chọn lại danh mục hoặc độ khó khác.</div>
        <button class="btn btn-outline" onclick="filterPracticeCategory('all'); filterPracticeLevel('all'); filterPracticeChapter('all');">Đặt lại bộ lọc</button>
      </div>
    \`;
    return;
  }

  const scenario = filtered[currentScenarioIndex] || filtered[0];
  const userChoice = practiceStats.answered[scenario.id];

  let chartSvgHtml = '';
  if (window.ChartVisualizer && scenario.chartConfig) {
    chartSvgHtml = ChartVisualizer.renderChartSvg(scenario.chartConfig);
  }

  container.innerHTML = \`
    <div class="card" style="padding: 24px;">
      
      <!-- Scenario Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px; gap: 10px;">
        <div>
          <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 6px;">
            <span class="badge badge-purple" style="font-size: 10.5px;">\${scenario.categoryName}</span>
            <span class="badge \${scenario.level === 'basic' ? 'badge-green' : (scenario.level === 'intermediate' ? 'badge-blue' : 'badge-red')}" style="font-size: 10px;">\${scenario.levelLabel || 'Cơ Bản'}</span>
          </div>
          <h3 style="font-size: 17.5px; font-weight: 800; color: #fff; line-height: 1.4;">\${scenario.title}</h3>
        </div>
        <div style="font-size: 12.5px; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.3); flex-shrink: 0;">
          Case \${currentScenarioIndex + 1} / \${filtered.length}
        </div>
      </div>

      <!-- Description -->
      <div style="font-size: 13.5px; color: #cbd5e1; line-height: 1.7; margin-bottom: 18px; background: rgba(15, 23, 42, 0.6); padding: 14px; border-radius: 8px; border-left: 3px solid #38bdf8;">
        \${scenario.description}
      </div>

      <!-- Real Visual Chart Box (If configured) -->
      \${chartSvgHtml ? \`
        <div style="margin-bottom: 22px; border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">
          \${chartSvgHtml}
        </div>
      \` : ''}

      <!-- Question Prompt -->
      <div style="font-size: 15px; font-weight: 700; color: #60a5fa; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">❓</span> <span>\${scenario.question}</span>
      </div>

      <!-- Interactive Multiple Choice Options -->
      <div style="display: flex; flex-direction: column; gap: 11px; margin-bottom: 20px;">
        \${scenario.options.map(opt => {
          let btnClass = 'quiz-option-btn';
          let icon = opt.id;
          
          if (userChoice) {
            if (opt.isCorrect) {
              btnClass += ' option-correct';
              icon = '✅';
            } else if (userChoice === opt.id) {
              btnClass += ' option-wrong';
              icon = '❌';
            }
          }

          return \`
            <button class="\${btnClass}" onclick="submitPracticeAnswer(\${scenario.id}, '\${opt.id}')" \${userChoice ? 'disabled' : ''} style="text-align: left; line-height: 1.55; padding: 12px 14px;">
              <span class="opt-badge">\${icon}</span>
              <span class="opt-text" style="font-size: 13px;">\${opt.text}</span>
            </button>
          \`;
        }).join('')}
      </div>

      <!-- Explanation Box -->
      \${userChoice ? \`
        <div class="quiz-explanation-card animate-fadeIn" style="border-left: 4px solid #38bdf8; background: rgba(15, 23, 42, 0.95); padding: 16px; border-radius: 8px; margin-top: 14px;">
          <div style="font-size: 14.5px; font-weight: 800; margin-bottom: 10px; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
            <span>💡</span> Lời Giải Giải Phẫu Hành Vi & Kế Hoạch Thực Chiến
          </div>
          <div style="font-size: 13.5px; line-height: 1.7; color: #e2e8f0;">
            \${scenario.explanation}
          </div>
        </div>
      \` : ''}

      <!-- Next / Prev Controls -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 22px; border-top: 1px solid var(--border-color); padding-top: 16px;">
        <button class="btn btn-secondary" onclick="navigatePracticeScenario(-1)" \${currentScenarioIndex === 0 ? 'disabled' : ''}>
          ⬅️ Case Trước
        </button>
        <button class="btn btn-primary" onclick="navigatePracticeScenario(1)" \${currentScenarioIndex >= filtered.length - 1 ? 'disabled' : ''}>
          Case Tiếp Theo ➡️
        </button>
      </div>

    </div>
  \`;
}

function submitPracticeAnswer(scenarioId, chosenOptionId) {
  if (practiceStats.answered[scenarioId]) return;

  const scenario = practiceScenarios.find(s => s.id === scenarioId);
  if (!scenario) return;

  const chosen = scenario.options.find(o => o.id === chosenOptionId);
  const isCorrect = chosen && chosen.isCorrect;

  practiceStats.answered[scenarioId] = chosenOptionId;
  practiceStats.total++;

  // Track by chapter for weak topic diagnostics
  const chap = scenario.chapterId || 1;
  practiceStats.chapterStats[chap] = practiceStats.chapterStats[chap] || { attempted: 0, correct: 0, failed: 0 };
  practiceStats.chapterStats[chap].attempted++;

  if (isCorrect) {
    practiceStats.correct++;
    practiceStats.streak++;
    practiceStats.chapterStats[chap].correct++;
    showToast('🎉 Chính xác! Bạn đã nắm rất vững tư duy kỹ thuật & hành vi!', 'success');
  } else {
    practiceStats.streak = 0;
    practiceStats.chapterStats[chap].failed++;
    showToast('❌ Chưa chính xác! Hãy đọc kỹ phần giải phẫu hành vi bên dưới để rút kinh nghiệm.', 'warning');
  }

  renderPracticeStats();
  loadCurrentScenario();
}

function navigatePracticeScenario(dir) {
  const filtered = getFilteredScenarios();
  const nextIdx = currentScenarioIndex + dir;
  if (nextIdx >= 0 && nextIdx < filtered.length) {
    currentScenarioIndex = nextIdx;
    loadCurrentScenario();
  }
}

function resetPracticeQuiz() {
  if (!confirm('Bạn có muốn đặt lại toàn bộ tiến độ bài tập để thử thách lại từ đầu không?')) return;
  practiceStats = {
    total: 0,
    correct: 0,
    streak: 0,
    answered: {},
    chapterStats: {}
  };
  currentScenarioIndex = 0;
  renderPracticeStats();
  loadCurrentScenario();
  showToast('Đã đặt lại 30 Case Study thực hành.', 'info');
}

window.initPracticeModule = initPracticeModule;
window.submitPracticeAnswer = submitPracticeAnswer;
window.navigatePracticeScenario = navigatePracticeScenario;
window.filterPracticeCategory = filterPracticeCategory;
window.filterPracticeLevel = filterPracticeLevel;
window.filterPracticeChapter = filterPracticeChapter;
window.resetPracticeQuiz = resetPracticeQuiz;
`;

fs.writeFileSync('public/js/practice.js', practiceJsContent, 'utf8');
console.log('Successfully written expanded practice.js with 30 cases across 12 chapters!');
