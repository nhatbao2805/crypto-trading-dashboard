import React, { useState } from "react";
import { Sparkles, Zap, Newspaper, BookOpen } from "lucide-react";
import { NewsSubTab, NewsArticle } from "../../types";
import { DailyBriefRouteView } from "./DailyBriefRouteView";
import { NewsAnalysisTab } from "./NewsAnalysisTab";
import { GlobalFeedTab } from "./GlobalFeedTab";
import { ArticleReaderRouteView } from "./ArticleReaderRouteView";

export const NewsModule: React.FC = () => {
  const [subTab, setSubTab] = useState<NewsSubTab>("daily");
  const [previousSubTab, setPreviousSubTab] = useState<NewsSubTab>("daily");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const handleSelectArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setPreviousSubTab(subTab === "article_reader" ? "feed" : subTab);
    setSubTab("article_reader");
  };

  const handleBackFromReader = () => {
    setSubTab(previousSubTab === "article_reader" ? "feed" : previousSubTab);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Sub-Tab Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5 bg-[#070a12] p-1.5 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setSubTab("daily")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              subTab === "daily"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-300" />
            <span>1. 📰 Bản Tin Ngày & Chiến Lược AI</span>
          </button>

          <button
            onClick={() => setSubTab("analyze")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              subTab === "analyze"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>2. ⚡ Phân Tích Đồng Coin</span>
          </button>

          <button
            onClick={() => setSubTab("feed")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              subTab === "feed"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Newspaper className="w-4 h-4 text-purple-400" />
            <span>3. 🌐 Dòng Tin Toàn Cầu</span>
          </button>
        </div>

        {subTab === "article_reader" && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Đang Đọc Bài Báo Toàn Màn Hình</span>
          </div>
        )}
      </div>

      {/* SubTab Route Views */}
      {subTab === "daily" && <DailyBriefRouteView />}
      {subTab === "analyze" && <NewsAnalysisTab onSelectArticle={handleSelectArticle} />}
      {subTab === "feed" && <GlobalFeedTab onSelectArticle={handleSelectArticle} />}
      {subTab === "article_reader" && (
        <ArticleReaderRouteView
          article={selectedArticle}
          onBack={handleBackFromReader}
        />
      )}
    </div>
  );
};
