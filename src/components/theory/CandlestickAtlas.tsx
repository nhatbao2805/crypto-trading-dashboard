import React from "react";
import { ChartVisualizer } from "./ChartVisualizer";
import { Sparkles, ArrowRight } from "lucide-react";

export const CandlestickAtlas: React.FC = () => {
  const presets = ChartVisualizer.getPresetPatterns();
  const keys = Object.keys(presets);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Atlas Header Banner */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
          <span>🕯️</span> Thư Viện Mô Hình Nến & Mẫu Hình Biểu Đồ Chuẩn Giáo Trình
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Hình ảnh mô phỏng trực quan chuẩn xác theo biểu đồ TradingView kèm hướng dẫn điểm Entry, Stop Loss và Take Profit từ Giáo trình.
        </p>
      </div>

      {/* Anatomical Diagrams */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#06090e] shadow-sm">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
            <span>🔬</span> CẤU TRÚC GIẢI PHẪU THÂN NẾN & BÓNG NẾN (OHLC)
          </div>
          <div dangerouslySetInnerHTML={{ __html: ChartVisualizer.renderCandleAnatomySvg() }} />
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#06090e] shadow-sm">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
            <span>🧠</span> 4 TRƯỜNG HỢP RÂU NẾN & TÂM LÝ CHIẾN TRƯỜNG (CHƯƠNG 3.4)
          </div>
          <div dangerouslySetInnerHTML={{ __html: ChartVisualizer.renderThreeCandleCasesSvg() }} />
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#06090e] shadow-sm">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
            <span>🔨</span> BỘ ĐÔI NẾN BÚA HAMMER & NẾN BẮN SAO SHOOTING STAR (CHƯƠNG 4.1)
          </div>
          <div dangerouslySetInnerHTML={{ __html: ChartVisualizer.renderHammerShootingStarSvg() }} />
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#06090e] shadow-sm">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
            <span>➕</span> 3 DẠNG NẾN DOJI KINH ĐIỂN (CHUẨN, CHUỒN CHUỒN, BIA MỘ) (CHƯƠNG 4.1.C)
          </div>
          <div dangerouslySetInnerHTML={{ __html: ChartVisualizer.renderDojiTypesSvg() }} />
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#06090e] shadow-sm">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
            <span>📦</span> BỘ ĐÔI NẾN NHẤN CHÌM (BULLISH & BEARISH ENGULFING) (CHƯƠNG 4.2.A)
          </div>
          <div dangerouslySetInnerHTML={{ __html: ChartVisualizer.renderEngulfingPairSvg() }} />
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#06090e] shadow-sm">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
            <span>⭐</span> CỤM 3 NẾN SAO MAI & SAO HÔM (MORNING & EVENING STAR) (CHƯƠNG 4.2.B)
          </div>
          <div dangerouslySetInnerHTML={{ __html: ChartVisualizer.renderMorningEveningStarSvg() }} />
        </div>
      </div>

      {/* Preset Patterns Grid - Balanced 2 Columns with Generous Width */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {keys.map((k) => {
          const item = presets[k];
          const chartSvg = ChartVisualizer.renderChartSvg({ ...item, width: 680, height: 320 });
          const risk = Math.abs(item.tradeSetup.entry - item.tradeSetup.sl);
          const reward = Math.abs(item.tradeSetup.tp - item.tradeSetup.entry);
          const rrRatio = risk > 0 ? (reward / risk).toFixed(1) : '1.0';

          return (
            <div
              key={k}
              className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-extrabold text-sm sm:text-base text-white tracking-wide leading-snug">{item.title}</div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold font-mono bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0">
                  R:R 1:{rrRatio}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed min-h-[38px]">{item.desc}</p>
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#06090e]">
                <div dangerouslySetInnerHTML={{ __html: chartSvg }} />
              </div>
              <div className="grid grid-cols-3 gap-3 bg-[#070a12] p-3 rounded-xl border border-slate-800/80 text-xs font-mono">
                <div className="flex flex-col bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 text-[11px] font-semibold">Điểm Vào (Entry)</span>
                  <b className="text-sky-400 text-sm mt-0.5 font-bold">${item.tradeSetup.entry}</b>
                </div>
                <div className="flex flex-col bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 text-[11px] font-semibold">Cắt Lỗ (Stop Loss)</span>
                  <b className="text-rose-400 text-sm mt-0.5 font-bold">${item.tradeSetup.sl}</b>
                </div>
                <div className="flex flex-col bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 text-[11px] font-semibold">Chốt Lời (Take Profit)</span>
                  <b className="text-emerald-400 text-sm mt-0.5 font-bold">${item.tradeSetup.tp}</b>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
