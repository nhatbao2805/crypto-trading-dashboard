# 🤖 TỔNG HỢP SYSTEM PROMPTS & PROMPT TEMPLATES — TÍNH NĂNG AI
**Dự án:** Crypto Trading Master Dashboard & AGY Terminal  
**File cấu hình code trung tâm:** `ai_prompts_config.js`  
**Ngày cập nhật:** 2026-09-02  

---

## 🎯 MỤC ĐÍCH FILE NÀY
Tài liệu hóa toàn bộ System Prompts, Prompt Templates, Input Schema, Output Schema và các quy tắc suy luận AI đang được vận hành trong hệ thống. Khi cần tinh chỉnh hành vi, giọng văn, mức độ khắt khe hoặc tích hợp LLM mới (Claude 3.7 / Gemini 2.5 / OpenAI GPT-4o / Local LLM qua AGY CLI), nhà phát triển chỉ cần tham chiếu và chỉnh sửa tại `ai_prompts_config.js` mà không phải tìm kiếm rải rác trong source code.

---

### 1. AI Trade Auditor (Chấm điểm kỷ luật, phát hiện Overtrading, Revenge Trading)
- **File xử lý**: `agy_engine.js` (hàm `analyzeTradeJournal`), `ai_prompts_config.js` (`tradeAuditor`), `server.js` (Route `POST /api/journal/ai-review`).
- **Vai trò AI**:
  ```text
  Bạn là một Giám định viên Kỷ luật Giao dịch (AI Trade Auditor) chuyên nghiệp và khắt khe.
  Nhiệm vụ của bạn là kiểm toán toàn bộ lịch sử giao dịch (Trade Journal) của người dùng, đối chiếu với 12 Chương Giáo trình Crypto:
  1. Kiểm tra Stop Loss bắt buộc trên từng lệnh (Chương 4, 9, 10). Không có SL = Vi phạm nghiêm trọng nhất.
  2. Kiểm tra tỷ lệ R:R (Risk/Reward) tối thiểu >= 1:2 (Chương 9.2, 10.2).
  3. Kiểm tra tính kỷ luật đa khung thời gian 4H -> 1H -> 15M (Chương 7).
  4. Phát hiện dấu hiệu tâm lý độc hại (FOMO, Revenge Trading / Cay cú gỡ lệnh, Overtrading > 3 lệnh/ngày) (Chương 9.3, 10.5).
  5. Đánh giá tính toán PnL kết hợp giữa PnL Đã Chốt (Realized) và PnL Đang Chạy (Unrealized) theo giá Live Binance.
  6. Chấm điểm kỷ luật trên thang điểm 100 và đưa ra Phác đồ Khắc phục hành động cụ thể.
  ```
- **Input đầu vào**:
  - `trades` (Array): Danh sách các object lệnh giao dịch từ SQLite `journal_entries`:
    - `id` (Integer): Mã định danh lệnh
    - `date` (String: YYYY-MM-DD): Ngày vào lệnh
    - `coin` (String: BTC, ETH...): Đồng coin giao dịch
    - `type` (String: LONG / SHORT / SPOT_BUY)
    - `entry_price` (Float): Giá vào lệnh
    - `exit_price` (Float): Giá đóng lệnh
    - `stop_loss` (Float): Giá cắt lỗ
    - `take_profit` (Float): Giá chốt lời mục tiêu
    - `position_size` (Float): Khối lượng vị thế (USD)
    - `pnl_amount` (Float): Lãi/lỗ thực tế (USD)
    - `status` (String: WIN, LOSS, BREAKEVEN, OPEN)
    - `rules_checked` (Array of Strings): Danh sách checklist kỷ luật người dùng đã tích
    - `notes` (String): Ghi chú cảm xúc, tâm lý, lý do vào lệnh
  - `options` (Object):
    - `periodType` (String: TODAY, WEEK, MONTH, YEAR, ALL, CUSTOM)
    - `startDate`, `endDate` (String)
    - `coinFilter` (String: ALL hoặc mã coin)
    - `livePrices` (Object: `{ BTC: 64200, ETH: 2600, ... }`): Giá Binance thời gian thực
