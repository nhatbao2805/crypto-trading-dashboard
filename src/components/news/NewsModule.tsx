import React, { useState } from "react";
import { Zap, MessageSquare, Newspaper } from "lucide-react";
import { NewsSubTab, NewsArticle } from "../../types";
import { NewsAnalysisTab } from "./NewsAnalysisTab";
import { AgyChatTab } from "./AgyChatTab";
import { GlobalFeedTab } from "./GlobalFeedTab";
import { ArticleDetailModal } from "./ArticleDetailModal";

export const NewsModule: React.FC = () => {
  const [subTab, setSubTab] = useState<NewsSubTab>("analyze");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Sub-Tab Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 bg-[#070a12] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSubTab("analyze")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "analyze"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1. Phân Tích Đồng Coin & AGY</span>
          </button>

          <button
            onClick={() => setSubTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "chat"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>2. Chat Chiến Lược AGY</span>
          </button>

          <button
            onClick={() => setSubTab("feed")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "feed"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 text-purple-400" />
            <span>3. Toàn Cầu Feed</span>
          </button>
        </div>
      </div>

      {/* SubTab Views */}
      {subTab === "analyze" && <NewsAnalysisTab onSelectArticle={setSelectedArticle} />}
      {subTab === "chat" && <AgyChatTab />}
      {subTab === "feed" && <GlobalFeedTab onSelectArticle={setSelectedArticle} />}

      {/* Article Detail Reader Modal */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
};
