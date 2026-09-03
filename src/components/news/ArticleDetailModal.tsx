import React from "react";
import { X, ExternalLink, Globe, Sparkles, ShieldCheck, Newspaper } from "lucide-react";
import { NewsArticle } from "../../types";

interface ArticleDetailModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl shadow-black/80">
        <div className="flex items-start justify-between pb-3.5 mb-4 border-b border-slate-800 gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                {article.translatedTitle || article.title}
              </h3>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Nguồn: <b className="text-slate-200">{article.source}</b></span>
                {article.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {article.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm">
          {/* AGY Diagnosis & Impact Card */}
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>CHUẨN ĐOÁN & ĐÁNH GIÁ TÁC ĐỘNG TỪ AGY TERMINAL</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  article.sentiment === "BULLISH"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : article.sentiment === "BEARISH"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-blue-500/20 text-sky-300 border border-blue-500/40"
                }`}
              >
                {article.impactLevel || "HIGH IMPACT"} • {article.sentiment || "BULLISH"}
              </span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              {article.agyDiagnosis ||
                `Bài viết từ ${article.source} tác động mạnh tới tâm lý thị trường, tạo động lực ngắn hạn cho giá đồng coin liên quan.`}
            </p>
          </div>

          {/* Vietnamese Translation */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>🇻🇳</span>
              <span>NỘI DUNG BÀI BÁO ĐÃ DỊCH SANG TIẾNG VIỆT:</span>
            </div>
            <div className="bg-[#070a12] border border-slate-800 rounded-xl p-4 text-slate-200 leading-relaxed whitespace-pre-line">
              {article.translatedSummary || article.summary || "Đang tải bản dịch chi tiết..."}
            </div>
          </div>

          {/* Original English Snippet */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Tiêu đề & Đoạn trích gốc (English):</span>
            </div>
            <div className="bg-[#070a12]/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 italic leading-relaxed">
              <p className="font-semibold text-slate-300 mb-1">{article.title}</p>
              <p>{article.originalSnippet || article.summary}</p>
            </div>
          </div>
        </div>

        {/* Action Link to Authentic Publisher */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Nguồn xác thực: <b className="text-white">{article.source}</b>
          </span>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/30"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở Bài Báo Gốc Tại Nguồn ↗</span>
          </a>
        </div>
      </div>
    </div>
  );
};