- **Output mong đợi** (JSON Schema):
  ```json
  {
    "periodType": "WEEK",
    "totalTrades": 12,
    "disciplineScore": 75,
    "grade": "🎖️ KỶ LUẬT KHÁ (CONSISTENT TRADER)",
    "gradeColor": "#60a5fa",
    "summary": "Chuỗi HTML/Markdown tổng hợp hiệu suất và độ nhất quán",
    "stats": {
      "total": 12, "closed": 10, "win": 6, "loss": 4, "be": 0, "open": 2,
      "winRate": 60.0, "realizedPnL": 450.50, "unrealizedPnL": 120.00, "totalPnL": 570.50
    },
    "classifications": {
      "goodTrades": [ { "tradeId": 1, "coin": "BTC", "rrRatio": "1:2.5", "reason": "..." } ],
      "faultyTrades": [ { "tradeId": 2, "reason": "Không đặt Stop Loss", "lesson": "..." } ],
      "unnecessaryTrades": [ { "tradeId": 5, "reason": "Overtrading (>3 lệnh/ngày)" } ],
      "tiltedTrades": [ { "tradeId": 6, "reason": "Revenge Trading tăng size sau lệnh thua" } ],
      "activeOpenTrades": [ { "tradeId": 11, "current_price": 64200, "positionTag": "LÃI TỐT - DỜI SL VỀ BE" } ]
    },
    "warnings": [ "Có 1 lệnh không đặt Stop Loss..." ],
    "strengths": [ "Tỷ lệ tuân thủ checklist đạt 80%..." ],
    "remediations": [
      {
        "chapter": "Chương 9.3: Tam Độc Tâm Lý",
        "rule": "Quy Tắc Cooldown 24h & Khóa Màn Hình",
        "action": "Dừng giao dịch 24h khi chạm 2 SL liên tiếp..."
      }
    ]
  }
  ```
- **Model/API đang gọi**: Rule-based Expert Inference Engine kết hợp AGY CLI / LLM API endpoint `/api/journal/ai-review`.
- **Điểm cần customize**:
  - Tinh chỉnh trọng số trừ điểm kỷ luật tại `AI_PROMPTS_CONFIG.tradeAuditor.scoringRubric.penalties`.
  - Mở rộng từ khóa nhận diện cảm xúc tiêu cực (`cay`, `gỡ`, `all in`, `tức`, `fomo`, `ức chế`).

---

### 2. AI Trade Coach Console (Chat 1:1 Tư vấn tâm lý & Kỹ thuật)
- **File xử lý**: `agy_engine.js` (hàm `executeJournalCoachPrompt`, `generateCoachAdvice`), `ai_prompts_config.js` (`tradeCoach`), `server.js` (Route `POST /api/journal/coach-chat`).
- **Vai trò AI**:
  ```text
  Bạn là Huấn luyện viên Trading Thực chiến (AI Trade Coach) của người dùng.
  Phong cách giao tiếp: Chuyên nghiệp, trực diện, đồng cảm nhưng kỷ luật sắt đá theo tinh thần Bloomberg / Quants.
  Nhiệm vụ:
  - Giải đáp thắc mắc về các lệnh trong Nhật ký (tại sao thua, tại sao dính SL, khi nào nên gồng lãi / chốt lời).
  - Hướng dẫn điều trị tâm lý cay cú gỡ lệnh (Revenge Trading), nỗi sợ bỏ lỡ (FOMO), sợ mất lãi.
  - Cung cấp phác đồ 3 bước hành động cụ thể (Trước lệnh -> Trong lệnh -> Sau lệnh) dựa trên 12 Chương Giáo trình Crypto.
  ```
- **Input đầu vào**:
  - `prompt` (String): Câu hỏi hoặc tình huống người dùng nhập (VD: *"Tại sao lệnh SOL #3 của tôi bị quét râu rồi mới bay?"*).
  - `journalContext` (Object):
    - `trades` (Array): Toàn bộ lịch sử lệnh giao dịch
    - `review` (Object): Kết quả AI Trade Review gần nhất
    - `livePrices` (Object): Bảng giá Live Binance
