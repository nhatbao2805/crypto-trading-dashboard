# 🪙 Sổ Tay & Ứng Dụng Hỗ Trợ Giao Dịch Tiền Điện Tử (Crypto Trading Dashboard)

> **Công cụ hỗ trợ học tập, rèn luyện kỷ luật và đồng hành cùng Trader trong từng quyết định đầu tư.**  
> Tích hợp: 📘 Giáo trình thực chiến A-Z • 📝 Luyện tập nhận định biểu đồ • 📓 Nhật ký giao dịch kèm ảnh chart • 📰 Bộ lọc tin tức tác động thị trường • 🤖 Hội đồng cố vấn AI đa góc nhìn • 💼 Giao dịch mô phỏng (Paper Trading) không rủi ro.

---

## 🎯 Ứng Dụng Này Dành Cho Ai?

- **Người mới bắt đầu (Beginner)**: Cần một lộ trình bài bản từ con số 0, nắm rõ bản chất thị trường, biểu đồ nến, các bẫy giá của Cá mập và tránh mất tiền vì thiếu kiến thức.
- **Trader muốn rèn luyện tính kỷ luật**: Đã biết giao dịch nhưng thường xuyên thua lỗ do FOMO, vào lệnh theo cảm xúc, không cài Stop Loss hoặc không có nơi ghi chép, rút kinh nghiệm.
- **Nhà đầu tư cần trợ lý phân tích**: Muốn có một góc nhìn phản biện khách quan (kỹ thuật, vĩ mô, rủi ro) trước khi đưa ra quyết định vào lệnh.

---

## ⚡ Hướng Dẫn Cài Đặt & Mở Ứng Dụng Nhanh (3 Bước Đơn Giản)

Bạn không cần phải có kiến thức lập trình phức tạp, chỉ cần làm theo 3 bước sau để mở và sử dụng ứng dụng ngay trên máy tính của mình:

