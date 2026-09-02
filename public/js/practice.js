// --- MODULE 2: INTERACTIVE TRADING PRACTICE & CASE STUDIES (30 CASES ACROSS 12 CHAPTERS) ---
// 100% Comprehensive Practical Scenarios, Whale Manipulation Traps & SMC Framework
// Built directly from the official rules of 'Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md'

let practiceStats = {
  total: 0,
  correct: 0,
  streak: 0,
  answered: {},
  chapterStats: {}
};

const practiceScenarios = [
  {
    "id": 1,
    "chapterId": 5,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "whale_traps",
    "categoryName": "🐋 Bẫy Cá Mập & Quét Sàn (Chương 5 & 9)",
    "title": "Case Study 1: Giải Mã Cú Quét Râu Đáy SFP (Swing Failure Pattern) Tại Vùng EQL",
    "description": "<b>Bối cảnh thực tế:</b> Giá Bitcoin sau chuỗi ngày điều chỉnh đang tạo <b>2 đáy bằng phẳng (Equal Lows - EQL) tại mốc $59,000</b>. Đám đông Retail Traders hào hứng mở lệnh Mua và đặt toàn bộ lệnh Dừng Lỗ (Stop Loss) ngay dưới mức $58,800 - $58,900.<br><br>Đột nhiên, một cây nến 15m đâm xuyên thủng hỗ trợ, rơi thẳng xuống <b>$57,600</b> (kích hoạt quét sạch toàn bộ bãi Stop Loss). Tuy nhiên, chỉ 10 phút sau, lực mua khổng lồ xuất hiện kéo giá rút chân dựng đứng và đóng cửa nến 15m tại <b>$59,400</b> (bên trong vùng hỗ trợ) với <b>Volume cao gấp 3.5 lần trung bình</b>.",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        {
          "open": 63500,
          "high": 63800,
          "low": 60800,
          "close": 61000,
          "vol": 180
        },
        {
          "open": 61000,
          "high": 61200,
          "low": 58950,
          "close": 59000,
          "vol": 240,
          "label": "Đáy 1 ($59k)"
        },
        {
          "open": 59000,
          "high": 61200,
          "low": 59100,
          "close": 60800,
          "vol": 200
        },
        {
          "open": 60800,
          "high": 61000,
          "low": 58980,
          "close": 59020,
          "vol": 220,
          "label": "Đáy 2 EQL ($59k)"
        },
        {
          "open": 59020,
          "high": 59600,
          "low": 57600,
          "close": 59400,
          "vol": 780,
          "label": "QUÉT SFP 🩸⚡",
          "labelColor": "#00c076"
        },
        {
          "open": 59400,
          "high": 62200,
          "low": 59350,
          "close": 62000,
          "vol": 540,
          "label": "BÙNG NỔ TĂNG 🚀",
          "labelColor": "#38bdf8"
        },
        {
          "open": 62000,
          "high": 64800,
          "low": 61900,
          "close": 64500,
          "vol": 460
        }
      ],
      "zones": [
        {
          "type": "support",
          "top": 59150,
          "bottom": 58850,
          "label": "BÃI STOP LOSS EQL (BỂ THANH KHOẢN SSL)"
        }
      ],
      "tradeSetup": {
        "entry": 59450,
        "sl": 57500,
        "tp": 64500,
        "startIndex": 4
      }
    },
    "question": "Bản chất hành vi của Cá mập (Market Maker) trong pha này là gì và kế hoạch giao dịch chuẩn xác nhất là gì?",
    "options": [
      {
        "id": "A",
        "text": "Thủng đáy $59,000 là tín hiệu thị trường sập không phanh ➔ Vào lệnh Bán khống (Short) đuổi theo đà giảm ngay khi thấy nến đỏ đâm xuống $57,600.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Cá mập cố tình tạo 2 đáy EQL để bẫy Stop Loss. Cú đâm sâu rồi rút râu đóng nến bên trong biên là mô hình SFP (Quét thanh khoản gom hàng) ➔ Mở lệnh Long khi nến 15m đóng cửa ($59,450), Stop Loss đặt tại $57,500 (dưới râu nến quét), Take Profit tại đỉnh cũ $64,500 (R:R ≈ 1 : 2.6).",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Đây là nến Doji lưỡng lự, tuyệt đối không có tín hiệu mua bán nào.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Chờ giá rơi về $30,000 mới cân nhắc mua.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 5.3, 5.4 & Chương 9.4 - Giáo Trình Crypto)</b><br>• <b>Dấu hiệu nhận biết SFP Đáy:</b> Giá đâm thủng đáy cũ nhưng KHÔNG ĐÓNG CỬA ĐƯỢC DƯỚI ĐÁY mà rút râu dài kèm Volume đột biến.<br>• <b>Kỷ luật vào lệnh:</b> Chỉ bóp cò khi cây nến 15m ĐÃ ĐÓNG CỬA thành công bên trên mức cản $59,000!"
  },
  {
    "id": 2,
    "chapterId": 7,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "whale_traps",
    "categoryName": "🐋 Bẫy Cá Mập & Quét Sàn (Chương 7 & 9)",
    "title": "Case Study 2: Bẫy Judas Swing & Bẫy Thanh Khoản Mua (BSL) Giờ Ra Tin CPI",
    "description": "<b>Bối cảnh:</b> Đúng 19:30 tối giờ VN công bố CPI tốt. Nến 5m giật dựng cột từ $64,000 bắn vượt qua đỉnh cũ $65,000 lên tận $65,800. Đám đông bấm Buy đuổi. 5 phút sau OI giảm và nến Bearish Engulfing khổng lồ xả thẳng về $63,600 nuốt trọn nến tăng.",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        {
          "open": 63600,
          "high": 64200,
          "low": 63500,
          "close": 64000,
          "vol": 140
        },
        {
          "open": 64000,
          "high": 65000,
          "low": 63900,
          "close": 64800,
          "vol": 210,
          "label": "Đỉnh Cũ $65k"
        },
        {
          "open": 64800,
          "high": 65800,
          "low": 64700,
          "close": 65600,
          "vol": 490,
          "label": "BẪY DỤ LONG 💥",
          "labelColor": "#f59e0b"
        },
        {
          "open": 65600,
          "high": 65700,
          "low": 63500,
          "close": 63700,
          "vol": 890,
          "label": "JUDAS DUMP 🩸",
          "labelColor": "#ff3b69"
        },
        {
          "open": 63700,
          "high": 63800,
          "low": 62200,
          "close": 62400,
          "vol": 520,
          "label": "SẬP SÂU ↘"
        }
      ],
      "zones": [
        {
          "type": "resistance",
          "top": 65200,
          "bottom": 64800,
          "label": "VÙNG KHÁNG CỰ ĐỈNH (BSL)"
        }
      ],
      "tradeSetup": {
        "entry": 63700,
        "sl": 65900,
        "tp": 59500,
        "startIndex": 3
      }
    },
    "question": "Hiện tượng trên là chiêu trò gì của Market Maker và Pro Trader sẽ hành động như thế nào?",
    "options": [
      {
        "id": "A",
        "text": "Tin tốt thì giá chắc chắn sẽ lên $100,000 ➔ Tiếp tục gồng lệnh Mua.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Bẫy Judas Swing: Cá mập dùng tin tốt để xả hàng giá cao ➔ Chờ nến xác nhận đóng cửa dưới đỉnh cũ để MỞ SHORT thuận xu hướng giảm (Entry $63,700, SL $65,900, TP $59,500).",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Do sàn bị lỗi máy chủ.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Không làm gì cả.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 3.2, 7.4 & 9.4 - Bẫy Judas Swing)</b><br>• Không bao giờ vào lệnh trong 15 phút đầu tiên sau tin vĩ mô!"
  },
  {
    "id": 3,
    "chapterId": 8,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "derivatives_data",
    "categoryName": "📊 Dữ Liệu Phái Sinh & Squeeze (Chương 8 & 9)",
    "title": "Case Study 3: Bẫy Funding Rate Âm Kỷ Lục & Tín Hiệu Săn Sóng Short Squeeze",
    "description": "<b>Bối cảnh:</b> SOL đi ngang $130 - $132 sau nhịp giảm. Mạng xã hội tràn ngập FUD, đám đông Short x20-x50. Funding Rate rớt sâu -0.18%/8h, Open Interest (OI) tăng vọt +$200M nhưng giá SOL không thủng $130!",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        {
          "open": 152,
          "high": 154,
          "low": 138,
          "close": 140,
          "vol": 220
        },
        {
          "open": 140,
          "high": 142,
          "low": 130,
          "close": 132,
          "vol": 310,
          "label": "Funding -0.18% ⚠️"
        },
        {
          "open": 132,
          "high": 133.5,
          "low": 129.5,
          "close": 131,
          "vol": 340,
          "label": "OI Tăng Đột Biến"
        },
        {
          "open": 131,
          "high": 149,
          "low": 130.8,
          "close": 147,
          "vol": 920,
          "label": "SHORT SQUEEZE 🚀",
          "labelColor": "#00c076"
        },
        {
          "open": 147,
          "high": 164,
          "low": 146,
          "close": 162,
          "vol": 780
        }
      ],
      "zones": [
        {
          "type": "support",
          "top": 132,
          "bottom": 129,
          "label": "VÙNG NÉN ĐÒN BẨY SHORT"
        }
      ],
      "tradeSetup": {
        "entry": 132.5,
        "sl": 128.5,
        "tp": 160,
        "startIndex": 2
      }
    },
    "question": "Sự bất thường giữa Funding Rate âm sâu, OI tăng và Giá đi ngang báo hiệu điều gì?",
    "options": [
      {
        "id": "A",
        "text": "Funding âm chứng tỏ phe Short đang áp đảo ➔ Nhắm mắt mở thêm lệnh Short.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Tín hiệu Nén lò xo chuẩn bị SHORT SQUEEZE: Khi Cá mập bơm lệnh Mua, chuỗi thanh lý Short sẽ kích hoạt lệnh Market Buy đẩy giá bay thẳng đứng ➔ Mở Long đón đầu quanh $132, SL $128.5, TP $158 - $162 (R:R = 1 : 6.8)!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "SOL sẽ về 0 USD.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Funding không ảnh hưởng tới giá.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 8.3 & 9.4 - Phái Sinh & Squeeze)</b><br>• Lệnh cắt lỗ của phe Short là lệnh Market Buy đẩy giá vọt lên thẳng đứng."
  },
  {
    "id": 4,
    "chapterId": 9,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "macro_cycle",
    "categoryName": "🌊 Vĩ Mô & Chu Kỳ Dòng Tiền (Chương 9.2)",
    "title": "Case Study 4: Xử Lý Danh Mục Khi Bitcoin Dominance (BTC.D) Đột Phá Kháng Cự",
    "description": "<b>Bối cảnh:</b> Giá Bitcoin vượt đỉnh $70k lên $75k. Cùng lúc BTC.D vượt cản 55% lên 62%. Danh mục có 80% Altcoin bị giảm -15% dù bảng điện BTC xanh ngát.",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        {
          "open": 65000,
          "high": 68000,
          "low": 64500,
          "close": 67500,
          "vol": 310
        },
        {
          "open": 67500,
          "high": 71000,
          "low": 67000,
          "close": 70500,
          "vol": 450,
          "label": "BTC.D VƯỢT 55% ⚠️"
        },
        {
          "open": 70500,
          "high": 75500,
          "low": 70000,
          "close": 75000,
          "vol": 680,
          "label": "BTC.D 62% (HÚT MÁU)"
        },
        {
          "open": 75000,
          "high": 76000,
          "low": 73500,
          "close": 74200,
          "vol": 410,
          "label": "Altcoin Đỏ Lửa 🩸"
        }
      ]
    },
    "question": "Dòng tiền thị trường đang nằm ở pha nào và giải pháp tái cơ cấu danh mục chuẩn nhất là gì?",
    "options": [
      {
        "id": "A",
        "text": "Thị trường đang vào Altseason ➔ Vay tiền mua Altcoin.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Thị trường đang ở PHA 1 (Dòng tiền chỉ tập trung kéo BTC, Altcoin bị hút máu) ➔ Giữ chặt BTC và USDT; Chờ BTC đi ngang lập đỉnh và BTC.D đảo chiều giảm mới đón MÙA ALTCOIN (Pha 3)!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Bán cắt lỗ toàn bộ nghỉ chơi.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Short BTC x100 gỡ lỗ.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.2 - Chu Kỳ Luân Chuyển Dòng Tiền 5 Pha)</b><br>• Dòng vốn tổ chức đổ vào BTC trước. Altseason chỉ nổ rộ khi BTC.D bắt đầu gãy giảm!"
  },
  {
    "id": 5,
    "chapterId": 9,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "whale_traps",
    "categoryName": "🐋 Bẫy Cá Mập & Quét Sàn (Chương 3 & 9)",
    "title": "Case Study 5: Bóc Trần Chiêu Trò Kê Lệnh Ảo (Spoofing) & Phân Kỳ Tích Lũy CVD",
    "description": "<b>Bối cảnh:</b> Tường Buy Limit 2,500 BTC tại $61,000 bị hủy khi giá rơi sát mép, khiến giá trượt về $60,400. Retail bán tháo Market nhưng chỉ báo CVD lại tạo Đáy cao hơn (HL).",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        {
          "open": 62800,
          "high": 63000,
          "low": 61800,
          "close": 62000,
          "vol": 190
        },
        {
          "open": 62000,
          "high": 62200,
          "low": 60950,
          "close": 61050,
          "vol": 240,
          "label": "Tường Ảo $61k"
        },
        {
          "open": 61050,
          "high": 61100,
          "low": 60300,
          "close": 60400,
          "vol": 690,
          "label": "RÚT TƯỜNG SẬP 🩸",
          "labelColor": "#ff3b69"
        },
        {
          "open": 60400,
          "high": 62500,
          "low": 60350,
          "close": 62300,
          "vol": 580,
          "label": "CVD TĂNG (ABSORPTION) ⭐",
          "labelColor": "#00c076"
        },
        {
          "open": 62300,
          "high": 64200,
          "low": 62200,
          "close": 64000,
          "vol": 460
        }
      ],
      "zones": [
        {
          "type": "support",
          "top": 60600,
          "bottom": 60200,
          "label": "VÙNG CÁ MẬP HẤP THỤ GOM HÀNG"
        }
      ],
      "tradeSetup": {
        "entry": 62350,
        "sl": 60200,
        "tp": 65500,
        "startIndex": 3
      }
    },
    "question": "Chiêu thức Cá mập đã áp dụng là gì và ý nghĩa của việc Phân kỳ CVD tăng là gì?",
    "options": [
      {
        "id": "A",
        "text": "Sàn bị hack.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Tường 2,500 BTC là bẫy Spoofing để xả hàng; Cú rơi về $60,400 kèm phân kỳ CVD tăng chứng minh Cá mập đang âm thầm hấp thụ toàn bộ lực bán tháo (Absorption) ➔ Tín hiệu gom hàng đáy uy tín!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "CVD tăng là in thêm coin.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Short tại $60,400.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 3.1 & 9.4)</b><br>• Phân kỳ CVD (Absorption) phản ánh dòng tiền lớn đang hấp thụ toàn bộ lực xả của đám đông."
  },
  {
    "id": 6,
    "chapterId": 10,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "risk_execution",
    "categoryName": "🛡️ Quản Trị Rủi Ro Futures (Chương 9.4 & 10)",
    "title": "Case Study 6: Xử Lý Bẫy Giãn Spread & Quét Râu Ảo Futures Ban Đêm",
    "description": "<b>Bối cảnh:</b> Long ETH tại $2,600, SL $2,540. Lúc 03:30 sáng, giá Spot chỉ giảm về $2,548 rồi bay $2,800. Tuy nhiên tài khoản Futures bị cắn SL do giật râu ảo cục bộ $2,532!",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        {
          "open": 2680,
          "high": 2700,
          "low": 2590,
          "close": 2600,
          "vol": 120
        },
        {
          "open": 2600,
          "high": 2610,
          "low": 2548,
          "close": 2580,
          "vol": 140,
          "label": "Spot Đáy $2,548"
        },
        {
          "open": 2580,
          "high": 2590,
          "low": 2532,
          "close": 2575,
          "vol": 390,
          "label": "FUTURES QUÉT $2,532 🩸",
          "labelColor": "#ff3b69"
        },
        {
          "open": 2575,
          "high": 2740,
          "low": 2570,
          "close": 2720,
          "vol": 480,
          "label": "BAY $2,800 🚀"
        }
      ]
    },
    "question": "Giải pháp phòng vệ sống còn trên sàn Futures là gì?",
    "options": [
      {
        "id": "A",
        "text": "Sàn hack tài khoản.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Luôn chuyển loại kích hoạt Stop Loss sang MARK PRICE và đặt SL lùi xa các mốc số tròn 0.3% - 0.5% để tạo vùng đệm an toàn!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Không bao giờ cài SL nữa.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Đánh đòn bẩy x100.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.4 & Chương 10)</b><br>• Mark Price chống râu ảo thao túng giá trên phái sinh."
  },
  {
    "id": 7,
    "chapterId": 6,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "macro_cycle",
    "categoryName": "⏱️ Đa Khung Thời Gian & SMC (Chương 6 & 7)",
    "title": "Case Study 7: Bẫy Phá Vỡ Cấu Trúc Khung Nhỏ (Minor ChoCH) Chạm Cản 4H",
    "description": "<b>Bối cảnh:</b> Khung 4H là Downtrend mạnh. Khung 15m vượt đỉnh tạo Bullish ChoCH. Nhiều nhóm Long đuổi. Ngay phía trên +0.8% là Bearish Order Block 4H!",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        {
          "open": 66000,
          "high": 66200,
          "low": 62000,
          "close": 62200,
          "vol": 350,
          "label": "Downtrend 4H"
        },
        {
          "open": 62200,
          "high": 63500,
          "low": 62100,
          "close": 63200,
          "vol": 210
        },
        {
          "open": 63200,
          "high": 64800,
          "low": 63000,
          "close": 64600,
          "vol": 290,
          "label": "15m ChoCH Tăng ⭐"
        },
        {
          "open": 64600,
          "high": 65100,
          "low": 64400,
          "close": 64500,
          "vol": 480,
          "label": "Chạm Bearish OB 4H"
        },
        {
          "open": 64500,
          "high": 64600,
          "low": 61000,
          "close": 61200,
          "vol": 810,
          "label": "SẬP THEO TREND 4H 🩸",
          "labelColor": "#ff3b69"
        }
      ],
      "zones": [
        {
          "type": "resistance",
          "top": 65200,
          "bottom": 64700,
          "label": "BEARISH ORDER BLOCK 4H"
        }
      ],
      "tradeSetup": {
        "entry": 64500,
        "sl": 65400,
        "tp": 60500,
        "startIndex": 3
      }
    },
    "question": "Tư duy đúng đắn của Pro Trader khi nhìn đa khung thời gian trong tình huống này là gì?",
    "options": [
      {
        "id": "A",
        "text": "15m ChoCH tăng là all in Long.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Khung nhỏ (15m) phải phục tùng khung lớn (4H). Nhịp tăng 15m chỉ là sóng hồi chạm vùng bán 4H ➔ Chờ nến đảo chiều 15m chạm cản 4H để MỞ SHORT thuận xu hướng chính (Entry $64,500, SL $65,400, TP $60,500)!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Tắt chart 4H đi.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Đánh cả Long và Short.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 6.3 & 7.5 - Top-Down Strategy)</b><br>• Không bao giờ giao dịch ngược xu hướng khung lớn 4H!"
  },
  {
    "id": 8,
    "chapterId": 10,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "risk_execution",
    "categoryName": "🧮 Quản Trị Vốn & Trượt Giá (Chương 10)",
    "title": "Case Study 8: Bài Toán Xử Lý Khủng Hoảng Trượt Giá (Slippage) Altcoin Rác",
    "description": "<b>Bối cảnh:</b> Vốn $5,000. Long Memecoin đòn bẩy x15 (Vị thế $30,000), SL 3% ($900 dự kiến). Khi xả hàng, lệnh Market SL bị trượt giá sâu tới 8.5% mới khớp được khiến tài khoản lỗ -$2,550 (mất hơn 51% vốn)!",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        {
          "open": 0.12,
          "high": 0.128,
          "low": 0.118,
          "close": 0.125,
          "vol": 200,
          "label": "Entry $0.125"
        },
        {
          "open": 0.125,
          "high": 0.126,
          "low": 0.121,
          "close": 0.122,
          "vol": 180,
          "label": "SL Dự Tính (-3%)"
        },
        {
          "open": 0.122,
          "high": 0.123,
          "low": 0.11,
          "close": 0.114,
          "vol": 950,
          "label": "TRƯỢT KHỚP (-8.5%) 🩸",
          "labelColor": "#ff3b69"
        }
      ]
    },
    "question": "Lỗi sai chí mạng của trader trong pha này là gì và công thức khắc phục chuẩn xác là gì?",
    "options": [
      {
        "id": "A",
        "text": "Lỗi sàn lừa đảo.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Vi phạm quy tắc quản trị vốn: Dùng đòn bẩy quá cao (x15) trên coin thanh khoản mỏng ➔ Khắc phục: Với coin rác, mạo hiểm tối đa 0.5% vốn ($25), đòn bẩy tối đa x2-x3 (hoặc chỉ mua Spot)!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Lần sau đánh x50.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Chỉ chơi theo nhóm VIP.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 10.1 & 10.3)</b><br>• Trượt giá có thể khuếch đại rủi ro gấp nhiều lần trên các coin thanh khoản mỏng."
  },
  {
    "id": 9,
    "chapterId": 9,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "macro_cycle",
    "categoryName": "🌊 Cấu Trúc Wyckoff & Tích Lũy (Chương 9.3)",
    "title": "Case Study 9: Nhận Diện Pha Rũ Bỏ Cuối Cùng Wyckoff Spring (Phase C)",
    "description": "<b>Bối cảnh:</b> Coin Layer 1 đi ngang $20 - $25 suốt 4 tuần. Nến đỏ xả thủng $20 về $17.80 ép cắt lỗ. Phiên sau nến xanh kéo ngược trở lại đóng trong hộp tích lũy ($21.80) với Volume cực đại!",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        {
          "open": 22,
          "high": 24,
          "low": 21,
          "close": 23,
          "vol": 140
        },
        {
          "open": 23,
          "high": 25,
          "low": 22.5,
          "close": 24.5,
          "vol": 160,
          "label": "Kháng Cự $25"
        },
        {
          "open": 24.5,
          "high": 24.8,
          "low": 20.2,
          "close": 20.4,
          "vol": 190,
          "label": "Hỗ Trợ $20"
        },
        {
          "open": 20.4,
          "high": 20.8,
          "low": 17.8,
          "close": 18.2,
          "vol": 680,
          "label": "SPRING RŨ BỎ 🩸",
          "labelColor": "#ef4444"
        },
        {
          "open": 18.2,
          "high": 22.2,
          "low": 18.1,
          "close": 21.8,
          "vol": 720,
          "label": "QUAY LẠI HỘP ⭐",
          "labelColor": "#00c076"
        },
        {
          "open": 21.8,
          "high": 28.5,
          "low": 21.5,
          "close": 28,
          "vol": 890,
          "label": "SÓNG MARKUP 🚀"
        }
      ],
      "zones": [
        {
          "type": "support",
          "top": 21,
          "bottom": 20,
          "label": "BIÊN DƯỚI HỘP TÍCH LŨY"
        }
      ],
      "tradeSetup": {
        "entry": 22,
        "sl": 17.5,
        "tp": 32,
        "startIndex": 4
      }
    },
    "question": "Đây là hiện tượng kinh điển gì theo phương pháp luận Wyckoff và kế hoạch vào lệnh ra sao?",
    "options": [
      {
        "id": "A",
        "text": "Thủng $20 là sập ➔ Short đuổi.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "PHA SPRING (Pha C Wyckoff): Cú rũ bỏ cuối cùng trước sóng Markup ➔ Mở Long khi nến tái tích lũy đóng trong Trading Range ($21.8 - $22.0), SL $17.5 (dưới đáy Spring), TP $25 và $32 (R:R >= 1:5)!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Thị trường mùa đông.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Wyckoff không đúng.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.3 - Wyckoff)</b><br>• Spring là cơ hội săn R:R cao nhất trong chu kỳ tích lũy!"
  },
  {
    "id": 10,
    "chapterId": 10,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "risk_execution",
    "categoryName": "🧮 Quản Trị Vị Thế & Tâm Lý (Chương 10.5)",
    "title": "Case Study 10: Xây Dựng Kế Hoạch Chốt Lời Từng Phần (DCA Out) & Trailing Stop",
    "description": "<b>Bối cảnh:</b> Mua BTC $54k, giá tăng lên $96k (lãi +77.7%). Fear & Greed đạt 92 (Cực kỳ tham lam). Mạng xã hội hô hào $150k ai bán là mất hàng. Bạn phân vân không biết nên làm gì?",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        {
          "open": 54000,
          "high": 58000,
          "low": 53500,
          "close": 57000,
          "vol": 240,
          "label": "Entry $54k"
        },
        {
          "open": 57000,
          "high": 82000,
          "low": 56500,
          "close": 81000,
          "vol": 480
        },
        {
          "open": 81000,
          "high": 96000,
          "low": 80500,
          "close": 95500,
          "vol": 780,
          "label": "ĐỈNH $96K ⚠️",
          "labelColor": "#f59e0b"
        }
      ]
    },
    "question": "Chiến lược quản trị vị thế và chốt lời thông minh, kỷ luật nhất của Pro Trader là gì?",
    "options": [
      {
        "id": "A",
        "text": "Gồng 100% không chốt đồng nào, vay thêm mua ở $96k.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Bán sạch 100% tiền mặt ngay lập tức.",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Chiến lược DCA Out 3 Bước: Chốt trước 30-40% ở $96k khóa tiền thật; Dời SL bảo vệ cho 60% còn lại về mức $88,000 (đáy 4H gần nhất) để thả trôi lợi nhuận không rủi ro!",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "Chuyển toàn bộ lãi sang mua memecoin.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ C (Theo Chương 10.4 & 10.5)</b><br>• Tiền chỉ là của bạn khi bạn đã bấm chốt lời!"
  },
  {
    "id": 11,
    "chapterId": 1,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "blockchain_basics",
    "categoryName": "⛓️ Bản Chất Blockchain (Chương 1)",
    "title": "Case Study 11: Nhận Diện Tính Bất Biến Của Sổ Cái & Giao Dịch Không Thể Thu Hồi",
    "description": "<b>Bối cảnh:</b> Người dùng gửi nhầm 0.5 BTC sang địa chỉ ví người lạ. Sau 3 xác nhận block, người này yêu cầu sàn hoàn tiền.",
    "chartConfig": null,
    "question": "Theo nguyên lý Blockchain, yêu cầu này có thực hiện được không?",
    "options": [
      {
        "id": "A",
        "text": "Hủy được nếu liên hệ sàn trong 24h.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "KHÔNG THỂ HỦY HOẶC ĐẢO NGƯỢC: Tính bất biến (Immutability) của Blockchain khiến không ai có quyền đảo ngược giao dịch khi đã được các node xác thực.",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Ngân hàng can thiệp thu hồi được.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Tắt mạng điện thoại để hoàn tiền.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 1.2)</b><br>• Blockchain là sổ cái bất biến, một khi đã xác nhận là không thể đảo ngược!"
  },
  {
    "id": 12,
    "chapterId": 1,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "blockchain_basics",
    "categoryName": "⛓️ Cơ Chế Đồng Thuận (Chương 1)",
    "title": "Case Study 12: Tấn Công 51% & Rủi Ro Double-Spending Trên Mạng Nhỏ",
    "description": "<b>Bối cảnh:</b> Một chain nhỏ bị nhóm lạ kiểm soát 53% hashrate để thực hiện double-spending.",
    "chartConfig": null,
    "question": "Biện pháp bảo vệ cốt lõi của người tham gia thị trường trước nguy cơ này là gì?",
    "options": [
      {
        "id": "A",
        "text": "Chỉ giao dịch và nắm giữ các mạng Blockchain có quy mô hashrate khổng lồ (như Bitcoin, Ethereum) hoặc yêu cầu số block xác nhận cao (30-60 confirmations) với chain nhỏ.",
        "isCorrect": true
      },
      {
        "id": "B",
        "text": "Nạp thêm tiền bắt đáy khi bị tấn công 51%.",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Bắt chính phủ bồi thường.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Tấn công 51% là tin giả.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ A (Theo Chương 1.2 & 2.1)</b><br>• Mạng càng lớn và phi tập trung thì chi phí tấn công 51% càng bất khả thi."
  },
  {
    "id": 13,
    "chapterId": 2,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "wallet_security",
    "categoryName": "🛡️ Bảo Mật Ví & Seed Phrase (Chương 2)",
    "title": "Case Study 13: Bẫy Phishing Seed Phrase Giả Mạo Hỗ Trợ Kỹ Thuật",
    "description": "<b>Bối cảnh:</b> Một admin Telegram tự xưng hỗ trợ MetaMask yêu cầu bạn nhập 12 từ khóa bí mật để sửa lỗi pending giao dịch.",
    "chartConfig": null,
    "question": "Hành động đúng đắn và an toàn nhất là gì?",
    "options": [
      {
        "id": "A",
        "text": "Cung cấp 12 từ khóa để sửa lỗi nhanh.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "TUYỆT ĐỐI KHÔNG CUNG CẤP: Không có admin hay đội ngũ hỗ trợ nào được phép xin 12 từ khóa Seed Phrase. Đây là lừa đảo 100% rút sạch tài sản!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Chỉ gửi 6 từ đầu.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Chụp ảnh màn hình gửi qua.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 2.2)</b><br>• Lộ 12 từ khóa Seed Phrase = Mất sạch toàn bộ tài sản!"
  },
  {
    "id": 14,
    "chapterId": 2,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "wallet_security",
    "categoryName": "🪙 Spot vs Futures & Đòn Bẩy (Chương 2)",
    "title": "Case Study 14: Thảm Họa Đòn Bẩy Cao x50 Khi Giao Dịch Futures Thay Vì Spot",
    "description": "<b>Bối cảnh:</b> Vốn $2,000, mở vị thế Long Futures đòn bẩy x50 (quy mô $100,000). Giá chỉ cần giật giảm -1.8% trước khi bay lên.",
    "chartConfig": null,
    "question": "Hậu quả đối với tài khoản là gì?",
    "options": [
      {
        "id": "A",
        "text": "Vẫn an toàn và lãi lớn khi giá bay lên.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "BỊ THANH LÝ CHÁY SẠCH 100% VỐN: Với đòn bẩy x50, biên độ chịu giá chỉ 1.8%-2.0%. Khi đã cháy tài khoản về 0 thì giá bay sau đó vô nghĩa!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Sàn tự bù tiền cho vay gồng.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Chỉ mất $36.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 2.3)</b><br>• Đòn bẩy cao biến biến động nhỏ thành thảm họa cháy sạch vốn."
  },
  {
    "id": 15,
    "chapterId": 3,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "orderbook_liquidity",
    "categoryName": "📊 Khớp Lệnh & Bể Thanh Khoản (Chương 3)",
    "title": "Case Study 15: Phân Biệt Lệnh Limit vs Lệnh Market Trong Pha Biến Động Lớn",
    "description": "<b>Bối cảnh:</b> Trong pha biến động mạnh, trader bấm lệnh Market Buy $50,000 USD thay vì lệnh Limit.",
    "chartConfig": null,
    "question": "Hậu quả trượt giá (Slippage) xảy ra là gì?",
    "options": [
      {
        "id": "A",
        "text": "Khớp chính xác mức giá hiển thị lúc bấm.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Lệnh Market quét qua các tầng giá bán mỏng và khớp ở mức giá cao bất lợi trên đỉnh sổ lệnh do hiện tượng trượt giá!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Sàn hoàn tiền trượt giá.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Lệnh bị hủy.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 3.1)</b><br>• Khi thị trường biến động mạnh, luôn ưu tiên dùng lệnh Limit."
  },
  {
    "id": 16,
    "chapterId": 3,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "orderbook_liquidity",
    "categoryName": "📊 Bể Thanh Khoản BSL/SSL (Chương 3)",
    "title": "Case Study 16: Bẫy Bể Thanh Khoản Buy-Side Liquidity (BSL) Tại Đỉnh Cũ",
    "description": "<b>Bối cảnh:</b> Vùng đỉnh $68,000 tập trung nhiều lệnh Buy Stop. Cá mập đẩy nhẹ lên $68,400 để khớp thanh khoản rồi xả mạnh.",
    "chartConfig": null,
    "question": "Bản chất dòng tiền ở vùng $68,400 là gì?",
    "options": [
      {
        "id": "A",
        "text": "Cá mập mua gom thêm.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Cá mập dùng thanh khoản mua bắt buộc của phe Short (BSL) làm đối ứng để phân phối chốt lời khối lượng lớn ở giá đỉnh!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Lỗi đường truyền.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Tín hiệu mua tất tay.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 3.2 & 9.4)</b><br>• Bể thanh khoản đỉnh BSL là nơi Cá mập xả hàng giá cao cho retail."
  },
  {
    "id": 17,
    "chapterId": 4,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "candlestick_patterns",
    "categoryName": "🕯️ Mô Hình Nến Đảo Chiều (Chương 4)",
    "title": "Case Study 17: Cụm Nến Sao Mai (Morning Star) Tại Vùng Hỗ Trợ Khung 1H",
    "description": "<b>Bối cảnh:</b> Xuất hiện Nến 1 đỏ dài, Nến 2 Doji tại hỗ trợ, Nến 3 xanh lớn vượt quá 65% thân nến 1.",
    "chartConfig": null,
    "question": "Chiến lược vào lệnh chuẩn mực theo mô hình Morning Star là gì?",
    "options": [
      {
        "id": "A",
        "text": "Vào Short ngay.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Mở Long khi Nến 3 đóng cửa xác nhận, Stop Loss dưới đáy nến Doji, Take Profit tại kháng cự đỉnh cũ (R:R >= 1:2).",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Chờ giá giảm 50% mới vào.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Không đặt Stop Loss.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 4.2)</b><br>• Cụm Morning Star báo hiệu phe Bò đã kiểm soát lại thị trường."
  },
  {
    "id": 18,
    "chapterId": 4,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "candlestick_patterns",
    "categoryName": "🕯️ Nến Shooting Star & Bẫy Đỉnh (Chương 4)",
    "title": "Case Study 18: Nến Shooting Star Xuất Hiện Sau Chuỗi Tăng Nóng Chạm Kháng Cự 4H",
    "description": "<b>Bối cảnh:</b> Sau 7 nến xanh liên tiếp, xuất hiện nến râu trên dài gấp 3 lần thân kèm Volume lớn tại kháng cự 4H.",
    "chartConfig": null,
    "question": "Tín hiệu trên cảnh báo điều gì và trader nên xử lý ra sao?",
    "options": [
      {
        "id": "A",
        "text": "Tín hiệu mua đuổi.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Cảnh báo phe mua đã kiệt sức và bị phe bán xả hàng chặn đứng ➔ Chốt lời Long hoặc canh mở Short với SL trên đỉnh râu nến!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Shooting star không có ý nghĩa khi tăng mạnh.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Mua gấp đôi.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 4.1)</b><br>• Râu nến trên dài thể hiện sự từ chối giá cao quyết liệt từ phe Gấu."
  },
  {
    "id": 19,
    "chapterId": 5,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "support_resistance",
    "categoryName": "🏢 Chuyển Đổi Vai Trò Break & Retest (Chương 5)",
    "title": "Case Study 19: Vào Lệnh Mua Chuẩn Kỷ Luật Khi Kháng Cự Biến Thành Hỗ Trợ Mới",
    "description": "<b>Bối cảnh:</b> Giá breakout kháng cự mạnh với volume lớn, sau đó điều chỉnh quay lại test cản cũ với volume cạn kiệt và nến rút chân.",
    "chartConfig": null,
    "question": "Điểm vào lệnh tối ưu và an toàn nhất là ở đâu?",
    "options": [
      {
        "id": "A",
        "text": "Mua đuổi tại đỉnh nến Breakout.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Vào Mua khi giá Retest thành công cản cũ có nến rút chân + Volume thấp, SL dưới vùng cản, TP tại đỉnh mục tiêu tiếp theo.",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Mở Short vì giá đang giảm.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Chờ giá về 0.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 5.4)</b><br>• Vào lệnh tại nhịp Retest giúp tối ưu R:R và có Stop Loss cực ngắn."
  },
  {
    "id": 20,
    "chapterId": 6,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "market_structure_smc",
    "categoryName": "📈 Cấu Trúc Xu Hướng HH/HL (Chương 6)",
    "title": "Case Study 20: Xác Định Xu Hướng Uptrend Còn Duy Trì Hay Đã Bị Bẻ Gãy",
    "description": "<b>Bối cảnh:</b> Đáy Higher Low (HL) gần nhất của xu hướng tăng bị nến 4H đục thủng và đóng nến bên dưới.",
    "chartConfig": null,
    "question": "Tín hiệu nến 4H đóng cửa dưới đáy HL thông báo điều gì?",
    "options": [
      {
        "id": "A",
        "text": "Uptrend vẫn giữ nguyên, mua tiếp.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Cấu trúc tăng đã chính thức BỊ BẺ GÃY (Tín hiệu CHoCH), xác suất cao chuyển sang Downtrend hoặc Sideway rộng ➔ Dừng mua, canh kịch bản hồi test để Short.",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Thị trường tăng 10 lần.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Lỗi sàn.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 6.1 & 6.2)</b><br>• Khi đáy Higher Low bị thủng và đóng nến dưới, cấu trúc tăng bị phá vỡ hoàn toàn."
  },
  {
    "id": 21,
    "chapterId": 7,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "multi_timeframe",
    "categoryName": "⏱️ Đa Khung Thời Gian & Killzones (Chương 7)",
    "title": "Case Study 21: Tận Dụng Khung Giờ Vàng (London / NY Killzones) Tránh Bẫy Sideway",
    "description": "<b>Bối cảnh:</b> Phiên Á đi ngang biên hẹp. Phiên London (14:30 VN) và New York (19:30 VN) biến động bùng nổ cuốn phăng 2 đầu.",
    "chartConfig": null,
    "question": "Quy tắc chọn thời gian giao dịch thông minh theo Giáo trình là gì?",
    "options": [
      {
        "id": "A",
        "text": "Canh 24/24 vào lệnh liên tục trong phiên Á.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Hạn chế trade phiên Á thanh khoản mỏng; Tập trung vào London Open (14:30 - 17:30) và New York Open (19:30 - 23:00) khi dòng tiền tổ chức tham gia mạnh nhất!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Chỉ trade lúc 3h sáng.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Khung giờ nào cũng như nhau.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 7.4)</b><br>• Giao dịch đúng khung giờ giúp tránh bẫy cưa chân bàn của thị trường đi ngang."
  },
  {
    "id": 22,
    "chapterId": 8,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "volume_vsa",
    "categoryName": "📊 Khối Lượng VSA & Phân Kỳ (Chương 8)",
    "title": "Case Study 22: Nhận Diện Phân Kỳ Tăng Giá RSI (Bullish Divergence) Khung 4H",
    "description": "<b>Bối cảnh:</b> Giá tạo đáy mới thấp hơn (LL) nhưng chỉ báo RSI tạo đáy mới cao hơn (HL).",
    "chartConfig": null,
    "question": "Tín hiệu phân kỳ RSI trên báo hiệu điều gì?",
    "options": [
      {
        "id": "A",
        "text": "Đà giảm đang mạnh hơn ➔ Short đuổi.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Phân kỳ tăng giá (Bullish Divergence): Lực bán đã suy kiệt dù giá rơi sâu hơn, dự báo xác suất đảo chiều tăng rất cao ➔ Canh Long khi có nến xác nhận.",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "RSI vô dụng.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Bán tháo danh mục.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 8.2)</b><br>• Phân kỳ đáy RSI là chỉ báo sớm uy tín báo hiệu cạn kiệt lực bán."
  },
  {
    "id": 23,
    "chapterId": 7,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "multi_timeframe",
    "categoryName": "⏱️ Đa Khung 4H ➔ 1H ➔ 15M (Chương 7)",
    "title": "Case Study 23: Quy Trình Lập Kế Hoạch Đa Khung Thời Gian Top-Down 3 Bước",
    "description": "<b>Bối cảnh:</b> Trader chuẩn bị vào lệnh nhưng phân vân giữa xu hướng các khung thời gian khác nhau.",
    "chartConfig": null,
    "question": "Thứ tự phân tích đa khung thời gian chuẩn mực là gì?",
    "options": [
      {
        "id": "A",
        "text": "Nhìn 1m trước rồi đoán 4H.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Bước 1: Khung 4H xác định Xu Hướng Chính ➔ Bước 2: Khung 1H xác định Vùng Cản Hỗ Trợ/Kháng Cự (POI) ➔ Bước 3: Khung 15m tìm Mô hình Nến kích hoạt Entry & Điểm đặt SL tối ưu.",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Chỉ cần xem 1 khung duy nhất.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Xem tin tức Twitter rồi vào lệnh.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 7.1 - Hệ Thống 3 Khung Thời Gian)</b><br>• Quy trình Top-Down đảm bảo bạn luôn giao dịch thuận xu hướng của dòng tiền lớn."
  },
  {
    "id": 24,
    "chapterId": 8,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "volume_vsa",
    "categoryName": "📊 Khối Lượng Cao Trào Selling Climax (Chương 8)",
    "title": "Case Study 24: Nhận Diện Cột Volume Cao Trào Xả (Selling Climax) Tạo Đáy",
    "description": "<b>Bối cảnh:</b> Sau đà giảm dài, xuất hiện một cây nến thân đỏ cực dài có râu dưới dài và Volume cao gấp 5 lần bình thường (Selling Climax).",
    "chartConfig": null,
    "question": "Hành vi của dòng tiền thông minh trong cây nến này là gì?",
    "options": [
      {
        "id": "A",
        "text": "Tất cả mọi người đều muốn bán, thị trường sắp về 0.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Lực bán tháo hoảng loạn của đám đông đã bị dòng tiền lớn (Smart Money) nhảy vào hấp thụ toàn bộ bằng lệnh mua đối ứng ➔ Tín hiệu chuẩn bị tạo đáy đảo chiều!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Lỗi dữ liệu sàn.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Mở Short thêm đòn bẩy x50.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 8.1 - Phương Pháp VSA)</b><br>• Cột Volume kỷ lục tại đáy phản ánh lực gom hàng quy mô lớn của các tổ chức."
  },
  {
    "id": 25,
    "chapterId": 2,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "wallet_security",
    "categoryName": "🪙 Tokenomics & Định Giá FDV (Chương 2)",
    "title": "Case Study 25: Bẫy Định Giá FDV Cao Khủng Khiếp Của Các Coin Mới Lên Sàn",
    "description": "<b>Bối cảnh:</b> Một đồng coin mới list sàn có Market Cap $200M nhưng FDV (Fully Diluted Valuation) lên tới $10 Tỷ USD và lượng lưu thông chỉ 2%. Lịch trả token (Vesting) sẽ mở khóa 5% mỗi tháng cho quỹ đầu tư giá vốn rẻ.",
    "chartConfig": null,
    "question": "Rủi ro dài hạn đối với nhà đầu tư nắm giữ đồng coin này là gì?",
    "options": [
      {
        "id": "A",
        "text": "Coin sẽ tăng giá vì nguồn cung lưu thông ban đầu ít.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "RỦI RO LẠM PHÁT XẢ HÀNG KHỔNG LỒ: Lượng token trả về hàng tháng cho các quỹ giá rẻ sẽ tạo áp lực bán liên tục đè bẹp giá coin trong dài hạn ➔ Tránh hold dài hạn các coin có FDV quá chênh lệch so với Market Cap!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "FDV không có ý nghĩa đối với giá coin.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Quỹ đầu tư không bao giờ bán coin.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 2.1 & 11)</b><br>• High FDV / Low Float là bẫy thanh khoản kinh điển của thị trường crypto."
  },
  {
    "id": 26,
    "chapterId": 5,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "whale_traps",
    "categoryName": "🐋 Bẫy Đỉnh Bằng Equal Highs (Chương 5 & 9)",
    "title": "Case Study 26: Xử Lý Bẫy Đỉnh Bằng (Equal Highs - EQH) Trước Sóng Xả",
    "description": "<b>Bối cảnh:</b> Giá tạo 2 đỉnh bằng nhau chằn chặn tại $65,000. Đám đông hào hứng đặt lệnh Short và để Stop Loss ngay tại $65,300.",
    "chartConfig": null,
    "question": "Kịch bản hành động giá quen thuộc của Market Maker tiếp theo là gì?",
    "options": [
      {
        "id": "A",
        "text": "Giá sẽ rơi thẳng từ $65,000 cho phe Short ăn đậm.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Cá mập sẽ đẩy một nhịp râu chọc qua $65,300 để quét sạch Stop Loss của phe Short (quét BSL) rồi mới xả hàng quay đầu giảm!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Giá đi ngang vĩnh viễn.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Sàn tự đóng lệnh Short.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 5.3 & 9.4)</b><br>• Vùng đỉnh bằng EQH là nơi chứa nhiều Stop Loss nhất, cá mập luôn tìm cách quét qua trước khi đi đúng hướng."
  },
  {
    "id": 27,
    "chapterId": 9,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "macro_cycle",
    "categoryName": "🌊 Nhận Diện Đỉnh Chu Kỳ Memecoin (Chương 9.2)",
    "title": "Case Study 27: Dấu Hiệu Đỉnh Sóng Khi Memecoin Vốn Hóa Nhỏ Tăng Hàng Trăm Lần",
    "description": "<b>Bối cảnh:</b> BTC đi ngang. Các đồng memecoin rác tăng x50-x200 trong vài ngày. Báo đài và người không chuyên rủ nhau chơi coin.",
    "chartConfig": null,
    "question": "Thị trường đang ở pha nào và hành động an toàn là gì?",
    "options": [
      {
        "id": "A",
        "text": "Thị trường mới bắt đầu ➔ Vay tiền mua memecoin.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Thị trường đang ở Pha 4 (Sóng Memecoin cuối cùng) chuẩn bị vào Pha 5 (Xả về USDT & Sập) ➔ Lập tức chốt lời từng phần (DCA Out) ra USDT bảo toàn vốn!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Memecoin sẽ thay thế BTC.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Không cần làm gì.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.2)</b><br>• Khi Memecoin bay điên cuồng là dấu hiệu dòng tiền thông minh đang xả hàng rút về USDT."
  },
  {
    "id": 28,
    "chapterId": 10,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "risk_execution",
    "categoryName": "🧠 Kiểm Soát Tâm Lý Cay Cú (Chương 10.5)",
    "title": "Case Study 28: Ngăn Chặn Chuỗi Thua Lỗ Liên Tiếp Bằng Quy Tắc Cooldown 24H",
    "description": "<b>Bối cảnh:</b> Vừa thua 2 lệnh Stop Loss liên tiếp trong buổi sáng. Tâm lý cay cú muốn mở lệnh gấp đôi size để gỡ ngay.",
    "chartConfig": null,
    "question": "Quy tắc kỷ luật chuẩn mực trong tình huống này là gì?",
    "options": [
      {
        "id": "A",
        "text": "Vào lệnh tiếp vì cơ hội không chờ đợi.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Áp dụng Quy tắc Cooldown 24H: Lập tức tắt máy tính rời khỏi bàn làm việc 24h để tránh Revenge Trading làm tê liệt lý trí!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Nâng đòn bẩy lên x100 để gỡ.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Hỏi bạn bè trên mạng.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.3 & 10.5)</b><br>• Dừng giao dịch khi cay cú là hành động dũng cảm nhất của một Master Trader."
  },
  {
    "id": 29,
    "chapterId": 11,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "market_structure_smc",
    "categoryName": "🏛️ Khối Lệnh Order Block & FVG (Chương 11)",
    "title": "Case Study 29: Phục Kích Điểm Vào Lệnh Tại Vùng Imbalance FVG Khung 1H",
    "description": "<b>Bối cảnh:</b> Giá bùng nổ để lại khoảng trống FVG giữa Râu Nến 1 ($2,420) và Râu Nến 3 ($2,480). Giá tăng lên $2,650 rồi bắt đầu hồi test lại.",
    "chartConfig": {
      "width": 620,
      "height": 260,
      "candles": [
        {
          "open": 2380,
          "high": 2420,
          "low": 2370,
          "close": 2410,
          "vol": 180,
          "label": "Nến 1 (Đỉnh $2,420)"
        },
        {
          "open": 2410,
          "high": 2580,
          "low": 2405,
          "close": 2570,
          "vol": 920,
          "label": "Nến 2 (Đột Biến)"
        },
        {
          "open": 2570,
          "high": 2650,
          "low": 2480,
          "close": 2640,
          "vol": 450,
          "label": "Nến 3 (Đáy $2,480)"
        },
        {
          "open": 2640,
          "high": 2650,
          "low": 2440,
          "close": 2460,
          "vol": 280,
          "label": "LẤP FVG RETEST 🎯",
          "labelColor": "#00c076"
        }
      ],
      "zones": [
        {
          "type": "support",
          "top": 2480,
          "bottom": 2420,
          "label": "KHOẢNG TRỐNG GIÁ FVG ($2,420 - $2,480)"
        }
      ],
      "tradeSetup": {
        "entry": 2450,
        "sl": 2390,
        "tp": 2750,
        "startIndex": 3
      }
    },
    "question": "Chiến lược giao dịch SMC chuẩn xác khi giá rơi về vùng FVG là gì?",
    "options": [
      {
        "id": "A",
        "text": "Mở Short vì giá đang giảm.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Vào lệnh Mua khi giá lấp đầy vùng FVG ($2,440 - $2,460) và có nến rút chân xác nhận, SL dưới đáy Nến 1 ($2,390), TP đỉnh cũ $2,750 (R:R ≈ 1 : 5.0)!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "FVG không có ý nghĩa.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Chờ giá về $1,000.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 11 - Smart Money Concepts)</b><br>• Vùng FVG hoạt động như thỏi nam châm hút giá quay lại lấp trước khi tiếp tục sóng đẩy!"
  },
  {
    "id": 30,
    "chapterId": 12,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "trading_roadmap",
    "categoryName": "🗺️ Lộ Trình 5 Bước Trader (Chương 12)",
    "title": "Case Study 30: Tầm Quan Trọng Của Việc Ghi Nhật Ký Giao Dịch & Backtesting",
    "description": "<b>Bối cảnh:</b> Trader A giao dịch cảm tính không ghi chép; Trader B ghi chép cẩn thận mọi lệnh vào Trade Journal (kèm ảnh chart, lý do SL/TP, cảm xúc).",
    "chartConfig": null,
    "question": "Sau 6 tháng, sự khác biệt lớn nhất giữa Trader A và Trader B là gì?",
    "options": [
      {
        "id": "A",
        "text": "Cả hai có kết quả ngẫu nhiên như nhau.",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Trader B tích lũy được dữ liệu thống kê khách quan, nhận diện được sai lầm (overtrading, dời SL) và trở thành Trader có lợi nhuận nhất quán; còn Trader A dễ cháy tài khoản vì lặp lại sai lầm cũ!",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Viết nhật ký tốn thời gian vô ích.",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Trader A giỏi hơn vì không bị gò bó kỷ luật.",
        "isCorrect": false
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 12 - Lộ Trình 5 Bước Trở Thành Trader Độc Lập)</b><br>• \"Cái gì đo lường được thì cái đó mới cải thiện được!\""
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

  if (totalEl) totalEl.innerText = answeredCount + ' / ' + totalQuestions;
  if (correctEl) correctEl.innerText = correctCount;
  if (accEl) accEl.innerText = acc + '%';
  if (streakEl) streakEl.innerText = '🔥 ' + practiceStats.streak;
}

function renderPracticeCategoryFilters() {
  const container = document.getElementById('practice-category-pills');
  if (!container) return;

  const categories = [
    { id: 'all', name: '🎯 Tất Cả (' + practiceScenarios.length + ' Case)' },
    { id: 'whale_traps', name: '🐋 Bẫy Cá Mập & Quét Sàn' },
    { id: 'derivatives_data', name: '📊 Phái Sinh & Squeeze' },
    { id: 'macro_cycle', name: '🌊 Vĩ Mô & Chu Kỳ' },
    { id: 'market_structure_smc', name: '🏛️ SMC & Cấu Trúc' },
    { id: 'candlestick_patterns', name: '🕯️ Mô Hình Nến' },
    { id: 'risk_execution', name: '🛡️ Quản Trị Rủi Ro' },
    { id: 'wallet_security', name: '🔒 Bảo Mật Ví' }
  ];

  let catBtns = categories.map(function(cat) {
    const activeClass = currentFilterCategory === cat.id ? 'active' : '';
    return '<button class="coin-pill-btn ' + activeClass + '" onclick="filterPracticeCategory(\'' + cat.id + '\')">' + cat.name + '</button>';
  }).join('');

  container.innerHTML = 
    '<div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">' +
      '<div style="display: flex; gap: 6px; flex-wrap: wrap;">' + catBtns + '</div>' +
      '<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color);">' +
        '<div style="display: flex; align-items: center; gap: 6px;">' +
          '<span style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">Độ khó:</span>' +
          '<select class="select-field" style="width: 140px; padding: 4px 8px; font-size: 12px;" onchange="filterPracticeLevel(this.value)">' +
            '<option value="all" ' + (currentFilterLevel === 'all' ? 'selected' : '') + '>Tất cả cấp độ</option>' +
            '<option value="basic" ' + (currentFilterLevel === 'basic' ? 'selected' : '') + '>🌱 Cơ Bản</option>' +
            '<option value="intermediate" ' + (currentFilterLevel === 'intermediate' ? 'selected' : '') + '>⚡ Trung Bình</option>' +
            '<option value="advanced" ' + (currentFilterLevel === 'advanced' ? 'selected' : '') + '>🔥 Nâng Cao</option>' +
          '</select>' +
        '</div>' +
        '<div style="display: flex; align-items: center; gap: 6px;">' +
          '<span style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">Ôn tập theo chương:</span>' +
          '<select class="select-field" style="width: 220px; padding: 4px 8px; font-size: 12px;" onchange="filterPracticeChapter(this.value)">' +
            '<option value="all" ' + (currentFilterChapter === 'all' ? 'selected' : '') + '>Tất cả 12 Chương</option>' +
            '<option value="1" ' + (currentFilterChapter === '1' ? 'selected' : '') + '>Chương 1: Bản Chất Blockchain</option>' +
            '<option value="2" ' + (currentFilterChapter === '2' ? 'selected' : '') + '>Chương 2: Phân Loại Coin & Ví</option>' +
            '<option value="3" ' + (currentFilterChapter === '3' ? 'selected' : '') + '>Chương 3: Order Book & Cung Cầu</option>' +
            '<option value="4" ' + (currentFilterChapter === '4' ? 'selected' : '') + '>Chương 4: Các Mô Hình Nến</option>' +
            '<option value="5" ' + (currentFilterChapter === '5' ? 'selected' : '') + '>Chương 5: Hỗ Trợ & Kháng Cự</option>' +
            '<option value="6" ' + (currentFilterChapter === '6' ? 'selected' : '') + '>Chương 6: Cấu Trúc Thị Trường</option>' +
            '<option value="7" ' + (currentFilterChapter === '7' ? 'selected' : '') + '>Chương 7: Đa Khung 4H-1H-15m</option>' +
            '<option value="8" ' + (currentFilterChapter === '8' ? 'selected' : '') + '>Chương 8: Volume, RSI, Phái Sinh</option>' +
            '<option value="9" ' + (currentFilterChapter === '9' ? 'selected' : '') + '>Chương 9: Bẫy Cá Mập & Wyckoff</option>' +
            '<option value="10" ' + (currentFilterChapter === '10' ? 'selected' : '') + '>Chương 10: Quản Lý Vốn 1% & R:R</option>' +
            '<option value="11" ' + (currentFilterChapter === '11' ? 'selected' : '') + '>Chương 11: SMC & FVG</option>' +
            '<option value="12" ' + (currentFilterChapter === '12' ? 'selected' : '') + '>Chương 12: Lộ Trình & Nhật Ký</option>' +
          '</select>' +
        '</div>' +
        '<span style="margin-left: auto; font-size: 11.5px; color: #38bdf8; font-weight: 700;">' +
          'Khớp: ' + getFilteredScenarios().length + ' Case Study' +
        '</span>' +
      '</div>' +
    '</div>';
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
  return practiceScenarios.filter(function(s) {
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
    container.innerHTML = 
      '<div class="card" style="padding: 40px; text-align: center; color: var(--text-muted);">' +
        '<div style="font-size: 32px; margin-bottom: 10px;">🔍</div>' +
        '<div style="font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 6px;">Không tìm thấy bài tập phù hợp với bộ lọc</div>' +
        '<div style="font-size: 12.5px; margin-bottom: 14px;">Hãy thử chọn lại danh mục hoặc độ khó khác.</div>' +
        '<button class="btn btn-outline" onclick="filterPracticeCategory(\'all\'); filterPracticeLevel(\'all\'); filterPracticeChapter(\'all\');">Đặt lại bộ lọc</button>' +
      '</div>';
    return;
  }

  const scenario = filtered[currentScenarioIndex] || filtered[0];
  const userChoice = practiceStats.answered[scenario.id];

  let chartSvgHtml = '';
  if (window.ChartVisualizer && scenario.chartConfig) {
    chartSvgHtml = ChartVisualizer.renderChartSvg(scenario.chartConfig);
  }

  let optionsHtml = scenario.options.map(function(opt) {
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

    return '<button class="' + btnClass + '" onclick="submitPracticeAnswer(' + scenario.id + ', \'' + opt.id + '\')" ' + (userChoice ? 'disabled' : '') + ' style="text-align: left; line-height: 1.55; padding: 12px 14px;">' +
      '<span class="opt-badge">' + icon + '</span>' +
      '<span class="opt-text" style="font-size: 13px;">' + opt.text + '</span>' +
    '</button>';
  }).join('');

  let explanationHtml = '';
  if (userChoice) {
    explanationHtml = 
      '<div class="quiz-explanation-card animate-fadeIn" style="border-left: 4px solid #38bdf8; background: rgba(15, 23, 42, 0.95); padding: 16px; border-radius: 8px; margin-top: 14px;">' +
        '<div style="font-size: 14.5px; font-weight: 800; margin-bottom: 10px; color: #38bdf8; display: flex; align-items: center; gap: 6px;">' +
          '<span>💡</span> Lời Giải Giải Phẫu Hành Vi & Kế Hoạch Thực Chiến' +
        '</div>' +
        '<div style="font-size: 13.5px; line-height: 1.7; color: #e2e8f0;">' +
          scenario.explanation +
        '</div>' +
      '</div>';
  }

  let levelBadgeClass = scenario.level === 'basic' ? 'badge-green' : (scenario.level === 'intermediate' ? 'badge-blue' : 'badge-red');

  container.innerHTML = 
    '<div class="card" style="padding: 24px;">' +
      '<div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px; gap: 10px;">' +
        '<div>' +
          '<div style="display: flex; gap: 6px; align-items: center; margin-bottom: 6px;">' +
            '<span class="badge badge-purple" style="font-size: 10.5px;">' + scenario.categoryName + '</span>' +
            '<span class="badge ' + levelBadgeClass + '" style="font-size: 10px;">' + (scenario.levelLabel || 'Cơ Bản') + '</span>' +
          '</div>' +
          '<h3 style="font-size: 17.5px; font-weight: 800; color: #fff; line-height: 1.4;">' + scenario.title + '</h3>' +
        '</div>' +
        '<div style="font-size: 12.5px; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.3); flex-shrink: 0;">' +
          'Case ' + (currentScenarioIndex + 1) + ' / ' + filtered.length +
        '</div>' +
      '</div>' +
      '<div style="font-size: 13.5px; color: #cbd5e1; line-height: 1.7; margin-bottom: 18px; background: rgba(15, 23, 42, 0.6); padding: 14px; border-radius: 8px; border-left: 3px solid #38bdf8;">' +
        scenario.description +
      '</div>' +
      (chartSvgHtml ? '<div style="margin-bottom: 22px; border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: #06090e;">' + chartSvgHtml + '</div>' : '') +
      '<div style="font-size: 15px; font-weight: 700; color: #60a5fa; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">' +
        '<span style="font-size: 18px;">❓</span> <span>' + scenario.question + '</span>' +
      '</div>' +
      '<div style="display: flex; flex-direction: column; gap: 11px; margin-bottom: 20px;">' +
        optionsHtml +
      '</div>' +
      explanationHtml +
      '<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 22px; border-top: 1px solid var(--border-color); padding-top: 16px;">' +
        '<button class="btn btn-secondary" onclick="navigatePracticeScenario(-1)" ' + (currentScenarioIndex === 0 ? 'disabled' : '') + '>' +
          '⬅️ Case Trước' +
        '</button>' +
        '<button class="btn btn-primary" onclick="navigatePracticeScenario(1)" ' + (currentScenarioIndex >= filtered.length - 1 ? 'disabled' : '') + '>' +
          'Case Tiếp Theo ➡️' +
        '</button>' +
      '</div>' +
    '</div>';
}

function submitPracticeAnswer(scenarioId, chosenOptionId) {
  if (practiceStats.answered[scenarioId]) return;

  const scenario = practiceScenarios.find(function(s) { return s.id === scenarioId; });
  if (!scenario) return;

  const chosen = scenario.options.find(function(o) { return o.id === chosenOptionId; });
  const isCorrect = chosen && chosen.isCorrect;

  practiceStats.answered[scenarioId] = chosenOptionId;
  practiceStats.total++;

  const chap = scenario.chapterId || 1;
  practiceStats.chapterStats[chap] = practiceStats.chapterStats[chap] || { attempted: 0, correct: 0, failed: 0 };
  practiceStats.chapterStats[chap].attempted++;

  if (isCorrect) {
    practiceStats.correct++;
    practiceStats.streak++;
    practiceStats.chapterStats[chap].correct++;
    if (window.showToast) showToast('🎉 Chính xác! Bạn đã nắm rất vững tư duy kỹ thuật & hành vi!', 'success');
  } else {
    practiceStats.streak = 0;
    practiceStats.chapterStats[chap].failed++;
    if (window.showToast) showToast('❌ Chưa chính xác! Hãy đọc kỹ phần giải phẫu hành vi bên dưới để rút kinh nghiệm.', 'warning');
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
  if (window.showToast) showToast('Đã đặt lại 30 Case Study thực hành.', 'info');
}

if (typeof window !== 'undefined') {
  window.initPracticeModule = initPracticeModule;
  window.submitPracticeAnswer = submitPracticeAnswer;
  window.navigatePracticeScenario = navigatePracticeScenario;
  window.filterPracticeCategory = filterPracticeCategory;
  window.filterPracticeLevel = filterPracticeLevel;
  window.filterPracticeChapter = filterPracticeChapter;
  window.resetPracticeQuiz = resetPracticeQuiz;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { practiceScenarios, practiceStats };
}
