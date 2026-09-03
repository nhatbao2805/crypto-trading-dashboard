import React, { useState, useEffect } from "react";
import {
  Bot,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Send,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Scale,
  MessageSquare,
  BarChart3,
  Layers,
  UserCheck,
  Compass,
  Zap,
  HelpCircle,
  Copy,
  Check,
  Maximize2,
  Columns,
  LayoutGrid,
  ChevronRight,
  X,
  Radio,
  Bell
} from "lucide-react";
import {
  CouncilDebateResult,
  UserPredictionEvaluation,
  AiTraderSubTab
} from "../../types";
import { AiTraderApi } from "../../services/api";
import { TRACKED_COINS, formatCoinPrice } from "../../services/binance";
import { TradingViewWidget } from "../common/TradingViewWidget";
import { MarketScreenerTab } from "./MarketScreenerTab";
import { TelegramSettingsModal } from "./TelegramSettingsModal";

interface AiTraderViewProps {
  livePrices?: Record<string, number>;
  onShowToast?: (message: string, type: "success" | "error" | "warning" | "info") => void;
}

export const AiTraderView: React.FC<AiTraderViewProps> = ({ livePrices = {}, onShowToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<AiTraderSubTab>("screener");
  const [selectedCoin, setSelectedCoin] = useState<string>("BTC");
  const [layoutMode, setLayoutMode] = useState<"split" | "chart_focus" | "council_focus">("split");
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debateResult, setDebateResult] = useState<CouncilDebateResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSetup, setCopiedSetup] = useState<boolean>(false);

  // User Hypothesis State
  const [hypothesisText, setHypothesisText] = useState<string>("");
  const [userAction, setUserAction] = useState<"LONG" | "SHORT">("LONG");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<UserPredictionEvaluation | null>(null);
  const [evalHistory, setEvalHistory] = useState<any[]>([]);

  // Council Chat State
  const [chatPrompt, setChatPrompt] = useState<string>("");
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "council"; text: string; time: string }>>([
    {
      sender: "council",
      text: "Xin chào! Chúng tôi là Hội Đồng Multi-Agent AI-Trader gồm 4 chuyên gia: Kỹ Thuật (Agent Alpha), Vĩ Mô (Agent Macro), Rủi Ro (Agent Guardian) và Phản Biện (Agent Sentinel). Bạn có thể soi nến, vẽ vời trên biểu đồ TradingView bên cạnh và đặt câu hỏi hoặc gửi giả thuyết để chúng tôi thẩm định!",
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  // Load Council Debate on coin change
  const loadCouncilAnalysis = async (coin = selectedCoin) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const currentPrice = livePrices[coin.toUpperCase()] || 0;
      const res = await AiTraderApi.runCouncilAnalysis({
        coin,
        clientMarket: currentPrice > 0 ? { price: currentPrice } : null
      });
      setDebateResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể kết nối Hội đồng AI");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCouncilAnalysis(selectedCoin);
  }, [selectedCoin]);

  // Evaluate User Prediction
  const handleEvaluatePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypothesisText.trim()) return;

    setIsEvaluating(true);
    try {
      const currentPrice = livePrices[selectedCoin.toUpperCase()] || 0;
      const res = await AiTraderApi.evaluatePrediction({
        coin: selectedCoin,
        hypothesis: hypothesisText.trim(),
        userAction,
        clientMarket: currentPrice > 0 ? { price: currentPrice } : null
      });
      if (res.success && res.evaluation) {
        setEvalResult(res.evaluation);
        setEvalHistory((prev) => [res.evaluation, ...prev]);
        // If in workspace, scroll to or show eval popup
        if (activeSubTab === "workspace") {
          setActiveSubTab("hypo_eval");
        }
      }
    } catch (err: any) {
      alert("Lỗi thẩm định: " + err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Send Council Chat
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim() || isSendingChat) return;

    const userText = chatPrompt.trim();
    const timeNow = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    setChatMessages((prev) => [...prev, { sender: "user", text: userText, time: timeNow }]);
    setChatPrompt("");
    setIsSendingChat(true);

    try {
      const currentPrice = livePrices[selectedCoin.toUpperCase()] || 0;
      const res = await AiTraderApi.chatCouncil({
        prompt: userText,
        coin: selectedCoin,
        clientMarket: currentPrice > 0 ? { price: currentPrice } : null
      });
      if (res.success && res.output) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "council",
            text: res.output,
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "council",
          text: `⚠️ Lỗi kết nối Hội đồng AI: ${err.message}`,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const currentLivePrice = livePrices[selectedCoin.toUpperCase()] || debateResult?.liveMarket?.price || 0;
  const change24h = debateResult?.liveMarket?.change24h || 0;
  const isPositive = change24h >= 0;

  const copySetupToClipboard = () => {
    if (!debateResult?.master_verdict) return;
    const v = debateResult.master_verdict;
    const text = `🎯 Kế Hoạch Trade [${selectedCoin}/USDT]\n• Quyết Định: ${v.action_label} (Xác suất ${v.probability_pct}%)\n• Entry: ${v.entry_zone}\n• Stop Loss: ${v.stop_loss}\n• Take Profit: ${v.take_profit}\n• Giá Live: $${formatCoinPrice(currentLivePrice)}`;
    navigator.clipboard.writeText(text);
    setCopiedSetup(true);
    setTimeout(() => setCopiedSetup(false), 2500);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. COMPACT TOP TOOLBAR & COIN SELECTOR */}
      <div className="bg-[#0b101b] border border-slate-800/80 rounded-2xl p-3.5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Coin Selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <span className="text-[11px] font-bold uppercase text-slate-400 mr-1 hidden sm:inline">COIN:</span>
            {TRACKED_COINS.map((c) => {
              const upper = c.toUpperCase();
              const isSelected = selectedCoin === upper;
              const p = livePrices[upper];
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCoin(upper)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-500 shadow-sm scale-105"
                      : "bg-[#070a12] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span>{upper}</span>
                  {p ? (
                    <span className="text-[10px] opacity-90 font-mono">${formatCoinPrice(p)}</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Right: Refresh & Action */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => loadCouncilAnalysis(selectedCoin)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-xl border border-slate-800 transition-all shrink-0"
              title="Quét lại dữ liệu realtime từ Binance"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-sky-400" : ""}`} />
              <span className="hidden sm:inline">Quét Lại Live</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs + Layout Modes */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSubTab("screener")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeSubTab === "screener"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                  : "text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20"
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>⚡ Radar Quét 24/7 & AI Screener</span>
            </button>

            <button
              onClick={() => setActiveSubTab("workspace")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeSubTab === "workspace"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>1. Workspace Pro</span>
            </button>

            <button
              onClick={() => setActiveSubTab("council")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeSubTab === "council"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Phòng Họp Chi Tiết ({selectedCoin})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("hypo_eval")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeSubTab === "hypo_eval"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>3. Thẩm Định Dự Đoán</span>
            </button>

            <button
              onClick={() => setActiveSubTab("chat")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeSubTab === "chat"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>4. Chat Với Hội Đồng</span>
            </button>

            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all shrink-0"
            >
              <Bell className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Bot Telegram</span>
            </button>
          </div>

          {/* Layout Mode Switcher (When in workspace) */}
          {activeSubTab === "workspace" && (
            <div className="flex items-center gap-1 bg-[#070a12] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setLayoutMode("split")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  layoutMode === "split"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Hiển thị song song Biểu đồ & Hội đồng AI"
              >
                <Columns className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline">Chia Đôi (Split)</span>
              </button>

              <button
                onClick={() => setLayoutMode("chart_focus")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  layoutMode === "chart_focus"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Toàn màn hình biểu đồ TradingView 100%"
              >
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Toàn Biểu Đồ</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. SUB-TAB 0: 24/7 RADAR MARKET SCREENER */}
      {activeSubTab === "screener" && (
        <MarketScreenerTab
          onSelectCoinForDebate={(coin) => {
            setSelectedCoin(coin.toUpperCase());
            setActiveSubTab("workspace");
          }}
          onOpenTelegramSettings={() => setIsTelegramModalOpen(true)}
          onShowToast={onShowToast || ((msg) => console.log(msg))}
        />
      )}

      {/* 3. SUB-TAB 1: WORKSPACE PRO */}
      {activeSubTab === "workspace" && (
        <div className="space-y-4">
          <div className={`grid gap-4 items-start ${layoutMode === "split" ? "grid-cols-1 xl:grid-cols-12" : "grid-cols-1"}`}>
            {/* TRADINGVIEW CHART & HYPOTHESIS FORM */}
            <div className={`${layoutMode === "split" ? "xl:col-span-7" : "w-full"} space-y-3`}>
              <div className="relative">
                {/* TRADINGVIEW WIDGET */}
                <TradingViewWidget
                  symbol={selectedCoin}
                  height={layoutMode === "chart_focus" ? "680px" : "600px"}
                  enableDrawing={true}
                  allowSymbolChange={true}
                  theme="dark"
                />

                {/* Focus Mode AI Panel Toggle Button */}
                {layoutMode === "chart_focus" && (
                  <button
                    onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
                    className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b101b]/90 hover:bg-slate-800 text-slate-200 border border-slate-700/90 backdrop-blur-md shadow-xl text-xs font-bold transition-all"
                  >
                    <BrainCircuit className="w-4 h-4 text-purple-400" />
                    <span>{isAiDrawerOpen ? "Đóng Hội Đồng AI" : "Mở Hội Đồng AI"}</span>
                  </button>
                )}
              </div>

              {/* QUICK HYPOTHESIS DOCK */}
              <div className="bg-[#0b101b] border border-slate-800/80 rounded-2xl p-3 shadow-lg">
                <form onSubmit={handleEvaluatePrediction} className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex gap-1 shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setUserAction("LONG")}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                        userAction === "LONG"
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                          : "bg-[#070a12] text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>LONG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserAction("SHORT")}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                        userAction === "SHORT"
                          ? "bg-rose-600 text-white border-rose-500 shadow-sm"
                          : "bg-[#070a12] text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>SHORT</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={hypothesisText}
                    onChange={(e) => setHypothesisText(e.target.value)}
                    placeholder={`Gửi mô hình bạn vừa vẽ: Ví dụ 2 đáy tại $${formatCoinPrice(currentLivePrice)}, RSI phân kỳ...`}
                    className="flex-1 w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />

                  <button
                    type="submit"
                    disabled={isEvaluating || !hypothesisText.trim()}
                    className="w-full sm:w-auto px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isEvaluating ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Thẩm Định</span>
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: AI COUNCIL STREAM (in Split Mode or Drawer Mode) */}
            {(layoutMode === "split" || isAiDrawerOpen) && (
              <div
                className={`${
                  layoutMode === "split"
                    ? "xl:col-span-5"
                    : "fixed top-14 right-0 bottom-0 z-40 w-full max-w-md bg-[#070b14] border-l border-slate-800 shadow-2xl p-4 overflow-y-auto animate-fadeIn"
                } space-y-3`}
              >
                {layoutMode === "chart_focus" && isAiDrawerOpen && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-white text-xs">Hội Đồng AI (Live Drawer)</span>
                    <button
                      onClick={() => setIsAiDrawerOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {isLoading && !debateResult ? (
                  <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3 min-h-[500px]">
                    <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                    <div className="text-white font-bold text-sm">Hội Đồng AI đang họp bàn...</div>
                    <div className="text-xs text-slate-400 max-w-xs">
                      Đang quét nến Binance {selectedCoin}/USDT, kiểm tra Funding Rate và 4 Sub-Agent.
                    </div>
                  </div>
                ) : debateResult ? (
                  <div className="bg-[#070b14] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl">
                    {/* TERMINAL HEADER */}
                    <div className="bg-[#0d1627] px-3.5 py-2.5 border-b border-indigo-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="ml-1.5 font-mono text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                          🏛️ HỘI ĐỒNG MULTI-AGENT LIVE
                        </span>
                      </div>

                      <button
                        onClick={copySetupToClipboard}
                        className="flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 transition-all"
                        title="Sao chép setup"
                      >
                        {copiedSetup ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Chép Setup</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* MARKET METRICS STRIP */}
                    <div className="bg-[#090f1d] px-3 py-2 border-b border-slate-800/80 text-[11px] font-mono flex flex-wrap items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold">{selectedCoin}/USDT</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-white font-bold">${formatCoinPrice(currentLivePrice)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                          {isPositive ? "+" : ""}{change24h.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* AGENT CARDS */}
                    <div className="p-3 space-y-2.5 max-h-[500px] overflow-y-auto no-scrollbar font-mono text-xs">
                      {/* SUB-AGENT 1: ALPHA */}
                      <div className="bg-[#0b1220] border border-blue-900/40 rounded-xl p-2.5 space-y-1 hover:border-blue-500/50 transition-all">
                        <div className="flex items-center justify-between text-indigo-300 font-bold text-[11px]">
                          <span>📊 [AGENT ALPHA - KỸ THUẬT]:</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            debateResult.technical_view.signal.includes("BULLISH")
                              ? "bg-emerald-500/20 text-emerald-400"
                              : debateResult.technical_view.signal.includes("BEARISH")
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {debateResult.technical_view.signal}
                          </span>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-snug">
                          • <span className="text-slate-400">Hỗ trợ:</span> <span className="text-emerald-400 font-bold">{debateResult.technical_view.support_zone}</span> | <span className="text-slate-400">Kháng cự:</span> <span className="text-rose-400 font-bold">{debateResult.technical_view.resistance_zone}</span>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-snug">
                          • <span className="text-slate-400">Nhận định:</span> {debateResult.technical_view.summary}
                        </div>
                      </div>

                      {/* SUB-AGENT 2: MACRO */}
                      <div className="bg-[#0b1220] border border-sky-900/40 rounded-xl p-2.5 space-y-1 hover:border-sky-500/50 transition-all">
                        <div className="flex items-center justify-between text-sky-300 font-bold text-[11px]">
                          <span>📰 [AGENT MACRO - VĨ MÔ]:</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            debateResult.macro_view.signal === "BULLISH"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : debateResult.macro_view.signal === "BEARISH"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-slate-800 text-slate-300"
                          }`}>
                            {debateResult.macro_view.signal}
                          </span>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-snug">
                          • <span className="text-slate-400">Funding Rate:</span> <span className="text-amber-300 font-bold">{debateResult.macro_view.fundingRate}</span> | <span className="text-slate-400">Vol:</span> <span className="text-white">{debateResult.macro_view.volumeUsd}</span>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-snug">
                          • <span className="text-slate-400">Dòng tiền:</span> {debateResult.macro_view.summary}
                        </div>
                      </div>

                      {/* SUB-AGENT 3: GUARDIAN */}
                      <div className="bg-[#0b1220] border border-amber-900/40 rounded-xl p-2.5 space-y-1 hover:border-amber-500/50 transition-all">
                        <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
                          <span>🛡️ [AGENT GUARDIAN - QUẢN TRỊ RỦI RO]:</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400">
                            {debateResult.risk_view.risk_score}/10 Rủi Ro
                          </span>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-snug">
                          • <span className="text-slate-400">Đòn bẩy Max:</span> <span className="text-purple-300 font-bold">{debateResult.risk_view.recommended_max_leverage}</span> | <span className="text-slate-400">R:R:</span> <span className="text-emerald-400 font-bold">{debateResult.risk_view.risk_reward_ratio}</span>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-snug">
                          • <span className="text-slate-400">SL:</span> <span className="text-rose-400 font-bold">{debateResult.risk_view.stop_loss}</span> | <span className="text-slate-400">TP:</span> <span className="text-emerald-400 font-bold">{debateResult.risk_view.take_profit_2}</span>
                        </div>
                      </div>

                      {/* SUB-AGENT 4: SENTINEL */}
                      <div className="bg-[#0b1220] border border-rose-900/40 rounded-xl p-2.5 space-y-1 hover:border-rose-500/50 transition-all">
                        <div className="flex items-center justify-between text-rose-300 font-bold text-[11px]">
                          <span>⚖️ [AGENT SENTINEL - PHẢN BIỆN]:</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-500/20 text-rose-400">
                            Cảnh Báo
                          </span>
                        </div>
                        <div className="text-amber-300 text-[11px] leading-snug">
                          • <span className="text-slate-400">Bẫy:</span> {debateResult.validator_view.trap_warning}
                        </div>
                        <div className="text-slate-300 text-[11px] leading-snug italic">
                          • <span className="text-slate-400">Chất vấn:</span> "{debateResult.validator_view.critical_question}"
                        </div>
                      </div>

                      {/* MASTER VERDICT */}
                      <div className="bg-gradient-to-r from-[#1c1236] to-[#121c38] border border-purple-500/50 rounded-xl p-3 space-y-2 shadow-lg">
                        <div className="flex items-center justify-between border-b border-purple-500/30 pb-1.5">
                          <span className="font-extrabold text-white text-[11px] uppercase">
                            👑 KẾT LUẬN CHỦ TỊCH HỘI ĐỒNG
                          </span>
                          <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            {debateResult.master_verdict.probability_pct}% KHẢ THI
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          <div>
                            <span className="text-slate-400">LỆNH:</span>{" "}
                            <span className="font-bold text-sky-300">{debateResult.master_verdict.action_label}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">ENTRY:</span>{" "}
                            <span className="font-bold text-white">{debateResult.master_verdict.entry_zone}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">SL:</span>{" "}
                            <span className="font-bold text-rose-400">{debateResult.master_verdict.stop_loss}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">TP:</span>{" "}
                            <span className="font-bold text-emerald-400">{debateResult.master_verdict.take_profit}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM ACTION BAR */}
                    <div className="bg-[#090f1d] px-3 py-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setActiveSubTab("chat")}
                        className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-bold transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chất vấn thêm</span>
                      </button>

                      <button
                        onClick={() => setActiveSubTab("council")}
                        className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                      >
                        <Layers className="w-3 h-3" />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
                    {errorMsg || "Chưa có dữ liệu phân tích. Hãy nhấn Quét Lại Live."}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SUB-TAB 2: PHÒNG HỌP CHI TIẾT HỘI ĐỒNG */}
      {activeSubTab === "council" && (
        <div className="space-y-6">
          {isLoading && !debateResult ? (
            <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
              <div className="text-white font-bold text-base">Hội Đồng AI đang họp bàn và tổng hợp dữ liệu...</div>
              <div className="text-xs text-slate-400 max-w-md">
                Đang quét nến 4H/1H từ Binance, kiểm tra khối lượng giao dịch, Funding Rate và chạy 4 Sub-Agent chuyên trách.
              </div>
            </div>
          ) : debateResult ? (
            <>
              {/* MASTER VERDICT HERO CARD */}
              <div className="bg-gradient-to-br from-[#0c1424] via-[#090f1d] to-[#0b1220] border-2 border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{debateResult.master_verdict.avatar}</span>
                    <div>
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        {debateResult.master_verdict.agent_name}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {debateResult.master_verdict.action_label}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-[#070a12]/80 px-4 py-2.5 rounded-xl border border-slate-800">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 uppercase font-bold">Xác Suất Khả Thi</div>
                      <div className="text-2xl font-black text-emerald-400">
                        {debateResult.master_verdict.probability_pct}%
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="bg-[#070a12] p-3 rounded-xl border border-slate-800/80">
                    <div className="text-[11px] text-slate-400">Giá Live Binance</div>
                    <div className="text-base font-bold text-white font-mono">
                      ${formatCoinPrice(currentLivePrice)}
                    </div>
                  </div>
                  <div className="bg-[#070a12] p-3 rounded-xl border border-slate-800/80">
                    <div className="text-[11px] text-slate-400">Vùng Entry Đề Xuất</div>
                    <div className="text-sm font-bold text-sky-400 font-mono">
                      {debateResult.master_verdict.entry_zone}
                    </div>
                  </div>
                  <div className="bg-[#070a12] p-3 rounded-xl border border-slate-800/80">
                    <div className="text-[11px] text-slate-400">Stop Loss Bắt Buộc</div>
                    <div className="text-sm font-bold text-rose-400 font-mono">
                      {debateResult.master_verdict.stop_loss}
                    </div>
                  </div>
                  <div className="bg-[#070a12] p-3 rounded-xl border border-slate-800/80">
                    <div className="text-[11px] text-slate-400">Take Profit Mục Tiêu</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      {debateResult.master_verdict.take_profit}
                    </div>
                  </div>
                </div>

                {/* Summary text */}
                <div
                  className="mt-4 text-sm text-slate-200 leading-relaxed bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-500/20"
                  dangerouslySetInnerHTML={{ __html: debateResult.master_verdict.summary_paragraph }}
                />

                {/* Key Reasons & Vital Warning */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                  <div className="bg-[#070a12] p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>3 Luận Điểm Cốt Lõi:</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-300">
                      {debateResult.master_verdict.key_reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#070a12] p-4 rounded-xl border border-amber-500/30 space-y-2">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Cảnh Báo Quan Trọng Nhất:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {debateResult.master_verdict.vital_warning}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 SUB-AGENTS PERSPECTIVES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Agent 1: Technical */}
                <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{debateResult.technical_view.avatar}</span>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {debateResult.technical_view.agent_name}
                        </div>
                        <div className="text-[11px] text-slate-400">Phân tích nến & Hỗ trợ/Kháng cự</div>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        debateResult.technical_view.signal.includes("BULLISH")
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : debateResult.technical_view.signal.includes("BEARISH")
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {debateResult.technical_view.signal}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {debateResult.technical_view.summary}
                  </p>

                  <div className="bg-[#070a12] p-3 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hỗ trợ 24h:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {debateResult.technical_view.support_zone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kháng cự 24h:</span>
                      <span className="font-bold text-rose-400 font-mono">
                        {debateResult.technical_view.resistance_zone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">RSI ước lượng:</span>
                      <span className="font-bold text-sky-400 font-mono">
                        {debateResult.technical_view.estimatedRsi}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agent 2: Macro & News */}
                <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{debateResult.macro_view.avatar}</span>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {debateResult.macro_view.agent_name}
                        </div>
                        <div className="text-[11px] text-slate-400">Vĩ mô & Dòng tiền On-chain</div>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        debateResult.macro_view.signal === "BULLISH"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : debateResult.macro_view.signal === "BEARISH"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {debateResult.macro_view.signal}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {debateResult.macro_view.summary}
                  </p>

                  <div className="bg-[#070a12] p-3 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Khối lượng 24h:</span>
                      <span className="font-bold text-white font-mono">
                        {debateResult.macro_view.volumeUsd}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Funding Rate Phái Sinh:</span>
                      <span className="font-bold text-sky-400 font-mono">
                        {debateResult.macro_view.fundingRate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agent 3: Risk Manager */}
                <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{debateResult.risk_view.avatar}</span>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {debateResult.risk_view.agent_name}
                        </div>
                        <div className="text-[11px] text-slate-400">Bảo vệ vốn & R:R kỷ luật</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Rủi ro: {debateResult.risk_view.risk_score}/10
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {debateResult.risk_view.advice}
                  </p>

                  <div className="bg-[#070a12] p-3 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Đòn bẩy tối đa an toàn:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {debateResult.risk_view.recommended_max_leverage}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tỷ lệ Risk/Reward:</span>
                      <span className="font-bold text-sky-400 font-mono">
                        {debateResult.risk_view.risk_reward_ratio}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agent 4: Validator & Trap Detector */}
                <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{debateResult.validator_view.avatar}</span>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {debateResult.validator_view.agent_name}
                        </div>
                        <div className="text-[11px] text-slate-400">Phản biện & Cảnh báo bẫy</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Tìm Lỗ Hổng
                    </span>
                  </div>

                  <p className="text-xs text-amber-300/90 leading-relaxed">
                    {debateResult.validator_view.trap_warning}
                  </p>

                  <div className="bg-[#070a12] p-3 rounded-xl text-xs space-y-1">
                    <div className="text-slate-400 font-bold">Câu hỏi phản biện độc lập:</div>
                    <div className="text-slate-300 italic">
                      "{debateResult.validator_view.critical_question}"
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              {errorMsg || "Chưa có dữ liệu phân tích. Hãy nhấn Quét Lại Live."}
            </div>
          )}
        </div>
      )}

      {/* 4. SUB-TAB 3: THẨM ĐỊNH DỰ ĐOÁN CỦA TÔI */}
      {activeSubTab === "hypo_eval" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Form Column */}
          <div className="lg:col-span-5 bg-[#0b101b] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Scale className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-base">Nhập Dự Đoán Của Bạn</h3>
            </div>

            <form onSubmit={handleEvaluatePrediction} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Đồng coin & Giá Live
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#070a12] border border-slate-800 font-mono text-sm">
                  <span className="font-bold text-white">{selectedCoin}/USDT</span>
                  <span className="text-sky-400 font-bold">${formatCoinPrice(currentLivePrice)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Bạn dự đoán theo chiều hướng nào?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserAction("LONG")}
                    className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      userAction === "LONG"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500"
                        : "bg-[#070a12] text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>LONG (MUA TĂNG)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserAction("SHORT")}
                    className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      userAction === "SHORT"
                        ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-500"
                        : "bg-[#070a12] text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>SHORT (BÁN GIẢM)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Luận điểm / Lý do dự đoán của bạn:
                </label>
                <textarea
                  rows={4}
                  value={hypothesisText}
                  onChange={(e) => setHypothesisText(e.target.value)}
                  placeholder="Ví dụ: Tôi thấy khung 1H tạo đáy 2 phân kỳ RSI, nến rút chân tại hỗ trợ nên muốn vào lệnh Long..."
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isEvaluating || !hypothesisText.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Hội đồng AI đang tính toán xác suất %...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Thẩm Định Xác Suất % Cho Lệnh Này</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Column */}
          <div className="lg:col-span-7 space-y-4">
            {evalResult ? (
              <div className="bg-[#0b101b] border-2 border-purple-500/40 rounded-2xl p-6 space-y-4 shadow-xl animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                      Kết Quả Thẩm Định Từ Hội Đồng AI
                    </span>
                    <h3 className="text-lg font-black text-white">
                      Đánh Giá: {evalResult.verdict}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Xác Suất Khả Thi</div>
                    <div className="text-3xl font-black text-emerald-400">
                      {evalResult.probability_pct}%
                    </div>
                  </div>
                </div>

                <div
                  className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-purple-950/20 p-3.5 rounded-xl border border-purple-500/20"
                  dangerouslySetInnerHTML={{ __html: evalResult.advice }}
                />

                {/* Suggested Safe Setup */}
                <div className="bg-[#070a12] p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    <span>Setup An Toàn Được Đề Xuất:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="bg-[#0a0f1d] p-2 rounded-lg">
                      <div className="text-slate-400 text-[10px]">Entry:</div>
                      <div className="text-white font-bold">{evalResult.suggested_setup.entry}</div>
                    </div>
                    <div className="bg-[#0a0f1d] p-2 rounded-lg">
                      <div className="text-slate-400 text-[10px]">Stop Loss:</div>
                      <div className="text-rose-400 font-bold">{evalResult.suggested_setup.stop_loss}</div>
                    </div>
                    <div className="bg-[#0a0f1d] p-2 rounded-lg">
                      <div className="text-slate-400 text-[10px]">Take Profit:</div>
                      <div className="text-emerald-400 font-bold">{evalResult.suggested_setup.take_profit}</div>
                    </div>
                    <div className="bg-[#0a0f1d] p-2 rounded-lg">
                      <div className="text-slate-400 text-[10px]">Đòn Bẩy:</div>
                      <div className="text-purple-400 font-bold">{evalResult.suggested_setup.leverage}</div>
                    </div>
                  </div>
                </div>

                {/* Pros and Cons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-emerald-950/10 border border-emerald-500/20 p-3 rounded-xl space-y-1">
                    <div className="font-bold text-emerald-400">Điểm Ủng Hộ (Pros):</div>
                    {evalResult.pros.map((p, i) => (
                      <div key={i} className="text-slate-300 text-[11px]">• {p}</div>
                    ))}
                  </div>

                  <div className="bg-rose-950/10 border border-rose-500/20 p-3 rounded-xl space-y-1">
                    <div className="font-bold text-rose-400">Rủi Ro & Cảnh Báo (Cons):</div>
                    {evalResult.cons.map((c, i) => (
                      <div key={i} className="text-slate-300 text-[11px]">• {c}</div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                <Sparkles className="w-8 h-8 text-purple-400 opacity-60" />
                <div className="font-bold text-white text-sm">Chưa có dự đoán nào được thẩm định</div>
                <div className="text-xs max-w-sm">
                  Hãy nhập phân tích hoặc ý định vào lệnh ở cột bên trái để Hội đồng AI chạy ma trận đo xác suất thành công cho bạn.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 4: CHAT & CHẤT VẤN HỘI ĐỒNG */}
      {activeSubTab === "chat" && (
        <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="font-bold text-white text-base">Phòng Chat Trực Tiếp Với Hội Đồng AI</h3>
                <div className="text-xs text-slate-400">Hỏi đáp, chất vấn hoặc xin ý kiến phân tích chuyên sâu</div>
              </div>
            </div>

            {/* Quick Prompt Badges */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => setChatPrompt("Tại sao lại không nên Mua đuổi lúc này?")}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
              >
                Tại sao không mua đuổi?
              </button>
              <button
                onClick={() => setChatPrompt("Vùng giá nào an toàn nhất để vào lệnh?")}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
              >
                Vùng giá an toàn?
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "council" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-blue-600/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/25"
                      : "bg-[#070a12] border border-slate-800 text-slate-200 rounded-tl-none shadow-sm"
                  }`}
                >
                  <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between gap-4 font-mono">
                    <span>{msg.sender === "user" ? "Bạn" : "Hội Đồng Multi-Agent AI"}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div>{msg.text}</div>
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <UserCheck className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isSendingChat && (
              <div className="flex items-center gap-2 text-xs text-sky-400 animate-pulse bg-sky-950/20 p-3 rounded-xl border border-sky-500/20 max-w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Hội đồng AI đang họp bàn câu trả lời...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChat} className="flex items-center gap-2 border-t border-slate-800/80 pt-3">
            <input
              type="text"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              placeholder="Đặt câu hỏi hoặc chất vấn Hội đồng AI (ví dụ: Tại sao RSI quá bán nhưng chưa tăng?)..."
              className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={isSendingChat || !chatPrompt.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Gửi Câu Hỏi</span>
            </button>
          </form>
        </div>
      )}

      {/* Telegram Settings Modal */}
      <TelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        onShowToast={onShowToast || ((msg) => console.log(msg))}
      />
    </div>
  );
};
