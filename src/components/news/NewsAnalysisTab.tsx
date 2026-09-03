import React, { useState } from "react";
import {
  Zap,
  Rocket,
  Flame,
  TrendingUp,
  TrendingDown,
  Terminal,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Newspaper
} from "lucide-react";
import { NewsAnalysisResult, NewsArticle } from "../../types";
import { NewsApi } from "../../services/api";
import { formatCoinPrice } from "../../services/binance";

interface NewsAnalysisTabProps {
  onSelectArticle: (article: NewsArticle) => void;
}

const QUICK_COINS = ["BTC", "ETH", "SOL", "BNB", "SUI", "DOGE", "XRP"];

export const NewsAnalysisTab: React.FC<NewsAnalysisTabProps> = ({ onSelectArticle }) => {
  const [coinInput, setCoinInput] = useState<string>("BTC");
  const [terminalLogs, setTerminalLogs] = useState<string>(
    "> Hệ thống AGY Terminal Console sẵn sàng. Hãy nhập mã đồng coin và nhấn 'Phân Tích & Kích Hoạt AGY' để bắt đầu."
  );
  const [terminalStatus, setTerminalStatus] = useState<string>("Ready");
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<NewsAnalysisResult | null>(null);

  const appendLog = (msg: string) => {
    setTerminalLogs((prev) => prev + "\n" + msg);
  };

  const handleRunAnalysis = async (targetCoin?: string) => {
    const coin = (targetCoin || coinInput).trim().toUpperCase();
    if (!coin) return;

    setLoading(true);
    setTerminalStatus(`Đang gọi AGY Engine (${coin})...`);
    setTerminalLogs(`> [AGY TERMINAL] Khởi động phiên phân tích 100% thời gian thực cho: ${coin}/USDT...\n> [1/3] Đang quét API Binance Spot & các hãng tin tài chính quốc tế...`);

    try {
      const res = await NewsApi.analyzeCoin({ coin });
      if (res.success && res.analysis) {
        setAnalysisResult(res.analysis);
        appendLog(`✔ [HOÀN TẤT] Phân tích hoàn chỉnh cho ${coin}. Tỷ lệ Bullish: ${res.analysis.bullishPercent}% | Bearish: ${res.analysis.bearishPercent}%`);
        setTerminalStatus("Active");
      }
    } catch (err: any) {
      appendLog(`❌ [LỖI] ${err.message}`);
      setTerminalStatus("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. COIN SEARCH BAR & QUICK PILLS */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-400" />
          <span>Nhập Tên Đồng Coin Để Phân Tích Tin Tức & Kích Hoạt Terminal AGY</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={coinInput}
            onChange={(e) => setCoinInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRunAnalysis();
            }}
            placeholder="Nhập mã coin (ví dụ: BTC, ETH, SOL, SUI, DOGE, XRP...)"
            className="flex-1 bg-[#070a12] border border-slate-700 rounded-xl px-4 py-2.5 text-sm sm:text-base font-mono font-bold uppercase text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />

          <button
            onClick={() => handleRunAnalysis()}
            disabled={loading || !coinInput.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition-all shadow-md shadow-blue-600/30 shrink-0"
          >
            <Rocket className="w-4 h-4" />
            <span>{loading ? "Đang Phân Tích..." : "Phân Tích & Kích Hoạt AGY"}</span>
          </button>
        </div>

        {/* Quick Coin Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Gợi ý nhanh:</span>
          {QUICK_COINS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCoinInput(c);
                handleRunAnalysis(c);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#070a12] hover:bg-slate-800 text-slate-300 hover:text-sky-400 border border-slate-800 transition-colors"
            >
              ⚡ {c}
            </button>
          ))}
        </div>
      </div>

      {/* 2. REAL-TIME AGY TERMINAL CONSOLE */}
      <div className="bg-[#05080f] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-[#080c14] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 ml-2">
              💻 AGY TERMINAL CONSOLE (/opt/homebrew/bin/agy) —{" "}
              <span className={terminalStatus === "Active" ? "text-emerald-400" : "text-amber-400"}>
                {terminalStatus}
              </span>
            </span>
          </div>

          <button
            onClick={() => setTerminalLogs("> Đã xóa log.")}
            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            Xóa log
          </button>
        </div>

        <div className="p-4 h-48 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
          {terminalLogs}
        </div>
      </div>

      {/* 3. NEWS IMPACT ANALYSIS RESULTS */}
      {analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fadeIn">
          {/* Left Column: Price Impact & Sentiment Meter */}
          <div className="lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-base font-black font-mono text-white tracking-wider">
                {analysisResult.coin}/USDT
              </span>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md ${
                  analysisResult.impactVerdict === "BULLISH"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : analysisResult.impactVerdict === "BEARISH"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-blue-500/20 text-sky-300 border border-blue-500/40"
                }`}
              >
                {analysisResult.impactVerdict} 🚀
              </span>
            </div>

            {/* Live Price Box */}
            <div className="bg-[#070a12] p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Giá Thị Trường Trực Tiếp</div>
              <div className="text-2xl font-black font-mono text-white">
                ${formatCoinPrice(analysisResult.price)}
              </div>
              <div
                className={`text-xs font-mono font-bold ${
                  (Number(analysisResult.change24h) || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {(Number(analysisResult.change24h) || 0) >= 0 ? "+" : ""}{(Number(analysisResult.change24h) || 0).toFixed(2)}% (24h)
              </div>
            </div>

            {/* Sentiment Meter Bar */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-300">Áp Lực Mua / Bán Toàn Thị Trường</div>
              <div className="h-3 w-full bg-rose-500/30 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${analysisResult.bullishPercent || 50}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-rose-400">🩸 Bearish ({analysisResult.bearishPercent || 50}%)</span>
                <span className="text-emerald-400">Bullish ({analysisResult.bullishPercent || 50}%) 🚀</span>
              </div>
            </div>

            {/* Catalysts List */}
            {analysisResult.catalysts && analysisResult.catalysts.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Các Chất Xúc Tác Tác Động Giá:</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {analysisResult.catalysts.map((cat, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-sky-400 mt-0.5">•</span>
                      <span>{cat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Recommendations & Articles */}
          <div className="lg:col-span-8 space-y-4">
            {/* Strategy Box */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="text-sm font-extrabold text-sky-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Tóm Tắt Động Lực Thị Trường & Khuyến Nghị Trader</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {analysisResult.summary}
              </p>

              {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-3.5 rounded-r-xl text-xs sm:text-sm text-slate-200 leading-relaxed space-y-1">
                  {analysisResult.recommendations.map((rec, i) => (
                    <div key={i}>👉 {rec}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Latest Articles */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Newspaper className="w-4 h-4 text-sky-400" />
                  <span>Các Bài Báo Mới Nhất Liên Quan Đến Coin Này</span>
                </div>
                <span className="text-[11px] text-slate-500">Bấm vào bài báo để xem bản dịch & chuẩn đoán</span>
              </div>

              <div className="space-y-2">
                {analysisResult.articles && analysisResult.articles.length > 0 ? (
                  analysisResult.articles.map((art, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectArticle(art)}
                      className="bg-[#070a12] border border-slate-800 hover:border-sky-500/50 p-3.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm font-bold text-slate-200 hover:text-sky-300">
                          {art.translatedTitle || art.title}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Nguồn: <b className="text-slate-400">{art.source}</b></span>
                          <span>• {art.impactLevel || "HIGH IMPACT"}</span>
                        </div>
                      </div>

                      <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Không có bài báo nào liên quan đến coin này.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
