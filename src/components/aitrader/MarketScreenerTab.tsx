import React, { useState, useEffect } from "react";
import {
  Radio,
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  SlidersHorizontal,
  Layers,
  Send,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { MarketScreenerResult, ScreenerCandidate, NlpStrategyResponse } from "../../types";
import { AiTraderApi } from "../../services/api";

interface MarketScreenerTabProps {
  onSelectCoinForDebate: (coin: string) => void;
  onOpenTelegramSettings: () => void;
  onShowToast: (message: string, type: "success" | "error" | "warning" | "info") => void;
}

export const MarketScreenerTab: React.FC<MarketScreenerTabProps> = ({
  onSelectCoinForDebate,
  onOpenTelegramSettings,
  onShowToast
}) => {
  const [screenerData, setScreenerData] = useState<MarketScreenerResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<"all" | "breakout" | "oversold" | "overbought">("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // NLP Strategy Parser State
  const [nlpPrompt, setNlpPrompt] = useState<string>(
    "Quét thị trường giao ngay: tìm các ký hiệu có khối lượng, dòng vốn đổ vào hoặc độ hot đang tăng nhanh và cảnh báo sớm cho tôi."
  );
  const [isParsingNlp, setIsParsingNlp] = useState<boolean>(false);
  const [nlpResponse, setNlpResponse] = useState<NlpStrategyResponse | null>(null);

  const fetchScreener = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await AiTraderApi.getScreenerLive();
      setScreenerData(res);
    } catch (err: any) {
      onShowToast(err.message || "Lỗi tải dữ liệu Radar Quét 24/7", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanNow = async () => {
    setIsLoading(true);
    try {
      const res = await AiTraderApi.scanScreenerNow();
      setScreenerData(res);
      onShowToast(`Đã quét xong ${res.totalScanned} cặp coin trên Binance!`, "success");
    } catch (err: any) {
      onShowToast(err.message || "Lỗi quét thị trường", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleParseNlpStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpPrompt.trim()) return;

    setIsParsingNlp(true);
    try {
      const res = await AiTraderApi.parseNlpStrategy(nlpPrompt);
      setNlpResponse(res);
      onShowToast("AI đã biên dịch ý tưởng thành bộ lọc chiến lược thành công!", "success");
    } catch (err: any) {
      onShowToast(err.message || "Lỗi phân tích ý tưởng", "error");
    } finally {
      setIsParsingNlp(false);
    }
  };

  useEffect(() => {
    fetchScreener(true);
    const interval = setInterval(() => fetchScreener(false), 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter items
  let displayList: ScreenerCandidate[] = [];
  if (screenerData) {
    if (filterTab === "breakout") displayList = screenerData.topBreakouts || [];
    else if (filterTab === "oversold") displayList = screenerData.topOversold || [];
    else if (filterTab === "overbought") displayList = screenerData.topOverbought || [];
    else displayList = screenerData.rankedSignals || [];
  }

  if (searchKeyword.trim()) {
    displayList = displayList.filter(c => 
      c.coin.toLowerCase().includes(searchKeyword.toLowerCase()) || 
      c.symbol.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. HERO BANNER & NLP STRATEGY INPUT (MATCHING PRO DESIGN) */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#0e1726] via-[#0b1120] to-[#080d1a] border border-blue-500/20 p-6 overflow-hidden shadow-2xl shadow-blue-500/5">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                Hệ Thống Trợ Lý AI 24/7 & Market Radar
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                Trợ lý giao dịch <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">AI 24/7 của bạn</span>
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl mt-1">
                Tự động quét toàn bộ hơn 350 cặp giao dịch Spot/Futures trên Binance theo thời gian thực, phát hiện dòng tiền đột biến và bắn cảnh báo bẫy giá tới bạn.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenTelegramSettings}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-2 shadow-lg hover:border-blue-500/50"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                Kết Nối Telegram Bot
              </button>

              <button
                onClick={handleScanNow}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Quét Ngay
              </button>
            </div>
          </div>

          {/* Natural Language Prompt Input Bar */}
          <form onSubmit={handleParseNlpStrategy} className="space-y-2 pt-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Nêu ý tưởng giao dịch của bạn (AI tự chuyển thành bộ lọc 24/7):
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={nlpPrompt}
                  onChange={(e) => setNlpPrompt(e.target.value)}
                  placeholder="VD: Quét thị trường giao ngay: tìm các ký hiệu có khối lượng, dòng vốn đổ vào hoặc RSI < 35..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={isParsingNlp}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-blue-600/30"
              >
                {isParsingNlp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Tạo Bộ Lọc
              </button>
            </div>
          </form>

          {/* Strategy Workflow 4 Steps Infographic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" /> 1. Quét thị trường
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Bao quát mọi ký hiệu spot/futures, khối lượng và dòng vốn thời gian thực.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> 2. Bộ lọc chéo
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Lọc các biến động ngắn hạn để giữ lại các đồng coin tiềm năng có xu hướng.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> 3. Xếp hạng lựa chọn
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Chấm điểm Confluence Score theo độ mạnh tín hiệu, R:R và tiềm năng tăng giá.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> 4. Cảnh báo đẩy
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tự động bắn thông báo đẩy kèm Entry, Stop Loss bắt buộc và cảnh báo bẫy.
              </p>
            </div>
          </div>

          {/* Active NLP Strategy Result Badge */}
          {nlpResponse && nlpResponse.strategy_config && (
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/40 animate-fade-in space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Đang Kích Hoạt Chiến Lược: {nlpResponse.strategy_config.strategy_name}
                </div>
                <span className="text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                  Tìm thấy {nlpResponse.active_matching_candidates?.length || 0} ứng viên phù hợp
                </span>
              </div>
              <p className="text-xs text-slate-300">{nlpResponse.strategy_config.intent_summary}</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. RADAR STATS & FILTER CONTROLS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        {/* Subtab Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === "all"
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🔥 Top Điểm Cao Nhất ({screenerData?.rankedSignals?.length || 0})
          </button>

          <button
            onClick={() => setFilterTab("breakout")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === "breakout"
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            ⚡ Bùng Nổ Volume ({screenerData?.topBreakouts?.length || 0})
          </button>

          <button
            onClick={() => setFilterTab("oversold")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === "oversold"
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            📉 Bắt Đáy Quá Bán ({screenerData?.topOversold?.length || 0})
          </button>

          <button
            onClick={() => setFilterTab("overbought")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === "overbought"
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🛑 Săn Bẫy Quá Mua ({screenerData?.topOverbought?.length || 0})
          </button>
        </div>

        {/* Search Bar & Market Breadth */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {screenerData && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0">
              <span>Độ rộng:</span>
              <span className="font-bold text-emerald-400">{screenerData.bullishBreadth}% Tăng</span>
              <span className="text-slate-600">|</span>
              <span>Đã quét: <b className="text-white">{screenerData.totalScanned}</b> coin</span>
            </div>
          )}

          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã coin..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 3. RADAR CARDS GRID */}
      {isLoading && !screenerData ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm">Đang quét dữ liệu toàn thị trường 350+ cặp Binance...</p>
        </div>
      ) : displayList.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800 p-8">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">Không tìm thấy mã coin nào thỏa mãn bộ lọc</p>
          <p className="text-xs text-slate-500 mt-1">Thử đổi tab lọc hoặc bấm "Quét Ngay" để cập nhật dữ liệu mới nhất</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayList.map((item) => {
            const isBullish = item.action.includes("BUY");
            const isHighConfluence = item.confluenceScore >= 80;

            return (
              <div
                key={item.symbol}
                className="group relative rounded-xl bg-[#0c1220] border border-slate-800 hover:border-blue-500/50 p-4 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col justify-between space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center font-black text-sm text-white">
                      {item.coin.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white text-base tracking-wide">{item.coin}</span>
                        <span className="text-[11px] text-slate-400">/USDT</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        ${item.price >= 1 ? item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : item.price.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md ${
                        item.change24h >= 0
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {item.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {item.change24h >= 0 ? "+" : ""}{item.change24h.toFixed(2)}%
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Vol: {item.volumeUsdFormatted}</div>
                  </div>
                </div>

                {/* Score & Signal */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" /> Điểm Hội Tụ:
                    </span>
                    <span
                      className={`font-black px-2 py-0.5 rounded-full text-xs ${
                        isHighConfluence
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {item.confluenceScore}/100 ⭐
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-slate-200 flex items-center justify-between">
                      <span className={isBullish ? "text-emerald-400" : "text-amber-400"}>{item.signal}</span>
                      <span className="text-[10px] text-slate-400 font-normal">RSI: {item.estimatedRsi}/100</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] font-mono text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Entry:</span>
                        {item.entryZone.split("-")[0]}
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-500 block">Stop Loss:</span>
                        {item.stopLoss}
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-500 block">TP Target:</span>
                        {item.takeProfit}
                      </div>
                    </div>
                  </div>

                  {/* Sentinel Trap Warning */}
                  <div className="text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-800/30 p-2 rounded-lg flex items-start gap-1.5 leading-snug">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item.trapWarning}</span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => onSelectCoinForDebate(item.coin)}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Đưa Vào Hội Đồng AI Soi Nến
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
