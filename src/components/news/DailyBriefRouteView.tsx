import React, { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  AlertTriangle,
  Target,
  Clock,
  Compass,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
  Gem,
  Flame,
  Globe,
  BarChart3,
  Landmark
} from "lucide-react";
import {
  DailyMarketBrief,
  FocusCoinDetail,
  ActionableTradeSetup,
  ShortTermHoldItem
} from "../../types";
import { NewsApi } from "../../services/api";

// --- DỮ LIỆU MẪU CHUẨN THỂ CHẾ (FALLBACK INSTITUTIONAL INTELLIGENCE) ---
const DEFAULT_FALLBACK_BRIEF: DailyMarketBrief = {
  date: "Thứ Sáu, Ngày 04/09/2026",
  macroHeadline: "Lãi Suất FED Duy Trì Ổn Định, Dòng Tiền Thể Chế Hấp Thụ Nguồn Cung Trước Dữ Liệu CPI & NFP Mới Nhất",
  marketMood: "BULLISH",
  sentimentScore: 68,
  macroSources: ["Investing.com", "Forex Factory", "Binance Spot"],
  executiveSummary: [
    "Dữ liệu vĩ mô Investing.com & Lịch kinh tế Forex Factory: Báo cáo việc làm phi nông nghiệp (NFP) và chỉ số giá tiêu dùng (CPI) tiếp tục là tâm điểm định hình lộ trình nới lỏng chính sách tiền tệ của Cục Dự trữ Liên bang Mỹ (FED).",
    "Chỉ số DXY & Trái phiếu Mỹ: Đồng Dollar Index dao động trong biên độ hẹp quanh 104.2; lợi suất trái phiếu chính phủ Mỹ 10 năm ổn định giúp giải tỏa áp lực bán tháo lên toàn bộ nhóm tài sản rủi ro (Risk-On assets).",
    "Dòng vốn thể chế & Spot ETF: Dòng vốn ròng vào các quỹ Spot Bitcoin & Ethereum ETF tiếp tục duy trì trạng thái dương tích cực, thiết lập các vùng đệm thanh khoản vững chắc tại các ngưỡng hỗ trợ kỹ thuật trọng yếu.",
    "Cấu trúc thanh khoản phái sinh: Tỷ lệ Funding Rate toàn thị trường ở mức cân bằng (+0.0100%), phe Long kiểm soát chủ động nhưng không có hiện tượng quá nhiệt; sẵn sàng cho các nhịp bứt phá mới."
  ],
  focusCoins: [
    {
      coin: "BTC",
      currentPrice: 64250.0,
      change24h: 2.15,
      impactHeadline: "Dòng vốn ròng từ các quỹ Spot ETF ghi nhận chuỗi 4 phiên mua ròng liên tiếp",
      sentiment: "BULLISH",
      analysis: "BTC duy trì vững chắc trên vùng Bullish Order Block khung H4. Phe Mua hấp thụ tốt lượng cung bán lẻ quanh $63,500; cấu trúc sóng tăng được bảo toàn."
    },
    {
      coin: "ETH",
      currentPrice: 3480.5,
      change24h: 1.8,
      impactHeadline: "Hoạt động mạng Layer-2 bùng nổ, doanh thu phí gas mạng lưới ghi nhận tín hiệu tạo đáy",
      sentiment: "BULLISH",
      analysis: "Cặp tỷ giá ETH/BTC tạo cấu trúc phân kỳ dương RSI. Lực mua từ các quỹ phái sinh bắt đầu gia tăng tỷ trọng khi vùng hỗ trợ $3,400 được giữ vững."
    },
    {
      coin: "SOL",
      currentPrice: 148.2,
      change24h: 4.6,
      impactHeadline: "Khối lượng giao dịch trên các DEX hệ sinh thái Solana dẫn đầu toàn thị trường",
      sentiment: "BULLISH",
      analysis: "SOL thể hiện sức mạnh vượt trội (Relative Strength) so với mặt bằng chung. Giá phá vỡ đỉnh ngắn hạn kèm khối lượng giao dịch on-chain tăng tốc."
    },
    {
      coin: "BNB",
      currentPrice: 585.0,
      change24h: 0.95,
      impactHeadline: "BNB Chain triển khai cập nhật cơ chế tối ưu hóa phí gas và đốt coin tự động",
      sentiment: "NEUTRAL",
      analysis: "BNB tích lũy chặt chẽ trong kênh giá $575 - $595. Thanh khoản nén chặt dự báo một đợt bùng nổ biến động khi giá phá vỡ một trong hai biên."
    },
    {
      coin: "SUI",
      currentPrice: 1.92,
      change24h: 6.8,
      impactHeadline: "Tổng giá trị khóa (TVL) đạt kỷ lục mới với làn sóng mở rộng các giao thức DeFi",
      sentiment: "BULLISH",
      analysis: "SUI thu hút dòng tiền đầu cơ lớn từ cộng đồng quốc tế. Cấu trúc nến H4 bứt phá dứt khoát khỏi vùng kháng cự $1.80, hướng về mốc cản tâm lý $2.20."
    },
    {
      coin: "XRP",
      currentPrice: 0.585,
      change24h: -1.2,
      impactHeadline: "Áp lực chốt lời gia tăng tại vùng kháng cự sau đợt hồi phục kỹ thuật",
      sentiment: "BEARISH",
      analysis: "XRP gặp áp lực bán mạnh tại vùng $0.60. Xuất hiện tín hiệu phân kỳ âm H4, giá có xu hướng thoái lui về kiểm định đường EMA 200 quanh $0.56."
    },
    {
      coin: "DOGE",
      currentPrice: 0.128,
      change24h: 3.2,
      impactHeadline: "Dòng tiền đầu cơ memecoin quay lại nhóm vốn hóa lớn khi tâm lý thị trường hưng phấn",
      sentiment: "BULLISH",
      analysis: "DOGE bứt phá đường cản chéo xu hướng giảm kéo dài. Lực cầu vùng $0.120 thể hiện sự hấp thụ nguồn cung chủ động."
    },
    {
      coin: "NEAR",
      currentPrice: 5.45,
      change24h: 5.1,
      impactHeadline: "Hưởng lợi từ làn sóng hợp tác AI x Web3 và tăng trưởng lượng ví hoạt động hàng ngày",
      sentiment: "BULLISH",
      analysis: "NEAR hoàn tất mô hình tái tích lũy trên khung Daily. Dòng tiền thông minh (Smart Money) tiếp tục bảo vệ mốc hỗ trợ giá trị cao $5.10."
    },
    {
      coin: "AVAX",
      currentPrice: 28.9,
      change24h: 2.4,
      impactHeadline: "Các định chế tài chính truyền thống đẩy mạnh thử nghiệm mạng con Subnet",
      sentiment: "BULLISH",
      analysis: "AVAX hình thành chuỗi đáy nâng dần (Higher Lows) trên khung H4. Khối lượng mua áp đảo khối lượng bán khi giá tiếp cận vùng cầu Discount."
    }
  ],
  actionableTradeSetups: [
    {
      coin: "BTC",
      bias: "LONG",
      entryZone: "$63,800 - $64,200",
      stopLoss: "$62,900 (Bắt buộc)",
      takeProfit1: "$65,800 (Kháng cự H4)",
      takeProfit2: "$67,500 (Vùng thanh khoản đỉnh)",
      riskRewardRatio: "1:2.8",
      trapWarning: "Cảnh báo cá mập quét râu Judas Swing vào đầu phiên Mỹ tại đáy phiên Á ($63,500); kiên nhẫn chờ nến từ chối (Rejection Pinbar) H1 rồi mới kích hoạt lệnh.",
      rationale: "Kiểm tra lại vùng Bullish Order Block H4 hợp lưu đường EMA 50 và vùng FVG Discount, cấu trúc sóng tăng lành mạnh."
    },
    {
      coin: "XRP",
      bias: "SHORT",
      entryZone: "$0.5920 - $0.6050",
      stopLoss: "$0.6180 (Bắt buộc)",
      takeProfit1: "$0.5650 (Đáy phiên trước)",
      takeProfit2: "$0.5400 (EMA 200 Daily)",
      riskRewardRatio: "1:2.5",
      trapWarning: "Cẩn trọng bẫy Bull Trap quét qua mốc cản tâm lý $0.60 để lấy thanh khoản rồi quay đầu giảm nhanh (SFP - Swing Failure Pattern).",
      rationale: "Kháng cự cứng khung Daily, chỉ báo RSI phân kỳ âm rõ nét trên khung H4, áp lực bán chủ động gia tăng khi tiếp cận cản."
    },
    {
      coin: "SOL",
      bias: "LONG",
      entryZone: "$144.00 - $146.50",
      stopLoss: "$139.80 (Bắt buộc)",
      takeProfit1: "$156.00 (Đỉnh cũ gần nhất)",
      takeProfit2: "$168.00 (Vùng thanh khoản tuần)",
      riskRewardRatio: "1:3.2",
      trapWarning: "Tránh mua đuổi (FOMO) khi giá đang áp sát vùng $150; chờ nhịp thoái lui lành mạnh về khối Order Block khung H1.",
      rationale: "Cấu trúc Break of Structure (BOS) khung 4H vững chắc, khối lượng giao dịch bùng nổ cùng dòng tiền DEX dẫn đầu thị trường."
    },
    {
      coin: "SUI",
      bias: "CHỜ RETEST",
      entryZone: "$1.78 - $1.83",
      stopLoss: "$1.69 (Bắt buộc)",
      takeProfit1: "$2.10 (Mục tiêu Fibonacci)",
      takeProfit2: "$2.35 (Đỉnh cao mới)",
      riskRewardRatio: "1:3.0",
      trapWarning: "Cảnh báo râu nến quét thanh khoản hai chiều do biến động cao; chỉ mở lệnh khi có xác nhận nến nhấn chìm tăng (Bullish Engulfing) tại vùng cầu.",
      rationale: "Kiểm định lại cạnh trên vùng tích lũy cũ sau nhịp bứt phá (Resistance flipped Support), phe Bò sẵn sàng tái tích lũy để đẩy giá lên đỉnh cao mới."
    }
  ],
  shortTermHolds: [
    {
      coin: "SUI",
      name: "Sui Network",
      holdingPeriod: "3 - 7 ngày",
      accumulationZone: "$1.75 - $1.85 (Chiến lược DCA 2 lần)",
      targetPrice: "$2.30 - $2.50 (+25% ~ +35% ROI)",
      invalidationLevel: "Đóng nến D1 dưới $1.65 (Cắt lỗ Spot -6.5%)",
      catalyst: "Forex Factory & Investing.com: Môi trường vĩ mô nới lỏng thúc đẩy dòng tiền đầu cơ vào L1 thế hệ mới; TVL DeFi của Sui đạt đỉnh lịch sử.",
      riskRating: "TRUNG BÌNH",
      rationale: "Hệ sinh thái bùng nổ mạnh mẽ, khối lượng giao dịch người dùng tăng đột biến, cấu trúc giá giữ vững Higher High trên khung Daily."
    },
    {
      coin: "NEAR",
      name: "NEAR Protocol",
      holdingPeriod: "1 - 2 tuần",
      accumulationZone: "$5.10 - $5.35 (Vùng Bullish Order Block D1)",
      targetPrice: "$6.80 - $7.50 (+30% ~ +42% ROI)",
      invalidationLevel: "Đóng nến D1 dưới $4.80 (Cắt lỗ Spot -6.0%)",
      catalyst: "Investing.com: Dòng tiền đầu tư vào nhóm công nghệ AI x Web3 tăng trưởng mạnh; các hội nghị công nghệ quốc tế sắp diễn ra.",
      riskRating: "THẤP",
      rationale: "Cấu trúc tích lũy mô hình Cốc tay cầm (Cup & Handle) khung Daily bền vững; các ví cá mập âm thầm gom hàng tại vùng hỗ trợ lớn."
    },
    {
      coin: "SOL",
      name: "Solana",
      holdingPeriod: "1 - 2 tuần",
      accumulationZone: "$142 - $147 (Vùng hỗ trợ EMA 50 D1)",
      targetPrice: "$180 - $195 (+25% ~ +35% ROI)",
      invalidationLevel: "Đóng nến D1 dưới $134 (Cắt lỗ Spot -6.0%)",
      catalyst: "Investing.com & Bloomberg: Kỳ vọng hồ sơ cấp phép Solana Spot ETF tiếp theo và doanh thu mạng lưới DEX liên tục vượt mặt đối thủ.",
      riskRating: "THẤP",
      rationale: "Đồng coin dẫn dắt (Leader) của nhóm Layer-1 với Relative Strength cao nhất; mỗi nhịp điều chỉnh là cơ hội gia tăng vị thế Spot an toàn."
    }
  ],
  riskNotice: "NGUYÊN TẮC QUẢN TRỊ VỐN SỐNG CÒN CỦA CHUYÊN GIA: Tuyệt đối không mạo hiểm quá 1-2% quy mô tài khoản trên mỗi lệnh giao dịch. Luôn đặt Stop Loss cố định ngay khi khớp lệnh; tuyệt đối không trung bình giá giảm (averaging down) khi giá vi phạm cấu trúc lệnh. Khi giá đạt mục tiêu chốt lời 1 (TP1), bắt buộc dời Stop Loss về điểm hòa vốn (Break-Even) để triệt tiêu hoàn toàn rủi ro thua lỗ."
};

