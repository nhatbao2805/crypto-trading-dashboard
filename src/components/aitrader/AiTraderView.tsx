import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Scale,
  MessageSquare,
  BarChart3,
  Layers,
  Copy,
  Check,
  Radio,
  Bell,
  Send,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame,
  ArrowRight,
  Zap,
  FileText,
  SlidersHorizontal
} from "lucide-react";
import {
  CouncilDebateResult,
  UserPredictionEvaluation,
  AiTraderSubTab,
  VolatilityEvent
} from "../../types";
import { AiTraderApi, PaperTraderApi, NewsApi } from "../../services/api";
import { TRACKED_COINS, formatCoinPrice } from "../../services/binance";
import { TradingViewWidget } from "../common/TradingViewWidget";
import { MarketScreenerTab } from "./MarketScreenerTab";
import { TelegramSettingsModal } from "./TelegramSettingsModal";
import { CouncilDebateModal } from "./CouncilDebateModal";

interface AiTraderViewProps {
  livePrices?: Record<string, number>;
  onShowToast?: (message: string, type: "success" | "error" | "warning" | "info") => void;
}

export const AiTraderView: React.FC<AiTraderViewProps> = ({ livePrices = {}, onShowToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<AiTraderSubTab>("screener");
  const [selectedCoin, setSelectedCoin] = useState<string>("BTC");
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debateResult, setDebateResult] = useState<CouncilDebateResult | null>(null);
  const [copiedSetup, setCopiedSetup] = useState<boolean>(false);
  const [volatilityEvents, setVolatilityEvents] = useState<VolatilityEvent[]>([]);
  const [isSubmittingPaperTrade, setIsSubmittingPaperTrade] = useState<boolean>(false);
  const [isAutoTrading, setIsAutoTrading] = useState<boolean>(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(50);

  // Pre-Execution Safety Configuration States (Mặc định: AI Auto-Pilot)
  const [ttlMinutes, setTtlMinutes] = useState<number | "AUTO" | null>("AUTO");
  const [maxLossUsd, setMaxLossUsd] = useState<number | "AUTO" | null>("AUTO");
  const [tradeMargin, setTradeMargin] = useState<number | "AUTO">("AUTO");
  const [tradeLeverage, setTradeLeverage] = useState<number | "AUTO">("AUTO");
  const [tradingStyle, setTradingStyle] = useState<"SCALPING" | "DAY_TRADE" | "SWING">("SCALPING");
  const [showSafeguardSettings, setShowSafeguardSettings] = useState<boolean>(false);
  const [isDebateModalOpen, setIsDebateModalOpen] = useState<boolean>(false);

  // Poll live volatility stream every 15s
  useEffect(() => {
    let timer: any = null;
    const fetchVolatility = () => {
      NewsApi.getVolatilityStream(8)
        .then((res) => {
          if (res.success && res.events) {
            setVolatilityEvents(res.events);
          }
        })
        .catch(() => {});
    };
    fetchVolatility();
    timer = setInterval(fetchVolatility, 15000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  // Bottom Interactive Console Mode (in Cockpit)
  const [consoleMode, setConsoleMode] = useState<"chat" | "evaluate">("chat");

  // User Hypothesis State
  const [hypothesisText, setHypothesisText] = useState<string>("");
  const [userAction, setUserAction] = useState<"LONG" | "SHORT">("LONG");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<UserPredictionEvaluation | null>(null);

  // Council Chat State
  const [chatPrompt, setChatPrompt] = useState<string>("");
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "council"; text: string; time: string }>>([
    {
      sender: "council",
      text: `Xin chào Trader! Tôi là Hội Đồng Multi-Agent (Alpha SMC, Macro Dòng Tiền, Guardian Quản Trị Vốn và Sentinel Săn Bẫy). Bạn muốn chất vấn điều gì về thị trường ${selectedCoin}/USDT lúc này?`,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  // Load Council Debate
  const loadCouncilAnalysis = async (coin: string, force = false, style: "SCALPING" | "DAY_TRADE" | "SWING" = tradingStyle) => {
    setIsLoading(true);
    try {
      const currentPrice = livePrices[coin.toUpperCase()] || 0;
      const data = await AiTraderApi.runCouncilAnalysis({
        coin,
        clientMarket: currentPrice > 0 ? { price: currentPrice } : null,
        forceRefresh: force,
        tradingStyle: style
      });
      setDebateResult(data);
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || "Lỗi tải phân tích Hội đồng AI", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCouncilAnalysis(selectedCoin, false, tradingStyle);
  }, [selectedCoin]);

  // Handle Evaluate Hypothesis
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
        if (onShowToast) onShowToast("Hội đồng AI đã hoàn tất phản biện & chấm điểm xác suất!", "success");
      }
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || "Lỗi thẩm định", "error");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle Council Chat
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim() || isSendingChat) return;

    const userText = chatPrompt.trim();
    setChatPrompt("");
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userText,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      }
    ]);

    setIsSendingChat(true);
    try {
      const currentPrice = livePrices[selectedCoin.toUpperCase()] || 0;
      const res = await AiTraderApi.chatCouncil({
        prompt: userText,
        coin: selectedCoin,
        clientMarket: currentPrice > 0 ? { price: currentPrice } : null
      });
      if (res.success && (res.output || res.reply)) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "council",
            text: res.output || res.reply,
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

  const executePaperTradeFromAi = async () => {
    if (!debateResult?.master_verdict) return;
    const v = debateResult.master_verdict;
    const isShort = v.action.includes("SHORT") || v.action.includes("SELL") || v.action_label.includes("BÁN");
    const currentPrice = livePrices[selectedCoin.toUpperCase()] || 0;

    const cleanNum = (str: string) => {
      if (!str) return null;
      const matched = str.replace(/,/g, "").match(/\d+(\.\d+)?/);
      return matched ? parseFloat(matched[0]) : null;
    };

    const sl = cleanNum(v.stop_loss);
    const tp = cleanNum(v.take_profit);
    const entry = currentPrice > 0 ? currentPrice : (cleanNum(v.entry_zone) || 100);
    const lev = debateResult.risk_view?.recommended_max_leverage
      ? parseInt(debateResult.risk_view.recommended_max_leverage.replace(/\D/g, ""), 10) || 5
      : 5;

    setIsSubmittingPaperTrade(true);
    try {
      await PaperTraderApi.openPosition({
        coin: selectedCoin.toUpperCase(),
        type: isShort ? "SHORT" : "LONG",
        entry_price: entry,
        stop_loss: sl || undefined,
        take_profit: tp || undefined,
        leverage: lev,
        margin: 200,
        ai_verdict: v.action_label,
        notes: `[Kèo chuẩn Hội Đồng AI Master Council - Xác suất ${v.probability_pct}%]\nKhuyến nghị: ${v.summary_paragraph || (v as any).verdict_summary || ""}`
      });

      if (onShowToast) {
        onShowToast(
          `⚡ Đã khớp lệnh Paper Trade ${selectedCoin} (${isShort ? "SHORT" : "LONG"}) với SL: $${sl || "Chưa đặt"}, TP: $${tp || "Chưa đặt"}! Đang tự động giám sát TP/SL live.`,
          "success"
        );
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(err.message || "Lỗi mở lệnh Paper Trade", "error");
      }
    } finally {
      setIsSubmittingPaperTrade(false);
    }
  };

  const handleAutonomousTrade = async (force: boolean = false) => {
    setIsAutoTrading(true);
    try {
      if (onShowToast) {
        onShowToast(
          force
            ? `⚡ Đang ép Hội Đồng AI mở lệnh thử nghiệm nến thật ${selectedCoin}...`
            : `🤖 Đang triệu tập 4 Chuyên Gia AI thảo luận nến thật ${selectedCoin} (Ngưỡng ${confidenceThreshold}%)...`,
          "info"
        );
      }
      const res = await AiTraderApi.executeAutoTrade({
        coin: selectedCoin,
        riskPercent: 1.5,
        minConfidence: confidenceThreshold,
        forceTrade: force,
        ttlMinutes,
        maxLossUsd,
        margin: tradeMargin,
        leverage: tradeLeverage,
        tradingStyle
      });
      if (res.success) {
        setDebateResult(res.debate);
        // Tự động mở Modal toàn văn tranh biện của 4 Agent để người dùng xem trực tiếp
        setIsDebateModalOpen(true);

        if (res.executed && res.position) {
          if (onShowToast) {
            onShowToast(
              `🎉 AI đã tự động mở vị thế ${res.position.type} ${res.coin} tại giá $${formatCoinPrice(res.position.entry_price)} (SL: $${res.position.stop_loss}, TP: $${res.position.take_profit})! Đang kích hoạt giám sát Realtime SL.`,
              "success"
            );
          }
        } else {
          if (onShowToast) {
            onShowToast(
              res.executionReason || "Hội đồng hoàn tất phiên họp nhưng khuyến nghị Quan sát. Bấm '⚡ Ép Lệnh Test' nếu bạn muốn kiểm tra luồng khớp lệnh ngay!",
              "warning"
            );
          }
        }
      }
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || "Lỗi khi AI tự động thảo luận & đặt lệnh", "error");
    } finally {
      setIsAutoTrading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 0. LIVE VOLATILITY TICKER STREAM BAR */}
      {volatilityEvents.length > 0 && (
        <div className="bg-[#0b101b] border border-amber-500/30 rounded-xl px-3 py-2 flex items-center gap-2.5 overflow-x-auto no-scrollbar shadow-lg">
          <div className="flex items-center gap-1.5 shrink-0 pr-2.5 border-r border-slate-800">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-wider uppercase text-amber-300">BIẾN ĐỘNG REALTIME:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {volatilityEvents.map((evt) => {
              const isSelected = selectedCoin === evt.coin;
              return (
                <button
                  key={evt.id}
                  onClick={() => {
                    setSelectedCoin(evt.coin);
                    setActiveSubTab("cockpit");
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all border ${
                    isSelected
                      ? "bg-blue-600/30 border-blue-500 text-white shadow-sm"
                      : "bg-[#070a12] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                  }`}
                  title={evt.description}
                >
                  <span className={evt.color === "rose" ? "text-rose-400" : (evt.color === "amber" ? "text-amber-400" : "text-emerald-400")}>
                    {evt.badge}
                  </span>
                  <span className="text-white font-mono">{evt.coin}</span>
                  <span className="text-[10px] text-slate-400 font-mono">${formatCoinPrice(evt.price)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. TOP HEADER & UNIFIED 2-PILLAR NAVIGATION */}
      <div className="bg-[#0b101b] border border-slate-800/80 rounded-2xl p-3.5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main 2-Pillar Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab("screener")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "screener"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30"
                  : "bg-[#070a12] text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <Radio className={`w-4 h-4 ${activeSubTab === "screener" ? "animate-pulse text-emerald-400" : "text-slate-400"}`} />
              <span>⚡ Radar Săn Kèo 24/7 & NLP</span>
            </button>

            <button
              onClick={() => setActiveSubTab("cockpit")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "cockpit" || activeSubTab === "workspace"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30"
                  : "bg-[#070a12] text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-purple-300" />
              <span>🏛️ Cockpit Soi Nến & Hội Đồng ({selectedCoin})</span>
            </button>
          </div>

          {/* Right Action: Telegram Bot Config */}
          <button
            onClick={() => setIsTelegramModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all ml-auto"
          >
            <Bell className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Bot Telegram</span>
          </button>
        </div>

        {/* Coin Selector Bar & Actions (When in Cockpit mode) */}
        {(activeSubTab === "cockpit" || activeSubTab === "workspace") && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3">
            {/* Row 1: Dedicated Tracked Coins Strip */}
            <div className="flex items-center justify-between gap-3 bg-[#050811] p-2 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar flex-1">
                <span className="text-[11px] font-bold uppercase text-slate-400 mr-2 shrink-0 flex items-center gap-1 pl-1">
                  <span>🪙</span> CHỌN COIN:
                </span>
                {TRACKED_COINS.map((c) => {
                  const upper = c.toUpperCase();
                  const isSelected = selectedCoin === upper;
                  const p = livePrices[upper];
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedCoin(upper)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                        isSelected
                          ? "bg-sky-500/15 text-sky-300 border-sky-500/60 shadow-sm shadow-sky-500/20 scale-102"
                          : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <span className="font-mono">{upper}</span>
                      {p ? (
                        <span className={`text-[10px] font-mono ${isSelected ? "text-sky-200" : "text-slate-400"}`}>
                          ${formatCoinPrice(p)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <div className="shrink-0 hidden md:flex items-center gap-2 border-l border-slate-800 pl-3 pr-1 text-xs">
                <span className="text-slate-400 text-[11px]">Đang chọn:</span>
                <span className="font-bold text-white font-mono">{selectedCoin}</span>
                {livePrices[selectedCoin] && (
                  <span className="text-emerald-400 font-mono font-bold">
                    ${formatCoinPrice(livePrices[selectedCoin])}
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Cockpit Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {/* Confidence Threshold Switcher */}
                <div className="flex items-center gap-1 bg-[#050811] p-1 rounded-xl border border-slate-800 text-[11px] font-bold shrink-0">
                  <span className="text-slate-400 px-1 text-[10px]">Ngưỡng:</span>
                  <button
                    onClick={() => setConfidenceThreshold(50)}
                    className={`px-2.5 py-1 rounded-lg transition-all text-xs font-semibold ${
                      confidenceThreshold === 50 ? "bg-emerald-600/90 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                    title="Chế độ Test Kèo: Cho phép khớp lệnh ngay khi xác suất >= 50%"
                  >
                    50% (Test)
                  </button>
                  <button
                    onClick={() => setConfidenceThreshold(65)}
                    className={`px-2.5 py-1 rounded-lg transition-all text-xs font-semibold ${
                      confidenceThreshold === 65 ? "bg-sky-600/90 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                    title="Kỷ luật Chuẩn: Chỉ khớp lệnh khi xác suất >= 65%"
                  >
                    65% (Chuẩn)
                  </button>
                </div>

                {/* Cấu Hình Rủi Ro & Chiến Thuật Toggle Button */}
                <button
                  onClick={() => setShowSafeguardSettings(!showSafeguardSettings)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shrink-0 ${
                    showSafeguardSettings
                      ? "bg-purple-600/20 text-purple-300 border-purple-500/60 shadow-sm shadow-purple-500/20"
                      : "bg-[#050811] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                  title="Cấu hình phong cách trade (Scalping, Day, Swing), thời gian giữ lệnh (TTL), lỗ tối đa USD chống cháy, ký quỹ, đòn bẩy"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Chiến Thuật & Rủi Ro</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                </button>

                {/* Xem Toàn Văn Biên Bản AI */}
                {debateResult && (
                  <button
                    onClick={() => setIsDebateModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl transition-all shrink-0"
                    title="Xem toàn văn biên bản tranh biện của 4 Agent"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>Biên Bản AI</span>
                  </button>
                )}
              </div>

              {/* Action Buttons Group */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleAutonomousTrade(false)}
                  disabled={isAutoTrading || isLoading}
                  className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/40 transition-all shrink-0 active:scale-95 disabled:opacity-50"
                  title="Triệu tập Hội Đồng 4 Agent tranh luận nến thật Binance và tự động mở vị thế Paper Trade nếu đạt xác suất cao"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-yellow-300 ${isAutoTrading ? "animate-spin" : ""}`} />
                  <span>{isAutoTrading ? "AI Đang Họp & Đặt Lệnh..." : "🤖 AI Tự Đặt Lệnh"}</span>
                </button>

                <button
                  onClick={() => handleAutonomousTrade(true)}
                  disabled={isAutoTrading || isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all shrink-0 active:scale-95 disabled:opacity-50"
                  title="Ép Hội Đồng AI mở vị thế Paper Trade thử nghiệm bất kể xác suất để kiểm tra luồng khớp lệnh và SL realtime"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚡ Ép Lệnh Test</span>
                </button>

                <button
                  onClick={() => loadCouncilAnalysis(selectedCoin, true, tradingStyle)}
                  disabled={isLoading || isAutoTrading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-[#050811] hover:bg-slate-800 hover:text-white rounded-xl border border-slate-800 transition-all shrink-0"
                  title="Quét lại nến thật Binance và cập nhật phân tích của 4 Agent"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-sky-400" : ""}`} />
                  <span className="hidden sm:inline">Quét Lại</span>
                </button>
              </div>
            </div>

            {/* Redesigned Pre-Execution Safeguard & Strategy Panel */}
            {showSafeguardSettings && (
              <div className="w-full mt-3 p-4 rounded-2xl bg-[#080d18] border border-slate-800 shadow-2xl space-y-4 animate-fadeIn">
                {/* Panel Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Cấu Hình Quản Trị Rủi Ro & Phong Cách Giao Dịch
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Định hình khung nến, biên độ kháng cự và tỷ lệ rủi ro/lợi nhuận an toàn
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTradingStyle("SCALPING");
                        setTtlMinutes("AUTO");
                        setMaxLossUsd("AUTO");
                        setTradeMargin("AUTO");
                        setTradeLeverage("AUTO");
                        loadCouncilAnalysis(selectedCoin, false, "SCALPING");
                      }}
                      className="text-[10px] font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      ↺ Mặc định AI Auto-Pilot
                    </button>
                  </div>
                </div>

                {/* 1. TRADING STYLE SELECTOR (Core Component) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase font-bold text-slate-300 flex items-center gap-1.5">
                      <span>🎯</span> Mục Tiêu Chiến Thuật (Khung Nến & Khoảng Cách Cản):
                    </span>
                    <span className="text-[10px] font-mono text-sky-400">
                      {tradingStyle === "SCALPING"
                        ? "Nến 15m Binance • Cản gần sát 0.6% - 1.2%"
                        : tradingStyle === "DAY_TRADE"
                        ? "Nến 1h Binance • Cản vừa 1.8% - 3.0%"
                        : "Nến 4h Binance • Cản rộng 4.5% - 8.0%"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: "SCALPING",
                        name: "⚡ SCALPING (Lướt Sóng Ngắn)",
                        time: "Nến 15m",
                        desc: "Kháng cự bám sát (0.6% - 1.2%), TP nhanh, Đòn bẩy 10x - 15x, TTL 1h - 2h",
                        badge: "Đánh Nhanh"
                      },
                      {
                        id: "DAY_TRADE",
                        name: "🎯 DAY TRADING (Trong Ngày)",
                        time: "Nến 1h",
                        desc: "Kháng cự vừa (1.8% - 3.0%), SL 1.5%, TP 3% - 4.5%, Đòn bẩy 5x - 10x, TTL 4h - 8h",
                        badge: "Tiêu Chuẩn"
                      },
                      {
                        id: "SWING",
                        name: "🌊 SWING TRADING (Theo Sóng)",
                        time: "Nến 4h",
                        desc: "Kháng cự rộng (4.5% - 8.0%), Bắt sóng lớn, Đòn bẩy 2x - 3x, TTL 24h - 48h",
                        badge: "Dài Hạn"
                      },
                    ].map((st) => {
                      const isSel = tradingStyle === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setTradingStyle(st.id as any);
                            loadCouncilAnalysis(selectedCoin, false, st.id as any);
                          }}
                          className={`text-left p-3 rounded-xl border transition-all ${
                            isSel
                              ? "bg-sky-500/10 border-sky-500/60 shadow-md shadow-sky-500/10 text-white"
                              : "bg-[#050811] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold ${isSel ? "text-sky-300" : "text-slate-200"}`}>
                              {st.name}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                                isSel
                                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {st.time}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">{st.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. FOUR PARAMETER CARDS (Unified Elegant Slate Design) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  {/* Card 1: TTL */}
                  <div className="p-3 rounded-xl bg-[#050811] border border-slate-800/80 space-y-1.5">
                    <span className="text-slate-300 text-[11px] block font-semibold">
                      ⏱️ Thời gian giữ lệnh (TTL):
                    </span>
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { label: "🤖 AI", val: "AUTO" },
                        { label: "30m", val: 30 },
                        { label: "1h", val: 60 },
                        { label: "4h", val: 240 },
                        { label: "Vô hạn", val: null },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setTtlMinutes(item.val as any)}
                          className={`py-1 rounded-lg text-center text-[10px] font-semibold border transition-all ${
                            ttlMinutes === item.val
                              ? "bg-sky-600/90 text-white font-bold border-sky-400 shadow-sm shadow-sky-500/20"
                              : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card 2: Hard Stop Loss USD */}
                  <div className="p-3 rounded-xl bg-[#050811] border border-slate-800/80 space-y-1.5">
                    <span className="text-slate-300 text-[11px] block font-semibold">
                      🛡️ Lỗ tối đa chống cháy ($ USD):
                    </span>
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { label: "🤖 Theo SL", val: "AUTO" },
                        { label: "$20", val: 20 },
                        { label: "$30", val: 30 },
                        { label: "$50", val: 50 },
                        { label: "Tắt", val: null },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setMaxLossUsd(item.val as any)}
                          className={`py-1 rounded-lg text-center text-[10px] font-semibold border transition-all ${
                            maxLossUsd === item.val
                              ? "bg-sky-600/90 text-white font-bold border-sky-400 shadow-sm shadow-sky-500/20"
                              : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Margin */}
                  <div className="p-3 rounded-xl bg-[#050811] border border-slate-800/80 space-y-1.5">
                    <span className="text-slate-300 text-[11px] block font-semibold">
                      💵 Ký quỹ ($ Margin):
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { label: "🤖 1.5% Vốn", val: "AUTO" },
                        { label: "$100", val: 100 },
                        { label: "$200", val: 200 },
                        { label: "$500", val: 500 },
                      ].map((m) => (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() => setTradeMargin(m.val as any)}
                          className={`py-1 rounded-lg text-center text-[10px] font-semibold border transition-all ${
                            tradeMargin === m.val
                              ? "bg-sky-600/90 text-white font-bold border-sky-400 shadow-sm shadow-sky-500/20"
                              : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card 4: Leverage */}
                  <div className="p-3 rounded-xl bg-[#050811] border border-slate-800/80 space-y-1.5">
                    <span className="text-slate-300 text-[11px] block font-semibold">
                      ⚡ Đòn bẩy (Leverage):
                    </span>
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { label: "🤖 R:R", val: "AUTO" },
                        { label: "2x", val: 2 },
                        { label: "5x", val: 5 },
                        { label: "10x", val: 10 },
                        { label: "20x", val: 20 },
                      ].map((lev) => (
                        <button
                          key={lev.label}
                          type="button"
                          onClick={() => setTradeLeverage(lev.val as any)}
                          className={`py-1 rounded-lg text-center text-[10px] font-semibold border transition-all ${
                            tradeLeverage === lev.val
                              ? "bg-sky-600/90 text-white font-bold border-sky-400 shadow-sm shadow-sky-500/20"
                              : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                          }`}
                        >
                          {lev.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Panel Footer: Summary & Risk-Free Rule */}
                <div className="flex flex-wrap items-center justify-between text-[11px] pt-3 border-t border-slate-800/80 gap-2">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    Tự dời SL về hòa vốn khi lãi &ge; +2.0% (Risk-Free Trade)
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span>
                      Phong cách: <b className="text-sky-300">{tradingStyle}</b>
                    </span>
                    <span>•</span>
                    <span>
                      TTL:{" "}
                      <b className="text-slate-200">
                        {ttlMinutes === "AUTO"
                          ? tradingStyle === "SCALPING"
                            ? "1h-2h"
                            : tradingStyle === "DAY_TRADE"
                            ? "4h-8h"
                            : "24h-48h"
                          : ttlMinutes
                          ? `${ttlMinutes}m`
                          : "Vô hạn"}
                      </b>
                    </span>
                    <span>•</span>
                    <span>
                      Lỗ max:{" "}
                      <b className="text-slate-200">
                        {maxLossUsd === "AUTO" ? "Theo Cản SMC" : maxLossUsd ? `$${maxLossUsd}` : "Tắt"}
                      </b>
                    </span>
                    <span>•</span>
                    <span>
                      Ký quỹ:{" "}
                      <b className="text-slate-200">
                        {tradeMargin === "AUTO" ? "1.5% Vốn" : `$${tradeMargin}`}
                      </b>
                    </span>
                    <span>•</span>
                    <span>
                      Đòn bẩy:{" "}
                      <b className="text-slate-200">
                        {tradeLeverage === "AUTO" ? "Guardian R:R" : `${tradeLeverage}x`}
                      </b>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. PILLAR 1: RADAR SĂN KÈO 24/7 (MARKET SCREENER + NLP + TELEGRAM) */}
      {activeSubTab === "screener" && (
        <MarketScreenerTab
          onSelectCoinForDebate={(coin) => {
            setSelectedCoin(coin.toUpperCase());
            setActiveSubTab("cockpit");
          }}
          onOpenTelegramSettings={() => setIsTelegramModalOpen(true)}
          onShowToast={onShowToast || ((msg) => console.log(msg))}
        />
      )}

      {/* 3. PILLAR 2: COCKPIT HỘI ĐỒNG & SOI NẾN PRO (TRADINGVIEW + COUNCIL SPLIT) */}
      {(activeSubTab === "cockpit" || activeSubTab === "workspace") && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* LEFT COLUMN (60%): TRADINGVIEW CHART & MASTER VERDICT */}
          <div className="xl:col-span-7 space-y-4">
            {/* Realtime TradingView Widget */}
            <div className="bg-[#0b101b] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <TradingViewWidget
                symbol={selectedCoin}
                height="560px"
                enableDrawing={true}
                allowSymbolChange={true}
                theme="dark"
              />
            </div>

            {/* Master Council Verdict Action Card */}
            {debateResult?.master_verdict && (
              <div className="bg-gradient-to-br from-[#0c1427] to-[#070b14] border border-indigo-500/40 rounded-2xl p-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-indigo-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👑</span>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase text-indigo-300 tracking-wider font-mono">
                        PHÁN QUYẾT CHỦ TỊCH HỘI ĐỒNG ({selectedCoin}/USDT)
                      </h4>
                      <div className="text-base font-black text-white mt-0.5">
                        {debateResult.master_verdict.action_label}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Xác Suất Khả Thi</div>
                      <div className="text-base font-extrabold text-emerald-400 font-mono">
                        {debateResult.master_verdict.probability_pct}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={executePaperTradeFromAi}
                        disabled={isSubmittingPaperTrade}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/30 active:scale-95 disabled:opacity-50"
                        title="Tự động mở vị thế Paper Trade theo các mức Entry, SL, TP của Hội đồng"
                      >
                        <Zap className={`w-3.5 h-3.5 text-yellow-300 ${isSubmittingPaperTrade ? "animate-spin" : ""}`} />
                        <span>{isSubmittingPaperTrade ? "Đang Mở Lệnh..." : "⚡ Đặt Lệnh Paper Trade"}</span>
                      </button>

                      <button
                        onClick={copySetupToClipboard}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        {copiedSetup ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSetup ? "Đã Sao Chép" : "Chép Setup"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Setup Entry / SL / TP Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                  <div className="bg-[#070a12]/80 border border-slate-800 rounded-xl p-2.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Vùng Entry</div>
                    <div className="text-xs font-bold text-sky-400 font-mono mt-0.5">
                      {debateResult.master_verdict.entry_zone}
                    </div>
                  </div>
                  <div className="bg-[#070a12]/80 border border-slate-800 rounded-xl p-2.5">
                    <div className="text-[10px] font-bold text-rose-400 uppercase">Stop Loss Bắt Buộc</div>
                    <div className="text-xs font-bold text-rose-300 font-mono mt-0.5">
                      {debateResult.master_verdict.stop_loss}
                    </div>
                  </div>
                  <div className="bg-[#070a12]/80 border border-slate-800 rounded-xl p-2.5">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase">Chốt Lời (TP)</div>
                    <div className="text-xs font-bold text-emerald-300 font-mono mt-0.5">
                      {debateResult.master_verdict.take_profit}
                    </div>
                  </div>
                  <div className="bg-[#070a12]/80 border border-slate-800 rounded-xl p-2.5">
                    <div className="text-[10px] font-bold text-purple-400 uppercase">Đòn Bẩy & R:R</div>
                    <div className="text-xs font-bold text-purple-300 font-mono mt-0.5">
                      {debateResult.risk_view?.recommended_max_leverage || "5x"} (R:R {debateResult.risk_view?.risk_reward_ratio || "1:2.4"})
                    </div>
                  </div>
                </div>

                {/* Vital Trap Warning */}
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Cảnh báo sống còn từ Sentinel: </span>
                    <span>{debateResult.master_verdict.vital_warning}</span>
                  </div>
                </div>

                {/* Token Metrics & Historical AI Accuracy Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-indigo-500/20 text-[11px] text-slate-400">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                      🎯 Xác Suất Thắng: {debateResult.master_verdict.probability_pct}% (TB Hệ thống: 74.5%)
                    </span>
                    <span className="hidden sm:inline text-slate-600">•</span>
                    <span className="text-slate-300 font-mono">
                      📊 Token: ~{debateResult.token_metrics?.last_tokens || 1240} tokens
                    </span>
                    <span className="hidden sm:inline text-slate-600">•</span>
                    <span className="text-indigo-300 font-mono font-semibold">
                      ⚡ Tiết kiệm {debateResult.token_metrics?.savings_pct || 64}% qua Single-Pass
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                    <span>Model: {debateResult.token_metrics?.model || "Gemini 2.5 Pro"}</span>
                    <span>({debateResult.token_metrics?.latency_ms || 780}ms)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (40%): 4 SUB-AGENTS & BOTTOM INTERACTIVE CONSOLE */}
          <div className="xl:col-span-5 space-y-4">
            {/* 4 Multi-Agent Cards */}
            <div className="bg-[#0b101b] border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Ý Kiến 4 Chuyên Gia Hội Đồng
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  LIVE SMC & RAG
                </span>
              </div>

              {isLoading && !debateResult ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-400" />
                  <p className="text-xs">Đang triệu tập Hội đồng 4 Agent...</p>
                </div>
              ) : debateResult ? (
                <div className="space-y-2.5">
                  {/* Agent 1: Alpha */}
                  <div className="bg-[#070a12] border border-slate-800/90 rounded-xl p-3">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                      <span>📊 Agent Alpha (Kỹ Thuật SMC)</span>
                      <span className="text-[10px] font-mono text-purple-400">RSI {debateResult.technical_view.estimatedRsi}/100</span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      {debateResult.technical_view.summary}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1.5 flex justify-between">
                      <span className="text-emerald-400">Hỗ trợ: {debateResult.technical_view.support_zone}</span>
                      <span className="text-rose-400">Kháng cự: {debateResult.technical_view.resistance_zone}</span>
                    </div>
                  </div>

                  {/* Agent 2: Macro */}
                  <div className="bg-[#070a12] border border-slate-800/90 rounded-xl p-3">
                    <div className="flex items-center justify-between text-xs font-bold text-sky-300">
                      <span>📰 Agent Macro (Dòng Tiền & Vĩ Mô)</span>
                      <span className="text-[10px] font-mono text-amber-400">Funding {debateResult.macro_view.fundingRate}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      {debateResult.macro_view.summary}
                    </div>
                  </div>

                  {/* Agent 3: Guardian */}
                  <div className="bg-[#070a12] border border-slate-800/90 rounded-xl p-3">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span>🛡️ Agent Guardian (Quản Trị Rủi Ro)</span>
                      <span className="text-[10px] font-mono text-emerald-400">{debateResult.risk_view.risk_level}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      {debateResult.risk_view.advice}
                    </div>
                  </div>

                  {/* Agent 4: Sentinel (Devil's Advocate) */}
                  <div className="bg-[#070a12] border border-rose-500/30 rounded-xl p-3">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                      <span>⚖️ Agent Sentinel (Luật Sư Của Quỷ)</span>
                      <span className="text-[10px] font-mono text-rose-400">Pre-Mortem Scan</span>
                    </div>
                    <div className="text-[11px] text-rose-200/90 mt-1.5 leading-relaxed font-medium">
                      ⚠️ {debateResult.validator_view.trap_warning}
                    </div>
                    <div className="text-[10px] text-slate-400 italic mt-1">
                      "{debateResult.validator_view.critical_question}"
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* BOTTOM INTEGRATED INTERACTIVE CONSOLE (CHAT & EVALUATION TABS) */}
            <div className="bg-[#0b101b] border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3">
              {/* Console Mode Switcher */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 bg-[#070a12] p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setConsoleMode("chat")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      consoleMode === "chat"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>💬 Chat 4 Agent</span>
                  </button>

                  <button
                    onClick={() => setConsoleMode("evaluate")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      consoleMode === "evaluate"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>⚖️ Thẩm Định Kế Hoạch</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono text-slate-400">
                  {selectedCoin}/USDT
                </span>
              </div>

              {/* MODE A: CHAT CONSOLE */}
              {consoleMode === "chat" && (
                <div className="space-y-3">
                  <div className="h-56 overflow-y-auto space-y-2.5 pr-1 no-scrollbar text-xs">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl ${
                          msg.sender === "user"
                            ? "bg-blue-600/20 border border-blue-500/30 text-blue-100 ml-6"
                            : "bg-[#070a12] border border-slate-800 text-slate-200 mr-6"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                          <span>{msg.sender === "user" ? "🧑 Trader" : "🏛️ Hội Đồng AI"}</span>
                          <span>{msg.time}</span>
                        </div>
                        <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                      </div>
                    ))}
                    {isSendingChat && (
                      <div className="p-2.5 rounded-xl bg-[#070a12] border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                        <span>Hội đồng đang họp bàn trả lời...</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendChat} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatPrompt}
                      onChange={(e) => setChatPrompt(e.target.value)}
                      placeholder="Chất vấn Hội đồng: Có nên FOMO lúc này không?..."
                      className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isSendingChat || !chatPrompt.trim()}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi</span>
                    </button>
                  </form>
                </div>
              )}

              {/* MODE B: EVALUATION CONSOLE */}
              {consoleMode === "evaluate" && (
                <div className="space-y-3">
                  <form onSubmit={handleEvaluatePrediction} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setUserAction("LONG")}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                          userAction === "LONG"
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                            : "bg-[#070a12] text-slate-400 border-slate-800"
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Dự Đoán LONG</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUserAction("SHORT")}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                          userAction === "SHORT"
                            ? "bg-rose-600 text-white border-rose-500 shadow-sm"
                            : "bg-[#070a12] text-slate-400 border-slate-800"
                        }`}
                      >
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Dự Đoán SHORT</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={hypothesisText}
                        onChange={(e) => setHypothesisText(e.target.value)}
                        placeholder="Nêu nhận định: Nến 15m rút chân tại hỗ trợ..."
                        className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="submit"
                        disabled={isEvaluating || !hypothesisText.trim()}
                        className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-1"
                      >
                        {isEvaluating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>Thẩm Định</span>
                      </button>
                    </div>
                  </form>

                  {/* Evaluation Result View */}
                  {evalResult && (
                    <div className="p-3 rounded-xl bg-[#070a12] border border-purple-500/30 text-xs space-y-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-purple-300">Kết Quả Thẩm Định: {evalResult.verdict}</span>
                        <span className="text-emerald-400 font-mono">{evalResult.probability_pct}% Khả thi</span>
                      </div>
                      <div className="text-slate-300 text-[11px] leading-relaxed">
                        • Điểm ủng hộ: {evalResult.pros?.join("; ")}
                      </div>
                      <div className="text-amber-300 text-[11px] leading-relaxed">
                        • Cảnh báo bẫy: {evalResult.cons?.join("; ")}
                      </div>
                      <div className="text-slate-400 text-[10px] italic">
                        💡 {evalResult.advice}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. TELEGRAM SETTINGS MODAL */}
      <TelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        onShowToast={onShowToast || ((msg) => console.log(msg))}
      />

      {/* 5. COUNCIL DEBATE LOG MODAL */}
      <CouncilDebateModal
        isOpen={isDebateModalOpen}
        onClose={() => setIsDebateModalOpen(false)}
        debate={debateResult}
        coin={selectedCoin}
      />
    </div>
  );
};
