# 🪙 Sổ Tay & Ứng Dụng Hỗ Trợ Giao Dịch Tiền Điện Tử (Crypto Trading Dashboard)

> **Hệ sinh thái hỗ trợ học tập, rèn luyện kỷ luật và đồng hành cùng Trader trong từng quyết định đầu tư.**  
> Tích hợp toàn diện: 📘 Giáo trình thực chiến 12 chương • 🕯️ Thư viện mô hình nến & bẫy giá chuẩn TradingView • 📝 Luyện tập nhận định biểu đồ • 📓 Nhật ký giao dịch kèm ảnh chart & kiểm toán kỷ luật • 📰 Bộ lọc tin tức tác động thị trường • 🤖 Hội đồng cố vấn AI đa tác nhân phản biện bẫy giá • 💼 Giao dịch mô phỏng (Paper Trading) $10,000 vốn ảo • 📲 Radar cảnh báo tín hiệu qua Telegram 24/7.

---

## 🎯 Ứng Dụng Này Dành Cho Ai?

- **Người mới bắt đầu (Beginner)**: Cần một lộ trình bài bản từ con số 0, hiểu rõ bản chất công nghệ Blockchain, nến Nhật, cấu trúc thị trường SMC, các bẫy giá của Cá mập và tránh mất tiền oan uổng.
- **Trader muốn rèn luyện kỷ luật**: Đã biết giao dịch nhưng hay thua lỗ vì vào lệnh theo cảm xúc, FOMO đu đỉnh, không cài Stop Loss, hoặc không có nơi ghi chép nhật ký bài bản để rút kinh nghiệm.
- **Nhà đầu tư cần ban cố vấn phản biện**: Muốn có một hội đồng chuyên gia khách quan (Kỹ thuật SMC, Vĩ mô, Quản trị rủi ro, Phản biện bẫy giá) soi xét mọi góc khuất trước khi xuống tiền.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT NHANH TỪ A -> Z CHO NGƯỜI MỚI

Bạn không cần phải là dân IT chuyên nghiệp, chỉ cần làm đúng theo các bước đơn giản dưới đây là có thể chạy ứng dụng mượt mà ngay trên máy tính của mình (Windows hoặc macOS).

### Bước 1: Cài đặt các công cụ nền tảng (Chỉ làm 1 lần duy nhất)

