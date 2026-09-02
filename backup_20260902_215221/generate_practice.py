import json

practice_scenarios = [
  # ----------------------------------------------------
  # CASE 1: SFP Quét Thanh Khoản Đáy EQL (Chương 5 & 9)
  # ----------------------------------------------------
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
        { "open": 63500, "high": 63800, "low": 60800, "close": 61000, "vol": 180 },
        { "open": 61000, "high": 61200, "low": 58950, "close": 59000, "vol": 240, "label": "Đáy 1 ($59k)" },
        { "open": 59000, "high": 61200, "low": 59100, "close": 60800, "vol": 200 },
        { "open": 60800, "high": 61000, "low": 58980, "close": 59020, "vol": 220, "label": "Đáy 2 EQL ($59k)" },
        { "open": 59020, "high": 59600, "low": 57600, "close": 59400, "vol": 780, "label": "QUÉT SFP 🩸⚡", "labelColor": "#00c076" },
        { "open": 59400, "high": 62200, "low": 59350, "close": 62000, "vol": 540, "label": "BÙNG NỔ TĂNG 🚀", "labelColor": "#38bdf8" },
        { "open": 62000, "high": 64800, "low": 61900, "close": 64500, "vol": 460 }
      ],
      "zones": [
        { "type": "support", "top": 59150, "bottom": 58850, "label": "BÃI STOP LOSS EQL (BỂ THANH KHOẢN SSL)" }
      ],
      "tradeSetup": { "entry": 59450, "sl": 57500, "tp": 64500, "startIndex": 4 }
    },
    "question": "Bản chất hành vi của Cá mập (Market Maker) trong pha này là gì và kế hoạch giao dịch chuẩn xác nhất là gì?",
    "options": [
      {
        "id": "A",
        "text": "Thủng đáy $59,000 là tín hiệu thị trường sập không phanh ➔ Vào lệnh Bán khống (Short) đuổi theo đà giảm ngay khi thấy nến đỏ đâm xuống $57,600.",
        "isCorrect": False
      },
      {
        "id": "B",
        "text": "Cá mập cố tình tạo 2 đáy EQL để bẫy Stop Loss. Cú đâm sâu rồi rút râu đóng nến bên trong biên là mô hình SFP (Quét thanh khoản gom hàng) ➔ Mở lệnh Long khi nến 15m đóng cửa ($59,450), Stop Loss đặt tại $57,500 (dưới râu nến quét), Take Profit tại đỉnh cũ $64,500 (R:R ≈ 1 : 2.6).",
        "isCorrect": True
      },
      {
        "id": "C",
        "text": "Đây là nến Doji lưỡng lự, tuyệt đối không có tín hiệu mua bán nào.",
        "isCorrect": False
      },
      {
        "id": "D",
        "text": "Chờ giá rơi về $30,000 mới cân nhắc mua.",
        "isCorrect": False
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 5.3, 5.4 & Chương 9.4 - Giáo Trình Crypto)</b><br>• <b>Dấu hiệu nhận biết SFP Đáy:</b> Giá đâm thủng đáy cũ (vùng có nhiều SL nhất) nhưng <i>KHÔNG ĐÓNG CỬA NẾN ĐƯỢC DƯỚI ĐÁY</i> mà rút râu dài ngoặc kèm Volume đột biến.<br>• <b>Tâm lý thị trường:</b> Đám đông retail bị cắn SL và bán tháo giá rẻ ngay tại đáy, tạo thanh khoản đối ứng hoàn hảo cho Cá mập gom đầy giỏ hàng.<br>• <b>Kỷ luật vào lệnh:</b> Không bắt dao rơi khi nến đang chọc xuống. Chỉ bóp cò khi cây nến 15m ĐÃ ĐÓNG CỬA thành công bên trên mức cản $59,000!"
  },

  # ----------------------------------------------------
  # CASE 2: Bẫy Judas Swing Giờ Ra Tin CPI (Chương 7 & 9)
  # ----------------------------------------------------
  {
    "id": 2,
    "chapterId": 7,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "whale_traps",
    "categoryName": "🐋 Bẫy Cá Mập & Quét Sàn (Chương 7 & 9)",
    "title": "Case Study 2: Bẫy Judas Swing & Bẫy Thanh Khoản Mua (BSL) Giờ Ra Tin CPI",
    "description": "<b>Bối cảnh thực tế:</b> Đúng 19:30 tối giờ VN, Mỹ công bố chỉ số CPI giảm nhẹ (tin vĩ mô tích cực). Trong 3 phút đầu tiên, cây nến 5m giật dựng cột từ $64,000 bắn vượt qua đỉnh cũ $65,000 lên tận <b>$65,800</b>. Hàng loạt hội nhóm hò reo 'To the Moon' và bấm Buy Market đuổi theo.<br><br>Tuy nhiên, chỉ 5 phút sau đó, Open Interest (OI) trên sàn Binance Futures đột ngột giảm mạnh và xuất hiện một cây nến Bearish Engulfing khổng lồ xả thẳng về <b>$63,600</b> nuốt trọn toàn bộ cây nến tăng trước đó.",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        { "open": 63600, "high": 64200, "low": 63500, "close": 64000, "vol": 140 },
        { "open": 64000, "high": 65000, "low": 63900, "close": 64800, "vol": 210, "label": "Đỉnh Cũ $65k" },
        { "open": 64800, "high": 65800, "low": 64700, "close": 65600, "vol": 490, "label": "BẪY DỤ LONG 💥", "labelColor": "#f59e0b" },
        { "open": 65600, "high": 65700, "low": 63500, "close": 63700, "vol": 890, "label": "JUDAS DUMP 🩸", "labelColor": "#ff3b69" },
        { "open": 63700, "high": 63800, "low": 62200, "close": 62400, "vol": 520, "label": "SẬP SÂU ↘" }
      ],
      "zones": [
        { "type": "resistance", "top": 65200, "bottom": 64800, "label": "VÙNG KHÁNG CỰ ĐỈNH (BÃI SL SHORT - BSL)" }
      ],
      "tradeSetup": { "entry": 63700, "sl": 65900, "tp": 59500, "startIndex": 3 }
    },
    "question": "Hiện tượng trên là chiêu trò gì của Market Maker và Pro Trader sẽ hành động như thế nào?",
    "options": [
      {
        "id": "A",
        "text": "Tin tốt thì giá chắc chắn sẽ lên $100,000 ➔ Tiếp tục gồng lệnh Mua và nạp thêm tiền trung bình giá khi nến xả đỏ.",
        "isCorrect": False
      },
      {
        "id": "B",
        "text": "Đây là Bẫy Judas Swing (Fakeout quét thanh khoản đỉnh BSL): Cá mập dùng tin tốt để tạo thanh khoản Mua đối ứng nhằm xả hàng giá cao ➔ Tuyệt đối KHÔNG FOMO mua đuổi; Chờ nến 5m/15m xác nhận đóng cửa dưới đỉnh cũ để MỞ SHORT thuận xu hướng giảm (Entry $63,700, SL $65,900, TP $59,500).",
        "isCorrect": True
      },
      {
        "id": "C",
        "text": "Do sàn Binance bị lỗi máy chủ ngẫu nhiên.",
        "isCorrect": False
      },
      {
        "id": "D",
        "text": "Chỉ số CPI không có ảnh hưởng gì tới thị trường crypto.",
        "isCorrect": False
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 3.2, 7.4 & 9.4 - Bẫy Judas Swing)</b><br>• <b>Quy tắc sống còn giờ ra tin vĩ mô:</b> 'Tin ra là Bán' (Sell the news). Đám đông mua vì tin tốt chính là dòng thanh khoản để Nhà tạo lập phân phối hàng nghìn BTC ở mức giá đỉnh.<br>• <b>Kỷ luật ICT / SMC:</b> Không bao giờ vào lệnh trong 15 phút đầu tiên sau khi tin công bố. Hãy kiên nhẫn chờ cú quét thanh khoản Judas hoàn tất rồi mới bóp cò theo hướng thực tế của dòng tiền lớn!"
  },

  # ----------------------------------------------------
  # CASE 3: Bẫy Funding Rate Âm Kỷ Lục (Chương 8 & 9)
  # ----------------------------------------------------
  {
    "id": 3,
    "chapterId": 8,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "derivatives_data",
    "categoryName": "📊 Dữ Liệu Phái Sinh & Squeeze (Chương 8 & 9)",
    "title": "Case Study 3: Bẫy Funding Rate Âm Kỷ Lục & Tín Hiệu Săn Sóng Short Squeeze",
    "description": "<b>Bối cảnh thực tế:</b> Sau khi SOL giảm từ $150 về $130, giá bắt đầu đi ngang trong biên $130 - $132 suốt 2 ngày. Mạng xã hội tràn ngập FUD tiêu cực, đám đông thi nhau mở lệnh Short với đòn bẩy x20 - x50 để ăn dày.<br><br>Dữ liệu On-chain & Sàn hiển thị: <b>Funding Rate rớt sâu xuống mức -0.18%/8h</b> (Phe Short phải trả phí cực lớn cho phe Long), <b>Open Interest (OI) tăng vọt thêm $200M</b> nhưng giá SOL <b>tuyệt đối không thể thủng qua mốc $130</b>.",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        { "open": 152, "high": 154, "low": 138, "close": 140, "vol": 220 },
        { "open": 140, "high": 142, "low": 130, "close": 132, "vol": 310, "label": "Funding -0.18% ⚠️" },
        { "open": 132, "high": 133.5, "low": 129.5, "close": 131, "vol": 340, "label": "OI Tăng Đột Biến" },
        { "open": 131, "high": 149, "low": 130.8, "close": 147, "vol": 920, "label": "SHORT SQUEEZE 🚀", "labelColor": "#00c076" },
        { "open": 147, "high": 164, "low": 146, "close": 162, "vol": 780, "label": "Thanh Lý Toàn Sàn" }
      ],
      "zones": [
        { "type": "support", "top": 132, "bottom": 129, "label": "VÙNG NÉN ĐÒN BẨY SHORT (NỒI ÁP SUẤT)" }
      ],
      "tradeSetup": { "entry": 132.5, "sl": 128.5, "tp": 160.0, "startIndex": 2 }
    },
    "question": "Sự bất thường giữa Funding Rate âm sâu, OI tăng và Giá đi ngang báo hiệu điều gì?",
    "options": [
      {
        "id": "A",
        "text": "Funding âm chứng tỏ phe Short đang áp đảo tuyệt đối ➔ Nhắm mắt mở thêm lệnh Short theo đám đông.",
        "isCorrect": False
      },
      {
        "id": "B",
        "text": "Đây là tín hiệu 'Nén lò xo' chuẩn bị kích hoạt SHORT SQUEEZE: Phe Short quá đông và hung hãn bị chặn đứng tại hỗ trợ. Khi Cá mập bơm lệnh Mua, chuỗi thanh lý Short sẽ tự động kích hoạt lệnh Market Buy đẩy giá bay thẳng đứng ➔ Mở Long đón đầu quanh $132, SL $128.5, TP $158 - $162 (R:R = 1 : 6.8)!",
        "isCorrect": True
      },
      {
        "id": "C",
        "text": "Thị trường sẽ sập về 0 USD trong đêm nay.",
        "isCorrect": False
      },
      {
        "id": "D",
        "text": "Funding Rate không có liên quan gì đến hành động giá.",
        "isCorrect": False
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 8.3 & 9.4 - Dữ Liệu Phái Sinh & Squeeze)</b><br>• <b>Cơ chế Short Squeeze:</b> Khi một vị thế Short bị chạm Stop Loss hoặc bị Sàn thanh lý (Liquidated), hệ thống buộc phải tung ra lệnh <i>MARKET BUY</i> để đóng lệnh. Hàng ngàn lệnh Buy cưỡng bức dồn dập trong vài phút sẽ tạo ra cây nến xanh dựng cột khổng lồ.<br>• <b>Công thức nhận diện:</b> Funding âm sâu (< -0.05%) + OI tăng vọt + Giá không giảm nữa = Bão Short Squeeze sắp đổ bộ!"
  },

  # ----------------------------------------------------
  # CASE 4: Xử Lý Khi Bitcoin Dominance Đột Phá Kháng Cự (Chương 9.2)
  # ----------------------------------------------------
  {
    "id": 4,
    "chapterId": 9,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "macro_cycle",
    "categoryName": "🌊 Vĩ Mô & Chu Kỳ Dòng Tiền (Chương 9.2)",
    "title": "Case Study 4: Xử Lý Danh Mục Khi Bitcoin Dominance (BTC.D) Đột Phá Kháng Cự",
    "description": "<b>Bối cảnh thực tế:</b> Giá Bitcoin vượt đỉnh cũ phá $70,000 và tiến thẳng lên $75,000. Cùng thời điểm đó, chỉ số <b>Bitcoin Dominance (BTC.D) phá vỡ kháng cự 55% và leo dốc lên 62%</b>.<br><br>Tài khoản của bạn đang nắm giữ 80% Altcoin (Layer 2, AI, GameFi). Bạn nhận thấy một nghịch lý đau đớn: <i>Giá BTC tăng ầm ầm nhưng danh mục Altcoin của bạn lại bị giảm -15% đến -20%</i>.",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        { "open": 65000, "high": 68000, "low": 64500, "close": 67500, "vol": 310 },
        { "open": 67500, "high": 71000, "low": 67000, "close": 70500, "vol": 450, "label": "BTC.D VƯỢT 55% ⚠️" },
        { "open": 70500, "high": 75500, low: 70000, close: 75000, vol: 680, "label": "BTC.D 62% (HÚT MÁU)" },
        { "open": 75000, "high": 76000, low: 73500, close: 74200, vol: 410, "label": "Altcoin Đỏ Lửa 🩸" }
      ]
    },
    "question": "Dòng tiền thị trường đang nằm ở pha nào và giải pháp tái cơ cấu danh mục chuẩn nhất là gì?",
    "options": [
      {
        "id": "A",
        "text": "Thị trường đang vào Altseason ➔ Vay thêm tiền để 'All-in' bắt đáy toàn bộ số Altcoin đang giảm giá.",
        "isCorrect": False
      },
      {
        "id": "B",
        "text": "Thị trường đang ở PHA 1 (Dòng tiền chỉ tập trung kéo BTC, Altcoin bị hút máu trầm trọng) ➔ Giữ chặt BTC và USDT; Tuyệt đối KHÔNG FOMO mua Altcoin sớm; Kiên nhẫn chờ khi BTC đi ngang lập đỉnh và BTC.D xuất hiện tín hiệu đảo chiều giảm mới luân chuyển vốn sang đón MÙA ALTCOIN (Pha 3)! ",
        "isCorrect": True
      },
      {
        "id": "C",
        "text": "Bán cắt lỗ toàn bộ danh mục ngay đáy rồi rút tiền về ngân hàng nghỉ chơi crypto.",
        "isCorrect": False
      },
      {
        "id": "D",
        "text": "Mở lệnh Short BTC đòn bẩy x100 để gỡ lại số tiền Altcoin bị lỗ.",
        "isCorrect": False
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.2 - Chu Kỳ Luân Chuyển Dòng Tiền 5 Pha)</b><br>• <b>Bản chất Pha 1:</b> Dòng vốn tổ chức (Wall Street, BlackRock ETF) chỉ mua Bitcoin vì tính thanh khoản và pháp lý. Khi BTC tăng sốc, các nhà đầu tư trên thị trường đồng loạt bán tháo Altcoin sang BTC để đu tàu, khiến cặp tỷ giá Altcoin/BTC sụp đổ.<br>• <b>Quy tắc vàng:</b> Altseason chỉ thực sự bùng nổ khi BTC đạt đỉnh và đi ngang sideway, dòng tiền chốt lời từ BTC mới bắt đầu tràn sang ETH (Pha 2) rồi mới tới Altcoin Mid/Low Cap (Pha 3)!"
  },

  # ----------------------------------------------------
  # CASE 5: Kê Lệnh Ảo Spoofing & Phân Kỳ CVD (Chương 3 & 9)
  # ----------------------------------------------------
  {
    "id": 5,
    "chapterId": 9,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "whale_traps",
    "categoryName": "🐋 Bẫy Cá Mập & Quét Sàn (Chương 3 & 9)",
    "title": "Case Study 5: Bóc Trần Chiêu Trò Kê Lệnh Ảo (Spoofing) & Phân Kỳ Tích Lũy CVD",
    "description": "<b>Bối cảnh thực tế:</b> Trên Order Book hiển thị một tường Mua khổng lồ 2,500 BTC tại mức giá $61,000. Đám đông an tâm nghĩ rằng đây là bức tường bê tông vững chắc và tranh nhau đặt lệnh Mua phía trên tại $61,050.<br><br>Khi giá vừa rơi sát mức $61,020, <b>tường 2,500 BTC đột ngột biến mất (bị hủy trong 1 giây)</b> khiến giá rơi tự do trượt thẳng xuống <b>$60,400</b>. Retail hoảng loạn cắt lỗ xả Market Buy nhưng trên biểu đồ phân tích sâu: <b>Chỉ báo CVD (Cumulative Volume Delta) lại liên tục dâng cao tạo Đáy sau cao hơn Đáy trước (HL)</b>.",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        { "open": 62800, "high": 63000, "low": 61800, "close": 62000, "vol": 190 },
        { "open": 62000, "high": 62200, "low": 60950, "close": 61050, "vol": 240, "label": "Tường Ảo $61k" },
        { "open": 61050, "high": 61100, "low": 60300, "close": 60400, "vol": 690, "label": "RÚT TƯỜNG SẬP 🩸", "labelColor": "#ff3b69" },
        { "open": 60400, "high": 62500, "low": 60350, "close": 62300, "vol": 580, "label": "CVD TĂNG (ABSORPTION) ⭐", "labelColor": "#00c076" },
        { "open": 62300, "high": 64200, "low": 62200, "close": 64000, "vol": 460 }
      ],
      "zones": [
        { "type": "support", "top": 60600, "bottom": 60200, "label": "VÙNG CÁ MẬP HẤP THỤ GOM HÀNG (CVD DIVERGENCE)" }
      ],
      "tradeSetup": { "entry": 62350, "sl": 60200, "tp": 65500, "startIndex": 3 }
    },
    "question": "Chiêu thức Cá mập đã áp dụng là gì và ý nghĩa của việc Phân kỳ CVD tăng là gì?",
    "options": [
      {
        "id": "A",
        "text": "Sàn Binance bị hack hệ thống đặt lệnh.",
        "isCorrect": False
      },
      {
        "id": "B",
        "text": "Tường 2,500 BTC là bẫy Spoofing giả để dụ đám đông kê lệnh rồi rút để ép giá giảm; Trong khi đó cú rơi về $60,400 kèm phân kỳ CVD tăng chứng minh Cá mập đang âm thầm dùng lệnh Limit nuốt trọn toàn bộ lực bán tháo hoảng loạn của retail (Hiện tượng Absorption) ➔ Tín hiệu gom hàng đáy uy tín, chuẩn bị đón sóng tăng mạnh!",
        "isCorrect": True
      },
      {
        "id": "C",
        "text": "CVD tăng nghĩa là sàn đang in thêm tiền ảo.",
        "isCorrect": False
      },
      {
        "id": "D",
        "text": "Vào lệnh Short tại $60,400 vì thị trường đã thủng cản.",
        "isCorrect": False
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 3.1 & Chương 9.4 - Dấu hiệu 4 & 5)</b><br>• <b>Spoofing (Kê lệnh ảo):</b> Là hành vi đặt lệnh Limit siêu lớn nhưng không có ý định khớp, nhằm tạo cảm giác an toàn hoặc sợ hãi giả tạo cho thị trường rồi hủy lệnh vào phút chót.<br>• <b>CVD Phân Kỳ Dương (Absorption):</b> Giá tạo Đáy mới thấp hơn nhưng CVD tạo Đáy cao hơn = Phe Bán nỗ lực xả hàng khủng nhưng toàn bộ số coin đó bị một 'Tay To' bí ẩn đặt lệnh Limit chặn mua hấp thụ sạch sẽ!"
  },

  # ----------------------------------------------------
  # CASE 6: Xử Lý Bẫy Giãn Spread & Quét Râu Ảo Futures (Chương 9.4 & 10)
  # ----------------------------------------------------
  {
    "id": 6,
    "chapterId": 10,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "risk_execution",
    "categoryName": "🛡️ Quản Trị Rủi Ro Futures (Chương 9.4 & 10)",
    "title": "Case Study 6: Xử Lý Bẫy Giãn Spread & Quét Râu Ảo Futures Ban Đêm",
    "description": "<b>Bối cảnh thực tế:</b> Bạn mở vị thế Long ETH tại $2,600, cài Stop Loss nghiêm ngặt tại $2,540. Lúc 03:30 sáng khi thanh khoản thị trường mỏng, trên biểu đồ Spot giá ETH chỉ giảm nhẹ về <b>$2,548</b> rồi lập tức bật tăng lên $2,800.<br><br>Tuy nhiên sáng hôm sau thức dậy, bạn bàng hoàng thấy <i>lệnh Long của mình đã bị cắn Stop Loss tại $2,540</i> vì biểu đồ Futures giật một râu nến ảo cục bộ xuống tận <b>$2,532</b> trước khi bay vọt lên!",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        { "open": 2680, "high": 2700, "low": 2590, "close": 2600, vol: 120 },
        { "open": 2600, "high": 2610, "low": 2548, "close": 2580, vol: 140, "label": "Spot Đáy $2,548" },
        { "open": 2580, "high": 2590, "low": 2532, "close": 2575, vol: 390, "label": "FUTURES QUÉT $2,532 🩸", "labelColor": "#ff3b69" },
        { "open": 2575, "high": 2740, "low": 2570, "close": 2720, vol: 480, "label": "BAY $2,800 🚀" }
      ]
    },
    "question": "Nguyên nhân gốc rễ của hiện tượng này là gì và giải pháp phòng vệ sống còn trên sàn Futures là gì?",
    "options": [
      {
        "id": "A",
        "text": "Sàn giao dịch cố tình hack tài khoản cá nhân của bạn.",
        "isCorrect": False
      },
      {
        "id": "B",
        "text": "Do bạn dùng cơ chế kích hoạt SL theo 'Last Price' (Giá khớp lệnh cuối cùng trên Futures rất dễ bị râu ảo do giãn Spread) ➔ Giải pháp: Luôn chuyển loại kích hoạt Stop Loss sang 'MARK PRICE' (Giá đánh dấu được tính từ bình quân gia quyền Spot nhiều sàn lớn), đồng thời đặt SL lùi xa các mốc số tròn 0.3% - 0.5% để tạo vùng đệm an toàn!",
        "isCorrect": True
      },
      {
        "id": "C",
        "text": "Không bao giờ cài Stop Loss nữa để tránh bị quét râu.",
        "isCorrect": False
      },
      {
        "id": "D",
        "text": "Đánh đòn bẩy x100 để kiếm lại số tiền bị mất.",
        "isCorrect": False
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.4 - Dấu hiệu 7 & Chương 10)</b><br>• <b>Sự khác nhau giữa Last Price và Mark Price:</b> Last Price là giá giao dịch trên sàn Futures của bạn (rất dễ bị một lệnh bán lớn làm trượt giá cục bộ). Mark Price là giá chỉ số tham chiếu công bằng được tính toán từ các sàn giao dịch Spot hàng đầu thế giới (Binance, Coinbase, Kraken, OKX) nên không thể bị giật râu ảo.<br>• <b>Kinh nghiệm thực chiến:</b> Đừng bao giờ đặt Stop Loss đúng boong tại các mốc số tròn tâm lý ($2,500, $2,600, $60,000) vì đó là 'mồi ngon' ưa thích của các thuật toán săn râu quét thanh khoản!"
  },

  # ----------------------------------------------------
  # CASE 7: Bẫy Phá Vỡ Cấu Trúc Khung Nhỏ (Minor ChoCH) (Chương 6 & 7)
  # ----------------------------------------------------
  {
    "id": 7,
    "chapterId": 6,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "macro_cycle",
    "categoryName": "⏱️ Đa Khung Thời Gian & SMC (Chương 6 & 7)",
    "title": "Case Study 7: Bẫy Phá Vỡ Cấu Trúc Khung Nhỏ (Minor ChoCH) Chạm Cản 4H",
    "description": "<b>Bối cảnh thực tế:</b> Trên biểu đồ khung 4H, giá Bitcoin đang nằm trong một xu hướng Giảm (Downtrend) rõ rệt với cấu trúc Đỉnh thấp dần (LH) và Đáy thấp dần (LL).<br><br>Đột nhiên trên khung 15 phút, giá bật tăng mạnh và vượt qua đỉnh gần nhất, tạo tín hiệu <b>Bullish ChoCH (Đổi cấu trúc tăng khung nhỏ)</b>. Rất nhiều nhóm tín hiệu vội vã hô hào 'Đã đảo chiều thành công' và thi nhau mở lệnh Long đòn bẩy cao. Tuy nhiên, ngay phía trên chỉ cách +0.8% là <b>Khối Kháng Cự Bearish Order Block khổng lồ của khung 4H</b>!",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        { "open": 66000, "high": 66200, "low": 62000, "close": 62200, "vol": 350, "label": "Downtrend 4H" },
        { "open": 62200, "high": 63500, "low": 62100, "close": 63200, "vol": 210 },
        { "open": 63200, "high": 64800, "low": 63000, "close": 64600, "vol": 290, "label": "15m ChoCH Tăng ⭐" },
        { "open": 64600, "high": 65100, "low": 64400, "close": 64500, "vol": 480, "label": "Chạm Bearish OB 4H" },
        { "open": 64500, "high": 64600, "low": 61000, "close": 61200, "vol": 810, "label": "SẬP THEO TREND 4H 🩸", "labelColor": "#ff3b69" }
      ],
      "zones": [
        { "type": "resistance", "top": 65200, "bottom": 64700, "label": "BEARISH ORDER BLOCK KHUNG LỚN 4H" }
      ],
      "tradeSetup": { "entry": 64500, "sl": 65400, "tp": 60500, "startIndex": 3 }
    },
    "question": "Tư duy đúng đắn của Pro Trader khi nhìn đa khung thời gian trong tình huống này là gì?",
    "options": [
      {
        "id": "A",
        "text": "15m ChoCH tăng là tín hiệu đảo chiều không thể sai ➔ All-in Long ngay lập tức.",
        "isCorrect": False
      },
      {
        "id": "B",
        "text": "Khung nhỏ (15m) luôn phải phục tùng xu hướng khung lớn (4H). Nhịp tăng 15m thực chất chỉ là SÓNG HỒI để đưa giá lên chạm vùng bán rẻ của phe Gấu khung 4H ➔ Chờ nến 15m chạm Bearish OB 4H và xuất hiện nến đảo chiều (Pinbar/Engulfing) để MỞ LỆNH SHORT thuận theo xu hướng chính 4H (Entry $64,500, SL $65,400, TP $60,500)! ",
        "isCorrect": True
      },
      {
        "id": "C",
        "text": "Tắt biểu đồ 4H đi, chỉ cần quan sát biểu đồ 1 phút là đủ kiếm tiền.",
        "isCorrect": False
      },
      {
        "id": "D",
        "text": "Mở đồng thời cả lệnh Long và Short trên cùng một tài khoản.",
        "isCorrect": False
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 6.3 & Chương 7.5 - Chiến Lược Top-Down Đa Khung Thời Gian)</b><br>• <b>Nguyên tắc bất di bất dịch:</b> 4H định hướng Xu Hướng ➔ 1H tìm Vùng Cản (POI/OB) ➔ 15m/5m tìm Tín Hiệu Kích Hoạt (Trigger/Entry).<br>• Cú phá vỡ cấu trúc trên khung 15m khi đâm đầu vào bức tường thành 4H thường chỉ là một 'cái bẫy thanh khoản' (Liquidity Inducement) để dụ phe Mua non nớt cung cấp thanh khoản cho phe Bán khung lớn xả hàng!"
  },

  # ----------------------------------------------------
  # CASE 8: Bài Toán Quản Trị Vốn & Trượt Giá Slippage (Chương 10)
  # ----------------------------------------------------
  {
    "id": 8,
    "chapterId": 10,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "risk_execution",
    "categoryName": "🧮 Quản Trị Vốn & Trượt Giá (Chương 10)",
    "title": "Case Study 8: Bài Toán Xử Lý Khủng Hoảng Trượt Giá (Slippage) Altcoin Rác",
    "description": "<b>Bối cảnh thực tế:</b> Tài khoản bạn có $5,000 vốn. Bạn quyết định mở vị thế Long một đồng Memecoin vốn hóa nhỏ với đòn bẩy x15 (Tổng quy mô vị thế là $30,000). Bạn tính toán đặt Stop Loss 3% (chấp nhận lỗ $900).<br><br>Đột nhiên đội ngũ dự án xả hàng (Rugpull), giá Memecoin rơi thẳng đứng tạo một cây nến cắm thẳng không có người mua đỡ. Lệnh Stop Loss dạng Market của bạn bị <b>trượt giá (Slippage) sâu tới 8.5% mới khớp được lệnh</b>, khiến số tiền lỗ thực tế vọt lên <b>-$2,550 (bốc hơi hơn 51% tổng tài khoản chỉ trong 1 lệnh duy nhất)</b>.",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        { "open": 0.120, "high": 0.128, "low": 0.118, "close": 0.125, "vol": 200, "label": "Entry $0.125" },
        { "open": 0.125, "high": 0.126, "low": 0.121, "close": 0.122, "vol": 180, "label": "SL Dự Tính (-3%)" },
        { "open": 0.122, "high": 0.123, "low": 0.110, "close": 0.114, "vol": 950, "label": "TRƯỢT KHỚP (-8.5%) 🩸", "labelColor": "#ff3b69" }
      ]
    },
    "question": "Lỗi sai chí mạng của trader trong pha này là gì và công thức khắc phục chuẩn xác là gì?",
    "options": [
      {
        "id": "A",
        "text": "Lỗi do sàn giao dịch lừa đảo cố tình ăn tiền của người dùng.",
        "isCorrect": False
      },
      {
        "id": "B",
        "text": "Vi phạm nghiêm trọng quy tắc quản trị vốn: Dùng đòn bẩy quá cao (x15) và quy mô vị thế quá lớn trên đồng coin có thanh khoản mỏng ➔ Khắc phục: Với Altcoin rác / Memecoin, chỉ mạo hiểm tối đa 0.5% vốn/lệnh ($25), đòn bẩy tối đa x2-x3 (hoặc chỉ giao dịch Spot), luôn tính toán rủi ro trượt giá bằng lệnh Stop Limit!",
        "isCorrect": True
      },
      {
        "id": "C",
        "text": "Lần sau mở đòn bẩy x50 để gỡ lại số tiền đã mất.",
        "isCorrect": False
      },
      {
        "id": "D",
        "text": "Chỉ giao dịch theo các hội nhóm kéo kèo trên mạng xã hội.",
        "isCorrect": False
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 10.1 & Chương 10.3 - Quản Lý Vốn & Kiểm Soát Rủi Ro)</b><br>• <b>Toán học quản trị vốn sống còn:</b> Khi giao dịch các đồng coin có thanh khoản mỏng, chênh lệch cung cầu (Spread) rất lớn. Khi có biến cố xả hàng, sổ lệnh bên Mua bị xóa sạch, lệnh cắt lỗ Market sẽ bị trôi xuống tầng giá sâu nhất.<br>• <b>Bài học đắt giá:</b> Đừng bao giờ mang tư duy đánh Bitcoin (thanh khoản tỷ USD) áp dụng vào các đồng coin rác!"
  },

  # ----------------------------------------------------
  # CASE 9: Nhận Diện Pha Rũ Bỏ Cuối Cùng Wyckoff Spring (Chương 9.3)
  # ----------------------------------------------------
  {
    "id": 9,
    "chapterId": 9,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "macro_cycle",
    "categoryName": "🌊 Cấu Trúc Wyckoff & Tích Lũy (Chương 9.3)",
    "title": "Case Study 9: Nhận Diện Pha Rũ Bỏ Cuối Cùng Wyckoff Spring (Phase C)",
    "description": "<b>Bối cảnh thực tế:</b> Một đồng coin Layer 1 đi ngang tích lũy trong chiếc hộp biên độ $20 - $25 suốt hơn 4 tuần lễ. Phần lớn trader bắt đầu chán nản rời bỏ thị trường.<br><br>Đột ngột, một cây nến đỏ xả mạnh đâm thủng mép dưới hỗ trợ $20 rơi về tận <b>$17.80</b> khiến toàn bộ những người kiên trì nhất cũng phải hoảng sợ cắt lỗ. Tuy nhiên, ngay trong phiên tiếp theo, một cây nến xanh Marubozu kéo ngược trở lại đóng nến bên trong chiếc hộp tích lũy (tại <b>$21.80</b>) với <b>Volume bùng nổ cực đại</b>!",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        { "open": 22, "high": 24, "low": 21, "close": 23, "vol": 140 },
        { "open": 23, "high": 25, "low": 22.5, "close": 24.5, "vol": 160, "label": "Kháng Cự $25" },
        { "open": 24.5, "high": 24.8, "low": 20.2, "close": 20.4, "vol": 190, "label": "Hỗ Trợ $20" },
        { "open": 20.4, "high": 20.8, "low": 17.8, "close": 18.2, "vol": 680, "label": "SPRING RŨ BỎ 🩸", "labelColor": "#ef4444" },
        { "open": 18.2, "high": 22.2, "low": 18.1, "close": 21.8, "vol": 720, "label": "QUAY LẠI HỘP ⭐", "labelColor": "#00c076" },
        { "open": 21.8, "high": 28.5, "low": 21.5, "close": 28.0, "vol": 890, "label": "SÓNG MARKUP 🚀" }
      ],
      "zones": [
        { "type": "support", "top": 21.0, "bottom": 20.0, "label": "BIÊN DƯỚI HỘP TÍCH LŨY (TRADING RANGE)" }
      ],
      "tradeSetup": { "entry": 22.0, "sl": 17.5, "tp": 32.0, "startIndex": 4 }
    },
    "question": "Đây là hiện tượng kinh điển gì theo phương pháp luận Wyckoff và kế hoạch vào lệnh ra sao?",
    "options": [
      {
        "id": "A",
        "text": "Giá đã thủng hỗ trợ $20 chứng tỏ xu hướng tăng thất bại ➔ Mở lệnh Short đuổi theo đà giảm.",
        "isCorrect": False
      },
      {
        "id": "B",
        "text": "Đây chính là PHA SPRING (Pha C trong sơ đồ tích lũy Wyckoff): Cú rũ bỏ cuối cùng để quét sạch bầy cừu trước khi bước vào giai đoạn Đẩy Giá (Markup) ➔ Mở lệnh Long khi nến tái tích lũy đóng cửa trở lại bên trong Trading Range ($21.8 - $22.0), Stop Loss đặt dưới đáy nến Spring $17.5, Take Profit tại mục tiêu $25 và $32 (R:R >= 1 : 5)! ",
        "isCorrect": True
      },
      {
        "id": "C",
        "text": "Thị trường đã bước vào chu kỳ mùa đông đóng băng 3 năm.",
        "isCorrect": False
      },
      {
        "id": "D",
        "text": "Phương pháp Wyckoff đã lỗi thời không còn áp dụng được.",
        "isCorrect": False
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.3 - Phương Pháp Luận Wyckoff & Các Pha Tích Lũy)</b><br>• <b>Định nghĩa Spring:</b> Là hành vi kiểm tra (Test) lượng cung trôi nổi cuối cùng dưới vùng hỗ trợ. Nếu sau cú đâm thủng mà không có thêm áp lực bán tháo tiếp diễn, dòng tiền lớn sẽ nhanh chóng kéo giá ngược lại vào biên tích lũy.<br>• <b>Đặc điểm nhận diện:</b> Cú rũ bỏ Spring chính là cơ hội săn lệnh Long có tỷ lệ Risk/Reward vượt trội và an toàn nhất trong toàn bộ chu kỳ tích lũy của một đồng coin!"
  },

  # ----------------------------------------------------
  # CASE 10: Kế Hoạch Chốt Lời Từng Phần DCA Out (Chương 10.5)
  # ----------------------------------------------------
  {
    "id": 10,
    "chapterId": 10,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "risk_execution",
    "categoryName": "🧮 Quản Trị Vị Thế & Tâm Lý (Chương 10.5)",
    "title": "Case Study 10: Xây Dựng Kế Hoạch Chốt Lời Từng Phần (DCA Out) & Trailing Stop",
    "description": "<b>Bối cảnh thực tế:</b> Bạn đã bắt đáy thành công Bitcoin tại vùng giá $54,000. Hiện tại giá Bitcoin đã tăng bùng nổ lên tới <b>$96,000 (bạn đang có khoản lãi khổng lồ +77.7%)</b>.<br><br>Chỉ số Sợ hãi & Tham lam (Crypto Fear & Greed Index) đạt mức <b>92 điểm (Cực kỳ tham lam)</b>. Toàn bộ mạng xã hội ngập tràn các bài đăng khoe lãi và hô hào 'BTC sẽ đạt $150,000 trong tuần tới, ai bán là mất hàng'. Bạn bắt đầu cảm thấy phân vân và lo lắng không biết nên xử lý vị thế thế nào.",
    "chartConfig": {
      "width": 620,
      "height": 310,
      "candles": [
        { "open": 54000, "high": 58000, "low": 53500, "close": 57000, vol: 240, "label": "Entry $54k" },
        { "open": 57000, "high": 82000, low: 56500, close: 81000, vol: 480 },
        { "open": 81000, "high": 96000, low: 80500, close: 95500, vol: 780, "label": "ĐỈNH $96K ⚠️", "labelColor": "#f59e0b" }
      ]
    },
    "question": "Chiến lược quản trị vị thế và chốt lời thông minh, kỷ luật nhất của Pro Trader là gì?",
    "options": [
      {
        "id": "A",
        "text": "Gồng 100% tài sản không chốt đồng nào, vay mượn thêm tiền mua tiếp ở đỉnh $96k.",
        "isCorrect": False
      },
      {
        "id": "B",
        "text": "Bán tháo sạch 100% tài sản ra tiền mặt ngay lập tức vì sợ thị trường sập.",
        "isCorrect": False
      },
      {
        "id": "C",
        "text": "Áp dụng chiến lược DCA Out 3 Bước: Chốt trước 30% - 40% vị thế ở $96k để khóa lợi nhuận tiền thật vào tài khoản ngân hàng; Lập tức dời lệnh Stop Loss bảo vệ cho 60% còn lại về mức $88,000 (Đáy 4H gần nhất) để thả trôi lợi nhuận không còn bất kỳ rủi ro nào!",
        "isCorrect": True
      },
      {
        "id": "D",
        "text": "Chuyển toàn bộ số lãi sang đánh các đồng Memecoin rác với hy vọng nhân 100 lần.",
        "isCorrect": False
      }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ C (Theo Chương 10.4 & Chương 10.5 - Khóa Lợi Nhuận & Tâm Lý Giao Dịch)</b><br>• <b>Chân lý thị trường:</b> 'Lợi nhuận trên màn hình chỉ là con số ảo cho đến khi bạn bấm nút chốt lời đút tiền vào túi'. Khi đám đông cực kỳ tham lam là lúc thông minh nhất để bắt đầu chia vốn chốt lời dần.<br>• <b>Sức mạnh của Trailing Stop & DCA Out:</b> Bằng cách chốt 1 phần và dời SL về vùng có lãi, bạn loại bỏ hoàn toàn áp lực tâm lý sợ mất tiền, giữ được cái đầu lạnh để đi trọn vẹn con sóng lớn nhất của thị trường!"
  },

  # ----------------------------------------------------
  # CASES 11 - 30: EXPANDED SCENARIOS COVERING ALL 12 CHAPTERS
  # ----------------------------------------------------
  {
    "id": 11,
    "chapterId": 1,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "blockchain_basics",
    "categoryName": "⛓️ Bản Chất Blockchain (Chương 1)",
    "title": "Case Study 11: Nhận Diện Tính Bất Biến Của Sổ Cái & Giao Dịch Không Thể Thu Hồi",
    "description": "<b>Bối cảnh:</b> Một người dùng mới chuyển 0.5 BTC từ sàn Binance về địa chỉ ví cá nhân nhưng vô tình điền sai địa chỉ đích (nhập địa chỉ của một người lạ trên mạng). Sau khi mạng Bitcoin xác nhận 3 Block, người này liên hệ đội ngũ hỗ trợ để yêu cầu hủy lệnh chuyển tiền và hoàn lại 0.5 BTC.",
    "chartConfig": {
      "width": 620, "height": 260,
      "candles": [
        { "open": 60000, "high": 61000, "low": 59500, "close": 60800, "vol": 150, "label": "Block #101" },
        { "open": 60800, "high": 61500, "low": 60400, "close": 61200, "vol": 210, "label": "Block #102 (Đã Khóa)" },
        { "open": 61200, "high": 62500, "low": 61100, "close": 62400, "vol": 380, "label": "Block #103 (3 Xác Nhận) 🔒" }
      ]
    },
    "question": "Theo nguyên lý vận hành của công nghệ Blockchain, yêu cầu hoàn tiền này có thực hiện được không?",
    "options": [
      { "id": "A", "text": "Có thể hủy được nếu gửi yêu cầu cho CEO sàn Binance trong vòng 24 giờ.", "isCorrect": False },
      { "id": "B", "text": "KHÔNG THỂ HỦY HOẶC ĐẢO NGƯỢC: Khi giao dịch đã được ghi vào Block và các Node xác thực, tính bất biến (Immutability) của Blockchain khiến không ai (kể cả sàn hay lập trình viên) có quyền sửa đổi hay rút lại tài sản.", "isCorrect": True },
      { "id": "C", "text": "Ngân hàng trung ương có thể can thiệp phong tỏa địa chỉ ví người nhận để thu hồi.", "isCorrect": False },
      { "id": "D", "text": "Tắt kết nối Internet của điện thoại sẽ làm giao dịch tự động hoàn về.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 1.2 - Giáo Trình Crypto)</b><br>• Blockchain là cuốn sổ cái phân tán, bất biến và phi tập trung. Khi đã đạt xác nhận trên chuỗi, giao dịch là vĩnh viễn và không thể đảo ngược!"
  },
  {
    "id": 12,
    "chapterId": 1,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "blockchain_basics",
    "categoryName": "⛓️ Cơ Chế Đồng Thuận (Chương 1)",
    "title": "Case Study 12: Tấn Công 51% & Rủi Ro Double-Spending Trên Mạng Blockchain Nhỏ",
    "description": "<b>Bối cảnh:</b> Một mạng blockchain PoW vốn hóa nhỏ có tổng hashrate thấp bị một nhóm đào lạ kiểm soát hơn 53% tổng công suất đào. Nhóm này âm thầm tạo một nhánh chuỗi riêng bí mật dài hơn để chi tiêu cùng một lượng coin 2 lần (Double-Spending) trên các sàn giao dịch.",
    "chartConfig": {
      "width": 620, "height": 260,
      "candles": [
        { "open": 12, "high": 14, "low": 11, "close": 13.5, "vol": 180 },
        { "open": 13.5, "high": 14, "low": 8.5, "close": 9.0, "vol": 890, "label": "51% ATTACK 🩸", "labelColor": "#ff3b69" },
        { "open": 9.0, "high": 9.5, "low": 4.2, "close": 4.8, "vol": 650, "label": "MẤT NIỀM TIN" }
      ]
    },
    "question": "Biện pháp bảo vệ cốt lõi của người tham gia thị trường trước nguy cơ này là gì?",
    "options": [
      { "id": "A", "text": "Chỉ giao dịch và nắm giữ các mạng Blockchain có quy mô hashrate khổng lồ và độ phi tập trung cao (như Bitcoin, Ethereum) hoặc yêu cầu số lượng Block xác nhận lớn (30-60 confirmations) với chain nhỏ.", "isCorrect": True },
      { "id": "B", "text": "Nạp thêm tiền bắt đáy ngay khi giá coin bị tấn công 51%.", "isCorrect": False },
      { "id": "C", "text": "Yêu cầu bồi thường từ chính phủ nước sở tại.", "isCorrect": False },
      { "id": "D", "text": "Tấn công 51% chỉ là tin đồn vô hại.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ A (Theo Chương 1.2 & 2.1)</b><br>• Bitcoin sở hữu hashrate khổng lồ khiến chi phí tấn công 51% tiêu tốn hàng chục tỷ USD và bất khả thi về mặt kinh tế."
  },
  {
    "id": 13,
    "chapterId": 2,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "wallet_security",
    "categoryName": "🛡️ Bảo Mật Ví & Seed Phrase (Chương 2)",
    "title": "Case Study 13: Bẫy Phishing Seed Phrase Giả Mạo Hỗ Trợ Kỹ Thuật",
    "description": "<b>Bối cảnh:</b> Bạn vừa kết nối ví MetaMask vào một sàn DEX nhưng giao dịch bị lỗi mạng Pending. Một tài khoản Telegram tự xưng là 'MetaMask Official Support Agent' nhắn tin trực tiếp yêu cầu bạn cung cấp 12 từ khóa bí mật (Secret Recovery Phrase) hoặc nhập vào link 'sync-wallet-validation.org' để mở khóa nút giao dịch.",
    "chartConfig": None,
    "question": "Hành động đúng đắn và an toàn nhất là gì?",
    "options": [
      { "id": "A", "text": "Nhập 12 từ khóa vào website để đội ngũ kỹ thuật sửa lỗi ví nhanh chóng.", "isCorrect": False },
      { "id": "B", "text": "TUYỆT ĐỐI KHÔNG CUNG CẤP: Không có bất kỳ đội ngũ hỗ trợ hay admin nào được phép yêu cầu 12 từ khóa Seed Phrase. Đây là bẫy lừa đảo rút sạch 100% tài sản! Block ngay tài khoản đó.", "isCorrect": True },
      { "id": "C", "text": "Chỉ gửi 6 từ đầu tiên của chuỗi 12 từ để kiểm tra.", "isCorrect": False },
      { "id": "D", "text": "Chụp ảnh màn hình 12 từ gửi qua tin nhắn riêng.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 2.2 - Cảnh Báo Bảo Mật)</b><br>• 12 từ khóa Seed Phrase là chìa khóa chủ quyền tài sản. Cung cấp Seed Phrase = Chuyển toàn bộ tiền cho kẻ lừa đảo!"
  },
  {
    "id": 14,
    "chapterId": 2,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "wallet_security",
    "categoryName": "🪙 Spot vs Futures & Đòn Bẩy (Chương 2)",
    "title": "Case Study 14: Thảm Họa Đòn Bẩy Cao x50 Khi Giao Dịch Futures Thay Vì Spot",
    "description": "<b>Bối cảnh:</b> Nhà đầu tư A có $2,000 vốn. Thay vì mua SPOT Bitcoin để nắm giữ an toàn khi giá $60,000, A mở vị thế Long Futures đòn bẩy x50 (Giá trị vị thế $100,000). Giá Bitcoin chỉ cần điều chỉnh giảm -1.8% trong nhịp giật râu quét sàn.",
    "chartConfig": {
      "width": 620, "height": 260,
      "candles": [
        { "open": 60000, "high": 60200, "low": 58900, "close": 59000, "vol": 450, "label": "GIẢM -1.8% 🩸", "labelColor": "#ff3b69" },
        { "open": 59000, "high": 64000, "low": 58950, "close": 63800, "vol": 780, "label": "TĂNG LẠI $64K 🚀" }
      ]
    },
    "question": "Hậu quả tài khoản của nhà đầu tư A là gì?",
    "options": [
      { "id": "A", "text": "Tài khoản vẫn an toàn và lãi lớn khi giá bật lên $64,000.", "isCorrect": False },
      { "id": "B", "text": "BỊ THANH LÝ CHÁY SẠCH 100% VỐN ($2,000): Với đòn bẩy x50, khoảng cách giá cháy chỉ là 1.8% - 2.0%. Dù sau đó giá có bay lên $100k thì tài khoản đã về 0 từ trước!", "isCorrect": True },
      { "id": "C", "text": "Sàn giao dịch sẽ tự động cho vay thêm tiền để gồng qua nhịp giảm.", "isCorrect": False },
      { "id": "D", "text": "Chỉ bị trừ 1.8% số tiền ($36).", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 2.3 - Spot vs Futures)</b><br>• Đòn bẩy cao là con dao hai lưỡi. Với người mới, chỉ nên bắt đầu bằng SPOT hoặc Futures đòn bẩy tối đa x2 - x3 có Stop Loss chặt chẽ!"
  },
  {
    "id": 15,
    "chapterId": 3,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "orderbook_liquidity",
    "categoryName": "📊 Khớp Lệnh & Bể Thanh Khoản (Chương 3)",
    "title": "Case Study 15: Phân Biệt Lệnh Limit vs Lệnh Market Trong Pha Biến Động Lớn",
    "description": "<b>Bối cảnh:</b> Khi có tin tức đột biến, giá ETH đang biến động mạnh giữa $2,500 và $2,580 với thanh khoản sổ lệnh mỏng. Một trader bấm lệnh 'Market Buy' $50,000 USD thay vì đặt lệnh Limit ở mức giá mong muốn.",
    "chartConfig": {
      "width": 620, "height": 260,
      "candles": [
        { "open": 2500, "high": 2595, "low": 2495, "close": 2580, "vol": 620, "label": "TRƯỢT GIÁ MARKET ⚠️" }
      ]
    },
    "question": "Hậu quả trượt giá (Slippage) xảy ra đối với lệnh Market Buy này là gì?",
    "options": [
      { "id": "A", "text": "Lệnh khớp chính xác ở mức giá $2,500 hiển thị ban đầu.", "isCorrect": False },
      { "id": "B", "text": "Lệnh Market sẽ quét xuyên qua toàn bộ các tầng giá bán thấp và khớp ở các mức giá cao nhất ($2,570 - $2,590), dẫn đến việc mua đu đỉnh ngắn hạn với giá bất lợi do trượt giá.", "isCorrect": True },
      { "id": "C", "text": "Sàn giao dịch tự động hoàn lại khoản chênh lệch giá.", "isCorrect": False },
      { "id": "D", "text": "Lệnh bị treo vô thời hạn.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 3.1 - Cơ chế Khớp Lệnh Order Book)</b><br>• Lệnh Market ưu tiên tốc độ nhưng chấp nhận mọi mức giá trên sổ lệnh. Khi thị trường biến động mạnh, luôn ưu tiên dùng lệnh Limit!"
  },
  {
    "id": 16,
    "chapterId": 3,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "orderbook_liquidity",
    "categoryName": "📊 Bể Thanh Khoản BSL/SSL (Chương 3)",
    "title": "Case Study 16: Bẫy Bể Thanh Khoản Buy-Side Liquidity (BSL) Tại Đỉnh Cũ",
    "description": "<b>Bối cảnh:</b> Vùng đỉnh $68,000 của BTC thu hút hàng triệu USD lệnh Buy Stop (Stop Loss của phe Short và lệnh Breakout Buy của retail trader). Cá mập đẩy giá vượt nhẹ lên $68,400 để khớp bể thanh khoản BSL này rồi lập tức xả hàng.",
    "chartConfig": {
      "width": 620, "height": 260,
      "candles": [
        { "open": 66000, "high": 67800, "low": 65800, "close": 67500, "vol": 220 },
        { "open": 67500, "high": 68400, "low": 67400, "close": 67600, "vol": 890, "label": "QUÉT BSL 💥", "labelColor": "#f59e0b" },
        { "open": 67600, "high": 67700, "low": 64200, "close": 64500, "vol": 720, "label": "XẢ SẬP 🩸", "labelColor": "#ff3b69" }
      ],
      "zones": [{ "type": "resistance", "top": 68400, "bottom": 67800, "label": "BÃI STOP LOSS PHE SHORT (BSL)" }]
    },
    "question": "Bản chất dòng tiền ở vùng $68,400 là gì?",
    "options": [
      { "id": "A", "text": "Cá mập mua vào để đẩy giá lên $100k.", "isCorrect": False },
      { "id": "B", "text": "Cá mập lợi dụng thanh khoản mua cưỡng bức của phe Short (Buy-Side Liquidity) để làm đối ứng cho các lệnh Bán chốt lời hàng trăm triệu USD ở vùng giá cao nhất!", "isCorrect": True },
      { "id": "C", "text": "Do sàn lỗi đường truyền.", "isCorrect": False },
      { "id": "D", "text": "Tín hiệu mua tất tay theo đà tăng.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 3.2 & Chương 9.4)</b><br>• Muốn bán khối lượng lớn giá cao, Nhà tạo lập buộc phải đẩy giá tới nơi có nhiều người muốn mua nhất (vùng BSL đỉnh cũ)."
  },
  {
    "id": 17,
    "chapterId": 4,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "candlestick_patterns",
    "categoryName": "🕯️ Mô Hình Nến Đảo Chiều (Chương 4)",
    "title": "Case Study 17: Cụm Nến Sao Mai (Morning Star) Tại Vùng Hỗ Trợ Khung 1H",
    "description": "<b>Bối cảnh:</b> Sau chuỗi giảm mạnh, giá SOL xuất hiện Nến 1 đỏ dài, Nến 2 là Doji chuồn chuồn tại hỗ trợ $128, và Nến 3 là Nến xanh lớn đóng cửa vượt quá 65% thân nến đỏ thứ nhất.",
    "chartConfig": {
      "width": 620, "height": 260,
      "candles": [
        { "open": 142, "high": 143, "low": 133, "close": 134, "vol": 190 },
        { "open": 134, "high": 135, "low": 126, "close": 127, "vol": 240, "label": "N1: Đỏ Lớn" },
        { "open": 127, "high": 128.5, "low": 124, "close": 127.5, "vol": 180, "label": "N2: Doji Đáy" },
        { "open": 127.5, "high": 138, "low": 127, "close": 137, "vol": 480, "label": "N3: Xanh Lớn (Sao Mai) ⭐", "labelColor": "#00c076" },
        { "open": 137, "high": 148, "low": 136.5, "close": 146, "vol": 420 }
      ],
      "zones": [{ "type": "support", "top": 128, "bottom": 124, "label": "HỖ TRỢ ĐÁY" }],
      "tradeSetup": { "entry": 137.5, "sl": 123.5, "tp": 155.0, "startIndex": 3 }
    },
    "question": "Chiến lược vào lệnh chuẩn mực theo mô hình Morning Star là gì?",
    "options": [
      { "id": "A", "text": "Vào Short ngay vì xu hướng trước đó là giảm.", "isCorrect": False },
      { "id": "B", "text": "Mở vị thế Long khi Nến 3 đóng cửa xác nhận ($137.5), Stop Loss đặt dưới đáy nến Doji ($123.5), Take Profit tại kháng cự $155 (R:R ≈ 1 : 2.5).", "isCorrect": True },
      { "id": "C", "text": "Chờ giá giảm thêm 50% mới vào lệnh.", "isCorrect": False },
      { "id": "D", "text": "Không cài Stop Loss vì Morning Star có tỷ lệ đúng 100%.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 4.2.B - Giáo Trình Crypto)</b><br>• Morning Star là cụm 3 nến đảo chiều đáy kinh điển báo hiệu phe Bò đã giành lại toàn quyền kiểm soát."
  },
  {
    "id": 18,
    "chapterId": 4,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "candlestick_patterns",
    "categoryName": "🕯️ Nến Shooting Star & Bẫy Đỉnh (Chương 4)",
    "title": "Case Study 18: Nến Shooting Star Xuất Hiện Sau Chuỗi Tăng Nóng Chạm Kháng Cự 4H",
    "description": "<b>Bối cảnh:</b> Giá BNB tăng 7 cây nến xanh liên tiếp lên $620. Cây nến tiếp theo có râu trên dài gấp 3 lần thân nến, đóng cửa là nến đỏ nhỏ sát đáy phiên kèm Volume tăng đột biến.",
    "chartConfig": {
      "width": 620, "height": 260,
      "candles": [
        { "open": 560, "high": 585, "low": 558, "close": 580, "vol": 150 },
        { "open": 580, "high": 605, "low": 578, "close": 600, "vol": 210 },
        { "open": 600, "high": 625, "low": 598, "close": 602, "vol": 540, "label": "SHOOTING STAR 🩸", "labelColor": "#ff3b69" },
        { "open": 602, "high": 604, "low": 565, "close": 570, "vol": 480, "label": "XÁC NHẬN SẬP" }
      ],
      "zones": [{ "type": "resistance", "top": 625, "bottom": 615, "label": "KHÁNG CỰ 4H" }]
    },
    "question": "Tín hiệu trên cảnh báo điều gì và trader nên xử lý ra sao?",
    "options": [
      { "id": "A", "text": "Tín hiệu mua đuổi vì râu trên nến chạm giá cao $625.", "isCorrect": False },
      { "id": "B", "text": "Cảnh báo phe mua đã kiệt sức và bị phe bán xả hàng chặn đứng tại cản ➔ Chốt lời vị thế Mua hoặc canh mở vị thế Bán khống (Short) với SL trên đỉnh râu nến $626.", "isCorrect": True },
      { "id": "C", "text": "Nến Shooting Star không có ý nghĩa khi thị trường đang tăng mạnh.", "isCorrect": False },
      { "id": "D", "text": "Nạp thêm vốn mua gấp đôi ở đỉnh.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 4.1.B - Nến Shooting Star)</b><br>• Râu trên dài thể hiện áp lực từ chối giá cao kịch liệt từ phe Gấu tại vùng kháng cự."
  },
  {
    "id": 19,
    "chapterId": 5,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "support_resistance",
    "categoryName": "🏢 Chuyển Đổi Vai Trò Break & Retest (Chương 5)",
    "title": "Case Study 19: Vào Lệnh Mua Chuẩn Kỷ Luật Khi Kháng Cự Biến Thành Hỗ Trợ Mới",
    "description": "<b>Bối cảnh:</b> Giá NEAR đi ngang dưới vùng cản $5.00 suốt 2 tuần. Một cây nến 4H tăng mạnh vượt $5.40 với Volume cao gấp đôi trung bình. Sau đó, giá điều chỉnh nhẹ nhàng về vùng $5.05 - $5.10 với Volume cạn kiệt và xuất hiện nến Hammer.",
    "chartConfig": {
      "width": 620, "height": 260,
      "candles": [
        { "open": 4.6, "high": 4.95, "low": 4.5, "close": 4.85, "vol": 110 },
        { "open": 4.85, "high": 5.45, "low": 4.80, "close": 5.40, "vol": 520, "label": "BREAKOUT 💥", "labelColor": "#38bdf8" },
        { "open": 5.40, "high": 5.45, "low": 5.05, "close": 5.10, "vol": 130, "label": "RETEST (VOL THẤP) 🎯", "labelColor": "#00c076" },
        { "open": 5.10, "high": 6.20, "low": 5.08, "close": 6.10, "vol": 490, "label": "TĂNG TIẾP 🚀" }
      ],
      "zones": [{ "type": "resistance", "top": 5.05, "bottom": 4.95, "label": "KHÁNG CỰ CŨ ➔ HỖ TRỢ MỚI" }],
      "tradeSetup": { "entry": 5.15, "sl": 4.85, "tp": 6.20, "startIndex": 2 }
    },
    "question": "Điểm vào lệnh tối ưu và an toàn nhất là ở đâu?",
    "options": [
      { "id": "A", "text": "Mua đuổi ngay tại đỉnh cây nến Breakout $5.45.", "isCorrect": False },
      { "id": "B", "text": "Vào lệnh Mua khi giá Retest thành công về vùng cản cũ ($5.10 - $5.15) có nến rút chân + Volume thấp, SL dưới vùng cản $4.85, TP tại đỉnh mục tiêu $6.20.", "isCorrect": True },
      { "id": "C", "text": "Mở Short vì giá đang hồi giảm.", "isCorrect": False },
      { "id": "D", "text": "Chờ giá thủng về $3.00.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 5.4 - Quy Tắc Chuyển Đổi Vai Trò)</b><br>• Mua tại nhịp Retest giúp tối ưu điểm vào và có Stop Loss cực kỳ ngắn!"
  },
  {
    "id": 20,
    "chapterId": 6,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "market_structure_smc",
    "categoryName": "📈 Cấu Trúc Xu Hướng HH/HL (Chương 6)",
    "title": "Case Study 20: Xác Định Xu Hướng Uptrend Còn Duy Trì Hay Đã Bị Bẻ Gãy",
    "description": "<b>Bối cảnh:</b> Giá AVAX đang trong cấu trúc Uptrend với Đáy Higher Low (HL) gần nhất tại $24.00. Giá bất ngờ có nhịp giảm xuyên thủng qua mốc $24.00 và đóng nến 4H tại $22.50.",
    "chartConfig": {
      "width": 620, "height": 260,
      "candles": [
        { "open": 20, "high": 26, "low": 19.5, "close": 25.5, "vol": 150 },
        { "open": 25.5, "high": 26.5, "low": 23.8, "close": 24.2, "vol": 120, "label": "Đáy HL Gần Nhất ($24)" },
        { "open": 24.2, "high": 31, "low": 24.0, "close": 30.5, "vol": 240, "label": "Đỉnh HH Mới ($31)" },
        { "open": 30.5, "high": 30.8, "low": 22.0, "close": 22.5, "vol": 480, "label": "GÃY HL (CHOCH) ⚡", "labelColor": "#ff3b69" }
      ]
    },
    "question": "Tín hiệu nến 4H đóng cửa dưới đáy HL $24.00 thông báo điều gì?",
    "options": [
      { "id": "A", "text": "Cấu trúc Uptrend vẫn giữ nguyên, tiếp tục mua vào bắt đáy.", "isCorrect": False },
      { "id": "B", "text": "Cấu trúc tăng đã chính thức BỊ BẺ GÃY (Tín hiệu Change of Character - CHoCH), thị trường có xác suất cao chuyển sang Downtrend hoặc Sideway rộng ➔ Ngừng mua gom, chờ kịch bản hồi test để canh Short.", "isCorrect": True },
      { "id": "C", "text": "Thị trường chuẩn bị tăng gấp 10 lần.", "isCorrect": False },
      { "id": "D", "text": "Chỉ là sự cố hiển thị của sàn.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 6.1 & 6.2 - Cấu Trúc Thị Trường)</b><br>• Khi đáy Higher Low tạo ra đỉnh cao nhất bị đục thủng và đóng nến dưới, cấu trúc tăng bị phá vỡ."
  },
  {
    "id": 21,
    "chapterId": 7,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "multi_timeframe",
    "categoryName": "⏱️ Đa Khung Thời Gian & Killzones (Chương 7)",
    "title": "Case Study 21: Tận Dụng Khung Giờ Vàng (London / NY Killzones) Tránh Bẫy Sideway",
    "description": "<b>Bối cảnh:</b> Trong phiên Á (06:00 - 12:00 VN), giá BTC đi ngang trong biên độ hẹp $300. Nhiều trader nôn nóng vào lệnh đòn bẩy cao và liên tục bị dính phí funding + trượt giá. Đến 14:30 (Mở phiên London), biến động bùng nổ quét sạch 2 đầu trước khi vào sóng đẩy chính.",
    "chartConfig": {
      "width": 620, "height": 260,
      "candles": [
        { "open": 62100, "high": 62200, "low": 62000, "close": 62050, "vol": 50, "label": "Phiên Á (Sideway)" },
        { "open": 62050, "high": 62150, "low": 61950, "close": 62100, "vol": 60 },
        { "open": 62100, "high": 62800, "low": 61600, "close": 62700, "vol": 680, "label": "LONDON KILLZONE ⚡", "labelColor": "#38bdf8" },
        { "open": 62700, "high": 64500, "low": 62600, "close": 64200, "vol": 890, "label": "SÓNG ĐẨY MỸ 🚀" }
      ]
    },
    "question": "Quy tắc chọn thời gian giao dịch thông minh theo Giáo trình là gì?",
    "options": [
      { "id": "A", "text": "Ngồi canh màn hình 24/24 và vào lệnh liên tục trong phiên Á.", "isCorrect": False },
      { "id": "B", "text": "Hạn chế giao dịch trong phiên Á thanh khoản mỏng; Tập trung cao độ vào các khung giờ vàng: London Open (14:30 - 17:30 VN) và New York Open (19:30 - 23:00 VN) khi dòng tiền tổ chức tham gia mạnh mẽ nhất!", "isCorrect": True },
      { "id": "C", "text": "Chỉ giao dịch vào lúc 3h sáng.", "isCorrect": False },
      { "id": "D", "text": "Khung giờ nào cũng như nhau trong thị trường crypto.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 7.4 - Chuyên đề Khung Giờ Vàng Killzones)</b><br>• Giao dịch đúng khung giờ giúp tránh bẫy cưa chân bàn của thị trường đi ngang."
  },
  {
    "id": 22,
    "chapterId": 8,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "volume_vsa",
    "categoryName": "📊 Khối Lượng VSA & Phân Kỳ (Chương 8)",
    "title": "Case Study 22: Nhận Diện Phân Kỳ Tăng Giá RSI (Bullish Divergence) Khung 4H",
    "description": "<b>Bối cảnh:</b> Giá Bitcoin sau chuỗi ngày giảm liên tục tạo Đáy mới thấp hơn (LL: $56,000 rơi về $53,500). Tuy nhiên, chỉ báo RSI trên khung 4H lại tạo Đáy sau cao hơn rõ rệt (HL: từ 26 điểm dâng lên 33 điểm).",
    "chartConfig": {
      "width": 620, "height": 260,
      "candles": [
        { "open": 60000, "high": 60200, "low": 55800, "close": 56000, "vol": 240, "label": "Đáy 1 ($56k - RSI 26)" },
        { "open": 56000, "high": 57500, "low": 55900, "close": 57000, "vol": 190 },
        { "open": 57000, "high": 57200, "low": 53400, "close": 53500, "vol": 310, "label": "Đáy 2 ($53.5k - RSI 33) ⭐", "labelColor": "#00c076" },
        { "open": 53500, "high": 58000, "low": 53450, "close": 57800, "vol": 620, "label": "PHÂN KỲ BÙNG NỔ 🚀" }
      ]
    },
    "question": "Tín hiệu phân kỳ RSI trên báo hiệu điều gì?",
    "options": [
      { "id": "A", "text": "Giá tạo đáy mới thấp hơn nghĩa là đà giảm đang mạnh hơn ➔ Short đuổi.", "isCorrect": False },
      { "id": "B", "text": "Tín hiệu Phân kỳ tăng giá (Bullish Divergence): Lực bán đã suy kiệt nghiêm trọng mặc dù giá rơi sâu hơn, dự báo xác suất đảo chiều tăng giá rất cao ➔ Canh mở vị thế Long khi xuất hiện nến rút chân xác nhận.", "isCorrect": True },
      { "id": "C", "text": "RSI không có tác dụng trong thị trường crypto.", "isCorrect": False },
      { "id": "D", "text": "Bán tháo toàn bộ danh mục.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 8.2 - Chỉ báo RSI & Phân Kỳ)</b><br>• Phân kỳ đáy RSI là một trong những chỉ báo sớm uy tín nhất của phân tích kỹ thuật."
  },
  {
    "id": 27,
    "chapterId": 9,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "macro_cycle",
    "categoryName": "🌊 Nhận Diện Đỉnh Chu Kỳ Memecoin (Chương 9.2)",
    "title": "Case Study 27: Dấu Hiệu Đỉnh Sóng Khi Memecoin Vốn Hóa Nhỏ Tăng Hàng Trăm Lần",
    "description": "<b>Bối cảnh:</b> Bitcoin và Ethereum đi ngang 3 tuần. Thị trường tràn ngập các đồng Memecoin vô giá trị tăng x50 - x200 trong vài ngày. Báo chí đại chúng và người không chuyên bắt đầu bàn tán rủ nhau nghỉ việc để chơi coin.",
    "chartConfig": None,
    "question": "Theo chu kỳ luân chuyển dòng tiền 5 Pha, thị trường đang ở pha nào và hành động an toàn là gì?",
    "options": [
      { "id": "A", "text": "Thị trường mới bắt đầu chu kỳ ➔ Vay mượn mua tất tay các đồng memecoin.", "isCorrect": False },
      { "id": "B", "text": "Thị trường đang ở Pha 4 (Sóng Memecoin cuối cùng & Cực độ tham lam) chuẩn bị bước vào Pha 5 (Xả về USDT & Sập Downtrend) ➔ Lập tức chốt lời từng phần (DCA Out) ra USDT để bảo toàn lợi nhuận!", "isCorrect": True },
      { "id": "C", "text": "Memecoin sẽ thay thế Bitcoin làm đồng tiền toàn cầu.", "isCorrect": False },
      { "id": "D", "text": "Không cần làm gì cả.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.2 - Pha 4 & 5 Chu Kỳ Dòng Tiền)</b><br>• Khi Memecoin rác bay điên cuồng là tín hiệu dòng tiền thông minh đang âm thầm xả hàng rút về USDT."
  },
  {
    "id": 28,
    "chapterId": 10,
    "level": "intermediate",
    "levelLabel": "⚡ Trung Bình",
    "category": "risk_execution",
    "categoryName": "🧠 Kiểm Soát Tâm Lý Cay Cú (Chương 10.5)",
    "title": "Case Study 28: Ngăn Chặn Chuỗi Thua Lỗ Liên Tiếp Bằng Quy Tắc Cooldown 24H",
    "description": "<b>Bối cảnh:</b> Một trader vừa dính 2 lệnh Stop Loss liên tiếp trong buổi sáng (mất -$200). Tâm lý bắt đầu ức chế, muốn mở ngay lệnh thứ 3 với khối lượng gấp đôi để 'gỡ lại số tiền đã mất trước giờ ăn trưa'.",
    "chartConfig": None,
    "question": "Quy tắc kỷ luật chuẩn mực của Pro Trader trong tình huống này là gì?",
    "options": [
      { "id": "A", "text": "Tiếp tục vào lệnh ngay lập tức vì cơ hội thị trường không chờ đợi.", "isCorrect": False },
      { "id": "B", "text": "Áp dụng Quy tắc Cooldown 24H: Lập tức tắt máy tính, rời khỏi bàn làm việc ít nhất 24 giờ. Trạng thái 'Revenge Trading' làm tê liệt tư duy logic và là nguyên nhân số 1 dẫn đến cháy tài khoản!", "isCorrect": True },
      { "id": "C", "text": "Nâng đòn bẩy lên x100 để gỡ trong 1 cây nến.", "isCorrect": False },
      { "id": "D", "text": "Hỏi ý kiến bạn bè trên mạng xã hội.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 9.3 & 10.5 - Tâm Lý Giao Dịch)</b><br>• Sau 2 lệnh thua liên tiếp, cảm xúc đã lấn át hoàn toàn lý trí. Tắt máy là hành động dũng cảm nhất của một Master Trader."
  },
  {
    "id": 29,
    "chapterId": 11,
    "level": "advanced",
    "levelLabel": "🔥 Nâng Cao",
    "category": "market_structure_smc",
    "categoryName": "🏛️ Khối Lệnh Order Block & FVG (Chương 11)",
    "title": "Case Study 29: Phục Kích Điểm Vào Lệnh Tại Vùng Imbalance FVG Khung 1H",
    "description": "<b>Bối cảnh:</b> Giá ETH sau tin tức bùng nổ để lại một khoảng trống giá trị Fair Value Gap (FVG) giữa Râu Nến 1 ($2,420) và Râu Nến 3 ($2,480). Giá tăng lên $2,650 rồi bắt đầu có nhịp hồi kiểm tra lại.",
    "chartConfig": {
      "width": 620, "height": 260,
      "candles": [
        { "open": 2380, "high": 2420, "low": 2370, "close": 2410, "vol": 180, "label": "Nến 1 (Đỉnh $2,420)" },
        { "open": 2410, "high": 2580, "low": 2405, "close": 2570, "vol": 920, "label": "Nến 2 (Đột Biến)" },
        { "open": 2570, "high": 2650, "low": 2480, "close": 2640, "vol": 450, "label": "Nến 3 (Đáy $2,480)" },
        { "open": 2640, "high": 2650, "low": 2440, "close": 2460, "vol": 280, "label": "LẤP FVG RETEST 🎯", "labelColor": "#00c076" }
      ],
      "zones": [{ "type": "support", "top": 2480, "bottom": 2420, "label": "KHOẢNG TRỐNG GIÁ FVG ($2,420 - $2,480)" }],
      "tradeSetup": { "entry": 2450, "sl": 2390, "tp": 2750, "startIndex": 3 }
    },
    "question": "Chiến lược giao dịch SMC chuẩn xác khi giá rơi về vùng FVG là gì?",
    "options": [
      { "id": "A", "text": "Mở Short vì giá đang rơi mạnh từ $2,650.", "isCorrect": False },
      { "id": "B", "text": "Vào lệnh Mua khi giá lấp đầy vùng FVG ($2,440 - $2,460) và xuất hiện nến rút chân xác nhận, SL dưới đáy Nến 1 ($2,390), TP đỉnh cũ $2,750 (R:R ≈ 1 : 5.0)!", "isCorrect": True },
      { "id": "C", "text": "FVG là vùng không có ý nghĩa kỹ thuật.", "isCorrect": False },
      { "id": "D", "text": "Đợi giá rơi về $1,000.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 11 - Smart Money Concepts)</b><br>• Vùng FVG đóng vai trò như một thỏi nam châm hút giá quay lại lấp thanh khoản trước khi tiếp tục sóng đẩy!"
  },
  {
    "id": 30,
    "chapterId": 12,
    "level": "basic",
    "levelLabel": "🌱 Cơ Bản",
    "category": "trading_roadmap",
    "categoryName": "🗺️ Lộ Trình 5 Bước Trader (Chương 12)",
    "title": "Case Study 30: Tầm Quan Trọng Của Việc Ghi Nhật Ký Giao Dịch & Backtesting",
    "description": "<b>Bối cảnh:</b> Hai trader mới bắt đầu: Trader A giao dịch theo cảm tính, thắng không biết tại sao thắng, thua không rõ nguyên nhân. Trader B ghi chép đầy đủ từng lệnh vào Trade Journal (kèm ảnh chụp chart trước/sau lệnh, lý do SL/TP, cảm xúc).",
    "chartConfig": None,
    "question": "Sau 6 tháng, sự khác biệt lớn nhất giữa Trader A và Trader B là gì?",
    "options": [
      { "id": "A", "text": "Cả hai đều có kết quả ngẫu nhiên như nhau.", "isCorrect": False },
      { "id": "B", "text": "Trader B tích lũy được dữ liệu thống kê khách quan, nhận diện được điểm yếu (overtrading, dời SL) và từng bước trở thành Trader có lợi nhuận nhất quán (Consistent Profitable Trader); trong khi Trader A dễ dàng cháy tài khoản do lặp lại các sai lầm cũ.", "isCorrect": True },
      { "id": "C", "text": "Viết nhật ký chỉ tốn thời gian không có ích lợi.", "isCorrect": False },
      { "id": "D", "text": "Trader A sẽ giỏi hơn vì không bị gò bó kỷ luật.", "isCorrect": False }
    ],
    "explanation": "<b>✅ ĐÁP ÁN ĐÚNG LÀ B (Theo Chương 12 - Lộ Trình 5 Bước Trở Thành Trader Độc Lập)</b><br>• 'Cái gì đo lường được thì cái đó mới cải thiện được!' Nhật ký giao dịch là chiếc gương phản chiếu kỷ luật của chính bạn."
  }
]

scenarios_json = json.dumps(practice_scenarios, indent=2, ensure_ascii=False)

js_content = f"""// --- MODULE 2: INTERACTIVE TRADING PRACTICE & CASE STUDIES (30 CASES ACROSS 12 CHAPTERS) ---
// 100% Comprehensive Practical Scenarios, Whale Manipulation Traps & SMC Framework
// Built directly from the official rules of 'Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md'

let practiceStats = {{
  total: 0,
  correct: 0,
  streak: 0,
  answered: {{}},
  chapterStats: {{}}
}};

const practiceScenarios = {scenarios_json};

let currentScenarioIndex = 0;
let currentFilterCategory = 'all';
let currentFilterLevel = 'all';
let currentFilterChapter = 'all';

function initPracticeModule() {{
  renderPracticeStats();
  renderPracticeCategoryFilters();
  loadCurrentScenario();
}}

function renderPracticeStats() {{
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
}}

function renderPracticeCategoryFilters() {{
  const container = document.getElementById('practice-category-pills');
  if (!container) return;

  const categories = [
    {{ id: 'all', name: '🎯 Tất Cả (' + practiceScenarios.length + ' Case)' }},
    {{ id: 'whale_traps', name: '🐋 Bẫy Cá Mập & Quét Sàn' }},
    {{ id: 'derivatives_data', name: '📊 Phái Sinh & Squeeze' }},
    {{ id: 'macro_cycle', name: '🌊 Vĩ Mô & Chu Kỳ' }},
    {{ id: 'market_structure_smc', name: '🏛️ SMC & Cấu Trúc' }},
    {{ id: 'candlestick_patterns', name: '🕯️ Mô Hình Nến' }},
    {{ id: 'risk_execution', name: '🛡️ Quản Trị Rủi Ro' }},
    {{ id: 'wallet_security', name: '🔒 Bảo Mật Ví' }}
  ];

  let catBtns = categories.map(function(cat) {{
    const activeClass = currentFilterCategory === cat.id ? 'active' : '';
    return '<button class="coin-pill-btn ' + activeClass + '" onclick="filterPracticeCategory(\\'' + cat.id + '\\')">' + cat.name + '</button>';
  }}).join('');

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
}}

function filterPracticeCategory(catId) {{
  currentFilterCategory = catId;
  renderPracticeCategoryFilters();
  currentScenarioIndex = 0;
  loadCurrentScenario();
}}

function filterPracticeLevel(lvl) {{
  currentFilterLevel = lvl;
  renderPracticeCategoryFilters();
  currentScenarioIndex = 0;
  loadCurrentScenario();
}}

function filterPracticeChapter(chap) {{
  currentFilterChapter = chap;
  renderPracticeCategoryFilters();
  currentScenarioIndex = 0;
  loadCurrentScenario();
}}

function getFilteredScenarios() {{
  return practiceScenarios.filter(function(s) {{
    const matchCat = currentFilterCategory === 'all' || s.category === currentFilterCategory;
    const matchLvl = currentFilterLevel === 'all' || s.level === currentFilterLevel;
    const matchChap = currentFilterChapter === 'all' || String(s.chapterId) === String(currentFilterChapter);
    return matchCat && matchLvl && matchChap;
  }});
}}

function loadCurrentScenario() {{
  const filtered = getFilteredScenarios();
  const container = document.getElementById('practice-card-container');
  if (!container) return;

  if (filtered.length === 0) {{
    container.innerHTML = 
      '<div class="card" style="padding: 40px; text-align: center; color: var(--text-muted);">' +
        '<div style="font-size: 32px; margin-bottom: 10px;">🔍</div>' +
        '<div style="font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 6px;">Không tìm thấy bài tập phù hợp với bộ lọc</div>' +
        '<div style="font-size: 12.5px; margin-bottom: 14px;">Hãy thử chọn lại danh mục hoặc độ khó khác.</div>' +
        '<button class="btn btn-outline" onclick="filterPracticeCategory(\\'all\\'); filterPracticeLevel(\\'all\\'); filterPracticeChapter(\\'all\\');">Đặt lại bộ lọc</button>' +
      '</div>';
    return;
  }}

  const scenario = filtered[currentScenarioIndex] || filtered[0];
  const userChoice = practiceStats.answered[scenario.id];

  let chartSvgHtml = '';
  if (window.ChartVisualizer && scenario.chartConfig) {{
    chartSvgHtml = ChartVisualizer.renderChartSvg(scenario.chartConfig);
  }}

  let optionsHtml = scenario.options.map(function(opt) {{
    let btnClass = 'quiz-option-btn';
    let icon = opt.id;
    
    if (userChoice) {{
      if (opt.isCorrect) {{
        btnClass += ' option-correct';
        icon = '✅';
      }} else if (userChoice === opt.id) {{
        btnClass += ' option-wrong';
        icon = '❌';
      }}
    }}

    return '<button class="' + btnClass + '" onclick="submitPracticeAnswer(' + scenario.id + ', \\'' + opt.id + '\\')" ' + (userChoice ? 'disabled' : '') + ' style="text-align: left; line-height: 1.55; padding: 12px 14px;">' +
      '<span class="opt-badge">' + icon + '</span>' +
      '<span class="opt-text" style="font-size: 13px;">' + opt.text + '</span>' +
    '</button>';
  }}).join('');

  let explanationHtml = '';
  if (userChoice) {{
    explanationHtml = 
      '<div class="quiz-explanation-card animate-fadeIn" style="border-left: 4px solid #38bdf8; background: rgba(15, 23, 42, 0.95); padding: 16px; border-radius: 8px; margin-top: 14px;">' +
        '<div style="font-size: 14.5px; font-weight: 800; margin-bottom: 10px; color: #38bdf8; display: flex; align-items: center; gap: 6px;">' +
          '<span>💡</span> Lời Giải Giải Phẫu Hành Vi & Kế Hoạch Thực Chiến' +
        '</div>' +
        '<div style="font-size: 13.5px; line-height: 1.7; color: #e2e8f0;">' +
          scenario.explanation +
        '</div>' +
      '</div>';
  }}

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
}}

function submitPracticeAnswer(scenarioId, chosenOptionId) {{
  if (practiceStats.answered[scenarioId]) return;

  const scenario = practiceScenarios.find(function(s) {{ return s.id === scenarioId; }});
  if (!scenario) return;

  const chosen = scenario.options.find(function(o) {{ return o.id === chosenOptionId; }});
  const isCorrect = chosen && chosen.isCorrect;

  practiceStats.answered[scenarioId] = chosenOptionId;
  practiceStats.total++;

  const chap = scenario.chapterId || 1;
  practiceStats.chapterStats[chap] = practiceStats.chapterStats[chap] || {{ attempted: 0, correct: 0, failed: 0 }};
  practiceStats.chapterStats[chap].attempted++;

  if (isCorrect) {{
    practiceStats.correct++;
    practiceStats.streak++;
    practiceStats.chapterStats[chap].correct++;
    if (window.showToast) showToast('🎉 Chính xác! Bạn đã nắm rất vững tư duy kỹ thuật & hành vi!', 'success');
  }} else {{
    practiceStats.streak = 0;
    practiceStats.chapterStats[chap].failed++;
    if (window.showToast) showToast('❌ Chưa chính xác! Hãy đọc kỹ phần giải phẫu hành vi bên dưới để rút kinh nghiệm.', 'warning');
  }}

  renderPracticeStats();
  loadCurrentScenario();
}}

function navigatePracticeScenario(dir) {{
  const filtered = getFilteredScenarios();
  const nextIdx = currentScenarioIndex + dir;
  if (nextIdx >= 0 && nextIdx < filtered.length) {{
    currentScenarioIndex = nextIdx;
    loadCurrentScenario();
  }}
}}

function resetPracticeQuiz() {{
  if (!confirm('Bạn có muốn đặt lại toàn bộ tiến độ bài tập để thử thách lại từ đầu không?')) return;
  practiceStats = {{
    total: 0,
    correct: 0,
    streak: 0,
    answered: {{}},
    chapterStats: {{}}
  }};
  currentScenarioIndex = 0;
  renderPracticeStats();
  loadCurrentScenario();
  if (window.showToast) showToast('Đã đặt lại 30 Case Study thực hành.', 'info');
}}

if (typeof window !== 'undefined') {{
  window.initPracticeModule = initPracticeModule;
  window.submitPracticeAnswer = submitPracticeAnswer;
  window.navigatePracticeScenario = navigatePracticeScenario;
  window.filterPracticeCategory = filterPracticeCategory;
  window.filterPracticeLevel = filterPracticeLevel;
  window.filterPracticeChapter = filterPracticeChapter;
  window.resetPracticeQuiz = resetPracticeQuiz;
}}

if (typeof module !== 'undefined' && module.exports) {{
  module.exports = {{ practiceScenarios, practiceStats }};
}}
"""

with open("public/js/practice.js", "w", encoding="utf-8") as f:
  f.write(js_content)

print(f"Generated public/js/practice.js with {len(practice_scenarios)} case studies!")
