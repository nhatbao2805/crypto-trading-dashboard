import React from "react";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Sparkles,
  ShieldCheck,
  Newspaper,
  Calendar,
  Tag,
  TrendingUp,
  TrendingDown,
  Compass,
  Flame,
  Landmark
} from "lucide-react";
import { NewsArticle } from "../../types";

interface ArticleReaderRouteViewProps {
  article: NewsArticle | null;
  onBack: () => void;
}

export const ArticleReaderRouteView: React.FC<ArticleReaderRouteViewProps> = ({
  article,
  onBack,
}) => {
  if (!article) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 p-8 bg-[#0c1220] rounded-2xl border border-slate-800 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
          <Newspaper className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Chưa Chọn Bài Báo Nào</h3>
          <p className="text-sm text-slate-400">
            Vui lòng quay lại danh sách dòng tin hoặc phân tích để chọn một bài viết cụ thể.
          </p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Quay Lại Danh Sách Tin Tức</span>
        </button>
      </div>
    );
  }

  const isBullish = article.sentiment === "BULLISH";
  const isBearish = article.sentiment === "BEARISH";
  const isInvesting =
    article.sourceType === "INVESTING" ||
    (article.source && article.source.toLowerCase().includes("investing"));
  const isForexFactory =
    article.sourceType === "FOREX_FACTORY" ||
    (article.source && (article.source.toLowerCase().includes("forex") || article.source.toLowerCase().includes("factory")));

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-7xl mx-auto">
      {/* Top Bar: Large Prominent Back Button & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm sm:text-base font-extrabold text-white bg-[#0f172a] hover:bg-slate-800 border border-slate-700 hover:border-slate-600 shadow-md transition-all group"
        >
          <ArrowLeft className="w-5 h-5 text-sky-400 group-hover:-translate-x-1 transition-transform" />
          <span>← Quay Lại Danh Sách Tin Tức</span>
        </button>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Mở Bài Báo Gốc Tại Nguồn ↗</span>
        </a>
      </div>

      {/* Article Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0c1322] via-[#0a0f1b] to-[#070b14] border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sentiment Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${
              isBullish
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : isBearish
                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
            }`}
          >
            {isBullish && <TrendingUp className="w-3.5 h-3.5" />}
            {isBearish && <TrendingDown className="w-3.5 h-3.5" />}
            {!isBullish && !isBearish && <Compass className="w-3.5 h-3.5" />}
            <span>{article.sentiment || "NEUTRAL"}</span>
          </span>

          {/* Impact Level */}
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-500/15 text-sky-300 border border-blue-500/30">
            {article.impactLevel || "HIGH"} IMPACT
          </span>

          {/* Category */}
          {article.category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              <Tag className="w-3 h-3" />
              <span>{article.category}</span>
            </span>
          )}

          {/* Published At */}
          <span className="inline-flex items-center gap-1 text-xs text-slate-400 ml-auto">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{article.publishedAt || "Vừa xuất bản"}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
          {article.translatedTitle || article.title}
        </h1>

        <div className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-800/80">
          <span>Hãng thông tấn / Nguồn tin:</span>
          {isInvesting ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Investing.com</span>
            </span>
          ) : isForexFactory ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10">
              <Landmark className="w-3.5 h-3.5 text-sky-400" />
              <span>Forex Factory</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 font-bold ml-1">
                High Impact
              </span>
            </span>
          ) : (
            <b className="text-white font-semibold">{article.source}</b>
          )}
        </div>
      </div>

      {/* 2-Column Wide Reading View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Vietnamese Translation & AGY Diagnosis */}
        <div className="lg:col-span-7 space-y-6">
          {/* AGY Terminal Impact Diagnosis Box */}
          <div className="rounded-2xl bg-gradient-to-r from-sky-950/30 via-slate-900/50 to-[#0c1322] border-2 border-sky-500/40 p-6 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="font-black text-sky-400 flex items-center gap-2 text-sm sm:text-base tracking-wide">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <span>CHẨN ĐOÁN TÁC ĐỘNG ĐỘC QUYỀN TỪ AGY TERMINAL</span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                AI Market Impact
              </span>
            </div>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
              {article.agyDiagnosis ||
                `Bài viết từ hãng tin ${article.source} mang hàm lượng tin tức trọng yếu, có khả năng tạo biến động ngắn hạn trên các cặp giao dịch liên quan. Nhà đầu tư nên theo dõi phản ứng giá tại các mốc kháng cự/hỗ trợ kỹ thuật.`}
            </p>
          </div>

          {/* Vietnamese Translation Section */}
          <div className="rounded-2xl bg-[#0c1220] border border-slate-800 p-6 sm:p-7 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <span className="text-xl">🇻🇳</span>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                NỘI DUNG & TÓM TẮT CHI TIẾT (BẢN DỊCH TIẾNG VIỆT)
              </h2>
            </div>

            <div className="text-base text-slate-200 leading-relaxed font-normal whitespace-pre-line space-y-4">
              <p className="bg-[#070b14] p-5 rounded-xl border border-slate-800/80 text-[15px] sm:text-[16px] leading-relaxed">
                {article.translatedSummary || article.summary || "Đang cập nhật bản dịch chi tiết của bài báo..."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Original English Snippet & Publisher Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Original English Snippet Box */}
          <div className="rounded-2xl bg-[#0c1220] border border-slate-800 p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <Globe className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm sm:text-base font-bold text-slate-200 uppercase tracking-wider">
                Tiêu Đề & Trích Đoạn Gốc (English)
              </h3>
            </div>

            <div className="space-y-3 bg-[#070b14] p-4 sm:p-5 rounded-xl border border-slate-800/80">
              <div className="font-bold text-slate-100 text-sm sm:text-base leading-snug">
                "{article.title}"
              </div>
              <p className="text-xs sm:text-sm text-slate-400 italic leading-relaxed">
                {article.originalSnippet || article.summary || "No raw English excerpt available."}
              </p>
            </div>
          </div>

          {/* Authentic Publisher Metadata Card */}
          <div className="rounded-2xl bg-[#0c1220] border border-slate-800 p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-slate-200 uppercase tracking-wider">
                Xác Thực Nguồn Tin & Bản Quyền
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Nhà Xuất Bản:</span>
                <span className="font-bold text-white">{article.source}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Thời Gian Quét:</span>
                <span className="text-slate-300">{article.publishedAt || "Thời gian thực"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Mức Độ Tác Động:</span>
                <span className="font-bold text-sky-400">{article.impactLevel || "HIGH"}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở Toàn Bộ Bài Viết Gốc ↗</span>
              </a>
              <p className="text-[11px] text-slate-500 text-center mt-2">
                Liên kết chuyển hướng trực tiếp đến trang web chính thức của {article.source}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