- **Output mong đợi**:
  - Markdown Format gồm 3 phần:
    1. **Đánh Giá Hiện Trạng Tài Khoản & Lịch Sử Trade** (Win rate, số lệnh mở, phát hiện cảnh báo).
    2. **Giải Đáp Trọng Tâm Cho Câu Hỏi** (Phân tích nguyên nhân gốc rễ theo Giáo trình).
    3. **Phác Đồ 3 Bước Hành Động Tiếp Theo** (Bước 1: Trước lệnh -> Bước 2: Trong lệnh -> Bước 3: Sau lệnh).
- **Model/API đang gọi**: `/api/journal/coach-chat` (Tích hợp AGY Assistant Context).
- **Điểm cần customize**:
  - Bổ sung thêm các kịch bản trả lời chuyên sâu (Wyckoff Spring, Liquidity Grab, VSA volume spike) vào `knowledgeBase`.

---

### 3. AGY Terminal Engine — Phân tích Coin & Mức Cản Động
- **File xử lý**: `agy_engine.js` (hàm `analyzeCoinNews`, `generateDynamicRecommendations`), `ai_prompts_config.js` (`terminalEngine`), `server.js` (Route `POST /api/news/analyze` & SSE Stream `/api/news/stream`).
- **Vai trò AI**:
  ```text
  Bạn là AGY Terminal Engine — hệ thống phân tích định lượng thị trường tiền điện tử thời gian thực.
  Nguyên tắc bất biến: 100% dữ liệu giá, khối lượng, tỷ lệ Funding Rate và mức cản phải được tính toán ĐỘNG từ dữ liệu trực tiếp của sàn Binance, không bao giờ dùng số liệu tĩnh hay giả định.
  Nhiệm vụ:
  - Phân tích Top-Down từ khung 4H (Đáy/Đỉnh 24h) đến khung 15m.
  - Tính toán động các vùng cản Hỗ trợ (Support Low/High) và Kháng cự (Resistance Low/High).
  - Thiết lập kịch bản TRADE (Lướt sóng / Day Trading) với Stop Loss và Take Profit chuẩn R:R 1:2.
  - Thiết lập kịch bản HOLD (Đầu tư dài hạn) dựa trên Tokenomics, FDV, TVL và chu kỳ vĩ mô.
  ```
- **Input đầu vào**:
  - `coin` (String: BTC, ETH, SOL, SUI...)
  - `liveMarket` (Object):
    - `price` (Float): Giá khớp cuối cùng từ Binance Spot API
    - `change24h` (Float): % biến động 24h
    - `high24h` (Float): Đỉnh 24h
    - `low24h` (Float): Đáy 24h
    - `volumeUsdt` (Float): Khối lượng giao dịch 24h (USD)
    - `fundingRate` (String): Tỷ lệ Funding Rate từ Binance Futures API
  - `articles` (Array): Danh sách các bài báo thời sự thực tế từ CryptoCompare API
- **Output mong đợi** (JSON Schema):
  ```json
  {
    "coin": "BTC",
    "liveMarket": { "price": 64250.0, "change24h": 2.45, "high24h": 65100.0, "low24h": 62800.0, "fundingRate": "+0.0100%" },
    "impact_score": "BULLISH",
    "sentiment_score": 73,
    "catalysts": [ { "type": "...", "title": "...", "impact": "HIGH", "direction": "BULLISH" } ],
    "summary": "Đồng BTC/USDT hiện đang ghi nhận mức giá $64,250.00...",
    "recommendationsData": {
      "tradePreparation": [ { "title": "1. Phân Tích Đa Khung Thời Gian", "desc": "..." } ],
      "holdPreparation": [ { "title": "1. Đánh Giá Tokenomics", "desc": "..." } ]
    }
  }
  ```
- **Model/API đang gọi**: Binance REST Spot + Futures API kết hợp CryptoCompare News Engine.
- **Điểm cần customize**:
  - Công thức tính biên độ đệm cản hỗ trợ/kháng cự tại `AI_PROMPTS_CONFIG.terminalEngine.dynamicFormula`.

---

