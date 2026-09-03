import React, { useState } from "react";
import { BookOpen, CandlestickChart, BookText } from "lucide-react";
import { Chapter, TheorySubTab } from "../../types";
import { TheoryReader } from "./TheoryReader";
import { CandlestickAtlas } from "./CandlestickAtlas";

interface TheoryModuleProps {
  chapters: Chapter[];
  onOpenGlossary: () => void;
}

export const TheoryModule: React.FC<TheoryModuleProps> = ({ chapters, onOpenGlossary }) => {
  const [subTab, setSubTab] = useState<TheorySubTab>("reader");

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 bg-[#070a12] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSubTab("reader")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "reader"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>12 Chương Giáo Trình</span>
          </button>

          <button
            onClick={() => setSubTab("atlas")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "atlas"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <CandlestickChart className="w-3.5 h-3.5 text-emerald-400" />
            <span>Thư Viện Mô Hình Nến (Atlas)</span>
          </button>
        </div>

        <button
          onClick={onOpenGlossary}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-700/80 transition-colors shadow-sm"
        >
          <BookText className="w-3.5 h-3.5 text-sky-400" />
          <span>Từ Điển Crypto (21 Thuật Ngữ)</span>
        </button>
      </div>

      {/* SubTab Views */}
      {subTab === "reader" ? (
        <TheoryReader chapters={chapters} onOpenGlossary={onOpenGlossary} />
      ) : (
        <CandlestickAtlas />
      )}
    </div>
  );
};