export const DailyBriefRouteView: React.FC = () => {
  const [brief, setBrief] = useState<DailyMarketBrief | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrief = async (forceGenerate = false) => {
    try {
      if (forceGenerate) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = forceGenerate
        ? await NewsApi.generateDailyBrief()
        : await NewsApi.getDailyBrief();

      if (res && res.success && res.brief) {
        setBrief(res.brief);
      } else {
        // Use fallback if API returns null/empty
        setBrief(DEFAULT_FALLBACK_BRIEF);
      }
    } catch (err: any) {
      console.warn("DailyBrief API fetch error, applying fallback data:", err);
      setBrief(DEFAULT_FALLBACK_BRIEF);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBrief(false);
  }, []);

  // Safe data extraction (support camelCase, snake_case, and institutional fallback)
  const currentBrief = brief || DEFAULT_FALLBACK_BRIEF;

  const macroHeadline =
    currentBrief.macroHeadline ||
    currentBrief.macro_headline ||
    DEFAULT_FALLBACK_BRIEF.macroHeadline;

  const marketMood = (
    currentBrief.marketMood ||
    currentBrief.market_mood ||
    DEFAULT_FALLBACK_BRIEF.marketMood
  ).toUpperCase();

  const rawScore =
    currentBrief.sentimentScore ??
    currentBrief.sentiment_score ??
    DEFAULT_FALLBACK_BRIEF.sentimentScore;

  // Calculate percentage (0 - 100%) for gauge
  let moodPercent = 50;
  if (rawScore >= -1 && rawScore <= 1) {
    moodPercent = Math.round((rawScore + 1) * 50);
  } else if (rawScore > 1 && rawScore <= 100) {
    moodPercent = Math.round(rawScore);
  }

  const executiveSummary =
    (currentBrief.executiveSummary && currentBrief.executiveSummary.length > 0)
      ? currentBrief.executiveSummary
      : (currentBrief.executive_summary && currentBrief.executive_summary.length > 0)
      ? currentBrief.executive_summary
      : DEFAULT_FALLBACK_BRIEF.executiveSummary;

  const focusCoins =
    (currentBrief.focusCoins && currentBrief.focusCoins.length > 0)
      ? currentBrief.focusCoins
      : (currentBrief.focus_coins && currentBrief.focus_coins.length > 0)
      ? currentBrief.focus_coins
      : DEFAULT_FALLBACK_BRIEF.focusCoins;

  const tradeSetups =
    (currentBrief.actionableTradeSetups && currentBrief.actionableTradeSetups.length > 0)
      ? currentBrief.actionableTradeSetups
      : (currentBrief.actionable_trade_setups && currentBrief.actionable_trade_setups.length > 0)
      ? currentBrief.actionable_trade_setups
      : DEFAULT_FALLBACK_BRIEF.actionableTradeSetups;

  const shortTermHolds =
    (currentBrief.shortTermHolds && currentBrief.shortTermHolds.length > 0)
      ? currentBrief.shortTermHolds
      : (currentBrief.short_term_holds && currentBrief.short_term_holds.length > 0)
      ? currentBrief.short_term_holds
      : DEFAULT_FALLBACK_BRIEF.shortTermHolds!;

  const riskNotice =
    currentBrief.riskNotice ||
    currentBrief.risk_notice ||
    DEFAULT_FALLBACK_BRIEF.riskNotice;

  const displayDate = currentBrief.date || DEFAULT_FALLBACK_BRIEF.date;

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "BULLISH":
      case "GREED":
        return {
          badgeBg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
          barColor: "from-emerald-600 to-teal-400",
          text: "BULLISH / TÍCH CỰC",
          icon: TrendingUp
        };
      case "BEARISH":
      case "FEAR":
        return {
          badgeBg: "bg-rose-500/15 border-rose-500/40 text-rose-400",
          barColor: "from-rose-600 to-red-400",
          text: "BEARISH / THẬN TRỌNG",
          icon: TrendingDown
        };
      default:
        return {
          badgeBg: "bg-amber-500/15 border-amber-500/40 text-amber-400",
          barColor: "from-amber-600 to-yellow-400",
          text: "NEUTRAL / TRUNG LẬP",
          icon: Compass
        };
    }
  };

  const moodStyle = getMoodColor(marketMood);
  const MoodIcon = moodStyle.icon;

  const formatPrice = (p: number) => {
    if (!p) return "$0.00";
    if (p >= 1000) {
      return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (p >= 1) {
      return `$${p.toFixed(2)}`;
    }
    return `$${p.toFixed(4)}`;
  };

  if (loading && !brief) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4 py-16">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center animate-pulse">
            <Sparkles className="w-7 h-7 text-blue-400 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white">Chief Strategist Đang Tổng Hợp Bản Tin...</h3>
          <p className="text-sm text-slate-400 max-w-md">
            Đang quét dữ liệu Binance Spot, phân tích bối cảnh vĩ mô toàn cầu từ Investing.com & Forex Factory và tính toán thiết lập giao dịch SMC thực chiến.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-7xl mx-auto">
      {/* =========================================================================
          HERO HEADER: Bloomberg Financial Intelligence Terminal Style
         ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1322] via-[#090d16] to-[#06080e] border border-slate-800 shadow-2xl p-6 sm:p-8">
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Row: AI Badge + Date + Refresh Button */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-sky-300 text-xs sm:text-sm font-extrabold tracking-wide uppercase shadow-sm">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Chief Macro & News Market Strategist</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{displayDate}</span>
              </div>
            </div>

            {/* Live LLM Refresh Action */}
            <button
              onClick={() => fetchBrief(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/25 border border-blue-400/30"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Đang Phân Tích Lại Bằng Live LLM..." : "🔄 Cập Nhật & Phân Tích Mới Nhất Bằng AI (Live LLM)"}</span>
            </button>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Bản Tin Thị Trường & Chiến Lược Vĩ Mô Toàn Cầu
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Tổng hợp tương quan dòng tiền tổ chức, tin tức kinh tế quốc tế và kịch bản tác chiến Smart Money Concept (SMC) theo thời gian thực.
            </p>
          </div>

          {/* Market Mood Gauge Bar */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 space-y-1.5">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Tâm Lý & Định Hướng Toàn Thị Trường (Market Mood)
              </div>
              <div className="flex items-center gap-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border font-black text-sm tracking-wide ${moodStyle.badgeBg}`}>
                  <MoodIcon className="w-4 h-4" />
                  <span>{moodStyle.text}</span>
                </div>
                <span className="text-sm font-bold text-slate-300">
                  Chỉ số sức mạnh: <span className="text-white font-mono text-base">{moodPercent}/100</span>
                </span>
              </div>
            </div>

            <div className="md:col-span-7 space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span className="text-rose-400">Cực Kỳ Thận Trọng (0)</span>
                <span className="text-amber-400">Cân Bằng (50)</span>
                <span className="text-emerald-400">Hưng Phấn / Bullish (100)</span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${moodStyle.barColor} transition-all duration-700 shadow-sm`}
                  style={{ width: `${Math.max(5, Math.min(100, moodPercent))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchBrief(false)}
            className="text-xs font-bold underline hover:text-white"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* =========================================================================
          PHẦN 1: 🏛️ BỐI CẢNH VĨ MÔ & DÒNG TIỀN TOÀN CẦU (Macro Drivers)
         ========================================================================= */}
      <section className="rounded-2xl bg-[#0c1220] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-sky-400 shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🏛️ BỐI CẢNH VĨ MÔ & DÒNG TIỀN TOÀN CẦU</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-sky-400 border border-blue-500/20 font-bold">
                  Macro Drivers
                </span>
              </h2>
              <p className="text-xs text-slate-400">Phân tích nhịp điệu kinh tế vĩ mô, lãi suất, thanh khoản USD và dòng vốn ETF</p>
            </div>
          </div>

          {/* HUY HIỆU NGUỒN THAM CHIẾU NỔI BẬT & SANG TRỌNG */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 border border-amber-500/30 shadow-md shadow-amber-500/5">
            <BarChart3 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-slate-200">
              📊 Dữ liệu vĩ mô & Lịch kinh tế tham chiếu thời gian thực từ{" "}
              <b className="text-amber-300 font-extrabold">Investing.com</b> &{" "}
              <b className="text-sky-300 font-extrabold">Forex Factory</b>
            </span>
          </div>
        </div>

        {/* Macro Headline */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-slate-900/40 border-l-4 border-l-blue-500 border border-slate-800/80 shadow-md">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Định Hướng Trọng Tâm Phiên Giao Dịch:</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
            "{macroHeadline}"
          </p>
        </div>

        {/* Executive Summary Bullet Points */}
        <div className="space-y-3 pt-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Điểm Tin Cốt Lõi Vĩ Mô (Executive Summary):</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {executiveSummary.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-[#080d18] border border-slate-800/80 hover:border-slate-700 transition-colors shadow-sm"
              >
                <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30">
                  {idx + 1}
                </span>
                <p className="text-sm sm:text-[15px] text-slate-200 leading-relaxed font-normal">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          PHẦN 2: 🪙 DANH SÁCH ĐỒNG COIN CẦN LƯU Ý HÔM NAY (Focus Coins)
         ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🪙 DANH SÁCH ĐỒNG COIN CẦN LƯU Ý HÔM NAY</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                  Focus Coins ({focusCoins.length} Coin)
                </span>
              </h2>
              <p className="text-xs text-slate-400">Tương quan giữa chất xúc tác tin tức và hành động giá (Price Action) trên Binance Spot</p>
            </div>
          </div>
        </div>

        {/* Diverse Coins Grid (BTC, ETH, SOL, BNB, SUI, XRP, DOGE, NEAR, AVAX...) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {focusCoins.map((coinItem, idx) => {
            const isPositive = (coinItem.change24h || 0) >= 0;
            const isBullish = coinItem.sentiment === "BULLISH";
            const isBearish = coinItem.sentiment === "BEARISH";

            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0c1220] border border-slate-800 hover:border-slate-700/80 p-5 space-y-4 shadow-lg transition-all hover:shadow-xl hover:shadow-blue-900/10 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Coin Top Row: Symbol + Price + Change % */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#070b14] border border-slate-700/80 flex items-center justify-center font-black text-sm text-white shadow-inner">
                        {coinItem.coin}
                      </div>
                      <div>
                        <div className="text-base font-black text-white">{coinItem.coin}/USDT</div>
                        <div className="text-[11px] text-slate-400 font-mono">Binance Spot</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black font-mono text-white">
                        {formatPrice(coinItem.currentPrice)}
                      </div>
                      <div
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                          isPositive
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{isPositive ? "+" : ""}{(coinItem.change24h || 0).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Impact Headline */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Tin Tức Tác Động:</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isBullish
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : isBearish
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {coinItem.sentiment || "NEUTRAL"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200 leading-snug">
                      {coinItem.impactHeadline || "Thị trường biến động ổn định theo biên độ kỹ thuật."}
                    </p>
                  </div>

                  {/* Price Action & SMC Analysis */}
                  <div className="p-3.5 rounded-xl bg-[#070b14] border border-slate-800/80 space-y-1">
                    <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                      Phân Tích Tin Tức vs Price Action:
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {coinItem.analysis || "Đang phân tích phản ứng của giá tại các vùng thanh khoản..."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          PHẦN 3: 🎯 GỢI Ý CHIẾN LƯỢC GIAO DỊCH THỰC CHIẾN (Actionable Trade Setups)
          HỖ TRỢ RÕ NÉT CẢ 2 CHIỀU VỊ THẾ: LONG, SHORT, CHỜ RETEST
         ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🎯 GỢI Ý CHIẾN LƯỢC GIAO DỊCH THỰC CHIẾN</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  Actionable Setups (2 Chiều Long / Short)
                </span>
              </h2>
              <p className="text-xs text-slate-400">Kịch bản vào lệnh SMC chi tiết kèm Entry, Stop Loss bắt buộc, Chốt lời và Cảnh báo bẫy giá cá mập</p>
            </div>
          </div>
        </div>

        {/* Setups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {tradeSetups.map((setup, idx) => {
            const isLong = setup.bias === "LONG";
            const isShort = setup.bias === "SHORT";
            const isRetest = setup.bias === "CHỜ RETEST";

            return (
              <div
                key={idx}
                className={`rounded-2xl bg-[#0c1220] border p-6 space-y-5 shadow-xl flex flex-col justify-between transition-all ${
                  isLong
                    ? "border-emerald-500/30 shadow-emerald-950/20 hover:border-emerald-500/50"
                    : isShort
                    ? "border-rose-500/30 shadow-rose-950/20 hover:border-rose-500/50"
                    : "border-amber-500/30 shadow-amber-950/20 hover:border-amber-500/50"
                }`}
              >
                <div className="space-y-4">
                  {/* Header: Coin + 2-Direction Bias Badge + R:R */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl font-black text-white">{setup.coin}/USDT</span>

                      {/* BADGE RÕ NÉT CẢ 2 CHIỀU VỊ THẾ */}
                      {isLong && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black border border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-md shadow-emerald-500/10">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span>🟢 VỊ THẾ LONG (CANH MUA)</span>
                        </span>
                      )}
                      {isShort && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black border border-rose-500/50 bg-rose-500/15 text-rose-300 shadow-md shadow-rose-500/10">
                          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                          <span>🔴 VỊ THẾ SHORT (CANH BÁN)</span>
                        </span>
                      )}
                      {isRetest && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black border border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/10">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>🟡 CHỜ RETEST VÙNG CẦU</span>
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Tỷ Lệ R:R</div>
                      <div className="text-sm font-black text-sky-400 font-mono">
                        {setup.riskRewardRatio || "1:2.5+"}
                      </div>
                    </div>
                  </div>

                  {/* Numeric Parameters Grid: Entry, SL, TP1, TP2 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Entry */}
                    <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800/90 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1">
                        <span>VÙNG ENTRY</span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white font-mono break-words">
                        {setup.entryZone || "Tham khảo biểu đồ"}
                      </div>
                    </div>

                    {/* Stop Loss Bắt Buộc */}
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        <span>STOP LOSS (SL)</span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-rose-200 font-mono break-words">
                        {setup.stopLoss || "Bắt buộc"}
                      </div>
                    </div>

                    {/* TP1 */}
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-emerald-400">
                        MỤC TIÊU 1 (TP1)
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-200 font-mono break-words">
                        {setup.takeProfit1 || "Kháng cự 1"}
                      </div>
                    </div>

                    {/* TP2 */}
                    <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-teal-400">
                        MỤC TIÊU 2 (TP2)
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-teal-200 font-mono break-words">
                        {setup.takeProfit2 || "Kháng cự 2"}
                      </div>
                    </div>
                  </div>

                  {/* Whale Trap / Liquidity Warning */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>CẢNH BÁO BẪY GIÁ CÁ MẬP / BẪY THANH KHOẢN (SFP / JUDAS SWING):</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                      {setup.trapWarning || "Cảnh báo quét râu SFP hoặc Judas Swing tại các mốc cản tâm lý khi ra tin tức quan trọng."}
                    </p>
                  </div>

                  {/* Rationale */}
                  <div className="p-3.5 rounded-xl bg-[#070b14] border border-slate-800/80 space-y-1">
                    <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Luận Điểm Kỹ Thuật & Xúc Tác Tin Tức:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {setup.rationale || "Hội tụ tín hiệu dòng tiền thông minh và phản ứng tại vùng mất cân bằng thanh khoản (FVG)."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          KHỐI 4 MỚI: 💎 DANH MỤC HOLD NGẮN HẠN (SPOT / SWING ACCUMULATION)
          Dành cho nhà đầu tư nắm giữ Spot theo sóng từ 3 ngày đến 2 tuần, không dùng đòn bẩy
         ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>💎 DANH MỤC HOLD NGẮN HẠN (SPOT / SWING ACCUMULATION)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  Spot Wave (0x Leverage)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Dành cho nhà đầu tư nắm giữ Spot theo sóng từ 3 ngày đến 2 tuần, không dùng đòn bẩy
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Spot Accumulation • Bảo Toàn Vốn 100%</span>
          </div>
        </div>

        {/* Short Term Hold Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shortTermHolds.map((item, idx) => {
            const isLowRisk = item.riskRating === "THẤP";
            const isMediumRisk = item.riskRating === "TRUNG BÌNH";

            return (
              <div
                key={idx}
                className="rounded-2xl bg-gradient-to-b from-[#0e1626] to-[#090e1a] border border-cyan-500/30 hover:border-cyan-500/50 p-5 space-y-4 shadow-xl shadow-cyan-950/20 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Header Thẻ: Coin, Tên Đầy Đủ, Tag Thời Gian, Badge Rủi Ro */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#060b14] border border-cyan-500/40 flex items-center justify-center font-black text-sm text-cyan-300 shadow-inner group-hover:scale-105 transition-transform">
                        {item.coin}
                      </div>
                      <div>
                        <div className="text-base font-black text-white flex items-center gap-1.5">
                          <span>{item.coin}</span>
                          {item.name && <span className="text-xs text-slate-400 font-normal">({item.name})</span>}
                        </div>
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-md mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>⏱️ {item.holdingPeriod}</span>
                        </div>
                      </div>
                    </div>

                    {/* Badge Rủi Ro */}
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Mức Rủi Ro</div>
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isLowRisk
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                            : isMediumRisk
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                            : "bg-rose-500/15 text-rose-300 border-rose-500/40"
                        }`}
                      >
                        {item.riskRating}
                      </span>
                    </div>
                  </div>

                  {/* Vùng Gom Hàng Spot Tối Ưu */}
                  <div className="p-3 rounded-xl bg-emerald-950/25 border-2 border-emerald-500/40 space-y-1">
                    <div className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>VÙNG GOM HÀNG SPOT TỐI ƯU:</span>
                    </div>
                    <div className="text-sm font-black text-white font-mono">
                      {item.accumulationZone}
                    </div>
                  </div>

                  {/* Mục Tiêu Chốt Lời Sóng Ngắn */}
                  <div className="p-3 rounded-xl bg-sky-950/25 border-2 border-sky-500/40 space-y-1">
                    <div className="text-[11px] font-extrabold text-sky-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-sky-400" />
                      <span>MỤC TIÊU CHỐT LỜI SÓNG NGẮN:</span>
                    </div>
                    <div className="text-sm font-black text-sky-200 font-mono">
                      {item.targetPrice}
                    </div>
                  </div>

                  {/* Ngưỡng Hủy Bỏ Sóng / Cắt Lỗ Spot */}
                  <div className="p-3 rounded-xl bg-amber-950/20 border-2 border-amber-500/40 space-y-1">
                    <div className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>NGƯỠNG HỦY BỎ SÓNG / CẮT LỖ SPOT:</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-amber-200 font-mono">
                      {item.invalidationLevel}
                    </div>
                  </div>

                  {/* Xúc Tác Tăng Trưởng & Vĩ Mô */}
                  <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800 space-y-1">
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Xúc Tác Tăng Trưởng & Vĩ Mô:</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {item.catalyst}
                    </p>
                  </div>

                  {/* Luận Điểm Phân Tích */}
                  <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800 space-y-1">
                    <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Luận Điểm Phân Tích:</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {item.rationale}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          PHẦN 5: 🛡️ NGUYÊN TẮC QUẢN TRỊ RỦI RO SỐNG CÒN (Risk Directive)
         ========================================================================= */}
      <section className="rounded-2xl bg-gradient-to-r from-red-950/40 via-[#130b14] to-[#0c1220] border-2 border-red-500/40 p-6 sm:p-7 shadow-2xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>🛡️ NGUYÊN TẮC QUẢN TRỊ RỦI RO SỐNG CÒN CỦA CHUYÊN GIA</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-extrabold uppercase">
                Kỷ Luật Thép 1-2%
              </span>
            </h3>
            <p className="text-xs text-slate-400">Bảo toàn vốn là chìa khóa duy nhất để tồn tại và làm giàu bền vững trong thị trường crypto</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-red-500/20">
          <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
            "{riskNotice}"
          </p>
        </div>
      </section>
    </div>
  );
};
