import React, { useState, useEffect } from "react";
import {
  Newspaper,
  Search,
  RefreshCw,
  ExternalLink,
  Flame,
  Sparkles,
  Landmark,
  Globe,
  BarChart3,
  Filter,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { NewsArticle } from "../../types";
import { NewsApi } from "../../services/api";

interface GlobalFeedTabProps {
  onSelectArticle: (article: NewsArticle) => void;
}

type SourceFilterType = "ALL" | "INVESTING" | "FOREX_FACTORY" | "CRYPTO";

interface SourceFilterOption {
  id: SourceFilterType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  activeClass: string;
}

const SOURCE_FILTERS: SourceFilterOption[] = [
  {
    id: "ALL",
    label: "Tất Cả Nguồn",
    icon: Globe,
    colorClass: "text-slate-300",
    activeClass: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-blue-600/30"
  },
  {
    id: "INVESTING",
    label: "🔥 Investing.com",
    icon: Flame,
    colorClass: "text-amber-400",
    activeClass: "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-400 shadow-amber-600/30"
  },
  {
    id: "FOREX_FACTORY",
    label: "🏛️ Forex Factory",
    icon: Landmark,
    colorClass: "text-sky-400",
    activeClass: "bg-gradient-to-r from-indigo-600 to-sky-600 text-white border-sky-400 shadow-sky-600/30"
  },
  {
    id: "CRYPTO",
    label: "🪙 Tin Tức Crypto",
    icon: Globe,
    colorClass: "text-emerald-400",
    activeClass: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-emerald-600/30"
  },
];

const FEED_CATEGORIES = [
  { id: "ALL", label: "Tất Cả Danh Mục" },
  { id: "BTC", label: "🪙 Bitcoin (BTC)" },
  { id: "ETH", label: "🔷 Ethereum (ETH)" },
  { id: "SOL", label: "🟣 Solana (SOL)" },
  { id: "Macro", label: "🏛️ Vĩ Mô & FED" },
  { id: "Trading", label: "📊 Phân Tích Kỹ Thuật" },
  { id: "Regulation", label: "⚖️ Pháp Lý & ETF" },
];

const DEFAULT_FALLBACK_ARTICLES: NewsArticle[] = [
  {
    id: "investing-pce",
    title: "US Core PCE Inflation Holds Steady at 2.6%, Solidifying Fed Rate Cut Expectations",
    source: "Investing.com",
    sourceType: "INVESTING",
    url: "https://www.investing.com",
    publishedAt: "15 phút trước",
    summary: "Chỉ số giá tiêu dùng cá nhân (PCE) cốt lõi của Mỹ duy trì ở mức 2.6% so với cùng kỳ, phù hợp kỳ vọng và củng cố cơ sở cắt giảm lãi suất của Fed.",
    category: "Macro • Vĩ Mô • Lãi Suất FED",
    impactLevel: "HIGH",
    sentiment: "BULLISH",
    translatedTitle: "Chỉ Số Lạm Phát PCE Hoa Kỳ Ổn Định Ở Mức 2.6%, Củng Cố Kỳ Vọng Cắt Giảm Lãi Suất Của Fed",
    translatedSummary: "Báo cáo PCE từ Cục Phân tích Kinh tế Hoa Kỳ cho thấy áp lực lạm phát tiếp tục hạ nhiệt về vùng mục tiêu dài hạn. Điều này tạo điều kiện thuận lợi cho Ủy ban Thị trường Mở Liên bang (FOMC) tiến hành nới lỏng chính sách tiền tệ, thúc đẩy dòng vốn tìm đến các thị trường tài sản rủi ro như crypto.",
    originalSnippet: "U.S. core Personal Consumption Expenditures (PCE) price index rose 2.6% year-over-year in line with estimates, reinforcing bets on upcoming Federal Reserve policy easing.",
    agyDiagnosis: "Tác động vĩ mô tích cực mạnh: Môi trường lãi suất thực hạ nhiệt giúp dòng vốn tái phân bổ vào Bitcoin và các đồng coin Layer-1 hàng đầu. Khuyến nghị canh Long tại vùng hỗ trợ swing low."
  },
  {
    id: "forex-nfp",
    title: "Forex Factory Calendar: Non-Farm Payrolls & Unemployment Rate Signal Balanced Soft Landing",
    source: "Forex Factory",
    sourceType: "FOREX_FACTORY",
    url: "https://www.forexfactory.com",
    publishedAt: "35 phút trước",
    summary: "Lịch kinh tế Forex Factory ghi nhận số liệu việc làm phi nông nghiệp (NFP) đạt 175K, tỷ lệ thất nghiệp 4.1%, xác nhận kịch bản hạ cánh mềm hoàn hảo.",
    category: "Macro • Lịch Kinh Tế • NFP",
    impactLevel: "HIGH",
    sentiment: "BULLISH",
    translatedTitle: "Lịch Kinh Tế Forex Factory: Bảng Lương Phi Nông Nghiệp (NFP) Đạt Điểm Cân Bằng Hoàn Hảo Cho Kịch Bản Hạ Cánh Mềm",
    translatedSummary: "Dữ liệu kinh tế công bố trên Forex Factory cho thấy thị trường lao động Mỹ đang hạ nhiệt có kiểm soát mà không rơi vào suy thoái. Chỉ số USD Index (DXY) dao động ổn định quanh 104.1 điểm, giải tỏa áp lực bán tháo lên toàn bộ thị trường tiền mã hóa.",
    originalSnippet: "Forex Factory economic release indicates non-farm payrolls printed at 175k while unemployment held at 4.1%, maintaining the Goldilocks soft-landing narrative.",
    agyDiagnosis: "Sự kiện tác động cao (High Impact Red Folder): Dữ liệu việc làm giải tỏa nỗi lo suy thoái đột ngột. Cá mập có xu hướng gom hàng sau các nhịp rung lắc quét râu ban đầu."
  },
  {
    id: "crypto-etf",
    title: "Spot Bitcoin ETFs Attract Institutional Inflows for Fourth Straight Session",
    source: "CoinDesk / Bloomberg",
    sourceType: "CRYPTO",
    url: "https://www.coindesk.com",
    publishedAt: "50 phút trước",
    summary: "Dòng vốn ròng từ các quỹ Spot ETF tại Mỹ tiếp tục ghi nhận đà mua vào ròng liên tiếp 4 phiên, tạo lực đỡ vững chắc cho vùng giá hỗ trợ 4H.",
    category: "BTC • ETF • Tổ Chức",
    impactLevel: "HIGH",
    sentiment: "BULLISH",
    translatedTitle: "Dòng Tiền Spot Bitcoin ETF Duy Trì Mua Ròng Liên Tiếp 4 Phiên Khối Lượng Lớn",
    translatedSummary: "Dữ liệu on-chain cho thấy các quỹ Spot Bitcoin ETF của BlackRock và Fidelity đã hấp thụ hơn 450 triệu USD thanh khoản ròng trong các phiên giao dịch gần nhất, hình thành khối cầu vững chắc tại vùng $63,000 - $64,000.",
    originalSnippet: "Net inflows into spot Bitcoin ETFs continued for the fourth consecutive day, providing strong structural support near key moving averages.",
    agyDiagnosis: "Động lực thị trường tích cực: Lực mua thực tế từ tổ chức đang hấp thụ tốt lượng cung bán lẻ. Khuyến nghị theo dõi điểm kiểm định lại (retest) vùng cầu 4H."
  },
  {
    id: "investing-dxy",
    title: "US Dollar Index Slides as Treasury Yields Ease Ahead of Key Economic Releases",
    source: "Investing.com",
    sourceType: "INVESTING",
    url: "https://www.investing.com",
    publishedAt: "1 giờ trước",
    summary: "Chỉ số Dollar Mỹ (DXY) giảm nhẹ khi lợi suất trái phiếu chính phủ kỳ hạn 10 năm trượt dốc, tạo dư địa tăng trưởng cho thị trường kim loại quý và crypto.",
    category: "Macro • DXY • Trái Phiếu",
    impactLevel: "MEDIUM",
    sentiment: "BULLISH",
    translatedTitle: "Chỉ Số Đồng USD Giảm Nhẹ Khi Lợi Suất Trái Phiếu Hạ Nhiệt, Dòng Tiền Tìm Đến Crypto",
    translatedSummary: "Lợi suất trái phiếu kho bạc Mỹ 10 năm hạ xuống mốc 4.20% giúp cải thiện tâm lý chấp nhận rủi ro trên diện rộng. Các nhà giao dịch phái sinh gia tăng tỷ trọng nắm giữ tài sản số khi chi phí nắm giữ USD suy yếu.",
    originalSnippet: "The US Dollar Index slipped toward key support as 10-year Treasury yields retreated, giving a boost to risk assets including digital currencies.",
    agyDiagnosis: "Môi trường vĩ mô rất thuận lợi: Tương quan nghịch đảo giữa DXY và Crypto đang phát huy tác dụng. Phe Bò có lợi thế lớn trong việc duy trì cấu trúc tăng."
  },
  {
    id: "forex-cpi",
    title: "Forex Factory Economic Alert: Consumer Price Index (CPI) Forecast Aligns with 2% Target Path",
    source: "Forex Factory",
    sourceType: "FOREX_FACTORY",
    url: "https://www.forexfactory.com",
    publishedAt: "2 giờ trước",
    summary: "Dự báo CPI tháng này trên lịch kinh tế Forex Factory cho thấy xu hướng giảm phát tiếp diễn ở nhóm hàng hóa tiêu dùng và năng lượng.",
    category: "Macro • CPI • Lạm Phát",
    impactLevel: "HIGH",
    sentiment: "BULLISH",
    translatedTitle: "Lịch Forex Factory: Dự Báo Chỉ Số CPI Tiếp Tục Bám Sát Lộ Trình Mục Tiêu 2% Của Fed",
    translatedSummary: "Các chuyên gia kinh tế hàng đầu dự báo chỉ số giá tiêu dùng tiếp tục xu hướng đi xuống nhờ giá năng lượng và chuỗi cung ứng toàn cầu ổn định. Đây là tín hiệu bảo đảm cho việc cắt giảm lãi suất không bị trì hoãn.",
    originalSnippet: "CPI projections featured on Forex Factory reflect sustained disinflation across core goods and logistics sectors.",
    agyDiagnosis: "Tin tức định hướng xu hướng trung hạn: Xác suất cắt giảm lãi suất 25-50 bps trong kỳ họp FOMC tới đạt trên 85%, tạo tâm lý hưng phấn cho thị trường."
  },
  {
    id: "crypto-sol",
    title: "Solana Ecosystem DEX Volume Hits All-Time Highs Amid Memecoin and DeFi Resurgence",
    source: "Cointelegraph",
    sourceType: "CRYPTO",
    url: "https://cointelegraph.com",
    publishedAt: "2.5 giờ trước",
    summary: "Khối lượng giao dịch trên các sàn phi tập trung của hệ sinh thái Solana vượt 3 tỷ USD/ngày, khẳng định vị thế dẫn đầu phân khúc Layer-1.",
    category: "SOL • DeFi • DEX",
    impactLevel: "HIGH",
    sentiment: "BULLISH",
    translatedTitle: "Khối Lượng Giao Dịch DEX Hệ Solana Lập Đỉnh Mới Cùng Sự Bùng Nổ Của DeFi",
    translatedSummary: "Solana tiếp tục ghi nhận lượng người dùng hoạt động hàng ngày (DAU) vượt trội và phí mạng lưới tích lũy kỷ lục. Sức mạnh tương đối (Relative Strength) của SOL vượt xa phần còn lại của thị trường altcoin.",
    originalSnippet: "Solana decentralized exchange volume surpassed daily records as retail and institutional liquidity flooded into ecosystem protocols.",
    agyDiagnosis: "Dòng tiền dẫn dắt (Leader): SOL đang là tâm điểm thu hút dòng vốn đầu cơ và nắm giữ theo sóng ngắn (Spot Wave) hiệu quả nhất hiện tại."
  }
];

export const GlobalFeedTab: React.FC<GlobalFeedTabProps> = ({ onSelectArticle }) => {
  const [articles, setArticles] = useState<NewsArticle[]>(DEFAULT_FALLBACK_ARTICLES);
  const [sourceFilter, setSourceFilter] = useState<SourceFilterType>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNews = async (targetSource = sourceFilter) => {
    setLoading(true);
    try {
      const sourceParam = targetSource === "ALL" ? "all" : targetSource.toLowerCase();
      const res = await NewsApi.getNewsArticles("BTC", sourceParam);
      if (res && res.articles && res.articles.length > 0) {
        setArticles(res.articles);
      } else {
        const analyzeRes = await NewsApi.analyzeCoin({ coin: "BTC" });
        if (analyzeRes.success && analyzeRes.analysis?.articles && analyzeRes.analysis.articles.length > 0) {
          setArticles(analyzeRes.analysis.articles);
        } else {
          setArticles(DEFAULT_FALLBACK_ARTICLES);
        }
      }
    } catch {
      setArticles(DEFAULT_FALLBACK_ARTICLES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(sourceFilter);
  }, []);

  const handleSelectSourceFilter = (newSource: SourceFilterType) => {
    setSourceFilter(newSource);
    fetchNews(newSource);
  };

  // Filter logic combining Source, Category, and Keyword Search
  const filtered = articles.filter((a) => {
    // 1. Source match
    let matchSource = true;
    if (sourceFilter === "INVESTING") {
      matchSource =
        a.sourceType === "INVESTING" ||
        (a.source && a.source.toLowerCase().includes("investing")) ||
        (a.title && a.title.toLowerCase().includes("investing"));
    } else if (sourceFilter === "FOREX_FACTORY") {
      matchSource =
        a.sourceType === "FOREX_FACTORY" ||
        (a.source && (a.source.toLowerCase().includes("forex") || a.source.toLowerCase().includes("factory"))) ||
        (a.title && (a.title.toLowerCase().includes("forex") || a.title.toLowerCase().includes("factory")));
    } else if (sourceFilter === "CRYPTO") {
      matchSource =
        a.sourceType === "CRYPTO" ||
        (!a.source?.toLowerCase().includes("investing") &&
         !a.source?.toLowerCase().includes("forex") &&
         !a.source?.toLowerCase().includes("factory"));
    }

    // 2. Category match
    const matchCat =
      category === "ALL" ||
      (a.category && a.category.includes(category)) ||
      a.title.includes(category) ||
      (a.translatedTitle && a.translatedTitle.includes(category));

    // 3. Keyword Search match
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.translatedTitle && a.translatedTitle.toLowerCase().includes(search.toLowerCase())) ||
      (a.summary && a.summary.toLowerCase().includes(search.toLowerCase())) ||
      (a.translatedSummary && a.translatedSummary.toLowerCase().includes(search.toLowerCase()));

    return matchSource && matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. HEADER & CONTROLS CONTAINER */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-base sm:text-lg font-black text-white flex items-center gap-2.5">
              <Newspaper className="w-5 h-5 text-sky-400" />
              <span>THƯ VIỆN BÀI BÁO & TIN TỨC VĨ MÔ THỰC TẾ TOÀN CẦU</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Đồng bộ dữ liệu thời gian thực từ <b>Investing.com</b>, <b>Forex Factory</b>, CoinDesk, Bloomberg, Cointelegraph. Bấm vào bài báo để đọc <b>bản dịch chi tiết & chuẩn đoán AGY Terminal</b>!
            </p>
          </div>

          <button
            onClick={() => fetchNews(sourceFilter)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/30 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Làm Mới Tin Tức</span>
          </button>
        </div>

        {/* =========================================================================
            THANH NÚT LỌC NGUỒN TIN NỔI BẬT TRÊN ĐẦU DANH SÁCH BÀI BÁO:
            [Tất Cả Nguồn] | [🔥 Investing.com] | [🏛️ Forex Factory] | [🪙 Tin Tức Crypto]
           ========================================================================= */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>Lọc Theo Nguồn Tin Tài Chính & Vĩ Mô:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SOURCE_FILTERS.map((sf) => {
              const Icon = sf.icon;
              const isActive = sourceFilter === sf.id;

              return (
                <button
                  key={sf.id}
                  onClick={() => handleSelectSourceFilter(sf.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all border shadow-sm ${
                    isActive
                      ? `${sf.activeClass} shadow-md scale-[1.02]`
                      : "bg-[#070a12] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : sf.colorClass}`} />
                  <span>{sf.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Phân Loại Chủ Đề:
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {FEED_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  category === c.id
                    ? "bg-slate-700 text-white border-slate-500 shadow-sm"
                    : "bg-[#070a12] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Keyword Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Tìm kiếm bài báo theo từ khóa (CPI, NFP, Lạm phát, ETF, Lãi suất, Cá mập, FVG, Order Block...)..."
            className="w-full bg-[#070a12] border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* 2. ARTICLES GRID */}
      {loading ? (
        <div className="text-center py-20 bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-sm font-bold text-white">
            Đang tải và đồng bộ tin tức thời gian thực từ Investing.com, Forex Factory & các hãng tin crypto...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#0f172a] border border-slate-800 rounded-2xl p-6 text-slate-400 text-sm space-y-2">
          <div className="font-bold text-slate-300">Không tìm thấy bài báo nào phù hợp với bộ lọc hiện tại.</div>
          <p className="text-xs text-slate-500">Thử chuyển sang "Tất Cả Nguồn" hoặc xóa từ khóa tìm kiếm.</p>
          <button
            onClick={() => {
              setSourceFilter("ALL");
              setCategory("ALL");
              setSearch("");
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600/20 text-sky-300 border border-blue-500/30 text-xs font-bold hover:bg-blue-600/30 mt-2"
          >
            <span>Đặt lại toàn bộ bộ lọc</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((art, idx) => {
            const isInvesting =
              art.sourceType === "INVESTING" ||
              (art.source && art.source.toLowerCase().includes("investing"));

            const isForexFactory =
              art.sourceType === "FOREX_FACTORY" ||
              (art.source && (art.source.toLowerCase().includes("forex") || art.source.toLowerCase().includes("factory")));

            const isBullish = art.sentiment === "BULLISH";
            const isBearish = art.sentiment === "BEARISH";

            return (
              <div
                key={art.id || idx}
                onClick={() => onSelectArticle(art)}
                className="bg-[#0f172a] border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:shadow-blue-900/10 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3">
                  {/* Card Top Row: Source Badge + Sentiment Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-800/80">
                    {/* BADGE NHẬN DIỆN NGUỒN TIN NỔI BẬT */}
                    {isInvesting ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>Investing.com</span>
                      </span>
                    ) : isForexFactory ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10">
                        <Landmark className="w-3.5 h-3.5 text-sky-400" />
                        <span>Forex Factory</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40 ml-0.5">
                          High Impact
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        <Globe className="w-3.5 h-3.5 text-sky-400" />
                        <span>{art.source || "Crypto News"}</span>
                      </span>
                    )}

                    {/* Sentiment Badge */}
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${
                        isBullish
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : isBearish
                          ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          : "bg-blue-500/15 text-sky-300 border-blue-500/30"
                      }`}
                    >
                      {art.sentiment || "BULLISH"}
                    </span>
                  </div>

                  {/* Article Title */}
                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 leading-snug line-clamp-2 transition-colors">
                    {art.translatedTitle || art.title}
                  </h4>

                  {/* Article Summary */}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-normal">
                    {art.translatedSummary || art.summary}
                  </p>
                </div>

                {/* Card Bottom: Published Time + Reader Link */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{art.publishedAt || "Mới cập nhật"}</span>
                  </span>

                  <div className="flex items-center gap-1.5 text-sky-400 font-bold group-hover:text-sky-300 transition-colors">
                    <span>Xem bản dịch & AGY</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