1. **Cài đặt Node.js** (Bắt buộc):
   - Truy cập trang chủ chính thức: 👉 [https://nodejs.org/](https://nodejs.org/)
   - Tải bản **LTS (Long Term Support)** (Khuyến nghị phiên bản 20.x hoặc 22.x).
   - Mở tệp vừa tải về và bấm `Next` liên tục để cài đặt như phần mềm thông thường.
2. **Cài đặt Git** (Nếu máy chưa có):
   - Windows: Tải tại [https://git-scm.com/download/win](https://git-scm.com/download/win) và cài đặt.
   - Mac: Đã có sẵn, hoặc gõ `xcode-select --install` trong Terminal.

---

### Bước 2: Tải mã nguồn dự án về máy tính

Mở cửa sổ dòng lệnh:
- Trên **Windows**: Bấm phím `Windows + R`, gõ `cmd` rồi bấm `Enter` (hoặc mở **PowerShell** / **Git Bash**).
- Trên **macOS**: Bấm `Cmd + Space`, gõ `Terminal` rồi bấm `Enter`.

Dán lần lượt các lệnh sau vào cửa sổ dòng lệnh:

```bash
# 1. Tải toàn bộ mã nguồn về máy tính của bạn
git clone https://github.com/nhatbao2805/crypto-trading-dashboard.git

# 2. Đi vào thư mục của ứng dụng
cd crypto-trading-dashboard

# 3. Cài đặt các thư viện cần thiết (chờ khoảng 1-2 phút)
npm install
```

---

## 🔑 HƯỚNG DẪN LẤY TẤT CẢ CÁC LOẠI KEY TỪ A -> Z (CỰC KỲ CHI TIẾT)

Ứng dụng của bạn tích hợp sẵn dữ liệu giá **Binance** và tin tức **CryptoCompare** chạy **HOÀN TOÀN TỰ ĐỘNG KHÔNG CẦN KEY**.  
Tuy nhiên, để kích hoạt **Hội đồng 4 AI Cố vấn (AI Trader)** và **Cảnh báo bắn tin nhắn về điện thoại qua Telegram**, bạn chỉ cần chuẩn bị 2 loại key dưới đây (Đều **MIỄN PHÍ 100%**):

---

### 1. 🌟 Google Gemini API Key (KHUYÊN DÙNG — 100% MIỄN PHÍ — KHÔNG CẦN THẺ VISA)

> **Mục đích**: Cung cấp "bộ não" cho Hội đồng 4 AI Tác tử (Kỹ thuật SMC, Dòng tiền vĩ mô, Quản trị rủi ro, Phản biện bẫy giá) và Trợ lý AI Coaching kỷ luật giao dịch.  
> **Chi phí**: **Miễn phí 100%** từ Google AI Studio (cho phép 15 yêu cầu/phút, 1.500 yêu cầu/ngày — đủ dùng thoải mái cho cá nhân).

#### Các bước lấy Key:
1. Mở trình duyệt web và truy cập vào trang: 👉 **[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)**
2. Đăng nhập bằng tài khoản **Gmail** thông thường của bạn.
3. Nhấp vào nút xanh biển nổi bật: **"Create API key"** (Tạo khóa API).
4. Trong bảng hiện lên:
   - Chọn mục **"Create API key in new project"** (Tạo khóa trong dự án mới), hoặc chọn một dự án Google Cloud có sẵn nếu bạn đã có.
5. Sau vài giây, hệ thống sẽ hiện ra một chuỗi ký tự dài bắt đầu bằng chữ `AIzaSy...`.
6. Nhấp vào nút **Copy** (Sao chép) bên cạnh chuỗi ký tự đó và cất tạm vào Notepad.  
   *(Lưu ý: Không chia sẻ mã này cho người khác để bảo mật).*

---

### 2. 📲 Telegram Bot Token & Chat ID (MIỄN PHÍ 100% — NHẬN CẢNH BÁO 24/7 VỀ ĐIỆN THOẠI)

> **Mục đích**: Khi phát hiện bẫy thanh khoản cá mập, quét râu SFP, hoặc cảnh báo giá chạm Stop Loss / Take Profit, hệ thống sẽ tự động gửi tin nhắn báo động trực tiếp vào ứng dụng Telegram trên điện thoại của bạn ngay cả khi bạn không mở máy tính.

#### Phần A: Lấy `TELEGRAM_BOT_TOKEN` (Tạo bot riêng của bạn):
1. Mở ứng dụng **Telegram** trên điện thoại hoặc máy tính.
2. Tại thanh tìm kiếm (Search), gõ tìm kiếm: `@BotFather`  
   *(Lưu ý: Chọn tài khoản chính chủ của Telegram có dấu tích xanh xác thực).*
3. Nhấp nút **Start** (hoặc gửi tin nhắn `/start`).
4. Gửi tiếp dòng lệnh: `/newbot`
5. BotFather sẽ hỏi bạn: *"Alright, a new bot. How are we going to call it? Please choose a name for your bot."*  
   👉 Bạn nhập một tên hiển thị tùy thích cho bot (ví dụ: `My Crypto Radar`).
6. BotFather tiếp tục hỏi: *"Good. Now let's choose a username for your bot..."*  
   👉 Bạn nhập tên định danh viết liền không dấu và **bắt buộc phải kết thúc bằng chữ `_bot`** (ví dụ: `baotrading_signal_bot` hoặc `nhatbao_radar_bot`).
7. BotFather sẽ gửi tin nhắn chúc mừng kèm đoạn mã **HTTP API Token** có dạng:  
   `7891234567:AAFlkjasd987123jhkjh-abcdef...`  
   👉 **Hãy copy toàn bộ chuỗi mã này**, đây chính là **`TELEGRAM_BOT_TOKEN`**.

#### Phần B: Lấy `TELEGRAM_CHAT_ID` (Địa chỉ hòm thư nhận tin nhắn của bạn):
1. Tại ô tìm kiếm Telegram, gõ tìm kiếm: `@userinfobot` (hoặc `@RawDataBot`).
2. Nhấp nút **Start**. Bot này sẽ lập tức trả về thông tin tài khoản Telegram của bạn, trong đó có dòng:  
   `Id: 123456789` (một chuỗi số gồm 9 đến 10 chữ số).  
   👉 **Hãy copy dãy số này**, đây chính là **`TELEGRAM_CHAT_ID`**.
3. ⚠️ **BƯỚC QUAN TRỌNG NHẤT KHÔNG ĐƯỢC QUÊN**:  
   Hãy mở lại con bot bạn vừa tạo ở **Phần A** (gõ tên bot của bạn vào ô tìm kiếm, ví dụ `@baotrading_signal_bot`), nhấp **Start** hoặc gửi cho nó một tin nhắn bất kỳ (ví dụ: `Hi`).  
   *(Nếu bạn không nhắn tin cho nó trước, Telegram sẽ kích hoạt chế độ chống spam và bot sẽ không thể gửi tin nhắn cho bạn).*

---

### 3. 🧠 DeepSeek API Key (TÙY CHỌN — Phản Biện Bẫy Giá Cực Sâu)

> **Mục đích**: Tích hợp mô hình lý luận **DeepSeek R1** (`deepseek-reasoner`) để "bóc mẽ" các bẫy giá SMC phức tạp với chi phí cực rẻ.

1. Truy cập vào trang: 👉 **[https://platform.deepseek.com/](https://platform.deepseek.com/)**
2. Đăng ký hoặc đăng nhập tài khoản.
3. Chọn mục **"API Keys"** ở thanh điều hướng bên trái.
4. Bấm nút **"Create API Key"**, đặt tên gợi nhớ (ví dụ: `CryptoDashboard`) rồi bấm Tạo.
5. Sao chép chuỗi mã có dạng `sk-xxxxxxxxxxxxxxxxxxxxxxxx`.

---

### 4. 🤖 OpenAI API Key (TÙY CHỌN — Dành Cho Người Thích GPT-4o)

1. Truy cập vào: 👉 **[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)**
2. Đăng nhập tài khoản OpenAI.
3. Bấm **"Create new secret key"** và copy chuỗi key bắt đầu bằng `sk-proj-...`.

---

### 5. 💻 Ollama Local (TÙY CHỌN — Chạy Offline 100% Không Tốn Tiền, Không Cần Key)

> Nếu bạn muốn phân tích hoàn toàn nội bộ trên máy tính của mình mà không gửi dữ liệu ra internet:
1. Tải và cài đặt Ollama từ: 👉 [https://ollama.com](https://ollama.com)
2. Mở Terminal / CMD gõ:  
   ```bash
   ollama run deepseek-r1:8b
   # hoặc
   ollama run qwen2.5:7b
   ```
3. Ứng dụng sẽ tự động kết nối qua địa chỉ `http://127.0.0.1:11434`.

---

## ⚙️ HƯỚNG DẪN TẠO VÀ ĐIỀN FILE CẤU HÌNH `.env`

Sau khi đã có các key ở trên, bạn chỉ cần dán vào file cấu hình theo 3 bước:

### Bước 1: Tạo file `.env` từ file mẫu `.env.example`

Tại cửa sổ Terminal / CMD đang mở ở thư mục `crypto-trading-dashboard`, gõ lệnh:

- Trên **macOS / Linux**:
  ```bash
  cp .env.example .env
  ```
- Trên **Windows (Command Prompt)**:
  ```cmd
  copy .env.example .env
  ```
- Trên **Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env
  ```

*(Hoặc bạn có thể dùng chuột copy file `.env.example`, dán ra cùng thư mục và đổi tên thành `.env`).*

---

### Bước 2: Mở file `.env` và dán key của bạn vào

Dùng bất kỳ trình soạn thảo nào (VS Code, Notepad trên Windows, hoặc TextEdit trên Mac) mở file `.env` vừa tạo lên.  
Nội dung file sẽ trông như sau, bạn chỉ việc điền key của mình vào sau dấu `=`:

```env
# ==============================================================================
# CẤU HÌNH HỆ THỐNG TRADING DASHBOARD & MULTI-AGENT COUNCIL
# ==============================================================================

# 1. CỔNG MÁY CHỦ (Mặc định: 3000)
PORT=3000

# 2. KHÓA API MÔ HÌNH NGÔN NGỮ (LLM)
# Chọn nhà cung cấp AI chính: gemini (khuyên dùng) hoặc deepseek
PRIMARY_LLM_PROVIDER=gemini

# [BẮT BUỘC ĐỂ DÙNG AI] Dán key Google Gemini bạn đã lấy ở Mục 1 vào đây:
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Các model Gemini tối ưu cho từng tác tử (Để mặc định là chuẩn nhất)
GEMINI_MODEL_PRO=gemini-2.5-pro
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MODEL_LITE=gemini-2.0-flash-lite

# [TÙY CHỌN] Điền nếu bạn có key DeepSeek
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL_REASONER=deepseek-reasoner
DEEPSEEK_MODEL=deepseek-chat

# [TÙY CHỌN] Chạy AI Offline bằng Ollama (Không cần chỉnh sửa nếu không dùng)
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL_DEEP=deepseek-r1:8b
OLLAMA_MODEL=qwen2.5:7b

# 3. CẢNH BÁO TÍN HIỆU TELEGRAM 24/7 (Điền thông tin ở Mục 2 để nhận tin nhắn)
TELEGRAM_BOT_TOKEN=7891234567:AAFlkjasd987123jhkjh-abcdef...
TELEGRAM_CHAT_ID=123456789
TELEGRAM_ALERT_MIN_SCORE=82
```

👉 **Lưu file lại** (`Ctrl + S` trên Windows hoặc `Cmd + S` trên Mac).

---

## 🖥️ HƯỚNG DẪN KHỞI CHẠY & SỬ DỤNG ỨNG DỤNG

Sau khi đã lưu file `.env`, bạn chạy 2 lệnh sau trên Terminal / CMD:

```bash
# 1. Biên dịch mã nguồn (chỉ mất vài giây)
npm run build

# 2. Khởi động máy chủ ứng dụng
npm start
```

Khi màn hình hiện thông báo:
```text
🚀 Server running at http://localhost:3000
✅ Database initialized at data/dashboard.sqlite
```

👉 Hãy mở trình duyệt web (Chrome, Cốc Cốc, Safari, Edge...) và truy cập vào địa chỉ:  
**`http://localhost:3000`**

*(Mẹo: Khi muốn tắt ứng dụng, bạn chỉ cần quay lại cửa sổ Terminal / CMD và nhấn `Ctrl + C`).*

---

### 🔍 Cách kiểm tra xem AI đã nhận Key thành công chưa?

1. Trên giao diện web, nhấp vào tab **"AI Trader"** ở menu bên trái.
2. Chọn đồng coin (ví dụ **BTC**) và chọn khung thời gian (ví dụ **15m** hoặc **1H**).
3. Nhập câu hỏi hoặc nhận định của bạn (ví dụ: *"Tôi thấy nến rút chân tại hỗ trợ 60k, có nên vào lệnh Long không?"*).
4. Bấm nút **"Họp Hội Đồng AI"**:
   - Nếu bạn thấy 4 tác tử AI (**Kỹ thuật SMC**, **Vĩ mô**, **Quản trị rủi ro**, **Phản biện bẫy giá**) lần lượt đưa ra các luận điểm chuyên sâu, kèm bảng xác suất thành công từ Chủ tịch Hội đồng (**Master Council**) ➔ **Chúc mừng, hệ thống AI đã hoạt động hoàn hảo 100%!**
   - *(Nếu chưa có key, hệ thống vẫn sẽ dùng bộ phân tích heuristic thông minh tích hợp sẵn để phục vụ bạn).*

---

## 🧭 CẨM NANG 6 TÍNH NĂNG ĐỈNH CAO CHO TRADER

Giao diện được phân bổ trực quan, thân thiện và khoa học:

```text
┌─────────────────────────────────────────────────────────────┐
│ 🪙 CRYPTO TRADING DASHBOARD & MULTI-AGENT TERMINAL          │
├──────────────┬──────────────────────────────────────────────┤
│ 📘 Lý Thuyết │  12 Chương Giáo trình + Thư viện Nến Atlas   │
│ 📝 Luyện Tập │  Trắc nghiệm tình huống biểu đồ thực tế      │
│ 📓 Nhật Ký   │  Ghi lệnh, ảnh TradingView, Chấm điểm kỷ luật│
│ 📰 Tin Tức   │  Bộ lọc tin tức AGY Terminal & Đánh giá mức độ│
│ 🤖 AI Trader │  Hội đồng 4 AI Tác tử phản biện bẫy giá      │
│ 💼 Demo/Sim  │  Sàn Paper Trading cấp sẵn $10,000 vốn ảo    │
└──────────────┴──────────────────────────────────────────────┘
```

---

### 1. 📘 Tab "Lý Thuyết" — Bách Khoa Toàn Thư Crypto Từ Cơ Bản Đến SMC Chuyên Sâu

- **12 Chương giáo trình bài bản**:
  - **Chương 1 - 3**: Bản chất Blockchain, Bitcoin, ví lạnh/nóng, phí gas, sàn Spot & Futures, sổ lệnh (Order Book), bể thanh khoản.
  - **Chương 4 - 6**: Giải phẫu nến Nhật OHLC, các cụm nến đảo chiều kinh điển (Hammer, Shooting Star, Engulfing, Doji, Morning/Evening Star), hỗ trợ/kháng cự và quy tắc chuyển đổi vai trò (Breakout & Retest).
  - **Chương 7**: **Chiến lược Đa Khung Thời Gian (Top-Down: 4H ➔ 1H ➔ 15m)** và khung giờ vàng săn thanh khoản (Killzones: London Open, New York Open).
  - **Chương 8 - 9**: **Tâm lý học hành vi thị trường & 7 Bẫy Thao Túng Của Cá Mập** (Quét râu SFP, Bẫy Judas Swing phiên Mỹ, Bẫy Funding Rate âm kích hoạt Short Squeeze, Pha Spring rũ bỏ theo Wyckoff).
  - **Chương 10 - 11**: Quản trị vốn sống còn (Quy tắc 1-2%, Tỷ lệ Risk:Reward tối thiểu 1:2) và Nhật ký lệnh.
  - **Chương 12**: **Vị thế tư duy CIO (Chief Investment Officer) & Bộ câu hỏi bóc mẽ AI**.
- **🕯️ Thư Viện Mô Hình Nến (Candlestick Atlas)**:
  - Hiển thị trực quan các biểu đồ nến chuẩn TradingView với tỷ lệ vàng, bố cục 2 cột rộng rãi, không bị chật chội hay rớt chữ.
  - Tích hợp sẵn thông số gợi ý điểm vào (**Entry**), điểm cắt lỗ (**Stop Loss**), điểm chốt lời (**Take Profit**) và tỷ lệ R:R chuẩn xác.
- **📚 Từ Điển Thuật Ngữ SMC**: Tra cứu nhanh hơn 20 thuật ngữ viết tắt của giới Smart Money (Order Block, BOS, CHoCH, Fair Value Gap, Buy-side Liquidity...).

---

### 2. 📝 Tab "Luyện Tập" — Rèn Luyện Bản Lĩnh Đọc Biểu Đồ

- Đưa ra các tình huống nến, mô hình giá và bẫy thanh khoản thực chiến.
- Bạn tự đưa ra phán quyết: **Mua (Long)**, **Bán (Short)** hay **Đứng ngoài quan sát**.
- Nhận phản hồi Đúng/Sai ngay lập tức kèm lời giải thích logic kỹ thuật chi tiết giúp củng cố kiến thức mỗi ngày.

---

### 3. 📓 Tab "Nhật Ký Giao Dịch" (Trading Journal) — Trái Tim Của Kỷ Luật

> *"Người không ghi chép nhật ký lệnh cũng giống như một người lái xe trong đêm mà không bật đèn pha."*

- **Ghi chép lệnh đa chiều**: Lưu trữ đồng coin, vị thế Long/Short, giá Entry, Stop Loss, Take Profit, đòn bẩy, số tiền ký quỹ.
- **Đính kèm ảnh biểu đồ TradingView**: Tải ảnh chart lúc vào lệnh lên để sau này đối soát lại xem mình đã phân tích đúng hay sai ở đâu.
- **Đóng lệnh trực tiếp theo giá Live Binance**: Nút đóng lệnh tức thì, tự động tính toán số tiền lãi/lỗ (PnL) và tỷ lệ phần trăm lợi nhuận.
- **🛡️ Bộ Kiểm Toán Kỷ Luật Tự Động (Discipline Auditor)**:
  - Chấm điểm kỷ luật của bạn trên thang điểm 100 dựa trên các quy tắc vàng của Giáo trình.
  - Cảnh báo ngay nếu bạn có dấu hiệu: Giao dịch trả thù sàn (Revenge Trading), bỏ quên Stop Loss, hoặc mạo hiểm quá 2% tài khoản cho một lệnh.
- **Sổ tay ghi chú (Personal Notes)**: Ghi lại các bài học xương máu và quy tắc cá nhân cần nhớ.

---

### 4. 📰 Tab "Tin Tức" (AGY News Terminal) — Lọc Nhiễu Thị Trường

- Tự động quét và cập nhật tin tức tiền điện tử mới nhất từ các nguồn uy tín toàn cầu.
- **Thang đo mức độ tác động (Impact Score)**:
  - 🔴 **Tác động MẠNH (High Impact)**: Tin tức vĩ mô lớn (CPI, FOMC họp lãi suất, hack sàn, quỹ ETF xả hàng...). Cảnh báo bạn nên siết chặt Stop Loss hoặc đứng ngoài thị trường.
  - 🟡 **Tác động VỪA (Medium Impact)**: Biến động trong biên độ kỹ thuật.
  - 🟢 **Tác động NHẸ (Low Impact)**: Tin tức định kỳ, ít rủi ro giật giá.
- Tóm tắt ý chính và đề xuất hành động chỉ trong 30 giây đọc lướt.

---

### 5. 🤖 Tab "AI Trader" — Hội Đồng 4 Tác Nhân Độc Lập

Trước khi bấm nút vào lệnh ở sàn thật, hãy đưa ý tưởng của bạn vào cho Hội đồng AI chất vấn:

1. **Chuyên gia Phân Tích Kỹ Thuật (Agent Alpha)**: Đọc nến, đo đạc RSI, MACD, cấu trúc sóng, vùng Order Block và Fair Value Gap (FVG).
2. **Chuyên gia Vĩ Mô & Dòng Tiền (Agent Macro)**: Đánh giá chu kỳ thị trường, xu hướng dòng vốn và sức mạnh Bitcoin Dominance (BTC.D).
3. **Chuyên gia Quản Trị Rủi Ro (Agent Guardian)**: Bắt buộc tuân thủ tỷ lệ R:R tối thiểu 1:2, kiểm tra khoảng cách Stop Loss an toàn để bảo vệ vốn.
4. **Luật Sư Của Quỷ / Thẩm Định Độc Lập (Agent Sentinel)**: Chuyên tìm kiếm điểm mù, vạch trần các bẫy giá giả mạo (Fakeout/Judas Swing) mà bạn đang chủ quan bỏ qua.
5. **Phán Quyết Chung (Master Council Verdict)**: Tổng hợp biểu quyết, chấm điểm xác suất thành công (%) và đưa ra kết luận dứt khoát: **Nên vào lệnh hay nên kiên nhẫn đứng ngoài**.

---

### 6. 💼 Tab "Giao Dịch Mô Phỏng" (Paper Trading) — Rèn Tay Nghề Không Sợ Cháy Túi

- Bạn được cấp sẵn tài khoản ảo **10,000 USDT**.
- Đặt lệnh Long / Short khớp theo giá thực tế 100% từ sàn Binance.
- Giúp bạn thử nghiệm các chiến lược SMC, đòn bẩy và quản lý vốn cho đến khi tỷ lệ thắng ổn định trước khi nạp tiền thật vào sàn giao dịch.

---

## 🔒 TÍNH RIÊNG TƯ & BẢO MẬT DỮ LIỆU CỦA BẠN

- **100% Dữ liệu lưu trữ cục bộ (Local First)**: Toàn bộ nhật ký lệnh, ghi chú, lịch sử giao dịch mô phỏng và hình ảnh chart của bạn đều nằm an toàn trên chính ổ cứng máy tính của bạn (tại tệp `data/dashboard.sqlite` và thư mục `uploads/`).
- **Không gửi dữ liệu nhạy cảm lên máy chủ bên thứ ba**: Bạn hoàn toàn làm chủ tài sản số và lịch sử đầu tư của mình.

---

## ❓ CÂU HỎI THƯỜNG GẶP (FAQ) & XỬ LÝ SỰ CỐ

<details>
<summary><b>1. Tôi không có API Key thì có mở và dùng ứng dụng được không?</b></summary>

**HOÀN TOÀN ĐƯỢC.**  
Dữ liệu giá Binance, tin tức CryptoCompare, toàn bộ 12 chương giáo trình, thư viện nến, phần luyện tập và nhật ký giao dịch đều hoạt động 100% bình thường mà không cần bất kỳ API key nào. Riêng tính năng Hội đồng AI sẽ tự động kích hoạt bộ máy phân tích heuristic thông minh nội bộ. Tuy nhiên, việc gắn key Gemini (miễn phí) sẽ giúp AI phân tích sâu và sắc sảo hơn rất nhiều.
</details>

<details>
<summary><b>2. Bị báo lỗi cổng 3000 đang bận (Error: listen EADDRINUSE :::3000)?</b></summary>

Lỗi này xuất hiện khi máy tính của bạn đang có một ứng dụng khác chạy cổng 3000.  
Bạn chỉ cần mở file `.env`, sửa dòng:
```env
PORT=3001
```
Sau đó khởi động lại bằng lệnh `npm start` và mở trình duyệt tại: **`http://localhost:3001`**.
</details>

<details>
<summary><b>3. Tắt máy tính thì nhật ký giao dịch và ảnh chụp có bị mất không?</b></summary>

**KHÔNG HỀ MẤT.**  
Mọi dữ liệu được lưu vĩnh viễn vào cơ sở dữ liệu SQLite tại thư mục `data/` trên máy tính của bạn. Khi nào bạn mở lại ứng dụng, toàn bộ lịch sử lệnh và ảnh biểu đồ sẽ hiển thị nguyên vẹn.
</details>

<details>
<summary><b>4. Tôi muốn sao lưu (Backup) dữ liệu sang máy tính khác thì làm thế nào?</b></summary>

Rất đơn giản, bạn chỉ cần copy 2 thư mục:
- Thư mục `data/` (chứa toàn bộ lệnh và ghi chú)
- Thư mục `uploads/` (chứa các hình ảnh biểu đồ bạn đã tải lên)  
Lưu vào USB hoặc Google Drive. Khi sang máy mới, bạn chỉ cần dán 2 thư mục này vào dự án là xong.
</details>

<details>
<summary><b>5. Tại sao tôi đã điền Telegram Token nhưng không nhận được tin nhắn?</b></summary>

Hãy kiểm tra 2 điểm sau:
1. Bạn đã mở con bot của bạn trên Telegram và bấm nút **Start** (hoặc gửi cho nó 1 tin nhắn) chưa? Nếu chưa nhắn tin trước, Telegram sẽ chặn bot không cho gửi tin nhắn đến bạn.
2. Kiểm tra xem `TELEGRAM_CHAT_ID` đã điền đúng dãy số lấy từ `@userinfobot` chưa.
</details>

---

## 💎 LỜI NHẮN NHỦ TỪ TÁC GIẢ GỬI ĐẾN BẠN

Thị trường tiền điện tử là một chiến trường tài chính khốc liệt bậc nhất hành tinh. Cá mập (Market Maker) và các quỹ đầu tư sở hữu hệ thống thuật toán triệu đô để quét sạch thanh khoản của những tay mơ thiếu kỷ luật.

Hãy luôn ghi nhớ 3 nguyên tắc sống còn:
1. **Bảo vệ vốn là ưu tiên số 1**: Luôn cài Stop Loss trước khi nghĩ đến lợi nhuận. Không bao giờ mạo hiểm quá 1-2% tổng vốn cho một lệnh giao dịch.
2. **AI là thư ký — BẠN mới là Giám Đốc Đầu Tư (CIO)**: AI có thể quét dữ liệu nhanh chóng nhưng bạn là người chịu trách nhiệm cuối cùng cho túi tiền của mình. Hãy luôn giữ một cái đầu lạnh và tư duy phản biện độc lập.
3. **Kỷ luật tạo nên sự tự do**: Hãy ghi chép nhật ký đều đặn, trung thực với từng sai lầm của bản thân và kiên trì rèn luyện mỗi ngày.

---

Chúc bạn làm chủ hệ thống, giao dịch kỷ luật và gặt hái thật nhiều thành công! 🚀🪙
