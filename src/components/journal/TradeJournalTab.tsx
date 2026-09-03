import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  PlusCircle,
  Bot,
  Filter,
  RotateCcw,
  Clock,
  Sparkles,
  Zap,
  Edit3,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Scale,
  List,
  LayoutGrid,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { TradeEntry, TradeStatsSummary, TradeStatus } from "../../types";
import { formatCoinPrice } from "../../services/binance";

interface TradeJournalTabProps {
  entries: TradeEntry[];
  stats: TradeStatsSummary | null;
  livePrices: Record<string, number>;
  onOpenAddModal: () => void;
  onEditTrade: (trade: TradeEntry) => void;
  onDeleteTrade: (id: number) => void;
  onCloseLiveTrade: (id: number, livePrice: number) => void;
  onSwitchToAiReview: () => void;
  onOpenLightbox: (url: string) => void;
  onFilterChange: (filters: { coin?: string; status?: string; startDate?: string; endDate?: string }) => void;
}

export const TradeJournalTab: React.FC<TradeJournalTabProps> = ({
  entries,
  stats,
  livePrices,
  onOpenAddModal,
  onEditTrade,
  onDeleteTrade,
  onCloseLiveTrade,
  onSwitchToAiReview,
  onOpenLightbox,
  onFilterChange,
}) => {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [showCurve, setShowCurve] = useState<boolean>(true);
  const [coinFilter, setCoinFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const handleApplyFilter = (newCoin?: string, newStatus?: string, newStart?: string, newEnd?: string) => {
    const c = newCoin !== undefined ? newCoin : coinFilter;
    const s = newStatus !== undefined ? newStatus : statusFilter;
    const sd = newStart !== undefined ? newStart : startDate;
    const ed = newEnd !== undefined ? newEnd : endDate;

    onFilterChange({
      coin: c || undefined,
      status: s || undefined,
      startDate: sd || undefined,
      endDate: ed || undefined,
    });
  };

  const handleResetFilters = () => {
    setCoinFilter("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    onFilterChange({});
  };

  // Compute live dynamic PnL for individual trade card
  const getTradeLiveMetrics = (entry: TradeEntry) => {
    if (entry.status !== "OPEN") {
      return {
        isLive: false,
        price: entry.exit_price || entry.entry_price,
        pnlAmount: entry.pnl_amount || 0,
        pnlPercent: entry.pnl_percent || 0,
        hitSL: false,
        hitTP: false,
      };
    }

    const coinUpper = (entry.coin || "BTC").toUpperCase();
    const livePrice = livePrices[coinUpper] || entry.entry_price || 0;
    const isShort = entry.type.includes("SHORT") || entry.type.includes("SELL");

    let pct = 0;
    let amt = 0;

    if (entry.entry_price > 0 && livePrice > 0) {
      if (isShort) {
        pct = ((entry.entry_price - livePrice) / entry.entry_price) * 100;
      } else {
        pct = ((livePrice - entry.entry_price) / entry.entry_price) * 100;
      }
      amt = entry.position_size ? entry.position_size * (pct / 100) : 0;
    }

    const hitSL = entry.stop_loss && livePrice > 0
      ? isShort ? livePrice >= entry.stop_loss : livePrice <= entry.stop_loss
      : false;

    const hitTP = entry.take_profit && livePrice > 0
      ? isShort ? livePrice <= entry.take_profit : livePrice >= entry.take_profit
      : false;

    return {
      isLive: true,
      price: livePrice,
      pnlAmount: Number(amt.toFixed(2)),
      pnlPercent: Number(pct.toFixed(2)),
      hitSL,
      hitTP,
    };
  };

  // Cumulative PnL Curve Data
  const closedEntries = entries.filter((e) => e.status !== "OPEN");
  let runningPnl = 0;
  const pnlCurvePoints = closedEntries.map((e) => {
    runningPnl += e.pnl_amount || 0;
    return runningPnl;
  });

  const winRateDisplay = stats ? (typeof stats.winRate === "number" ? stats.winRate.toFixed(1) : String(stats.winRate || "0")) : "0";
  const rawTotalPnl = stats ? (stats.totalPnl !== undefined ? stats.totalPnl : stats.totalPnL) : 0;
  const totalPnlNum = Number(rawTotalPnl) || 0;
  const totalPnlDisplay = `$${totalPnlNum >= 0 ? "+" : ""}${totalPnlNum.toFixed(2)}`;
  const profitFactorDisplay = stats ? (typeof stats.profitFactor === "number" ? stats.profitFactor.toFixed(2) : String(stats.profitFactor || "0.00")) : "0.00";

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. TOP COMPACT JOURNAL STATUS RIBBON */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-3 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Percent className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Tỷ Lệ Thắng</div>
              <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono leading-none">
                {winRateDisplay}%
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sky-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Tổng Lợi Nhuận</div>
              <div className={`text-xs sm:text-sm font-black font-mono leading-none ${totalPnlNum > 0 ? "text-emerald-400" : totalPnlNum < 0 ? "text-rose-400" : "text-slate-200"}`}>
                {totalPnlDisplay}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Tổng Số Lệnh</div>
              <div className="text-xs sm:text-sm font-black text-white font-mono leading-none">
                {stats?.totalTrades !== undefined ? stats.totalTrades : entries.length}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Profit Factor</div>
              <div className="text-xs sm:text-sm font-black text-amber-400 font-mono leading-none">
                {profitFactorDisplay}
              </div>
            </div>
          </div>
        </div>

        {/* Toggle PnL Curve */}
        <button
          onClick={() => setShowCurve(!showCurve)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-[#070a12] px-2.5 py-1 rounded-lg border border-slate-800 transition-colors ml-auto"
        >
          <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
          <span>{showCurve ? "Ẩn Đường PnL" : "Hiện Đường PnL"}</span>
          {showCurve ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 2. COLLAPSIBLE PNL CURVE CHART */}
      {showCurve && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              📈 Biểu Đồ Tăng Trưởng PnL Tích Lũy
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-400 border border-blue-500/30">
              {closedEntries.length} Lệnh Đã Đóng
            </span>
          </div>

          <div className="h-28 w-full flex items-center justify-center">
            {pnlCurvePoints.length >= 2 ? (
              <svg viewBox="0 0 800 120" className="w-full h-full">
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const min = Math.min(0, ...pnlCurvePoints);
                  const max = Math.max(10, ...pnlCurvePoints);
                  const range = max - min || 1;
                  const getY = (v: number) => 105 - ((v - min) / range) * 90;
                  const getX = (i: number) => 30 + (i / (pnlCurvePoints.length - 1)) * 740;

                  const pathD = pnlCurvePoints
                    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx)} ${getY(p)}`)
                    .join(" ");

                  const areaD = `${pathD} L ${getX(pnlCurvePoints.length - 1)} 115 L 30 115 Z`;

                  return (
                    <>
                      <line x1="30" y1={getY(0)} x2="770" y2={getY(0)} stroke="#334155" strokeDasharray="3,3" />
                      <path d={areaD} fill="url(#pnlGrad)" />
                      <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" />
                      {pnlCurvePoints.map((p, idx) => (
                        <circle key={idx} cx={getX(idx)} cy={getY(p)} r="3" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" />
                      ))}
                    </>
                  );
                })()}
              </svg>
            ) : (
              <div className="text-xs text-slate-500 text-center">
                Nhập ít nhất 2 lệnh trade có kết quả (WIN / LOSS) để vẽ biểu đồ tăng trưởng PnL.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TOOLBAR FILTERS & ACTIONS & VIEW SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#0f172a] border border-slate-800 p-3 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Lọc Coin (BTC...)"
            value={coinFilter}
            onChange={(e) => {
              setCoinFilter(e.target.value);
              handleApplyFilter(e.target.value);
            }}
            className="w-24 bg-[#070a12] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 font-mono uppercase focus:outline-none focus:border-sky-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              handleApplyFilter(undefined, e.target.value);
            }}
            className="w-32 bg-[#070a12] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-sky-500"
          >
            <option value="">Tất cả kết quả</option>
            <option value="WIN">🏆 WIN (Thắng)</option>
            <option value="LOSS">🛑 LOSS (Lỗ)</option>
            <option value="BREAKEVEN">⚖️ Hòa Vốn</option>
            <option value="OPEN">⏳ Đang Mở</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              handleApplyFilter(undefined, undefined, e.target.value);
            }}
            className="w-28 bg-[#070a12] border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              handleApplyFilter(undefined, undefined, undefined, e.target.value);
            }}
            className="w-28 bg-[#070a12] border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />

          <button
            onClick={handleResetFilters}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
          >
            Đặt Lại
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher: Table vs Cards */}
          <div className="flex items-center gap-1 bg-[#070a12] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "table" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Dạng Bảng Cô Đọng (Compact Table)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "cards" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Dạng Thẻ Lớn (Grid Cards)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onSwitchToAiReview}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Review</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-500 transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Thêm Lệnh</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN DATA VIEW: COMPACT TABLE OR GRID CARDS */}
      {entries.length === 0 ? (
        <div className="text-center py-16 bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
          <div className="text-2xl mb-1">📊</div>
          <h4 className="text-sm font-bold text-white mb-1">Chưa có lệnh giao dịch nào</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
            Bấm "Thêm Lệnh" để lưu lại lệnh giao dịch thực tế kèm ảnh biểu đồ TradingView và checklist kỷ luật.
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            + Thêm Lệnh Đầu Tiên
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* COMPACT TABLE VIEW */
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#070a12] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Coin / Chiều</th>
                  <th className="py-2.5 px-3">Trạng Thái</th>
                  <th className="py-2.5 px-3">Entry / Exit</th>
                  <th className="py-2.5 px-3">SL / TP</th>
                  <th className="py-2.5 px-3">Quy Mô ($)</th>
                  <th className="py-2.5 px-3">PnL ($ / %)</th>
                  <th className="py-2.5 px-3">Ngày</th>
                  <th className="py-2.5 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {entries.map((entry) => {
                  const metrics = getTradeLiveMetrics(entry);
                  const isLong = entry.type.includes("LONG") || entry.type.includes("BUY");
                  const isOpen = entry.status === "OPEN";

                  let imgsArr: string[] = [];
                  if (Array.isArray(entry.images)) imgsArr = entry.images;
                  else if (typeof entry.images === "string") {
                    try {
                      imgsArr = JSON.parse(entry.images);
                    } catch {}
                  }

                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white font-mono">{entry.coin}</span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                              isLong ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {entry.type}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            entry.status === "WIN"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : entry.status === "LOSS"
                              ? "bg-rose-500/20 text-rose-400"
                              : entry.status === "OPEN"
                              ? "bg-sky-500/20 text-sky-400 animate-pulse"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-300">
                        <div>${entry.entry_price}</div>
                        <div className="text-[10px] text-slate-500">
                          {isOpen ? `Live: $${formatCoinPrice(metrics.price)}` : `Exit: $${entry.exit_price || entry.entry_price}`}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="text-rose-400 text-[11px]">{entry.stop_loss ? `$${entry.stop_loss}` : "-"}</div>
                        <div className="text-emerald-400 text-[11px]">{entry.take_profit ? `$${entry.take_profit}` : "-"}</div>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-slate-200">
                        ${entry.position_size || 0}
                      </td>

                      <td className="py-2.5 px-3">
                        <div
                          className={`font-extrabold ${
                            (Number(metrics.pnlAmount) || 0) > 0
                              ? "text-emerald-400"
                              : (Number(metrics.pnlAmount) || 0) < 0
                              ? "text-rose-400"
                              : "text-slate-300"
                          }`}
                        >
                          {(Number(metrics.pnlAmount) || 0) >= 0 ? "+" : ""}${(Number(metrics.pnlAmount) || 0).toFixed(2)}
                        </div>
                        <div
                          className={`text-[10px] ${
                            (Number(metrics.pnlPercent) || 0) > 0
                              ? "text-emerald-400"
                              : (Number(metrics.pnlPercent) || 0) < 0
                              ? "text-rose-400"
                              : "text-slate-500"
                          }`}
                        >
                          ({(Number(metrics.pnlPercent) || 0) >= 0 ? "+" : ""}{(Number(metrics.pnlPercent) || 0).toFixed(1)}%)
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-[11px] text-slate-400 whitespace-nowrap">
                        {entry.date}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {imgsArr.length > 0 && (
                            <button
                              onClick={() => onOpenLightbox(imgsArr[0])}
                              className="p-1 rounded text-slate-400 hover:text-sky-400"
                              title="Xem ảnh chart"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isOpen && (
                            <button
                              onClick={() => entry.id && onCloseLiveTrade(entry.id, metrics.price)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 hover:bg-sky-500/30 border border-sky-500/30"
                              title="Chốt lệnh theo giá live Binance"
                            >
                              Chốt Live
                            </button>
                          )}
                          <button
                            onClick={() => onEditTrade(entry)}
                            className="p-1 rounded text-slate-400 hover:text-sky-400"
                            title="Sửa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => entry.id && onDeleteTrade(entry.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {entries.map((entry) => {
            const metrics = getTradeLiveMetrics(entry);
            const isLong = entry.type.includes("LONG") || entry.type.includes("BUY");
            const isOpen = entry.status === "OPEN";

            let rulesArr: string[] = [];
            if (Array.isArray(entry.rules_checked)) rulesArr = entry.rules_checked;
            else if (typeof entry.rules_checked === "string") {
              try {
                rulesArr = JSON.parse(entry.rules_checked);
              } catch {}
            }

            let imgsArr: string[] = [];
            if (Array.isArray(entry.images)) imgsArr = entry.images;
            else if (typeof entry.images === "string") {
              try {
                imgsArr = JSON.parse(entry.images);
              } catch {}
            }

            return (
              <div
                key={entry.id}
                className="bg-[#0f172a] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 shadow-sm transition-all space-y-3"
              >
                {/* Header: Coin, Type, Status & Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm font-mono text-white tracking-wider">
                      {entry.coin}/USDT
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        isLong ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {entry.type}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        entry.status === "WIN"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : entry.status === "LOSS"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : entry.status === "OPEN"
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 animate-pulse"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {entry.status === "WIN"
                        ? "🏆 WIN"
                        : entry.status === "LOSS"
                        ? "🛑 LOSS"
                        : entry.status === "OPEN"
                        ? "⏳ ĐANG MỞ"
                        : "⚖️ HÒA"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditTrade(entry)}
                      className="p-1 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                      title="Chỉnh sửa lệnh"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => entry.id && onDeleteTrade(entry.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Xóa lệnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Live PnL Box for OPEN or recorded PnL */}
                <div className="bg-[#070a12] p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">
                      {isOpen ? "PnL Thời Gian Thực (Binance Live)" : "Kết Quả Lãi / Lỗ Đã Chốt"}
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5 font-mono">
                      <span
                        className={`text-base font-extrabold ${
                          (Number(metrics.pnlAmount) || 0) > 0
                            ? "text-emerald-400"
                            : (Number(metrics.pnlAmount) || 0) < 0
                            ? "text-rose-400"
                            : "text-slate-200"
                        }`}
                      >
                        {(Number(metrics.pnlAmount) || 0) >= 0 ? "+" : ""}${(Number(metrics.pnlAmount) || 0).toFixed(2)}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          (Number(metrics.pnlPercent) || 0) > 0
                            ? "text-emerald-400"
                            : (Number(metrics.pnlPercent) || 0) < 0
                            ? "text-rose-400"
                            : "text-slate-400"
                        }`}
                      >
                        ({(Number(metrics.pnlPercent) || 0) >= 0 ? "+" : ""}{(Number(metrics.pnlPercent) || 0).toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="flex flex-col items-end gap-1">
                      {metrics.hitSL && (
                        <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/30">
                          ⚠️ ĐÃ CHẠM SL
                        </span>
                      )}
                      {metrics.hitTP && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                          🎯 ĐÃ CHẠM TP
                        </span>
                      )}
                      <button
                        onClick={() => entry.id && onCloseLiveTrade(entry.id, metrics.price)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 transition-colors"
                      >
                        <Zap className="w-3 h-3 text-sky-400" />
                        <span>Chốt Live ${formatCoinPrice(metrics.price)}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Metrics Breakdown */}
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono bg-[#070a12]/50 p-2 rounded-xl border border-slate-800/50">
                  <div>
                    <span className="text-slate-500 text-[9px] block">Entry:</span>
                    <span className="font-bold text-slate-200">${entry.entry_price}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block">Stop Loss:</span>
                    <span className="font-bold text-rose-400">{entry.stop_loss ? `$${entry.stop_loss}` : "Không"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block">Take Profit:</span>
                    <span className="font-bold text-emerald-400">{entry.take_profit ? `$${entry.take_profit}` : "Không"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block">Size ($):</span>
                    <span className="font-bold text-slate-200">${entry.position_size || 0}</span>
                  </div>
                </div>

                {/* Confluences Checked */}
                {rulesArr.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rulesArr.map((r, i) => (
                      <span key={i} className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700/80">
                        ✔ {r}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {entry.notes && (
                  <p className="text-xs text-slate-300 bg-[#070a12] p-2 rounded-xl border border-slate-800/80 leading-relaxed whitespace-pre-line">
                    {entry.notes}
                  </p>
                )}

                {/* Image Thumbnails */}
                {imgsArr.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {imgsArr.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Chart preview"
                        onClick={() => onOpenLightbox(url)}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-700 cursor-pointer hover:border-sky-500 transition-colors"
                      />
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Ngày: {entry.date}
                  </span>
                  <span>ID: #{entry.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
