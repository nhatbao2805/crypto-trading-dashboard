# 🚀 Crypto Trading Dashboard & AI Multi-Agent Council

> **Hệ Thống Phân Tích & Quản Trị Giao Dịch Tiền Điện Tử Toàn Diện**  
> Tích hợp giáo trình thực chiến A-Z, luyện tập phân tích kỹ thuật, nhật ký giao dịch kỷ luật kèm upload biểu đồ, bộ lọc tin tức AGY Terminal và Hội đồng AI Trader đa tác nhân.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8.svg)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%203-003B57.svg)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

---

## 📑 Mục Lục

1. [Giới Thiệu Tổng Quan](#-giới-thiệu-tổng-quan)
2. [Các Tính Năng Cốt Lõi](#-các-tính-năng-cốt-lõi)
3. [Kiến Trúc Kỹ Thuật (Tech Stack)](#-kiến-trúc-kỹ-thuật-tech-stack)
4. [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
5. [Hướng Dẫn Cài Đặt (Installation)](#-hướng-dẫn-cài-đặt-installation)
6. [Hướng Dẫn Khởi Chạy & Sử Dụng (Usage)](#-hướng-dẫn-khởi-chạy--sử-dụng-usage)
7. [Các Lệnh Scripts Có Sẵn](#-các-lệnh-scripts-có-sẵn)
8. [Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
9. [Tài Liệu API Endpoints](#-tài-liệu-api-endpoints)
10. [Khắc Phục Sự Cố Thường Gặp (Troubleshooting)](#-khắc-phục-sự-cố-thường-gặp-troubleshooting)
11. [Đóng Góp & Bản Quyền](#-đóng-góp--bản-quyền)

---

## 🌟 Giới Thiệu Tổng Quan

**Crypto Trading Dashboard** là một nền tảng all-in-one được thiết kế dành cho nhà giao dịch tiền điện tử (từ người mới bắt đầu đến trader chuyên nghiệp). Dự án giải quyết các vấn đề then chốt:
- **Thiếu kiến thức bài bản**: Cung cấp cẩm nang 12 chương từ cốt lõi Blockchain, nến đảo chiều, phân tích đa khung thời gian (4H - 1H - 15m) đến Smart Money Concepts (SMC) và nhận diện bẫy Cá mập (Market Maker).
- **Giao dịch theo cảm xúc**: Hệ thống **Trading Journal** bắt buộc nhập lý do, confluences, quản lý vốn và tự động chấm điểm kỷ luật giao dịch (**Discipline Auditor**).
- **Nhiễu loạn thông tin**: **AGY News Terminal** thu thập, phân loại và chấm điểm tác động (Impact Score) của tin tức lên giá thị trường.
- **Thiếu góc nhìn phản biện khách quan**: Hội đồng **AI Multi-Agent Council** gồm 4 chuyên gia AI độc lập (Technical, Macro, Risk, Validator) tranh luận và đưa ra phán quyết Master Verdict trước khi vào lệnh.

---

## 🎯 Các Tính Năng Cốt Lõi

### 1. 📘 Giáo Trình Thực Chiến Toàn Tập (Theory Module)
- 12 chương lý thuyết trực quan với sơ đồ Mermaid, bảng so sánh và mô hình nến ASCII/Minh họa.
- Tìm kiếm tức thì theo từ khóa, thuật ngữ chuyên ngành (SMC, Order Block, Liquidity Pool, Killzones...).
- Theo dõi tiến độ đọc và lưu dấu chương đang học.

### 2. 📝 Luyện Tập Kỹ Thuật & Tình Huống (Practice Quiz & Analysis)
- Bộ câu hỏi trắc nghiệm tình huống thực tế (Price Action, phân tích đa khung thời gian).
- Giải thích chi tiết đáp án đúng/sai ngay sau khi chọn.
- Thống kê tỷ lệ chính xác, chuỗi thắng (streak) và hiệu suất học tập.

### 3. 📓 Nhật Ký Giao Dịch Kỷ Luật (Trading Journal & Discipline Auditor)
- Ghi chép chi tiết từng lệnh: Coin, Vị thế (Long/Short), Entry, Stop Loss, Take Profit, Đòn bẩy, Kích thước lệnh, Cảm xúc khi vào lệnh.
- **Hỗ trợ tải và lưu ảnh chụp màn hình biểu đồ (TradingView)** trực tiếp vào nhật ký.
- Tự động tính toán PnL ($ và %) và tỷ lệ Risk:Reward (R:R).
- **Bộ Chấm Điểm Kỷ Luật (Discipline Auditor)**: Đánh giá tuân thủ quy tắc Stop Loss, không FOMO, bảo toàn vốn 1-2%.

### 4. 📰 AGY News Impact Terminal
- Bộ lọc tin tức theo thời gian thực cho các đồng coin phổ biến (BTC, ETH, SOL, BNB, SUI, DOGE...).
- Phân loại cấp độ tác động: `HIGH` (Đỏ), `MEDIUM` (Vàng), `LOW` (Xanh lam).
- Phân tích chất xúc tác (Catalysts) và khuyến nghị hành động tương ứng.

### 5. 🤖 Hội Đồng AI Đa Tác Nhân (AI Multi-Agent Council)
- **Technical Agent**: Phân tích cấu trúc sóng, vùng hỗ trợ/kháng cự, chỉ báo RSI, MACD, MA.
- **Macro Agent**: Đánh giá bối cảnh chu kỳ dòng tiền, tin tức vĩ mô, xu hướng Bitcoin Dominance.
- **Risk Agent**: Kiểm soát rủi ro, cảnh báo đòn bẩy cao, ép buộc Stop Loss chặt chẽ.
- **Validator Agent**: Phản biện các điểm mù, kiểm tra thiên kiến xác nhận (Confirmation Bias).
- **Master Trader**: Tổng hợp tranh luận và đưa ra xác suất thành công (%) kèm phán quyết cuối cùng.

### 6. 💼 Giao Dịch Mô Phỏng (Paper Trading Simulator)
- Tài khoản demo 10,000 USDT khởi điểm.
- Mở/đóng vị thế theo thời gian thực không rủi ro vốn thật.
- Thử nghiệm các giả thuyết giao dịch và học hỏi từ sai lầm.

---

## 🛠 Kiến Trúc Kỹ Thuật (Tech Stack)

| Thành Phần | Công Nghệ Sử Dụng | Vai Trò |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Chart.js | Giao diện hiện đại, responsive, trực quan hóa biểu đồ và hiệu năng cao |
| **Backend** | Node.js (v22+), Express-style native HTTP Server | Xử lý RESTful APIs, phân tích dữ liệu, upload ảnh đa phương tiện |
| **Database** | SQLite (`node:sqlite` DatabaseSync) | Cơ sở dữ liệu nhẹ, không cần cài server rời, tự động tạo bảng |
| **AI Engine** | AGY Multi-Agent Architecture | Động cơ phân tích đa góc nhìn phản biện độc lập |

---

## 📋 Yêu Cầu Hệ Thống

Trước khi bắt đầu cài đặt, máy tính của bạn cần có:
- **Node.js**: Phiên bản `>= 18.0.0` (Khuyến nghị **Node.js 20** hoặc **Node.js 22 LTS**).
  - Kiểm tra phiên bản: `node -v`
- **NPM**: Phiên bản `>= 9.0.0` (đi kèm sẵn với Node.js).
  - Kiểm tra phiên bản: `npm -v`
- **Git**: Đã cài đặt trên máy.

---

## ⚙️ Hướng Dẫn Cài Đặt (Installation)

### Bước 1: Tải mã nguồn về máy (Clone Repository)

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```
*(Nếu bạn đã có sẵn thư mục mã nguồn trên máy, chỉ cần mở terminal tại thư mục đó).*

### Bước 2: Cài đặt các thư viện phụ thuộc (Dependencies)

Chạy lệnh sau để cài đặt toàn bộ package cần thiết:

```bash
npm install
```

Quá trình này sẽ tự động tải các gói phụ thuộc cho cả giao diện Frontend (React, Vite, Tailwind CSS, Chart.js...) và Backend.

---

## 🚀 Hướng Dẫn Khởi Chạy & Sử Dụng (Usage)

Dự án cung cấp 2 phương thức khởi chạy tùy theo nhu cầu của bạn:

---

### 👉 Cách 1: Khởi Chạy Trọn Gói (Production / Full-Stack Độc Lập) — *Khuyến Nghị*

Đây là cách đơn giản nhất: Frontend được build thành tệp tĩnh và được server Node.js phục vụ trực tiếp tại cùng một cổng.

#### 1. Biên dịch Frontend:
```bash
npm run build
```

#### 2. Khởi động máy chủ:
```bash
npm start
```
*(Hoặc dùng `npm run dev`)*

#### 3. Mở trình duyệt và truy cập:
```
http://localhost:3000
```

> **Ghi chú**: Cơ sở dữ liệu SQLite tại `data/dashboard.sqlite` và thư mục tải ảnh `uploads/` sẽ tự động được khởi tạo nếu chưa tồn tại.

---

### 👉 Cách 2: Khởi Chạy Chế Độ Phát Triển (Development Mode với Hot-Reload)

Nếu bạn muốn chỉnh sửa mã nguồn giao diện và xem kết quả tức thì (Hot Module Replacement):

#### Cửa sổ Terminal 1 — Khởi chạy Backend API Server:
```bash
npm run dev
```
*Server API hoạt động tại: `http://localhost:3000`*

#### Cửa sổ Terminal 2 — Khởi chạy Vite Dev Server:
```bash
npm run dev:vite
```
*Giao diện phát triển hoạt động tại: `http://localhost:5173`*

> Vite đã được cấu hình proxy tự động chuyển tiếp các request `/api` và `/uploads` sang `http://localhost:3000`.

---

### 👉 Cách 3: Sử Dụng AI Live Agent Terminal trên dòng lệnh (CLI)

Nếu bạn muốn tương tác trực tiếp với Hội đồng AI thông qua cửa sổ dòng lệnh:

```bash
npm run agent:live
```

---

### 👉 Cách 4: Chạy Kiểm Thử (Run Tests)

Dự án đi kèm bộ kiểm thử toàn diện để kiểm tra tính toàn vẹn của hệ thống:

```bash
# Chạy toàn bộ các bài kiểm thử
npm run test:all

# Hoặc chạy kiểm thử riêng biệt từng phần:
npm run test:modular      # Kiểm thử kiến trúc module & database
npm run test:integration  # Kiểm thử các endpoints API
npm test                  # Kiểm thử toàn diện test_suite
```

---

## 📜 Các Lệnh Scripts Có Sẵn

Dưới đây là bảng tổng hợp các lệnh trong `package.json`:

| Lệnh | Ý Nghĩa / Mục Đích |
| :--- | :--- |
| `npm install` | Cài đặt các thư viện phụ thuộc |
| `npm run build` | Kiểm tra kiểu TypeScript và build giao diện React bằng Vite vào thư mục `dist/` |
| `npm start` | Khởi chạy máy chủ sản xuất (phục vụ cả API và giao diện tại port 3000) |
| `npm run dev` | Khởi chạy máy chủ Backend |
| `npm run dev:watch` | Khởi chạy máy chủ Backend với tính năng tự reload khi sửa file (`node --watch`) |
| `npm run dev:vite` | Khởi chạy Vite Dev Server cho Frontend (`localhost:5173`) |
| `npm run agent:live` | Khởi chạy Terminal tương tác trực tiếp với AI Trader |
| `npm run test:all` | Chạy toàn bộ test suites (E2E, Modular, Integration) |
| `npm run test:modular` | Chạy test kiến trúc modular và SQLite repositories |
| `npm run test:integration` | Chạy test tích hợp các API endpoints |

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
├── Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md # Giáo trình lý thuyết Crypto toàn tập (12 chương)
├── server.js                               # Điểm khởi động máy chủ chính
├── package.json                            # Cấu hình dự án và dependencies
├── tsconfig.json                           # Cấu hình TypeScript cho dự án
├── vite.config.ts                          # Cấu hình Vite & API proxy
├── tailwind.config.js                      # Cấu hình Tailwind CSS
├── index.html                              # File HTML gốc cho ứng dụng React
│
├── server/                                 # MÃ NGUỒN BACKEND MODULAR
│   ├── app.js                              # Tạo HTTP server, middleware & routing
│   ├── config/                             # Cấu hình Database SQLite & Constants
│   ├── controllers/                        # Xử lý logic nghiệp vụ từng tính năng
│   ├── middlewares/                        # Xử lý Static files, CORS, Error handling
│   ├── models/                             # Data Access Layer (Repositories SQLite)
│   │   ├── JournalRepository.js            # Quản lý nhật ký lệnh & audit kỷ luật
│   │   ├── NotesRepository.js              # Quản lý ghi chú cá nhân
│   │   ├── PaperTradeRepository.js         # Quản lý tài khoản & vị thế paper trade
│   │   └── DebateRepository.js             # Lưu trữ lịch sử phân tích AI
│   ├── routes/                             # Khai báo các API routes
│   └── agents/                             # Kiến trúc AGY Multi-Agent Council
│
├── src/                                    # MÃ NGUỒN FRONTEND REACT + TYPESCRIPT
│   ├── App.tsx                             # Component trung tâm quản lý tab điều hướng
│   ├── main.tsx                            # Điểm gắn kết React vào DOM
│   ├── index.css                           # Style toàn cục & cấu hình Tailwind
│   ├── types/                              # Định nghĩa kiểu dữ liệu TypeScript
│   └── components/                         # CÁC MODULE GIAO DIỆN
│       ├── theory/                         # Giao diện đọc sách lý thuyết & từ điển
│       ├── practice/                       # Giao diện trắc nghiệm tình huống
│       ├── journal/                        # Giao diện nhật ký lệnh, upload ảnh & audit kỷ luật
│       ├── news/                           # Giao diện AGY Terminal & phân tích tin tức
│       ├── aitrader/                       # Giao diện Hội đồng AI phản biện đa tác nhân
│       ├── humantrader/                    # Giao diện Paper Trading mô phỏng & dự đoán
│       └── common/                         # Các components dùng chung (Modal, Button, Card...)
│
├── data/                                   # Nơi lưu trữ file CSDL SQLite (dashboard.sqlite)
└── uploads/                                # Nơi lưu trữ ảnh chụp màn hình biểu đồ người dùng tải lên
```

---

## 📡 Tài Liệu API Endpoints

Hệ thống cung cấp sẵn các REST API phục vụ cho giao diện người dùng:

| Phương Thức | Đường Dẫn | Chức Năng |
| :--- | :--- | :--- |
| `GET` | `/api/theory` | Lấy danh mục 12 chương lý thuyết và từ điển thuật ngữ |
| `GET` | `/api/theory/chapter/:id` | Lấy nội dung chi tiết của một chương |
| `GET` | `/api/journal` | Lấy danh sách các lệnh đã ghi trong nhật ký |
| `POST` | `/api/journal` | Thêm mới một nhật ký giao dịch |
| `DELETE` | `/api/journal/:id` | Xóa một lệnh khỏi nhật ký |
| `POST` | `/api/upload` | Tải lên ảnh chụp màn hình biểu đồ (Base64) |
| `GET` | `/api/journal/stats` | Thống kê hiệu suất (Winrate, PnL, Tỷ lệ R:R) |
| `GET` | `/api/paper-trading/account` | Lấy số dư và trạng thái tài khoản Paper Trading |
| `POST` | `/api/paper-trading/position` | Mở vị thế giao dịch mô phỏng mới |
| `POST` | `/api/ai/debate` | Kích hoạt hội đồng AI tranh luận và phán quyết về một đồng coin |
| `GET` | `/api/news` | Lấy danh sách tin tức thị trường và điểm tác động |

---

## 🔧 Khắc Phục Sự Cố Thường Gặp (Troubleshooting)

### 1. Lỗi cổng đã được sử dụng (`EADDRINUSE: address already in use :::3000`)
- **Nguyên nhân**: Một tiến trình khác (hoặc server cũ) đang chạy ngầm trên cổng 3000.
- **Cách khắc phục**:
  - **Cách 1 - Giải phóng cổng 3000**:
    ```bash
    kill -9 $(lsof -ti:3000)
    ```
  - **Cách 2 - Khởi chạy server trên cổng khác**:
    ```bash
    PORT=3005 npm start
    ```

### 2. Giao diện báo lỗi không tải được API (`Network Error` hoặc `Failed to fetch`)
- Hãy đảm bảo bạn đã khởi động Backend server (`npm start` hoặc `npm run dev`) trước khi truy cập hoặc sử dụng Vite dev server.

### 3. Ảnh upload không hiển thị
- Kiểm tra thư mục `uploads/` đã được tạo trong dự án chưa (hệ thống sẽ tự động tạo thư mục này khi server khởi động).

---

## 🤝 Đóng Góp & Bản Quyền

Dự án được xây dựng phục vụ mục đích học tập, rèn luyện tư duy giao dịch kỷ luật và ứng dụng trí tuệ nhân tạo hỗ trợ ra quyết định tài chính. Mọi đóng góp (Pull Request, Báo cáo lỗi) đều được hoan nghênh!

*Chúc bạn giao dịch kỷ luật và thành công trên thị trường crypto!* 🚀
