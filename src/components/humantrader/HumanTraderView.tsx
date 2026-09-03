import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  PlusCircle,
  XCircle,
  Clock,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertTriangle,
  History,
  Activity,
  Zap
} from "lucide-react";
import {
  PaperAccount,
  PaperPosition,
  PaperHistoryStats,
  HumanTraderSubTab
} from "../../types";
import { PaperTraderApi, AiTraderApi } from "../../services/api";
import { TRACKED_COINS, formatCoinPrice } from "../../services/binance";

interface HumanTraderViewProps {
  livePrices?: Record<string, number>;
}

export const HumanTraderView: React.FC<HumanTraderViewProps> = ({ livePrices = {} }) => {
  const [activeSubTab, setActiveSubTab] = useState<HumanTraderSubTab>("trade_desk");
  const [selectedCoin, setSelectedCoin] = useState<string>("BTC");
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [openPositions, setOpenPositions] = useState<PaperPosition[]>([]);
  const [historyTrades, setHistoryTrades] = useState<PaperPosition[]>([]);
  const [historyStats, setHistoryStats] = useState<PaperHistoryStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Order Form State
  const [orderType, setOrderType] = useState<"LONG" | "SHORT">("LONG");
  const [leverage, setLeverage] = useState<number>(5);
  const [marginUsd, setMarginUsd] = useState<number>(500);
  const [stopLoss, setStopLoss] = useState<string>("");
  const [takeProfit, setTakeProfit] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // AI Pre-Trade Check State
  const [isAiChecking, setIsAiChecking] = useState<boolean>(false);
  const [aiCheckResult, setAiCheckResult] = useState<any | null>(null);

  // Load account & positions
  const loadTradingData = async () => {
    setIsLoading(true);
    try {
      const [accRes, posRes, histRes] = await Promise.all([
        PaperTraderApi.getAccount(),
        PaperTraderApi.getPositions(),
        PaperTraderApi.getHistory({ limit: 50 })
      ]);
      if (accRes.account) setAccount(accRes.account);
      if (posRes.positions) setOpenPositions(posRes.positions);
      if (histRes.trades) setHistoryTrades(histRes.trades);
      if (histRes.stats) setHistoryStats(histRes.stats);
    } catch (err: any) {
      console.error("Error loading paper trading data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTradingData();
  }, []);

  const currentPrice = livePrices[selectedCoin.toUpperCase()] || 0;

  // Auto set default SL / TP when coin or direction changes
  useEffect(() => {
    if (currentPrice > 0) {
      if (orderType === "LONG") {
        setStopLoss((currentPrice * 0.985).toFixed(2));
        setTakeProfit((currentPrice * 1.03).toFixed(2));
      } else {
        setStopLoss((currentPrice * 1.015).toFixed(2));
        setTakeProfit((currentPrice * 0.97).toFixed(2));
      }
    }
  }, [selectedCoin, orderType, currentPrice > 0]);

  // Handle Quick AI Pre-Trade Safety Check
  const handleAiSafetyCheck = async () => {
    if (currentPrice <= 0) return;
    setIsAiChecking(true);
    setAiCheckResult(null);
    try {
      const res = await AiTraderApi.evaluatePrediction({
        coin: selectedCoin,
        hypothesis: `Ý định vào lệnh ${orderType} ${selectedCoin} tại giá $${formatCoinPrice(currentPrice)} với đòn bẩy ${leverage}x, SL ${stopLoss}, TP ${takeProfit}.`,
        userAction: orderType,
        clientMarket: { price: currentPrice }
      });
      if (res.success && res.evaluation) {
        setAiCheckResult(res.evaluation);
      }
    } catch (err: any) {
      alert("Lỗi kiểm tra AI: " + err.message);
    } finally {
      setIsAiChecking(false);
    }
  };

  // Handle Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPrice <= 0) {
      alert("Đang chờ dữ liệu giá Live Binance...");
      return;
    }

    if (marginUsd <= 0) {
      alert("Vui lòng nhập số tiền ký quỹ hợp lệ (> 0)");
      return;
    }

    if (account && marginUsd > account.availableBalance) {
      alert(`Số dư khả dụng ($${account.availableBalance}) không đủ để ký quỹ $${marginUsd}`);
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const payload = {
        coin: selectedCoin,
        type: orderType,
        entry_price: currentPrice,
        stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
        take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
        leverage,
        margin: marginUsd,
        ai_verdict: aiCheckResult ? `${aiCheckResult.verdict} (${aiCheckResult.probability_pct}%)` : "",
        notes: notes.trim()
      };

      const res = await PaperTraderApi.openPosition(payload);
      if (res.success) {
        setAccount(res.account);
        setOpenPositions((prev) => [res.position, ...prev]);
        setAiCheckResult(null);
        setNotes("");
        alert(`🎉 Đã mở vị thế ${orderType} ${selectedCoin} thành công tại giá $${formatCoinPrice(currentPrice)}!`);
      }
    } catch (err: any) {
      alert("Không thể mở vị thế: " + err.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Handle Close Position
  const handleClosePosition = async (position: PaperPosition) => {
    const liveP = livePrices[position.coin.toUpperCase()] || position.entry_price;
    if (liveP <= 0) {
      alert("Không thể lấy giá Live để đóng lệnh.");
      return;
    }

    const confirmClose = window.confirm(
      `Xác nhận đóng vị thế ${position.type} ${position.coin} tại giá Live $${formatCoinPrice(liveP)}?`
    );
    if (!confirmClose) return;

    try {
      const res = await PaperTraderApi.closePosition(position.id, liveP, "MANUAL");
      if (res.success) {
        setAccount(res.account);
        setOpenPositions((prev) => prev.filter((p) => p.id !== position.id));
        setHistoryTrades((prev) => [res.position, ...prev]);
      }
    } catch (err: any) {
      alert("Lỗi khi đóng vị thế: " + err.message);
    }
  };

  // Handle Reset Account
  const handleResetAccount = async () => {
    const confirmReset = window.confirm(
      "Bạn có chắc chắn muốn khôi phục số dư tài khoản về mức mặc định $10,000 USD?"
    );
    if (!confirmReset) return;

    try {
      const res = await PaperTraderApi.resetAccount(10000);
      if (res.success) {
        setAccount(res.account);
        setOpenPositions([]);
        await loadTradingData();
        alert("Đã reset tài khoản về $10,000 USD thành công!");
      }
    } catch (err: any) {
      alert("Lỗi reset tài khoản: " + err.message);
    }
  };

  // Calculate live unrealized PnL for all open positions
  let totalUnrealizedPnl = 0;
  const positionsWithLivePnl = openPositions.map((pos) => {
    const liveP = livePrices[pos.coin.toUpperCase()] || pos.entry_price;
    const isShort = pos.type === "SHORT";
    let pnlPct = 0;
    if (pos.entry_price > 0 && liveP > 0) {
      const priceDiffPct = isShort
        ? ((pos.entry_price - liveP) / pos.entry_price) * 100
        : ((liveP - pos.entry_price) / pos.entry_price) * 100;
      pnlPct = priceDiffPct * pos.leverage;
    }
    const pnlAmt = pos.margin * (pnlPct / 100);
    totalUnrealizedPnl += pnlAmt;

    return {
      ...pos,
      currentPrice: liveP,
      livePnlPct: Number(pnlPct.toFixed(2)),
      livePnlAmt: Number(pnlAmt.toFixed(2))
    };
  });

  const totalEquity = account ? account.balance + totalUnrealizedPnl : 10000;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. TOP COMPACT ASSET STATUS RIBBON */}
      <div className="bg-[#0b101b] border border-slate-800/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Tổng Tài Sản</div>
              <div className="text-xs sm:text-sm font-black text-white font-mono leading-tight">
                ${totalEquity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Khả Dụng</div>
              <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono leading-tight">
                ${account ? account.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "10,000.00"}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">PnL Live ({openPositions.length} Lệnh)</div>
              <div className={`text-xs sm:text-sm font-black font-mono leading-tight ${totalUnrealizedPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {totalUnrealizedPnl >= 0 ? "+" : ""}${totalUnrealizedPnl.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Percent className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Tỷ Lệ Thắng</div>
              <div className="text-xs sm:text-sm font-black text-white font-mono leading-tight">
                {historyStats ? `${historyStats.winRate}%` : "0%"} <span className="text-[10px] text-slate-400 font-normal">({historyStats ? `${historyStats.winTrades}W-${historyStats.lossTrades}L` : "0W-0L"})</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleResetAccount}
          className="text-[10px] sm:text-[11px] text-slate-400 hover:text-rose-400 font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/30 transition-all ml-auto"
        >
          Reset $10k
        </button>
      </div>

      {/* 2. SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 bg-[#0b101b] p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveSubTab("trade_desk")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "trade_desk"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>1. Bàn Đặt Lệnh Thực Chiến</span>
        </button>

        <button
          onClick={() => setActiveSubTab("positions")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "positions"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>2. Vị Thế Đang Mở ({openPositions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("history")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "history"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <History className="w-3.5 h-3.5 text-purple-400" />
          <span>3. Lịch Sử Lệnh Đã Đóng ({historyTrades.length})</span>
        </button>
      </div>

      {/* 3. SUB-TAB 1: TRADE DESK */}
      {activeSubTab === "trade_desk" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Ticker & Market Specs */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-white text-base">Thị Trường Binance Live</span>
                </div>
                <span className="text-xs font-mono text-slate-400">WebSocket Realtime 24/7</span>
              </div>

              {/* Coin Select Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {TRACKED_COINS.map((c) => {
                  const upper = c.toUpperCase();
                  const isSelected = selectedCoin === upper;
                  const p = livePrices[upper];
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedCoin(upper)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30"
                          : "bg-[#070a12] text-slate-300 border-slate-800 hover:bg-slate-800/50"
                      }`}
                    >
                      {upper}
                    </button>
                  );
                })}
              </div>

              {/* Live Price Display Box */}
              <div className="bg-[#070a12] border border-slate-800 rounded-2xl p-5 text-center space-y-2 relative overflow-hidden">
                <div className="text-xs text-slate-400 uppercase font-bold">
                  {selectedCoin}/USDT Spot Index
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {currentPrice ? `$${formatCoinPrice(currentPrice)}` : "Đang kết nối..."}
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Dữ liệu khớp lệnh trực tiếp theo sàn Binance</span>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-950/20 border border-blue-500/20 p-4 rounded-xl text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-blue-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Quy Tắc Quản Lý Vốn (Chương 9 Giáo trình):</span>
                </div>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  <li>• Không nên ký quỹ quá 10% - 20% số dư khả dụng cho 1 vị thế.</li>
                  <li>• Luôn cài đặt Stop Loss trước khi mở lệnh để bảo vệ tài khoản.</li>
                  <li>• Sử dụng tính năng "Hỏi ý kiến AI" để kiểm tra tỷ lệ an toàn.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Order Entry Form */}
          <div className="lg:col-span-6">
            <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="font-bold text-white text-base">Đặt Lệnh Thực Chiến ({selectedCoin})</h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Khả dụng: ${account ? account.availableBalance.toFixed(2) : "10,000.00"}
                </span>
              </div>

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                {/* 1. Order Side (Long / Short) */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Chiều Vị Thế</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType("LONG")}
                      className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        orderType === "LONG"
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500"
                          : "bg-[#070a12] text-slate-400 border border-slate-800 hover:text-white"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>LONG (MUA TĂNG)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType("SHORT")}
                      className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        orderType === "SHORT"
                          ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-500"
                          : "bg-[#070a12] text-slate-400 border border-slate-800 hover:text-white"
                      }`}
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span>SHORT (BÁN GIẢM)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Leverage Selector */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300">Đòn Bẩy (Leverage)</label>
                    <span className="text-xs font-mono font-bold text-purple-400">{leverage}x</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[1, 2, 3, 5, 10, 20].map((lev) => (
                      <button
                        key={lev}
                        type="button"
                        onClick={() => setLeverage(lev)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          leverage === lev
                            ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                            : "bg-[#070a12] text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        {lev}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Margin Input & Position Size */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300">Số Tiền Ký Quỹ (Margin USD)</label>
                    <span className="text-xs font-mono text-slate-400">
                      Tổng quy mô lệnh: <b className="text-white">${(marginUsd * leverage).toLocaleString()}</b>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      step={10}
                      value={marginUsd}
                      onChange={(e) => setMarginUsd(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">USD</span>
                  </div>

                  {/* Quick percentage buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    {[10, 25, 50, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          if (account) {
                            const val = Math.floor((account.availableBalance * pct) / 100);
                            setMarginUsd(Math.max(10, val));
                          }
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. SL / TP Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Cắt Lỗ (Stop Loss)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      placeholder="Giá SL..."
                      className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-rose-400 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Chốt Lời (Take Profit)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      placeholder="Giá TP..."
                      className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 5. Notes */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Ghi Chú Kế Hoạch</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Lý do vào lệnh (ví dụ: RSI phân kỳ đáy 2, retest hỗ trợ)..."
                    className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* AI Safety Check Box (if activated) */}
                {aiCheckResult && (
                  <div className="bg-purple-950/20 border border-purple-500/30 p-3.5 rounded-xl space-y-2 text-xs animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Đánh Giá Từ Hội Đồng AI:</span>
                      </span>
                      <span className="font-black text-emerald-400 font-mono">
                        Xác suất: {aiCheckResult.probability_pct}%
                      </span>
                    </div>
                    <div
                      className="text-[11px] text-slate-200"
                      dangerouslySetInnerHTML={{ __html: aiCheckResult.advice }}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleAiSafetyCheck}
                    disabled={isAiChecking || currentPrice <= 0}
                    className="w-full sm:w-auto px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold text-xs rounded-xl border border-purple-500/30 transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Sparkles className={`w-4 h-4 ${isAiChecking ? "animate-spin" : ""}`} />
                    <span>Hỏi Ý Kiến AI Trước Khi Vào Lệnh</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingOrder || currentPrice <= 0}
                    className={`flex-1 w-full py-3 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                      orderType === "LONG"
                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                        : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
                    }`}
                  >
                    {isSubmittingOrder ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang khớp lệnh Live...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>MỞ VỊ THẾ {orderType} {selectedCoin}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB 2: VỊ THẾ ĐANG MỞ */}
      {activeSubTab === "positions" && (
        <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Danh Sách Vị Thế Đang Mở</h3>
            </div>
            <span className="text-xs text-slate-400">
              PnL tự động nhảy theo giá nến Binance Live
            </span>
          </div>

          {positionsWithLivePnl.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
              <Activity className="w-8 h-8 text-slate-600" />
              <div className="font-bold text-white text-sm">Hiện không có vị thế nào đang mở</div>
              <div className="text-xs">
                Chuyển qua tab "Bàn Đặt Lệnh Thực Chiến" để mở lệnh mới.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono uppercase">
                    <th className="py-3 px-3">Cặp Coin</th>
                    <th className="py-3 px-3">Chiều</th>
                    <th className="py-3 px-3">Đòn Bẩy</th>
                    <th className="py-3 px-3">Ký Quỹ</th>
                    <th className="py-3 px-3">Giá Vào (Entry)</th>
                    <th className="py-3 px-3">Giá Live Hiện Tại</th>
                    <th className="py-3 px-3">Stop Loss</th>
                    <th className="py-3 px-3">Take Profit</th>
                    <th className="py-3 px-3">Lãi / Lỗ (PnL)</th>
                    <th className="py-3 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {positionsWithLivePnl.map((pos) => {
                    const isPos = pos.livePnlAmt >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-white">{pos.coin}/USDT</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              pos.type === "LONG"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {pos.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-purple-400 font-bold">{pos.leverage}x</td>
                        <td className="py-3.5 px-3">${pos.margin.toFixed(2)}</td>
                        <td className="py-3.5 px-3 font-bold">${formatCoinPrice(pos.entry_price)}</td>
                        <td className="py-3.5 px-3 font-bold text-sky-400">${formatCoinPrice(pos.currentPrice)}</td>
                        <td className="py-3.5 px-3 text-rose-400">{pos.stop_loss ? `$${formatCoinPrice(pos.stop_loss)}` : "-"}</td>
                        <td className="py-3.5 px-3 text-emerald-400">{pos.take_profit ? `$${formatCoinPrice(pos.take_profit)}` : "-"}</td>
                        <td className="py-3.5 px-3">
                          <div className={`font-bold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                            {isPos ? "+" : ""}${pos.livePnlAmt.toFixed(2)} ({isPos ? "+" : ""}{pos.livePnlPct.toFixed(2)}%)
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => handleClosePosition(pos)}
                            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg font-bold text-xs border border-rose-500/30 transition-all"
                          >
                            Đóng Lệnh
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. SUB-TAB 3: LỊCH SỬ LỆNH ĐÃ ĐÓNG */}
      {activeSubTab === "history" && (
        <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-base">Lịch Sử Giao Dịch Đã Đóng</h3>
            </div>
            <span className="text-xs text-slate-400">
              Tổng số lệnh: <b className="text-white">{historyTrades.length}</b>
            </span>
          </div>

          {historyTrades.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Chưa có lịch sử giao dịch nào đã đóng.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono uppercase">
                    <th className="py-3 px-3">Thời Gian</th>
                    <th className="py-3 px-3">Cặp Coin</th>
                    <th className="py-3 px-3">Chiều</th>
                    <th className="py-3 px-3">Đòn Bẩy</th>
                    <th className="py-3 px-3">Giá Vào</th>
                    <th className="py-3 px-3">Giá Đóng</th>
                    <th className="py-3 px-3">Ký Quỹ</th>
                    <th className="py-3 px-3">Lãi / Lỗ (PnL)</th>
                    <th className="py-3 px-3">Lý Do Đóng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {historyTrades.map((t) => {
                    const isWin = (t.pnl_amount || 0) >= 0;
                    return (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 text-slate-400 text-[11px]">{t.date}</td>
                        <td className="py-3 px-3 font-bold text-white">{t.coin}/USDT</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.type === "LONG"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-purple-400 font-bold">{t.leverage}x</td>
                        <td className="py-3 px-3">${formatCoinPrice(t.entry_price)}</td>
                        <td className="py-3 px-3 font-bold text-slate-200">
                          {t.exit_price ? `$${formatCoinPrice(t.exit_price)}` : "-"}
                        </td>
                        <td className="py-3 px-3">${t.margin.toFixed(2)}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-bold ${isWin ? "text-emerald-400" : "text-rose-400"}`}
                          >
                            {isWin ? "+" : ""}${t.pnl_amount?.toFixed(2)} ({isWin ? "+" : ""}{t.pnl_percent?.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">{t.close_reason || "MANUAL"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
