import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Sun,
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Compass,
  Activity,
  Zap
} from "lucide-react";
import { DailyBriefingData } from "../../types";
import { AiTraderApi } from "../../services/api";

interface DailyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [data, setData] = useState<DailyBriefingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AiTraderApi.getDailyBriefing();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Không thể tải bản tin thị trường");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBriefing();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const scoreColor =
    (data?.healthScore || 0) >= 7.5
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : (data?.healthScore || 0) >= 5.5
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-rose-400 bg-rose-500/10 border-rose-500/30";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto p-3 sm:p-4 bg-black/85 backdrop-blur-md flex justify-center items-start sm:items-center animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] bg-[#0c121e] border border-slate-800 rounded-2xl shadow-2xl shadow-black/95 overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 bg-[#070a12] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10">
              <Sun className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  Bản Tin Khởi Động Phiên Giao Dịch
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  PRE-MARKET
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                {data?.date || "Tổng hợp toàn cảnh thị trường & Kế hoạch phiên"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBriefing}
              disabled={loading}
              title="Làm mới dữ liệu Live"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
          {loading && !data ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-xs font-semibold">Đang quét dữ liệu Binance & Hội Đồng AI...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <div className="font-bold">Lỗi tải bản tin thị trường</div>
                <div className="text-xs opacity-90">{error}</div>
              </div>
            </div>
          ) : data ? (
            <>
              {/* SECTION 1: MARKET HEALTH SCORE, BREADTH & 4 PILLARS */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d1627] to-[#0a101d] border border-slate-800 shadow-md space-y-3">
                {/* Header Row: Score + Regime */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Trạng Thái Thị Trường Hôm Nay
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-xl border text-xs font-black flex items-center gap-1.5 ${scoreColor}`}>
                    <span>ĐIỂM AN TOÀN: {data.healthScore} / 10</span>
                    <span>•</span>
                    <span>{data.regime}</span>
                  </div>
                </div>

                {/* Market Breadth & Sentiment Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  {data.marketBreadth && (
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>
                        Độ Rộng Sàn: <strong>{data.marketBreadth.greenCount}/{data.marketBreadth.totalCoins} Coin Xanh ({data.marketBreadth.breadthPct}%)</strong>
                      </span>
                    </div>
                  )}

                  {data.sentiment && (
                    <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 font-medium flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      <span>
                        Tâm Lý Thị Trường: <strong>{data.sentiment.fearGreedLabel} ({data.sentiment.fearGreedScore}/100)</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Capital Flow / Market Insight */}
                <div className="p-3 rounded-xl bg-[#070a12]/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <div className="text-[10px] uppercase font-bold text-sky-400 mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Luân Chuyển Dòng Tiền (BTC vs Altcoins):</span>
                  </div>
                  {data.sentiment?.capitalFlowSummary || data.regimeSummary}
                </div>

                {/* 4 Pillars of Crypto Market (BTC, ETH, SOL, PHÁI SINH) */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                    Các Trụ Cột Dẫn Dắt Thị Trường:
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(data.pillars && data.pillars.length > 0 ? data.pillars : [
                      {
                        symbol: "BTC",
                        name: "Bitcoin",
                        role: "Dẫn dắt xu hướng",
                        price: data.macro?.btcPrice || "$0",
                        change24h: data.macro?.btcChange24h || "0%",
                        rsi: data.macro?.rsi14 || 50,
                        trend: data.macro?.trend || "NEUTRAL"
                      }
                    ]).map((p, idx) => {
                      const isPos = String(p.change24h || "").startsWith("+");
                      return (
                        <div key={idx} className="p-2.5 rounded-xl bg-[#070a12] border border-slate-800/80 hover:border-slate-700 transition-colors">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-bold text-white text-xs">{p.symbol}</span>
                            <span className="text-[9px] font-semibold text-slate-400">{p.role}</span>
                          </div>

                          <div className="text-xs font-mono font-bold text-slate-100 mt-1 flex items-center justify-between">
                            <span>{p.price}</span>
                            <span className={`text-[10px] ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                              {p.change24h}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/60 font-mono">
                            <span>RSI: {p.rsi}</span>
                            <span className="text-sky-400 font-semibold truncate ml-1">{p.trend}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 2: RADAR TOP COIN SETUPS */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Radar Cặp Coin Đáng Chú Ý Hôm Nay (Top Setups)
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {(data.candidateSetups || []).map((setup, idx) => {
                    const isPos = String(setup.change24h || "").startsWith("+");
                    const isLong =
                      (setup.direction || "").toUpperCase().includes("MUA") ||
                      (setup.direction || "").toUpperCase().includes("LONG") ||
                      (setup.direction || "").toUpperCase().includes("BUY");

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#070a12] border border-slate-800/80 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-xs">{setup.coin}/USDT</span>
                            <span className="font-mono text-slate-300 text-xs">{setup.price}</span>
                            <span className={`font-mono text-[10px] font-bold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                              {setup.change24h}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              isLong
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}
                          >
                            {setup.direction}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {setup.thesis}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Avoid coins alert */}
                {data.avoidCoins && data.avoidCoins.length > 0 && (
                  <div className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>⛔ CÁC ĐỒNG COIN NÊN NÉ TRÁNH HÔM NAY:</span>
                    </div>
                    {data.avoidCoins.map((ac, i) => (
                      <div key={i} className="text-[11px] text-slate-300 mt-1 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-rose-400">
                        <strong className="text-white">{ac.coin}:</strong> {ac.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 3: ECONOMIC TIMINGS & RED FLAGS */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Khung Giờ Bão Giá Cần Cảnh Giác (Red Flags)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(data.timeAlerts || []).map((ta, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#070a12] border border-slate-800/80"
                    >
                      <div className="text-[11px] font-mono font-bold text-purple-400">{ta.time}</div>
                      <div className="text-xs font-bold text-white mt-0.5">{ta.event}</div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">{ta.impact}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: CAPITAL RULES & DISCIPLINE */}
              <div className="p-3.5 rounded-xl bg-[#070a12] border border-slate-800/80">
                <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>QUY TẮC KỶ LUẬT & BẢO TOÀN VỐN HÔM NAY</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  {(data.disciplineRules || []).map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 bg-[#070a12] border-t border-slate-800">
          <div className="text-[10px] text-slate-500 hidden sm:block">
            ⚡ Tự động phân tích từ Binance Klines & Hội Đồng AI Master Council
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md shadow-amber-500/20"
          >
            Đã Nắm Rõ & Bắt Đầu Phiên
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
