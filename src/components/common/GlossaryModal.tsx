import React, { useState } from "react";
import { BookOpen, Search, X, Tag } from "lucide-react";
import { GlossaryTerm } from "../../types";

interface GlossaryModalProps {
  isOpen: boolean;
  terms: GlossaryTerm[];
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, terms, onClose }) => {
  const [search, setSearch] = useState<string>("");

  if (!isOpen) return null;

  const filtered = terms.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.origin.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Từ Điển Thuật Ngữ Crypto & SMC ({terms.length} Thuật Ngữ)</h3>
              <p className="text-xs text-slate-400">Trích lục chuẩn từ Chương 11 Giáo Trình Toàn Tập</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Toolbar */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tra cứu thuật ngữ (HODL, ATH, Order Block, SFP, ChoCH, FVG, Slippage...)"
            className="w-full bg-[#070a12] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Term List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Không tìm thấy thuật ngữ nào phù hợp với từ khóa "{search}".
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#070a12] border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-sky-400 font-mono">{item.term}</span>
                    <span className="text-[11px] text-slate-400 italic">({item.origin})</span>
                  </div>
                  {item.category && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {item.category}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Đóng Từ Điển
          </button>
        </div>
      </div>
    </div>
  );
};