### Bước 1: Cài đặt Node.js
Đảm bảo máy tính của bạn đã có **Node.js** (phiên bản 18 trở lên).  
👉 Nếu chưa có, bạn chỉ cần tải bản LTS tại trang chủ [nodejs.org](https://nodejs.org/) và cài đặt như phần mềm thông thường.

### Bước 2: Tải dự án về máy
Mở cửa sổ dòng lệnh (**Terminal** trên macOS hoặc **Command Prompt / PowerShell** trên Windows), dán các lệnh sau:

```bash
# 1. Tải ứng dụng về máy
git clone https://github.com/nhatbao2805/crypto-trading-dashboard.git

# 2. Đi vào thư mục ứng dụng
cd crypto-trading-dashboard

# 3. Cài đặt các thành phần cần thiết (chỉ chạy 1 lần đầu)
npm install
```

### Bước 3: Mở ứng dụng để sử dụng
```bash
# Biên dịch và khởi động ứng dụng
npm run build
npm start
```

Mở trình duyệt web bất kỳ (Google Chrome, Safari, Microsoft Edge, Brave...) và truy cập vào địa chỉ:
👉 **`http://localhost:3000`**

*(Khi không sử dụng nữa, bạn chỉ cần quay lại cửa sổ dòng lệnh và nhấn tổ hợp phím `Ctrl + C` để đóng ứng dụng).*

---

## 🧭 Cẩm Nang Sử Dụng Chi Tiết Từng Tính Năng

Giao diện ứng dụng được chia thành các khu vực chức năng rõ ràng ở thanh điều hướng bên trái:

```text
┌─────────────────────────────────────────────────────────────┐
│ 🪙 CRYPTO TRADING DASHBOARD                                 │
├──────────────┬──────────────────────────────────────────────┤
│ 📘 Lý Thuyết │  Nội dung chi tiết từng tính năng hiển thị   │
│ 📝 Luyện Tập │  tại khu vực chính màn hình ở đây...         │
│ 📓 Nhật Ký   │                                              │
│ 📰 Tin Tức   │                                              │
│ 🤖 AI Trader │                                              │
│ 💼 Demo/Sim  │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

---

### 1. 📘 Tab "Lý Thuyết" — Tự Học Crypto Từ Cơ Bản Đến Nâng Cao

Đây là cuốn giáo trình toàn diện gồm 12 chương được biên soạn thực tế, dễ hiểu:

- **Các nội dung nổi bật**:
  - **Chương 1 - 3**: Bản chất công nghệ Blockchain, tiền điện tử, ví lạnh/ví nóng, sàn Spot & Futures, sổ lệnh (Order Book) và bể thanh khoản.
  - **Chương 4 - 6**: Nhận diện các mẫu hình nến đảo chiều quan trọng, xác định chuẩn xác vùng Hỗ trợ/Kháng cự, cấu trúc thị trường (đỉnh/đáy) và các bẫy phá vỡ giả (Fakeout).
  - **Chương 7**: **Chuyên đề Đa khung thời gian (4H - 1H - 15m)** và khung giờ vàng giao dịch (Killzones).
  - **Chương 9**: **7 dấu hiệu nhận biết Cá mập (Market Maker) thao túng & quét sàn**.
  - **Chương 10 - 11**: Quản lý vốn sống còn (quy tắc 1-2%), tâm lý giao dịch và Từ điển thuật ngữ Smart Money Concepts (SMC, Order Block, Liquidity Pool...).
- **Cách sử dụng**:
  - Nhấp chuột vào từng chương ở menu bên trái để đọc nội dung.
  - Bấm nút **"Từ Điển Thuật Ngữ"** trên thanh tiêu đề để mở nhanh bảng tra cứu giải nghĩa các từ viết tắt chuyên ngành.

---

### 2. 📝 Tab "Luyện Tập" — Thử Tài Nhận Định Tình Huống Thị Trường

Giúp bạn rèn luyện phản xạ đọc biểu đồ mà không phải trả giá bằng tiền thật:

- **Bộ câu hỏi tình huống thực tế**: Hệ thống đưa ra các tình huống nến, xu hướng, đa khung thời gian cụ thể.
- **Kiểm tra kết quả ngay lập tức**: Khi bạn chọn phương án (Mua / Bán / Đứng ngoài), hệ thống sẽ báo ngay kết quả Đúng/Sai và giải thích cặn kẽ logic kỹ thuật tại sao nên hành động như vậy.
- **Theo dõi tiến độ**: Xem số câu trả lời đúng, tỷ lệ chính xác và chuỗi đúng liên tiếp (Streak) để tự tin hơn trước khi giao dịch thực tế.

---

### 3. 📓 Tab "Nhật Ký Giao Dịch" (Trading Journal) — Trái Tim Của Kỷ Luật

> *"Nếu bạn không thể đo lường và ghi lại những gì mình làm, bạn sẽ không bao giờ cải thiện được kết quả giao dịch."*

Đây là công cụ quan trọng nhất giúp bạn loại bỏ cảm xúc và nâng cao tỷ lệ thắng:

#### ✍️ Cách ghi chép một lệnh giao dịch mới:
1. Nhấn nút **"+ Thêm Lệnh Mới"**.
2. Điền thông tin lệnh:
   - Đồng coin giao dịch (BTC, ETH, SOL...).
   - Vị thế: **LONG** (Kỳ vọng giá tăng) hoặc **SHORT** (Kỳ vọng giá giảm).
   - Mức giá vào lệnh (**Entry**), mức giá cắt lỗ (**Stop Loss**), mức giá chốt lời (**Take Profit**).
   - Đòn bẩy sử dụng và số tiền đầu tư.
3. **Đính kèm ảnh chụp màn hình biểu đồ**:
   - Bạn có thể chụp ảnh biểu đồ phân tích trên TradingView, sau đó bấm tải ảnh hoặc dán ảnh trực tiếp vào nhật ký. Sau này khi xem lại, bạn sẽ thấy rõ lúc đó mình vào lệnh vì lý do gì.
4. Chọn cảm xúc lúc vào lệnh (Tự tin, Lo lắng, FOMO, Trả thù sàn...) và đánh dấu các quy tắc kỹ thuật bạn đã tuân thủ.
5. Bấm **Lưu lệnh**. Hệ thống sẽ tự động tính toán tỷ lệ Lời:Lỗ (Risk:Reward - R:R) và lãi/lỗ (PnL) cho bạn.

#### 🛡️ Discipline Auditor — Vị Giám Khảo Kỷ Luật Tự Động:
- Tab **"Kiểm Toán Kỷ Luật"** sẽ phân tích lịch sử lệnh của bạn và chấm điểm kỷ luật trên thang điểm 100.
- Ứng dụng sẽ thẳng thắn chỉ ra các sai lầm nguy hiểm:
  - Bạn có hay quên đặt Stop Loss không?
  - Bạn có rủi ro quá 2% tài khoản cho một lệnh không?
  - Bạn có bị cuốn vào "giao dịch trả thù" (Revenge Trading) sau các lệnh thua không?

#### 📝 Sổ tay ghi chú cá nhân (Notes):
- Ghi lại các kinh nghiệm rút ra hàng tuần, chiến lược mới muốn thử nghiệm hoặc checklist cá nhân trước khi mở máy tính.

---

### 4. 📰 Tab "Tin Tức" (AGY News Terminal) — Phân Tích & Lọc Nhiễu Thị Trường

Thị trường crypto tràn ngập tin đồn thất thiệt. Bộ lọc tin tức AGY Terminal giúp bạn:

- **Lọc tin tức theo đồng coin**: Chọn coin bạn quan tâm để xem các sự kiện nóng liên quan.
- **Thang đo mức độ tác động (Impact Score)**:
  - 🔴 **Tác động MẠNH (High Impact)**: Các tin tức có thể gây bão giá (họp lãi suất Fed, quỹ lớn mua/bán, hack sàn...). Cảnh báo bạn cân nhắc đứng ngoài hoặc siết chặt dừng lỗ.
  - 🟡 **Tác động VỪA (Medium Impact)**: Biến động trong biên độ vừa phải.
  - 🟢 **Tác động NHẸ (Low Impact)**: Tin tức định kỳ, ít rủi ro biến động giật giá.
- **Tóm tắt & Khuyến nghị hành động**: Nắm bắt nhanh nguyên nhân và dự phóng xu hướng chỉ trong 30 giây đọc lướt.

---

### 5. 🤖 Tab "AI Trader" — Hội Đồng Trợ Lý Phản Biện Đa Tác Nhân

Trước khi bấm nút vào lệnh, bạn có thể tham khảo ý kiến từ Hội đồng AI gồm 4 góc nhìn chuyên gia độc lập:

1. **Chuyên gia Phân Tích Kỹ Thuật (Technical Agent)**: Soi các chỉ báo RSI, MACD, cấu trúc nến, mức cản đa khung thời gian.
2. **Chuyên gia Vĩ Mô (Macro Agent)**: Đánh giá xu hướng chu kỳ dòng tiền và sức mạnh của Bitcoin Dominance.
3. **Chuyên gia Quản Trị Rủi Ro (Risk Agent)**: Đánh giá xem mức Stop Loss có quá xa không, tỷ lệ R:R có xứng đáng để mạo hiểm vốn không.
4. **Chuyên gia Thẩm Định Độc Lập (Validator Agent)**: Tìm kiếm các điểm mù và giả định chủ quan mà bạn có thể đang ngộ nhận.
5. **Phán Quyết Chung (Master Council Verdict)**: Đưa ra nhận định tổng thể, xác suất thành công (%) và lời khuyên có nên vào lệnh hay nên kiên nhẫn đứng ngoài.

---

### 6. 💼 Tab "Giao Dịch Mô Phỏng" (Paper Trading) — Tập Luyện Không Sợ Cháy Túi

Dành cho bạn muốn thử nghiệm chiến lược giao dịch thực tế mà không cần nạp tiền thật:
- Bạn được cấp sẵn tài khoản ảo **10,000 USDT**.
- Mở/đóng các vị thế Long, Short theo giá thị trường.
- Tự do thử nghiệm quản lý vốn, đòn bẩy và chiến lược cho đến khi tỷ lệ thắng ổn định rồi mới bước ra thị trường thật.

---

## 🔒 Tính Riêng Tư & An Toàn Dữ Liệu

- **100% Lưu Trữ Cục Bộ (Local & Private)**: Toàn bộ nhật ký lệnh, các ghi chú cá nhân và hình ảnh biểu đồ của bạn đều được lưu trữ trực tiếp trên chính chiếc máy tính của bạn (tại thư mục `data/` và `uploads/`).
- **Không gửi dữ liệu cá nhân lên mây**: Bạn hoàn toàn làm chủ tài sản thông tin của mình, không lo bị lộ danh mục đầu tư hay lịch sử lệnh ra bên ngoài.

---

## ❓ Câu Hỏi Thường Gặp (FAQ)

<details>
<summary><b>1. Tôi muốn đổi cổng chạy khác nếu cổng 3000 đang bận?</b></summary>

Rất đơn giản, tại cửa sổ dòng lệnh bạn chỉ cần gõ:
```bash
PORT=3001 npm start
```
Sau đó mở trình duyệt tại: `http://localhost:3001`.
</details>

<details>
<summary><b>2. Dữ liệu lệnh và ảnh chụp có bị mất khi tôi tắt máy tính không?</b></summary>

Hoàn toàn không. Dữ liệu được lưu vĩnh viễn vào tệp cơ sở dữ liệu `data/dashboard.sqlite` trên máy tính của bạn. Lần sau khi bạn mở ứng dụng, toàn bộ dữ liệu sẽ hiển thị nguyên vẹn.
</details>

<details>
<summary><b>3. Tôi có thể sao lưu (backup) nhật ký giao dịch của mình không?</b></summary>

Có. Bạn chỉ cần copy thư mục `data/` và thư mục `uploads/` cất vào ổ cứng ngoài hoặc Google Drive cá nhân là đã sao lưu toàn bộ dữ liệu an toàn.
</details>

---

## ⚠️ Tuyên Bố Miễn Trừ Trách Nhiệm

*Ứng dụng này được phát triển với mục đích giáo dục, hỗ trợ học tập và xây dựng kỷ luật cá nhân trong đầu tư. Mọi phân tích, đánh giá kỹ thuật và nhận định từ trí tuệ nhân tạo (AI) đều chỉ mang tính chất tham khảo, không cấu thành lời khuyên đầu tư tài chính. Bạn hoàn toàn chịu trách nhiệm cho mọi quyết định giao dịch của chính mình.*

---
Chúc bạn học tập hiệu quả, kiên định kỷ luật và gặt hái nhiều thành công trên thị trường! 🚀
