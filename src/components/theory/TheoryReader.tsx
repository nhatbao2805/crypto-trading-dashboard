import React, { useEffect, useState, useRef } from "react";
import { marked } from "marked";
import { Search, ChevronLeft, ChevronRight, BookOpen, Layers, Sparkles } from "lucide-react";
import { Chapter } from "../../types";
import { TheoryApi } from "../../services/api";
import { ChartVisualizer } from "./ChartVisualizer";

interface TheoryReaderProps {
  chapters: Chapter[];
  onOpenGlossary: () => void;
}

export const TheoryReader: React.FC<TheoryReaderProps> = ({ chapters, onOpenGlossary }) => {
  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [chapterDetail, setChapterDetail] = useState<Chapter | null>(null);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredChapters = chapters.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const currentIdx = chapters.findIndex((c) => c.id === activeChapterId);
  const currentChapter = chapters[currentIdx] || chapters[0];

  useEffect(() => {
    if (!activeChapterId) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    TheoryApi.getChapter(activeChapterId)
      .then((data) => {
        if (isMounted) {
          setChapterDetail(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeChapterId, chapters.length]);

  useEffect(() => {
    if (!contentRef.current || loading) return;

    const boxes = contentRef.current.querySelectorAll(".visual-mount-box");
    boxes.forEach((el) => {
      const type = el.getAttribute("data-visual");
      if (!type) return;

      let html = "";
      if (type === "blockchain-ledger") html = ChartVisualizer.renderBlockchainLedgerSvg();
      else if (type === "candle-anatomy") html = ChartVisualizer.renderCandleAnatomySvg();
      else if (type === "three-candle-cases") html = ChartVisualizer.renderThreeCandleCasesSvg();
      else if (type === "doji-types") html = ChartVisualizer.renderDojiTypesSvg();
      else if (type === "engulfing-pair") html = ChartVisualizer.renderEngulfingPairSvg();
      else if (type === "hammer-shooting-star") html = ChartVisualizer.renderHammerShootingStarSvg();
      else if (type === "morning-evening-star") html = ChartVisualizer.renderMorningEveningStarSvg();
      else if (type === "support-resistance-zone") html = ChartVisualizer.renderSupportResistanceZoneSvg();
      else if (type === "role-reversal-diagram") html = ChartVisualizer.renderRoleReversalDiagramSvg();
      else if (type === "market-structure") html = ChartVisualizer.renderMarketStructureSvg();
      else if (type === "fractal-swing") html = ChartVisualizer.renderFractalSwingSvg();
      else if (type === "rsi-oscillator") html = ChartVisualizer.renderRsiOscillatorSvg();
      else if (type === "success-triangle") html = ChartVisualizer.renderSuccessTriangleSvg();
      else if (type === "risk-reward-diagram") html = ChartVisualizer.renderRiskRewardDiagramSvg();
      else if (type === "capital-flow-cycle") html = ChartVisualizer.renderCapitalFlowCycleSvg();
      else if (type === "whale-manipulation-overview") html = ChartVisualizer.renderWhaleManipulationSvg();
      else if (type === "fvg-diagram") html = ChartVisualizer.renderFvgDiagramSvg();
      else if (type === "order-block") html = ChartVisualizer.renderOrderBlockSvg();
      else if (type === "bos-choch") html = ChartVisualizer.renderBosChochSvg();
      else if (type === "hot-cold-wallet") {
        html = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 18px 0;">
            <div style="background: rgba(255, 59, 105, 0.08); border: 1px solid rgba(255, 59, 105, 0.35); border-radius: 10px; padding: 16px;">
              <div style="font-size: 15px; font-weight: 800; color: #ff6b8f; margin-bottom: 8px;">🔥 VÍ NÓNG (HOT WALLET)</div>
              <ul style="margin-left: 16px; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                <li><b>Đặc điểm:</b> Kết nối trực tiếp Internet (App di động / Extension trình duyệt).</li>
                <li><b>Ưu điểm:</b> Tiện lợi giao dịch hàng ngày, kết nối DeFi/Web3 tức thì, chi phí 0đ.</li>
                <li><b>Rủi ro:</b> Dễ bị dính mã độc, link phishing lừa đảo nếu bất cẩn.</li>
                <li><b>Đại diện tiêu biểu:</b> MetaMask, Phantom, Trust Wallet, Rabby Wallet.</li>
              </ul>
            </div>
            <div style="background: rgba(0, 192, 118, 0.08); border: 1px solid rgba(0, 192, 118, 0.35); border-radius: 10px; padding: 16px;">
              <div style="font-size: 15px; font-weight: 800; color: #26e396; margin-bottom: 8px;">🧊 VÍ LẠNH (COLD WALLET)</div>
              <ul style="margin-left: 16px; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                <li><b>Đặc điểm:</b> Thiết bị phần cứng vật lý riêng biệt, ngắt hoàn toàn khỏi Internet.</li>
                <li><b>Ưu điểm:</b> An toàn tuyệt đối chống hacker từ xa, xác thực vật lý bằng nút bấm.</li>
                <li><b>Mục đích:</b> Thích hợp lưu trữ tài sản lớn dài hạn (HODL).</li>
                <li><b>Đại diện tiêu biểu:</b> Ledger Nano X, Trezor Model T, SafePal S1.</li>
              </ul>
            </div>
          </div>
        `;
      }

      if (html) {
        el.innerHTML = html;
      }
    });
  }, [chapterDetail, loading]);

  const handleNavigate = (direction: number) => {
    const nextIdx = currentIdx + direction;
    if (nextIdx >= 0 && nextIdx < chapters.length) {
      setActiveChapterId(chapters[nextIdx].id);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const getRenderedContent = () => {
    if (!chapterDetail?.content) return "";

    let rawContent = chapterDetail.content.replace(/^#\s+CHƯƠNG\s+\d+[:\s].*\n+/i, "");

    // Clean symbols
    rawContent = rawContent
      .replace(/\$\rightarrow\$/g, "➔")
      .replace(/\\rightarrow/g, "➔")
      .replace(/\$\ge\$/g, "≥")
      .replace(/\\ge/g, "≥")
      .replace(/\$\le\$/g, "≤")
      .replace(/\\le/g, "≤")
      .replace(/\$\times\$/g, "×")
      .replace(/\\times/g, "×")
      .replace(/\$\approx\$/g, "≈")
      .replace(/\\approx/g, "≈")
      .replace(/\\mathbf\{([^}]+)\}/g, "$1")
      .replace(/\\text\{([^}]+)\}/g, "$1")
      .replace(/\\%/g, "%")
      .replace(/\\\$/g, "$");

    // Replace ASCII blocks with Mount Boxes
    rawContent = rawContent.replace(/```[\s\S]*?BLOCK #101[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"blockchain-ledger\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?VÍ NÓNG[\s\S]*?VÍ LẠNH[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"hot-cold-wallet\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?NẾN TĂNG \(BULLISH\)[\s\S]*?NẾN GIẢM \(BEARISH\)[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"candle-anatomy\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?TRƯỜNG HỢP 1[\s\S]*?TRƯỜNG HỢP 2[\s\S]*?TRƯỜNG HỢP 3[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"three-candle-cases\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?Xu hướng giảm[\s\S]*?Nến Hammer[\s\S]*?```/gi, "\n\n<div class=\"visual-mount-box\" data-visual=\"hammer-shooting-star\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?DOJI CHUẨN[\s\S]*?DOJI CHUỒN CHUỒN[\s\S]*?DOJI BIA MỘ[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"doji-types\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?BULLISH ENGULFING[\s\S]*?BEARISH ENGULFING[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"engulfing-pair\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?MORNING STAR[\s\S]*?EVENING STAR[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"morning-evening-star\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?VÙNG KHÁNG CỰ \(Trần Nhà[\s\S]*?VÙNG HỖ TRỢ \(Mặt Sàn[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"support-resistance-zone\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?Phá vỡ \(Breakout\)[\s\S]*?HỖ TRỢ GỐC[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"role-reversal-diagram\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?UPTREND \(Xu hướng Tăng\)[\s\S]*?DOWNTREND[\s\S]*?SIDEWAY[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"market-structure\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?QUY TẮC XÁC NHẬN ĐỈNH[\s\S]*?QUY TẮC XÁC NHẬN ĐÁY[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"fractal-swing\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?QUÁ MUA[\s\S]*?QUÁ BÁN[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"rsi-oscillator\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?TỔNG HỢP 7 DẤU HIỆU CÁ MẬP QUÉT SÀN[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"whale-manipulation-overview\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?50% TÂM LÝ[\s\S]*?30% QUẢN LÝ VỐN[\s\S]*?20% PHÂN TÍCH KỸ THUẬT[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"success-triangle\"></div>\n\n");
    rawContent = rawContent.replace(/```[\s\S]*?Mục tiêu Chốt Lời[\s\S]*?TỶ LỆ R:R = 1:2[\s\S]*?```/g, "\n\n<div class=\"visual-mount-box\" data-visual=\"risk-reward-diagram\"></div>\n\n");

    return marked.parse(rawContent, { gfm: true, breaks: true }) as string;
  };

  const presets = ChartVisualizer.getPresetPatterns();

  return (
    <div className={`grid gap-6 animate-fadeIn ${isZenMode ? "grid-cols-1 max-w-5xl mx-auto" : "grid-cols-1 lg:grid-cols-12"}`}>
      {/* LEFT SIDEBAR: TOC & SEARCH (Hidden when in Zen Mode) */}
      {!isZenMode && (
        <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-3 lg:sticky lg:top-20 self-start max-h-[calc(100vh-100px)]">
          {/* Search */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-3 shadow-sm">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm nội dung (Nến, RSI, SMC...)"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Chapters TOC list */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-3.5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                📑 Mục Lục 12 Chương
              </span>
              <span className="text-[10px] font-mono text-sky-400 font-semibold">
                {filteredChapters.length} Chương
              </span>
            </div>

            <div className="flex flex-col gap-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 no-scrollbar">
              {filteredChapters.map((c) => {
                const isActive = c.id === activeChapterId;
                const titleClean = c.title.replace(/^CHƯƠNG\s+\d+[:\s]*/i, "");

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveChapterId(c.id);
                      window.scrollTo({ top: 100, behavior: "smooth" });
                    }}
                    className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isActive
                        ? "bg-blue-600/15 border-blue-500/40 text-white shadow-sm"
                        : "bg-[#070a12]/70 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className={`text-[9px] font-extrabold font-mono uppercase ${isActive ? "text-sky-400" : "text-slate-400"}`}>
                        CHƯƠNG {c.id}
                      </div>
                      <div className="text-xs font-semibold leading-tight truncate mt-0.5">{titleClean}</div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        isActive ? "bg-blue-500/30 text-sky-300" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {c.sectionCount || 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      )}

      {/* RIGHT MAIN CONTENT AREA */}
      <main className={`${isZenMode ? "w-full" : "lg:col-span-8 xl:col-span-9"} flex flex-col gap-4`}>
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 sm:p-7 lg:p-9 shadow-sm min-h-[700px] flex flex-col">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-sky-400 font-mono tracking-wider">
                    CHƯƠNG {currentChapter?.id} / {chapters.length}
                  </span>
                  {isZenMode && (
                    <select
                      value={activeChapterId}
                      onChange={(e) => {
                        setActiveChapterId(Number(e.target.value));
                        window.scrollTo({ top: 100, behavior: "smooth" });
                      }}
                      className="bg-[#070a12] border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-slate-200 font-semibold focus:outline-none"
                    >
                      {chapters.map((c) => (
                        <option key={c.id} value={c.id}>
                          Chương {c.id}: {c.title.replace(/^CHƯƠNG\s+\d+[:\s]*/i, "")}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-white mt-1.5">
                  {currentChapter?.title || "Đang tải nội dung giáo trình..."}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsZenMode(!isZenMode)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-all"
                title={isZenMode ? "Mở lại danh sách chương" : "Ẩn danh sách chương để tập trung đọc"}
              >
                <span>{isZenMode ? "📖 Hiện Mục Lục" : "👓 Zen Mode (Tập Trung)"}</span>
              </button>

              <button
                onClick={() => handleNavigate(-1)}
                disabled={currentIdx <= 0}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 border border-slate-700 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Trước
              </button>
              <button
                onClick={() => handleNavigate(1)}
                disabled={currentIdx >= chapters.length - 1}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 border border-slate-700 transition-colors"
              >
                Tiếp <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Real Candlestick Pattern Visual Callouts by Chapter */}
          {activeChapterId === 4 && (
            <div className="mb-6 p-4 rounded-xl bg-[#06090e] border border-slate-800">
              <div className="text-sm font-extrabold text-sky-400 mb-3 flex items-center gap-2">
                <span>🕯️</span> BỘ HÌNH ẢNH MÔ HÌNH NẾN ĐẢO CHIỀU THỰC TẾ (CHƯƠNG 4)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div
                  className="rounded-xl overflow-hidden border border-slate-800 bg-[#080c14]"
                  dangerouslySetInnerHTML={{
                    __html: ChartVisualizer.renderChartSvg({ ...presets.hammer, width: 480, height: 250 }),
                  }}
                />
                <div
                  className="rounded-xl overflow-hidden border border-slate-800 bg-[#080c14]"
                  dangerouslySetInnerHTML={{
                    __html: ChartVisualizer.renderChartSvg({ ...presets.shooting_star, width: 480, height: 250 }),
                  }}
                />
                <div
                  className="rounded-xl overflow-hidden border border-slate-800 bg-[#080c14]"
                  dangerouslySetInnerHTML={{
                    __html: ChartVisualizer.renderChartSvg({ ...presets.bullish_engulfing, width: 480, height: 250 }),
                  }}
                />
                <div
                  className="rounded-xl overflow-hidden border border-slate-800 bg-[#080c14]"
                  dangerouslySetInnerHTML={{
                    __html: ChartVisualizer.renderChartSvg({ ...presets.morning_star, width: 480, height: 250 }),
                  }}
                />
              </div>
            </div>
          )}

          {activeChapterId === 5 && (
            <div className="mb-6 p-4 rounded-xl bg-[#06090e] border border-slate-800">
              <div className="text-sm font-extrabold text-sky-400 mb-3 flex items-center gap-2">
                <span>📈</span> BIỂU ĐỒ CHUYỂN ĐỔI VAI TRÒ (BREAKOUT & RETEST) & QUÉT RÂU SFP THỰC TẾ
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div
                  className="rounded-xl overflow-hidden border border-slate-800 bg-[#080c14]"
                  dangerouslySetInnerHTML={{
                    __html: ChartVisualizer.renderChartSvg({ ...presets.role_reversal, width: 480, height: 250 }),
                  }}
                />
                <div
                  className="rounded-xl overflow-hidden border border-slate-800 bg-[#080c14]"
                  dangerouslySetInnerHTML={{
                    __html: ChartVisualizer.renderChartSvg({ ...presets.liquidity_sweep_sfp, width: 480, height: 250 }),
                  }}
                />
              </div>
            </div>
          )}

          {activeChapterId === 7 && (
            <div className="mb-6 p-4 rounded-xl bg-[#06090e] border border-slate-800">
              <div className="text-sm font-extrabold text-sky-400 mb-3 flex items-center gap-2">
                <span>🎯</span> BIỂU ĐỒ KỊCH BẢN THỰC CHIẾN 3 KHUNG GIỜ BTC (R:R = 1 : 12.8) & BẪY JUDAS
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div
                  className="rounded-xl overflow-hidden border border-slate-800 bg-[#080c14]"
                  dangerouslySetInnerHTML={{
                    __html: ChartVisualizer.renderChartSvg({ ...presets.multi_timeframe_btc, width: 480, height: 250 }),
                  }}
                />
                <div
                  className="rounded-xl overflow-hidden border border-slate-800 bg-[#080c14]"
                  dangerouslySetInnerHTML={{
                    __html: ChartVisualizer.renderChartSvg({ ...presets.judas_swing, width: 480, height: 250 }),
                  }}
                />
              </div>
            </div>
          )}

          {activeChapterId === 9 && (
            <div className="mb-6 p-4 rounded-xl bg-[#06090e] border border-slate-800">
              <div className="text-sm font-extrabold text-sky-400 mb-3 flex items-center gap-2">
                <span>🐋</span> 4 BẪY THỰC CHIẾN KINH ĐIỂN CỦA CÁ MẬP (WHALES & MARKET MAKERS)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div
                  className="rounded-xl overflow-hidden border border-slate-800 bg-[#080c14]"
                  dangerouslySetInnerHTML={{
                    __html: ChartVisualizer.renderChartSvg({ ...presets.liquidity_sweep_sfp, width: 480, height: 250 }),
                  }}
                />
                <div
                  className="rounded-xl overflow-hidden border border-slate-800 bg-[#080c14]"
                  dangerouslySetInnerHTML={{
                    __html: ChartVisualizer.renderChartSvg({ ...presets.judas_swing, width: 480, height: 250 }),
                  }}
                />
                <div
                  className="rounded-xl overflow-hidden border border-slate-800 bg-[#080c14]"
                  dangerouslySetInnerHTML={{
                    __html: ChartVisualizer.renderChartSvg({ ...presets.funding_squeeze, width: 480, height: 250 }),
                  }}
                />
                <div
                  className="rounded-xl overflow-hidden border border-slate-800 bg-[#080c14]"
                  dangerouslySetInnerHTML={{
                    __html: ChartVisualizer.renderChartSvg({ ...presets.wyckoff_spring, width: 480, height: 250 }),
                  }}
                />
              </div>
            </div>
          )}

          {/* Chapter Body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin"></div>
              <p className="text-sm font-medium">Đang tải nội dung chương...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              Lỗi tải nội dung: {error}
            </div>
          ) : (
            <div
              ref={contentRef}
              className="theory-markdown prose prose-invert max-w-none flex-1"
              dangerouslySetInnerHTML={{ __html: getRenderedContent() }}
            />
          )}

          {/* Bottom Prev/Next Footer */}
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-800">
            <button
              onClick={() => handleNavigate(-1)}
              disabled={currentIdx <= 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 border border-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Chương Trước
            </button>
            <button
              onClick={() => handleNavigate(1)}
              disabled={currentIdx >= chapters.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors"
            >
              Chương Tiếp Theo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
