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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#06090e]">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
            <span>🔬</span> CẤU TRÚC GIẢI PHẪU THÂN NẾN & BÓNG NẾN (OHLC)
          </div>
          <div dangerouslySetInnerHTML={{ __html: ChartVisualizer.renderCandleAnatomySvg() }} />
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#06090e]">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
            <span>📊</span> 3 TRƯỜNG HỢP NẾN CƠ BẢN (NẮM QUYỀN KIỂM SOÁT THỊ TRƯỜNG)
          </div>
          <div dangerouslySetInnerHTML={{ __html: ChartVisualizer.renderThreeCandleCasesSvg() }} />
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#06090e]">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
            <span>🔨</span> BỘ ĐÔI NẾN BÚA HAMMER & NẾN BẮN SAO SHOOTING STAR
          </div>
          <div dangerouslySetInnerHTML={{ __html: ChartVisualizer.renderHammerShootingStarSvg() }} />
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#06090e]">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
            <span>➕</span> 3 DẠNG NẾN DOJI KINH ĐIỂN (CHUẨN, CHUỒN CHUỒN, BIA MỘ)
          </div>
          <div dangerouslySetInnerHTML={{ __html: ChartVisualizer.renderDojiTypesSvg() }} />
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#06090e]">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
            <span>📦</span> BỘ ĐÔI NẾN NHẤN CHÌM (BULLISH & BEARISH ENGULFING)
          </div>
          <div dangerouslySetInnerHTML={{ __html: ChartVisualizer.renderEngulfingPairSvg() }} />
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#06090e]">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
            <span>⭐</span> CỤM 3 NẾN SAO MAI & SAO HÔM (MORNING & EVENING STAR)
          </div>
          <div dangerouslySetInnerHTML={{ __html: ChartVisualizer.renderMorningEveningStarSvg() }} />
        </div>
      </div>

      {/* Preset Patterns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
        {keys.map((k) => {
          const item = presets[k];
          const chartSvg = ChartVisualizer.renderChartSvg({ ...item, width: 560, height: 280 });

          return (
            <div
              key={k}
              className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 flex flex-col gap-3.5 shadow-sm hover:border-slate-700 transition-colors"
            >
              <div className="font-extrabold text-sm sm:text-base text-white">{item.title}</div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.desc}</p>
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#06090e]">
                <div dangerouslySetInnerHTML={{ __html: chartSvg }} />
              </div>
              <div className="grid grid-cols-3 gap-2 bg-[#070a12] p-2.5 rounded-xl border border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-slate-400">Entry: </span>
                  <b className="text-sky-400">${item.tradeSetup.entry}</b>
                </div>
                <div>
                  <span className="text-slate-400">SL: </span>
                  <b className="text-rose-400">${item.tradeSetup.sl}</b>
                </div>
                <div>
                  <span className="text-slate-400">TP: </span>
                  <b className="text-emerald-400">${item.tradeSetup.tp}</b>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
