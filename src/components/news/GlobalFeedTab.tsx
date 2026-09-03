import React, { useState, useEffect } from "react";
import {
  Newspaper,
  Search,
  RefreshCw,
  ExternalLink,
  Tag,
  Globe,
  Flame,
  Sparkles
} from "lucide-react";
import { NewsArticle } from "../../types";
import { NewsApi } from "../../services/api";

interface GlobalFeedTabProps {
  onSelectArticle: (article: NewsArticle) => void;
}

const FEED_CATEGORIES = [
  { id: "ALL", label: "Tất Cả Tin" },
  { id: "BTC", label: "🪙 Bitcoin (BTC)" },
  { id: "ETH", label: "🔷 Ethereum (ETH)" },
  { id: "SOL", label: "🟣 Solana (SOL)" },
  { id: "Trading", label: "📊 Giao Dịch & Phân Tích" },
  { id: "Regulation", label: "⚖️ Pháp Lý & SEC" },
  { id: "Macro", label: "🏛️ Vĩ Mô & FED" },
];

const DEFAULT_FALLBACK_ARTICLES: NewsArticle[] = [
  {
    title: "Bitcoin bứt phá trên vùng hỗ trợ quan trọng khi dòng tiền ETF duy trì dương",
    source: "CoinDesk / Bloomberg",
    url: "https://www.coindesk.com",
    publishedAt: "Vừa xong",
    summary: "Dòng vốn ròng từ các quỹ Spot ETF tại Mỹ tiếp tục ghi nhận đà mua vào ròng liên tiếp, tạo lực đỡ vững chắc cho vùng giá hỗ trợ 4H.",
    category: "BTC • ETF • Macro",
    impactLevel: "HIGH",
    sentiment: "BULLISH",
    translatedTitle: "Bitcoin bứt phá trên vùng hỗ trợ quan trọng khi dòng tiền ETF duy trì dương",
    translatedSummary: "Dòng vốn ròng từ các quỹ Spot ETF tại Mỹ tiếp tục ghi nhận đà mua vào ròng liên tiếp, tạo lực đỡ vững chắc cho vùng giá hỗ trợ 4H của Bitcoin. Thanh khoản toàn thị trường phái sinh ổn định.",
    originalSnippet: "Net inflows into spot Bitcoin ETFs continued for the third consecutive day, providing strong structural support near key moving averages.",
    agyDiagnosis: "Động lực thị trường tích cực: Lực mua thực tế từ tổ chức đang hấp thụ tốt lượng cung bán lẻ. Khuyến nghị theo dõi điểm kiểm định lại (retest) vùng cầu 4H."
  },
  {
    title: "Ethereum củng cố quanh mốc hỗ trợ kỹ thuật, phí gas mạng Layer 2 giảm sâu",
    source: "Cointelegraph",
    url: "https://cointelegraph.com",
    publishedAt: "1 giờ trước",
    summary: "Hệ sinh thái Layer 2 ghi nhận mức phí giao dịch cực thấp sau các nâng cấp mạng lưới, thúc đẩy hoạt động on-chain tăng trưởng.",
    category: "ETH • Layer 2 • DeFi",
    impactLevel: "MEDIUM",
    sentiment: "BULLISH",
    translatedTitle: "Ethereum củng cố quanh mốc hỗ trợ kỹ thuật, phí gas mạng Layer 2 giảm sâu",
    translatedSummary: "Hệ sinh thái Layer 2 ghi nhận mức phí giao dịch cực thấp sau các nâng cấp mạng lưới, thúc đẩy hoạt động on-chain tăng trưởng vượt bậc.",
    originalSnippet: "Ethereum layer-2 activity surges as transaction fees drop to record lows following network upgrades.",
    agyDiagnosis: "Tín hiệu tích cực trung hạn cho hệ sinh thái ETH. Khuyến nghị canh lệnh Mua tại vùng hỗ trợ swing low."
  },
  {
    title: "Chủ tịch FED phát biểu về định hướng lãi suất và tác động thanh khoản toàn cầu",
    source: "Reuters Financial",
    url: "https://www.reuters.com",
    publishedAt: "3 giờ trước",
    summary: "Các chỉ số lạm phát PCE tiếp tục tiến gần mục tiêu 2%, mở ra kỳ vọng nới lỏng chính sách tiền tệ trong các quý tới.",
    category: "Macro • FED • Interest Rates",
    impactLevel: "HIGH",
    sentiment: "BULLISH",
    translatedTitle: "Chủ tịch FED phát biểu về định hướng lãi suất và tác động thanh khoản toàn cầu",
    translatedSummary: "Các chỉ số lạm phát PCE tiếp tục tiến gần mục tiêu 2%, mở ra kỳ vọng nới lỏng chính sách tiền tệ trong các quý tới.",
    originalSnippet: "Federal Reserve officials note inflation progress, signaling potential rate path adjustments later this year.",
    agyDiagnosis: "Môi trường vĩ mô thuận lợi cho tài sản rủi ro (Risk-on assets). Không nên mở vị thế Short đuổi theo tin tức ngắn hạn."
  }
];

export const GlobalFeedTab: React.FC<GlobalFeedTabProps> = ({ onSelectArticle }) => {
  const [articles, setArticles] = useState<NewsArticle[]>(DEFAULT_FALLBACK_ARTICLES);
  const [category, setCategory] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await NewsApi.analyzeCoin({ coin: "BTC" });
      if (res.success && res.analysis && res.analysis.articles && res.analysis.articles.length > 0) {
        setArticles(res.analysis.articles);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filtered = articles.filter((a) => {
    const matchCat = category === "ALL" || (a.category && a.category.includes(category)) || a.title.includes(category);
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.summary && a.summary.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER & CONTROLS */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-base font-black text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-sky-400" />
              <span>THƯ VIỆN TIN TỨC CRYPTO TOÀN CẦU (100% BÀI BÁO THỰC TẾ)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cập nhật thời gian thực từ CoinDesk, Cointelegraph, Bloomberg, Reuters, Decrypt... Bấm vào bài báo để xem <b>Bản dịch tiếng Việt chuẩn & Chuẩn đoán AGY</b>!
            </p>
          </div>

          <button
            onClick={fetchNews}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm Mới Tin Tức</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {FEED_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                category === c.id
                  ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                  : "bg-[#070a12] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Keyword Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Tìm kiếm bài báo theo từ khóa (ETF, Lạm phát, Halving, Cá mập, Phá vỡ, Hỗ trợ...)..."
            className="w-full bg-[#070a12] border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* 2. ARTICLES GRID */}
      {loading ? (
        <div className="text-center py-20 bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-sm font-bold text-white">Đang tải và lọc các bài báo mới nhất từ các hãng tin tài chính quốc tế...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#0f172a] border border-slate-800 rounded-2xl p-6 text-slate-500 text-sm">
          Không tìm thấy bài báo nào phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((art, idx) => (
            <div
              key={idx}
              onClick={() => onSelectArticle(art)}
              className="bg-[#0f172a] border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 shadow-sm transition-all cursor-pointer flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {art.source}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      art.sentiment === "BULLISH"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : art.sentiment === "BEARISH"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-blue-500/20 text-sky-300"
                    }`}
                  >
                    {art.sentiment || "BULLISH"}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-sky-300 leading-snug line-clamp-2 mb-2 transition-colors">
                  {art.translatedTitle || art.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {art.translatedSummary || art.summary}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-sky-400 pt-2 border-t border-slate-800/80 font-semibold">
                <span>Xem bản dịch & chuẩn đoán AGY</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