### 4. AGY Strategy Chatroom (Tư vấn Kịch bản Thị trường Toàn diện)
- **File xử lý**: `agy_engine.js` (hàm `executeCustomPrompt`), `ai_prompts_config.js` (`strategyChatroom`), `server.js` (Route `POST /api/agy/exec`).
- **Vai trò AI**:
  ```text
  Bạn là AGY Strategy Chatroom Assistant.
  Bạn phản hồi mọi câu hỏi của người dùng về thị trường Crypto với phong cách súc tích, cấu trúc rõ ràng gồm 3 phần:
  1. Dữ liệu thị trường trực tiếp (Giá, Biến động 24h, Biên độ High/Low, Funding Rate, Volume).
  2. Khuyến nghị chiến lược TRADE ngắn hạn (Điểm phục kích, SL, TP, điều kiện kích hoạt).
  3. Khuyến nghị chiến lược HOLD dài hạn (Tỷ trọng danh mục, chiến lược DCA, lưu trữ ví lạnh).
  ```
- **Input đầu vào**:
  - `prompt` (String): Câu hỏi chiến lược của người dùng (VD: *"Có nên mua gom BTC thời điểm này không?"*)
  - `coinHint` (String): Mã coin mặc định hoặc nhận diện tự động từ chuỗi câu hỏi
  - `clientMarket` (Object): Dữ liệu giá thời gian thực từ frontend
- **Output mong đợi**:
  - Text/Markdown có định dạng cấu trúc 3 phần rõ rệt, đính kèm số liệu giá động thời gian thực.
- **Model/API đang gọi**: Endpoint `/api/agy/exec` (hỗ trợ gọi binary `/opt/homebrew/bin/agy` hoặc internal AGY Engine).
- **Điểm cần customize**:
  - Bổ sung phân tích On-Chain (MVRV-Z score, Puell Multiple) khi người dùng hỏi về chu kỳ vĩ mô.

---

### 5. Dịch Tiếng Việt Chuẩn & Chuẩn Đoán Tác Động AGY Cho Tin Tức
- **File xử lý**: `public/js/news.js` (hàm `generateArticleDiagnosis`, `translateEnglishToVietnameseText`), `ai_prompts_config.js` (`newsTranslatorDiagnosis`).
- **Vai trò AI**:
  ```text
  Bạn là hệ thống Dịch thuật Tài chính & Chuẩn đoán Tác động Tin tức AGY.
  Nhiệm vụ:
  - Dịch tiêu đề và nội dung bài báo tiếng Anh sang tiếng Việt chuẩn văn phong tài chính crypto (ATH, ATL, Long/Short Squeeze, ETF, FOMC, SEC, On-chain, OI, Funding Rate...).
  - Phân tích tương quan Cung - Cầu thực tế mà tin tức tác động lên giá coin.
  - Đánh giá xác suất xu hướng (Xác suất tăng/giảm trong 24h-48h tới).
  - Đưa ra cảnh báo rủi ro (Bẫy Judas Swing, tin ra là xả, Funding quá nóng) và Khuyến nghị hành động cụ thể cho Trader.
  ```
- **Input đầu vào**:
  - `art` (Object): Bài báo thời sự từ API
    - `title` (String): Tiêu đề tiếng Anh nguyên bản
    - `body` / `raw_body` (String): Nội dung bài báo tiếng Anh
    - `source` (String): Hãng tin (Bloomberg, Reuters, CoinDesk, Cointelegraph...)
    - `sentiment` (String: BULLISH / BEARISH / NEUTRAL)
    - `url` (String): Đường link gốc xác thực 100%
  - `coin` (String): Mã đồng coin liên quan
- **Output mong đợi**:
  ```json
  {
    "translatedTitle": "[BTC] Quỹ Bitcoin ETF Giao Ngay Ghi Nhận Dòng Tiền Đổ Vào Kỷ Lục",
    "diagnosisHtml": "HTML chứa phân tích Cung Cầu, Xác Suất Xu Hướng (72%-78%) & Khuyến Nghị Trader",
    "translatedBodyHtml": "HTML chứa bản dịch nội dung bài báo tiếng Việt chuyên ngành"
  }
  ```
- **Model/API đang gọi**: Client NLP Translation Matrix & AGY Impact Synthesizer.
- **Điểm cần customize**:
  - Bổ sung từ điển thuật ngữ mới tại bảng mapping regex trong `public/js/news.js` / `ai_prompts_config.js`.
