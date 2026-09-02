import re

with open("Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md", "r", encoding="utf-8") as f:
    text = f.read()

# Additions for each chapter:
chapter_enrichments = {
    1: """
<div class="visual-mount-box" data-visual="blockchain-ledger"></div>

### 1.4 Sai Lầm Thường Gặp Của Người Mới (Common Mistakes)
- **Nhầm lẫn giữa Private Key và Public Key:** Chụp ảnh Private Key hoặc gửi 12 từ khóa cho người lạ trên Telegram/Discord.
- **Chuyển nhầm mạng lưới (Cross-chain mismatch):** Chuyển USDT mạng TRC-20 sang địa chỉ ví nhận mạng ERC-20 hoặc BEP-20 mà không qua cầu nối (Bridge), dẫn đến kẹt hoặc mất token vĩnh viễn.
- **Tưởng Blockchain có thể hoàn tiền:** Nghĩ rằng gọi điện lên tổng đài hoặc ngân hàng có thể "hủy lệnh chuyển nhầm" (Blockchain có tính bất biến 100%).

### 1.5 Case Thực Tế Lịch Sử: Vụ Tấn Công The DAO (2016) & Sự Ra Đời Của Ethereum Classic
- **Bối cảnh:** Tháng 6/2016, quỹ The DAO xây dựng trên Ethereum bị hacker khai thác lỗ hổng Reentrancy trong Smart Contract, rút mất 3.6 triệu ETH (chiếm 15% tổng cung ETH lúc bấy giờ).
- **Hành động & Bài học:** Để bảo vệ nhà đầu tư, cộng đồng Ethereum đã quyết định Hard Fork quay ngược sổ cái tại Block 1,920,000 để thu hồi tiền, tạo ra chuỗi **Ethereum (ETH)** mới; trong khi nhóm bảo thủ giữ nguyên tính bất biến tuyệt đối ở lại chuỗi cũ mang tên **Ethereum Classic (ETC)**. Sự kiện khẳng định Smart Contract một khi triển khai lên Mainnet có rủi ro cực lớn nếu không được kiểm toán (Audit) cẩn mật.

### 1.6 Câu Hỏi Tự Kiểm Tra Chương 1 (Self-Check Quiz)
1. **Tính chất nào sau đây KHÔNG PHẢI là đặc tính của công nghệ Blockchain?**
   - A. Sổ cái phân tán phi tập trung
   - B. Dữ liệu có thể tùy ý sửa đổi bởi Admin sáng lập *(Đáp án đúng)*
   - C. Minh bạch và kiểm chứng được bằng mã hóa
   - D. Cơ chế đồng thuẫn mạng lưới (PoW, PoS)
2. **Private Key (Khóa bí mật) dùng để làm gì?**
   - A. Dùng để gửi cho bạn bè chuyển tiền
   - B. Dùng để ký xác nhận và rút/chuyển tài sản từ ví *(Đáp án đúng)*
   - C. Dùng để xem lịch sử giao dịch công khai
   - D. Dùng để đăng ký tài khoản sàn CEX
""",

    2: """
<div class="visual-mount-box" data-visual="hot-cold-wallet"></div>

### 2.4 Sai Lầm Thường Gặp Của Người Mới (Common Mistakes)
- **Để 100% tài sản trên sàn CEX:** Tưởng sàn giao dịch là ngân hàng an toàn tuyệt đối ("Not your keys, not your coins").
- **Dùng đòn bẩy x50 - x100 khi mới tham gia:** Chỉ cần biến động 1% là cháy sạch toàn bộ tiền vốn.
- **Lưu 12 từ khóa Seed Phrase trên Google Drive / iCloud / Tin nhắn Zalo:** Bị hacker quét mã độc và rút sạch ví khi lộ mật khẩu đám mây.

### 2.5 Case Thực Tế Lịch Sử: Sự Sụp Đổ Của Đế Chế FTX & Bài Học "Not Your Keys, Not Your Coins"
- **Bối cảnh (Tháng 11/2022):** FTX - sàn giao dịch tiền điện tử lớn thứ 2 thế giới do Sam Bankman-Fried (SBF) sáng lập - bị lộ việc bí mật chuyển $10 tỷ USD tiền gửi của khách hàng sang quỹ đầu tư mạo hiểm Alameda Research để gồng lỗ.
- **Hậu quả:** Khi khách hàng ồ ạt rút $6 tỷ USD trong 72 giờ (Bank Run), FTX mất thanh khoản và đệ đơn phá sản. Hàng triệu người dùng trên toàn cầu mất trắng toàn bộ số coin gửi trên sàn.
- **Bài học xương máu:** Tiền gửi trên sàn CEX chỉ là "con số ghi nợ IOU". Số tiền dài hạn (Hold) bắt buộc phải rút về **Ví Lạnh (Ledger / Trezor)** hoặc ví cá nhân không lưu ký!

### 2.6 Câu Hỏi Tự Kiểm Tra Chương 2 (Self-Check Quiz)
1. **Đâu là ví lạnh (Cold Wallet) lưu trữ an toàn nhất?**
   - A. Sàn giao dịch Binance
   - B. Ví tiện ích MetaMask
   - C. Thiết bị phần cứng Ledger Nano X cách ly Internet *(Đáp án đúng)*
   - D. Ứng dụng Telegram Bot
2. **Sự khác biệt cốt lõi giữa Spot và Futures là gì?**
   - A. Spot sở hữu coin thực tế và không bị thanh lý; Futures giao dịch hợp đồng đòn bẩy và có rủi ro cháy tài khoản *(Đáp án đúng)*
   - B. Spot kiếm được nhiều tiền hơn Futures
   - C. Futures không bao giờ mất tiền
   - D. Spot chỉ dành cho chuyên gia
""",

    3: """
### 3.3 Sai Lầm Thường Gặp Của Người Mới (Common Mistakes)
- **Đặt lệnh Market khi thị trường giật mạnh:** Bị trượt giá (Slippage) hàng ngàn USD do sổ lệnh mỏng.
- **Tưởng tường Buy Limit lớn là cản cứng:** Bị dính bẫy Kê lệnh ảo (Spoofing) của Cá mập, tường bị hủy trong tích tắc khi giá chạm tới.
- **Đặt Stop Loss đúng ngay mốc số tròn:** Bị Market Maker quét râu ăn thanh khoản trước khi giá bật tăng.

### 3.4 Case Thực Tế Lịch Sử: Ngày Thứ Năm Đen Tối "Black Thursday" (12/03/2020)
- **Bối cảnh:** Đại dịch Covid-19 bùng nổ, thị trường tài chính toàn cầu sụp đổ. Giá Bitcoin rớt tự do từ $8,000 xuống mức thấp nhất $3,782 chỉ trong vòng 24 giờ (giảm hơn 50%).
- **Cơ chế Order Book sụp đổ:** Lệnh xả tháo của retail khiến các bot thanh lý trên sàn BitMEX và Binance đồng loạt đẩy lệnh Market Sell, xóa sạch toàn bộ sổ lệnh Bids bên mua. Phí gas Ethereum tăng vọt khiến hệ thống MakerDAO không kịp thanh lý tài sản thế chấp.
- **Bài học:** Trong cơn hoảng loạn tột độ, thanh khoản Order Book biến mất hoàn toàn. Trader thông minh không bao giờ dùng lệnh Market mà kiên nhẫn rải lệnh Limit mua đón ở các vùng chiết khấu sâu.

### 3.5 Câu Hỏi Tự Kiểm Tra Chương 3 (Self-Check Quiz)
1. **Bể thanh khoản Buy-Side Liquidity (BSL) thường tập trung nhiều nhất ở đâu?**
   - A. Ngay giữa thân nến Doji
   - B. Phía trên các đỉnh cũ và vùng kháng cự quan trọng *(Đáp án đúng)*
   - C. Ở các mức giá ngẫu nhiên
   - D. Dưới đáy sâu nhất của năm
2. **Hiện tượng trượt giá (Slippage) xảy ra khi nào?**
   - A. Khi dùng lệnh Limit chờ khớp
   - B. Khi dùng lệnh Market quét qua nhiều tầng giá trên Order Book mỏng *(Đáp án đúng)*
   - C. Khi mạng Internet bị chậm 1 giây
   - D. Khi sàn khóa nút nạp tiền
""",

    4: """
<div class="visual-mount-box" data-visual="candle-anatomy"></div>
<div class="visual-mount-box" data-visual="three-candle-cases"></div>
<div class="visual-mount-box" data-visual="doji-types"></div>
<div class="visual-mount-box" data-visual="engulfing-pair"></div>
<div class="visual-mount-box" data-visual="hammer-shooting-star"></div>
<div class="visual-mount-box" data-visual="morning-evening-star"></div>

### 4.3 Sai Lầm Thường Gặp Của Người Mới (Common Mistakes)
- **Đánh nến đơn lẻ không nhìn bối cảnh cản:** Thấy cây nến Hammer xuất hiện lơ lửng giữa trời (không có hỗ trợ) vội vàng nhảy vào Mua.
- **Không chờ nến đóng cửa (Close Time):** Vào lệnh khi nến 15m mới chạy được 3 phút, đến phút thứ 14 nến bất ngờ quay xe rút râu thành nến xả.
- **Xem thường Volume của nến:** Mô hình Engulfing có nến đảo chiều nhưng Volume lại thấp hơn trung bình ➔ Dễ là bẫy Fakeout lừa đảo.

### 4.4 Case Thực Tế Lịch Sử: Nến Pinbar Thần Thánh Của Bitcoin Ngày 19/05/2021
- **Bối cảnh:** Sau lệnh cấm đào coin của Trung Quốc, Bitcoin sập từ $43,000 về $30,000 trong phiên sáng.
- **Hành động giá:** Cây nến 4H để lại một râu nến dưới dài $12,000 USD (từ $30,000 rút ngược lên đóng nến tại $38,000) với khối lượng giao dịch kỷ lục trong lịch sử Binance.
- **Kết quả:** Nến Pinbar siêu búa khổng lồ này đã tạo nên mức đáy vững chắc nhất năm 2021, mở màn cho chu kỳ tăng phi mã lên đỉnh lịch sử $69,000 vào tháng 11/2021.

### 4.5 Câu Hỏi Tự Kiểm Tra Chương 4 (Self-Check Quiz)
1. **Đặc điểm nhận dạng của một cây nến Hammer (Búa) tăng giá chuẩn là gì?**
   - A. Thân nến rất dài và không có râu
   - B. Râu nến dưới dài ít nhất gấp 2-3 lần thân nến và xuất hiện tại vùng hỗ trợ *(Đáp án đúng)*
   - C. Râu nến trên rất dài xuất hiện ở đỉnh
   - D. Giá mở cửa bằng đúng giá đóng cửa
2. **Cụm mô hình nến Nhấn Chìm Tăng (Bullish Engulfing) có ý nghĩa gì?**
   - A. Báo hiệu phe Gấu đang áp đảo
   - B. Nến xanh sau thân lớn nuốt chửng hoàn toàn nến đỏ trước, báo hiệu phe Bò đã kiểm soát thị trường *(Đáp án đúng)*
   - C. Báo hiệu thị trường đi ngang
   - D. Báo hiệu sàn sắp bảo trì
""",

    5: """
<div class="visual-mount-box" data-visual="support-resistance-zone"></div>
<div class="visual-mount-box" data-visual="role-reversal-diagram"></div>

### 5.5 Sai Lầm Thường Gặp Của Người Mới (Common Mistakes)
- **Vẽ Hỗ trợ/Kháng cự bằng 1 đường kẻ duy nhất:** Giá thị trường có độ co giãn, cản phải là một **VÙNG GIÁ (Zone)** có biên độ trên/dưới.
- **Short ngay hỗ trợ / Long ngay kháng cự:** Sai lầm sơ đẳng do tâm lý sợ bỏ lỡ FOMO khi thấy giá chạy nhanh tới cản.
- **Không phân biệt được Breakout Thật vs Phá Vỡ Giả (Fakeout/SFP):** Breakout thật phải có nến đóng cửa dứt khoát bên ngoài cản kèm Volume tăng vọt.

### 5.6 Case Thực Tế Lịch Sử: Vùng Cản $20,000 Của Bitcoin Biến Thành Bệ Phóng Lịch Sử (2020)
- **Bối cảnh:** Mức $20,000 là đỉnh lịch sử của chu kỳ 2017 và là ngưỡng kháng cự tâm lý lớn nhất thế giới suốt 3 năm.
- **Chuyển đổi vai trò:** Tháng 12/2020, Bitcoin bứt phá vượt qua $20,000 với Volume khổng lồ. Giá quay lại Retest nhẹ nhàng mốc $20,000 - $20,800 biến kháng cự thành hỗ trợ thế kỷ, trước khi bay thẳng lên $64,000.
- **Bài học:** Kháng cự khung thời gian càng lớn khi bị phá vỡ sẽ trở thành Hỗ trợ có lực đẩy càng khủng khiếp!

### 5.7 Câu Hỏi Tự Kiểm Tra Chương 5 (Self-Check Quiz)
1. **Quy tắc chuyển đổi vai trò (Role Reversal) phát biểu điều gì?**
   - A. Hỗ trợ luôn luôn là hỗ trợ vĩnh viễn
   - B. Kháng cự khi bị phá vỡ dứt khoát sẽ biến thành Hỗ trợ mới trong nhịp Retest *(Đáp án đúng)*
   - C. Kháng cự bị thủng thì giá sẽ quay về 0
   - D. Kháng cự chỉ có tác dụng trong 1 giờ
2. **Mô hình Swing Failure Pattern (SFP) xảy ra khi nào?**
   - A. Giá chọc thủng đỉnh/đáy cũ nhưng rút râu đóng nến trở lại bên trong biên cản kèm Volume lớn *(Đáp án đúng)*
   - B. Giá đi ngang không biến động
   - C. Giá đóng nến 3 cây liên tiếp ngoài cản
   - D. Khi sàn giao dịch ngừng hiển thị giá
""",

    6: """
<div class="visual-mount-box" data-visual="market-structure"></div>
<div class="visual-mount-box" data-visual="bos-choch"></div>

### 6.4 Sai Lầm Thường Gặp Của Người Mới (Common Mistakes)
- **Đánh ngược cấu trúc thị trường (Counter-trend):** Xu hướng 4H đang giảm cắm đầu nhưng vẫn cố tìm điểm bắt đáy Long ngược sóng.
- **Nhầm lẫn giữa Sóng Hồi (Pullback) và Đảo Chiều (Reversal):** Giá hồi nhẹ trong khung 15m tưởng đã đổi cấu trúc, vội vàng vào lệnh lớn.
- **Xác định sai Đỉnh/Đáy có giá trị (Valid Swing High/Low):** Lấy các râu nến nhiễu khung 1m làm đỉnh đáy cấu trúc.

### 6.5 Case Thực Tế Lịch Sử: Cú Sập LUNA/UST & Vòng Xoáy Tử Thần (Tháng 05/2022)
- **Bối cảnh:** Thuật toán cân bằng giữa stablecoin UST và token LUNA bị mất peg $1.
- **Cấu trúc thị trường bẻ gãy:** LUNA liên tục phá vỡ các đáy Higher Low (HL) trên khung Daily và Weekly. Mặc dù hàng loạt trader bắt đáy ở $50, $20, $5 vì tưởng "quá rẻ", cấu trúc Downtrend tiếp tục tạo BOS phá đáy liên hồi in thêm hàng ngàn tỷ token cho đến khi giá về $0.00001.
- **Bài học:** Đừng bao giờ bắt dao rơi một tài sản đã gãy hoàn toàn cấu trúc thị trường dài hạn!

### 6.6 Câu Hỏi Tự Kiểm Tra Chương 6 (Self-Check Quiz)
1. **Cấu trúc Uptrend chuẩn mực được hình thành bởi yếu tố nào?**
   - A. Đỉnh sau thấp hơn (LH) và Đáy sau thấp hơn (LL)
   - B. Đỉnh sau cao hơn (Higher High - HH) và Đáy sau cao hơn (Higher Low - HL) *(Đáp án đúng)*
   - C. Giá nằm im trong một chiếc hộp
   - D. Giá biến động ngẫu nhiên không có quy luật
2. **Change of Character (CHoCH) là tín hiệu gì trong Smart Money Concepts?**
   - A. Tín hiệu tiếp diễn xu hướng cũ
   - B. Tín hiệu giá phá vỡ đỉnh/đáy chủ chốt đầu tiên báo hiệu khả năng ĐẢO CHIỀU CẤU TRÚC *(Đáp án đúng)*
   - C. Tín hiệu sàn sắp hủy niêm yết coin
   - D. Tín hiệu nạp thêm tiền
""",

    7: """
<div class="visual-mount-box" data-visual="fractal-swing"></div>

### 7.6 Sai Lầm Thường Gặp Của Người Mới (Common Mistakes)
- **Chỉ nhìn 1 khung thời gian duy nhất:** Bị "mù cấu trúc" dẫn đến việc mở Long ngay sát vùng Bearish Order Block của khung lớn 4H.
- **Giao dịch vào giờ chết (Dead Zones):** Ngồi trade liên tục vào buổi sáng phiên Á (07:00 - 11:00 VN) khi thị trường không có thanh khoản, dễ bị dính bẫy cưa chân bàn.
- **Rối loạn đa khung (Analysis Paralysis):** Bật cùng lúc 10 khung giờ từ 1m đến Weekly khiến thông tin xung đột và không dám bóp cò.

### 7.7 Case Thực Tế Lịch Sử: Cú Bùng Nổ Phê Duyệt Bitcoin ETF Giao Ngay (10/01/2024)
- **Bối cảnh:** SEC chính thức phê duyệt 11 quỹ Bitcoin Spot ETF của BlackRock, Fidelity.
- **Phân tích đa khung thời gian:** Khung 1D và 4H duy trì cấu trúc tăng vững chắc; trước giờ tin ra, khung 15m có cú giật rũ bỏ bẫy Judas về $45,000 (chạm vùng Hỗ trợ 1H) trước khi phóng thẳng lên $49,000 trong phiên New York Killzone.
- **Bài học:** Sự đồng thuận giữa Xu hướng 4H + Vùng cản 1H + Tín hiệu kích hoạt nến 15m trong phiên Mỹ là công thức chiến thắng với xác suất cao nhất.

### 7.8 Câu Hỏi Tự Kiểm Tra Chương 7 (Self-Check Quiz)
1. **Theo quy tắc Top-Down, khung 4H và khung 15m có vai trò gì?**
   - A. Khung 4H để vào lệnh, khung 15m để nhìn xu hướng
   - B. Khung 4H để xác định Xu Hướng & Biên Cản Lớn; Khung 15m để tìm Tín Hiệu Kích Hoạt & Tối Ưu SL *(Đáp án đúng)*
   - C. Cả hai khung đều dùng chung mục đích
   - D. Chỉ nên dùng khung 1 phút
2. **Khung giờ vàng London Killzone theo giờ Việt Nam diễn ra vào khoảng thời gian nào?**
   - A. 06:00 - 09:00 sáng
   - B. 14:30 - 17:30 chiều *(Đáp án đúng)*
   - C. 02:00 - 04:00 đêm
   - D. 11:00 - 13:00 trưa
""",

    8: """
<div class="visual-mount-box" data-visual="rsi-oscillator"></div>

### 8.4 Sai Lầm Thường Gặp Của Người Mới (Common Mistakes)
- **Short ngay khi RSI > 70 trong Uptrend mạnh:** Trong một con sóng tăng parabol, RSI có thể duy trì ở vùng quá mua (80 - 90) suốt nhiều tuần lễ.
- **Bỏ qua khối lượng Volume:** Thấy nến tăng mạnh nhưng Volume lại sụt giảm (Dấu hiệu No Demand của VSA) mà vẫn nhảy vào mua đuổi.
- **Đánh cược ngược Funding Rate mà không có xác nhận nến:** Thấy Funding âm vội Long ngay khi giá vẫn đang trong đà rơi tự do.

### 8.5 Case Thực Tế Lịch Sử: Cú Short Squeeze Lịch Sử Của Bitcoin Lên $40,000 (Tháng 07/2021)
- **Bối cảnh:** Sau 2 tháng tích lũy đi ngang ở $30,000, Funding Rate trên toàn bộ các sàn phái sinh âm sâu liên tục trong 10 ngày khi đám đông thi nhau mở Short đón tin sập về $20,000.
- **Sự kiện Short Squeeze:** Đúng 07:00 sáng, chỉ một lệnh mua đẩy giá vượt $34,000 đã kích hoạt chuỗi thanh lý hơn $1 Tỷ USD vị thế Short trong 30 phút, đẩy giá bay thẳng một mạch lên $40,000.
- **Bài học:** Funding Rate âm cực đoan kết hợp với việc giá không thể tạo đáy mới là chiếc lò xo nén chuẩn bị cho đợt bùng nổ Short Squeeze kinh hoàng nhất.

### 8.6 Câu Hỏi Tự Kiểm Tra Chương 8 (Self-Check Quiz)
1. **Hiện tượng Phân kỳ tăng giá (Bullish Divergence) của RSI được xác định khi nào?**
   - A. Giá tạo Đỉnh cao hơn, RSI tạo Đỉnh cao hơn
   - B. Giá tạo Đáy thấp hơn (LL), nhưng RSI tạo Đáy cao hơn (HL) *(Đáp án đúng)*
   - C. RSI vượt qua mốc 80
   - D. RSI rơi về 0
2. **Open Interest (OI) tăng mạnh kết hợp Giá tăng mạnh thể hiện điều gì?**
   - A. Dòng tiền mới và các vị thế mua mới đang đổ mạnh vào thị trường củng cố xu hướng tăng *(Đáp án đúng)*
   - B. Thị trường chuẩn bị sập về 0
   - C. Phe bán đang chiếm ưu thế
   - D. Sàn giao dịch sắp đóng cửa
""",

    9: """
<div class="visual-mount-box" data-visual="capital-flow-cycle"></div>
<div class="visual-mount-box" data-visual="whale-manipulation-overview"></div>

### 9.5 Sai Lầm Thường Gặp Của Người Mới (Common Mistakes)
- **Cầm toàn bộ Altcoin trong Pha 1:** Khi Bitcoin Dominance tăng sốc, Altcoin bị hút máu giảm 20-30% dù Bitcoin bay vút đỉnh.
- **Bắt đáy Memecoin ở Pha 5:** Mua các đồng coin chó mèo khi dòng tiền thông minh đã rút về USDT, dẫn đến việc đu đỉnh chia 10 - chia 50 tài khoản.
- **Tin vào các hội nhóm VIP "Kèo nội bộ x100":** Thực chất là bẫy thanh khoản để nhóm sáng lập xả hàng lên đầu thành viên.

### 9.6 Case Thực Tế Lịch Sử: Cú Sập Lịch Sử Của Sàn Giao Dịch Mt. Gox (2014)
- **Bối cảnh:** Sàn Mt. Gox tại Nhật Bản xử lý hơn 70% tổng khối lượng giao dịch Bitcoin toàn cầu bị hack mất 850,000 BTC.
- **Tác động chu kỳ:** Sự sụp đổ của Mt. Gox đã đẩy thị trường vào mùa đông Downtrend kéo dài suốt 2 năm từ $1,150 rơi về $200 trước khi dòng tiền tích lũy trở lại cho chu kỳ mới.
- **Bài học:** Chu kỳ thị trường luôn lặp lại qua các giai đoạn: Tích lũy ➔ Bùng nổ ➔ Hưng phấn cực độ ➔ Khủng hoảng sụp đổ ➔ Tái tích lũy.

### 9.7 Câu Hỏi Tự Kiểm Tra Chương 9 (Self-Check Quiz)
1. **Trong chu kỳ 5 pha luân chuyển dòng tiền, Altseason thực sự bùng nổ ở pha nào?**
   - A. Pha 1 (Dòng tiền đổ vào Bitcoin)
   - B. Pha 3 (Dòng tiền từ Top Coin tràn sang Mid/Low Cap, DeFi, AI) *(Đáp án đúng)*
   - C. Pha 5 (Xả về USDT)
   - D. Không bao giờ có Altseason
2. **Pha Spring trong phương pháp Wyckoff có mục đích cốt lõi là gì?**
   - A. Đẩy giá sập về 0
   - B. Cú rũ bỏ cuối cùng kiểm tra lượng cung dưới đáy trước khi vào sóng Đẩy Giá (Markup) *(Đáp án đúng)*
   - C. Dụ người mua ở đỉnh
   - D. Tăng đòn bẩy cho sàn
""",

    10: """
<div class="visual-mount-box" data-visual="success-triangle"></div>
<div class="visual-mount-box" data-visual="risk-reward-diagram"></div>

### 10.6 Sai Lầm Thường Gặp Của Người Mới (Common Mistakes)
- **Giao dịch không có Stop Loss (No SL):** Gồng lỗ từ -$50 thành cháy sạch toàn bộ tài khoản $10,000.
- **Cay cú gỡ lệnh (Revenge Trading):** Vừa dính 1 lệnh thua liền mở ngay lệnh mới gấp đôi khối lượng để gỡ gạc, dẫn đến chuỗi thua lỗ liên hoàn.
- **Tỷ lệ R:R < 1:1:** Thắng thì ăn $10 nhưng thua thì mất $50, khiến tài khoản luôn bào mòn dù tỷ lệ đoán đúng cao.

### 10.7 Case Thực Tế Lịch Sử: Sự Sụp Đổ Của Quỹ Three Arrows Capital (3AC) Do Không Quản Trị Rủi Ro
- **Bối cảnh (Tháng 06/2022):** Quỹ phòng hộ crypto hàng đầu Three Arrows Capital (quản lý hơn $10 tỷ USD) dùng đòn bẩy khổng lồ vay mượn từ Celsius, Voyager, Genesis để tất tay vào LUNA và GBTC mà không có biện pháp phòng hộ (Hedging/Stop Loss).
- **Hậu quả:** Khi LUNA về 0 và BTC gãy mốc $30,000, 3AC bị thanh lý hàng loạt và vỡ nợ, kéo theo sự sụp đổ dây chuyền của toàn bộ ngành cho vay crypto năm 2022.
- **Bài học đắt giá:** Dù bạn có là quỹ $10 Tỷ USD hay trader nhỏ lẻ $100 USD, nếu không có Stop Loss và quản trị rủi ro 1-2%, thị trường sẽ đào thải bạn không thương tiếc!

### 10.8 Câu Hỏi Tự Kiểm Tra Chương 10 (Self-Check Quiz)
1. **Theo quy tắc quản trị rủi ro chuyên nghiệp, mức thua lỗ tối đa cho MỘT LỆNH nên là bao nhiêu?**
   - A. 10% - 20% tổng vốn
   - B. 1% - 2% tổng vốn tài khoản *(Đáp án đúng)*
   - C. 50% tổng vốn
   - D. Toàn bộ tài khoản
2. **Nếu tỷ lệ Risk/Reward của bạn luôn đạt tối thiểu 1:2, bạn chỉ cần Winrate bao nhiêu để có lãi dương?**
   - A. Trên 90%
   - B. Chỉ cần đạt từ 35% - 40% winrate *(Đáp án đúng)*
   - C. Phải đạt đúng 100%
   - D. 0%
""",

    11: """
<div class="visual-mount-box" data-visual="order-block"></div>
<div class="visual-mount-box" data-visual="fvg-diagram"></div>

### 11.4 Sai Lầm Thường Gặp Của Người Mới (Common Mistakes)
- **Coi mọi cây nến ngược màu là Order Block:** Một Order Block hợp lệ bắt buộc phải dẫn đến cú Phá Vỡ Cấu Trúc (BOS) hoặc để lại khoảng trống Imbalance (FVG).
- **Vào lệnh ngay khi giá vừa chạm mép ngoài FVG:** Không chờ phản ứng rút râu xác nhận trên khung nhỏ.
- **Bỏ quên vùng Discount / Premium:** Mở lệnh Long ở vùng giá đắt đỏ Premium (>50% Fibonacci) hoặc mở Short ở vùng giá rẻ Discount (<50% Fibonacci).

### 11.5 Case Thực Tế Lịch Sử: Vùng Order Block $16,000 Của Bitcoin Đầu Năm 2023
- **Bối cảnh:** Sau vụ phá sản FTX, Bitcoin tích lũy đáy quanh $16,000 - $17,000 tạo nên một khối Bullish Order Block khổng lồ trên khung Weekly.
- **Diễn biến:** Tháng 01/2023, Bitcoin bùng nổ phá vỡ cấu trúc giảm khung Daily (BOS) với các cây nến để lại khoảng trống FVG lớn. Giá retest nhẹ nhàng mép Order Block tại $16,800 rồi mở màn cho siêu chu kỳ tăng từ $16,000 lên đỉnh lịch sử $73,700!
- **Bài học:** Các khối Order Block khung lớn (Daily/Weekly) là dấu chân của các tổ chức tài chính hàng đầu thế giới mà retail traders cần học cách đồng hành.

### 11.6 Câu Hỏi Tự Kiểm Tra Chương 11 (Self-Check Quiz)
1. **Khoảng trống giá trị công bằng (Fair Value Gap - FVG) được xác định bởi mô hình mấy cây nến?**
   - A. Mô hình 1 nến Doji
   - B. Mô hình 3 nến liên tiếp tạo khoảng trống giữa râu Nến 1 và râu Nến 3 *(Đáp án đúng)*
   - C. Mô hình 10 nến bằng nhau
   - D. Không cần nến nào
2. **Khối Lệnh Mua Bullish Order Block (+OB) là gì?**
   - A. Cây nến xanh lớn nhất trên đỉnh
   - B. Cây nến GIẢM (Đỏ) cuối cùng trước khi xuất hiện chuỗi nến tăng mạnh phá vỡ cấu trúc (BOS) *(Đáp án đúng)*
   - C. Nến Doji ở giữa phiên
   - D. Lệnh Market của retail
""",

    12: """
### 12.3 Sai Lầm Thường Gặp Của Người Mới (Common Mistakes)
- **Giao dịch theo cảm tính không có Trade Journal:** Thắng không biết vì sao thắng, thua không biết lỗi do đâu để sửa.
- **Nhảy từ phương pháp này sang phương pháp khác (System Hopping):** Thua 2 lệnh theo SMC vội chuyển sang Indicator, thua tiếp lại đổi sang Gann/Elliott.
- **Nạp số tiền lớn ngay tuần đầu tiên:** Thay vì luyện tập với số vốn nhỏ $50 - $100 hoặc Paper Trade để rèn luyện tâm lý và kỷ luật.

### 12.4 Case Thực Tế Lịch Sử: Hành Trình Của Huyền Thoại Jesse Livermore & Tầm Quan Trọng Của Kỷ Luật
- **Bối cảnh:** Jesse Livermore - một trong những nhà giao dịch vĩ đại nhất lịch sử Phố Wall - từng kiếm được hơn 100 triệu USD trong cuộc khủng hoảng 1929 nhờ bán khống và tuân thủ các mốc then chốt (Pivotal Points).
- **Bài học suy ngẫm:** Tuy nhiên, mỗi lần ông vi phạm các nguyên tắc ghi chép nhật ký và kỷ luật quản lý rủi ro của chính mình, ông đều rơi vào cảnh phá sản. Câu chuyện là minh chứng vĩnh cửu: Kỷ luật và sự nhất quán là chiếc phao cứu sinh duy nhất giúp trader tồn tại trên thị trường tài chính!

### 12.5 Câu Hỏi Tự Kiểm Tra Chương 12 (Self-Check Quiz)
1. **Lợi ích quan trọng nhất của việc ghi chép Nhật Ký Giao Dịch (Trade Journal) là gì?**
   - A. Khoe ảnh với bạn bè trên mạng xã hội
   - B. Tích lũy dữ liệu thống kê khách quan để phát hiện điểm yếu tâm lý, đo lường tỷ lệ thắng và cải thiện kỷ luật theo thời gian *(Đáp án đúng)*
   - C. Tăng đòn bẩy lên gấp 10 lần
   - D. Sàn giao dịch sẽ tặng tiền thưởng
2. **Lộ trình thực hành đúng đắn cho một người mới bắt đầu tham gia Crypto là gì?**
   - A. Nạp toàn bộ tiền tiết kiệm đánh Futures x100 ngay ngày đầu
   - B. Học vững lý thuyết ➔ Luyện tập Case Study / Paper Trade ➔ Giao dịch tài khoản nhỏ với rủi ro 1% ➔ Ghi nhật ký nghiêm ngặt ➔ Tối ưu hóa hệ thống *(Đáp án đúng)*
   - C. Mua theo tín hiệu của các hội nhóm ẩn danh
   - D. Không cần học lý thuyết
"""
}

# Split text by chapters and enrich
parts = text.split("# CHƯƠNG ")
header = parts[0]
new_chapters = []

for i, p in enumerate(parts[1:], 1):
    # check if chapter index exists in enrichments
    chap_text = "# CHƯƠNG " + p.strip()
    if i in chapter_enrichments:
        chap_text += "\n\n" + chapter_enrichments[i].strip() + "\n"
    new_chapters.append(chap_text)

full_enhanced_md = header + "\n\n".join(new_chapters)

with open("Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md", "w", encoding="utf-8") as f:
    f.write(full_enhanced_md)

print("Successfully enriched all 12 chapters in Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md!")
