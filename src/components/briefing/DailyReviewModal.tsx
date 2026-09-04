import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Moon,
  X,
  RefreshCw,
  Award,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  BookmarkCheck,
  Sparkles,
  BookOpen
} from "lucide-react";
import { DailyReviewData } from "../../types";
import { AiTraderApi } from "../../services/api";
import { formatCoinPrice, formatMoney } from "../../services/binance";

interface DailyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyReviewModal: React.FC<DailyReviewModalProps> = ({
  isOpen,
  onClose
}) => {
  const [data, setData] = useState<DailyReviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const fetchReview = async () => {
    setLoading(true);
    setError(null);
    setSavedSuccess(false);
    try {
      const res = await AiTraderApi.getDailyReview();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Không thể tải báo cáo lệnh trong ngày");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReview();
    }
  }, [isOpen]);

  const handleSaveToNote = async () => {
    if (!data || savingNote || savedSuccess) return;
    setSavingNote(true);
    try {
      await AiTraderApi.saveDailyReviewToNote(data);
      setSavedSuccess(true);
    } catch (err: any) {
      alert("Lỗi khi lưu vào sổ tay: " + err.message);
    } finally {
      setSavingNote(false);
    }
  };

  if (!isOpen) return null;

  const pnl = data?.stats?.totalPnL || 0;
  const isProfit = pnl >= 0;

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
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-sm shadow-purple-500/10">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  Review & Tổng Kết Lệnh Trong Ngày
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  POST-MARKET
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                {data?.formattedDate || "Chẩn đoán kỷ luật & Đúc kết bài học phiên"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchReview}
              disabled={loading}
              title="Làm mới dữ liệu"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
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
              <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-xs font-semibold">Đang quét toàn bộ lệnh hôm nay và chẩn đoán kỷ luật...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <div className="font-bold">Lỗi tải báo cáo lệnh</div>
                <div className="text-xs opacity-90">{error}</div>
              </div>
            </div>
          ) : data ? (
            <>
              {/* SECTION 1: PERFORMANCE SUMMARY BADGES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#070a12] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Tổng Số Lệnh</div>
                  <div className="text-base font-black text-white font-mono mt-0.5">
                    {data.stats?.totalTrades ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {data.stats?.winningTrades ?? 0} Thắng • {data.stats?.losingTrades ?? 0} Thua • {data.stats?.beTrades ?? 0} Hòa
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#070a12] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Tỷ Lệ Thắng (Win Rate)</div>
                  <div className="text-base font-black text-white font-mono mt-0.5">
                    {data.stats?.winRate ?? 0}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {data.stats?.closedTrades ?? 0} lệnh đã chốt
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#070a12] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Tổng PnL Hôm Nay</div>
                  <div className={`text-base font-black font-mono mt-0.5 ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                    {isProfit ? "+" : ""}${formatMoney(pnl)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    PF: {data.stats?.profitFactor ?? "0.00"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="text-[10px] text-purple-300 font-medium">Điểm Kỷ Luật AI</div>
                  <div className="text-base font-black text-purple-300 font-mono mt-0.5 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>{data.audit?.disciplineScore ?? 10} / 10</span>
                  </div>
                  <div className="text-[10px] text-purple-400/80 mt-0.5">
                    Chẩn đoán theo 50 chương
                  </div>
                </div>
              </div>

              {/* SECTION 2: TABLE OF TODAY'S TRADES */}
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-sky-400" />
                  <span>Danh Sách Lệnh Khớp Trong Ngày ({(data.trades || []).length})</span>
                </h4>

                {(data.trades || []).length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-[#070a12] rounded-xl border border-slate-800">
                    Hôm nay bạn chưa mở hoặc đóng lệnh nào. Rất tốt nếu bạn đang kiên nhẫn đứng ngoài thị trường!
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#070a12]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#05080f] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                          <tr>
                            <th className="py-2 px-3">Coin / Chiều</th>
                            <th className="py-2 px-3">Giá Vào</th>
                            <th className="py-2 px-3">Giá Exit</th>
                            <th className="py-2 px-3">Quy Mô</th>
                            <th className="py-2 px-3">PnL ($ / %)</th>
                            <th className="py-2 px-3 text-right">Trạng Thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {(data.trades || []).map((t) => {
                            const tPnl = Number(t.pnl_amount) || 0;
                            const isWin = t.status === "WIN" || tPnl > 0;
                            const isLoss = t.status === "LOSS" || tPnl < 0;

                            return (
                              <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white">{t.coin}</span>
                                    <span
                                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                                        t.type.includes("LONG") || t.type.includes("BUY")
                                          ? "bg-emerald-500/20 text-emerald-400"
                                          : "bg-rose-500/20 text-rose-400"
                                      }`}
                                    >
                                      {t.type}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2 px-3">${formatCoinPrice(t.entry_price)}</td>
                                <td className="py-2 px-3 text-slate-400">{t.exit_price ? `$${formatCoinPrice(t.exit_price)}` : "-"}</td>
                                <td className="py-2 px-3">${formatMoney(t.position_size)}</td>
                                <td className="py-2 px-3">
                                  <span className={`font-bold ${isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-slate-300"}`}>
                                    {tPnl >= 0 ? "+" : ""}${formatMoney(tPnl)}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span
                                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                      t.status === "WIN"
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : t.status === "LOSS"
                                        ? "bg-rose-500/20 text-rose-400"
                                        : t.status === "OPEN"
                                        ? "bg-sky-500/20 text-sky-400"
                                        : "bg-slate-800 text-slate-400"
                                    }`}
                                  >
                                    {t.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: AI DISCIPLINE DIAGNOSIS */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#0e111d] to-[#070a12] border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Chẩn Đoán Kỷ Luật & Tâm Lý Của Hội Đồng AI</span>
                </div>

                {/* Strengths */}
                {data.audit?.strengths && data.audit.strengths.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-emerald-400 mb-1">
                      ✅ Điểm Tích Cực Trong Phiên:
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {data.audit.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 shrink-0">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {data.audit?.weaknesses && data.audit.weaknesses.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-rose-400 mb-1">
                      ⚠️ Điểm Cần Khắc Phục / Cảnh Báo:
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {data.audit.weaknesses.map((w, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400 shrink-0">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lessons */}
                {data.audit?.lessons && data.audit.lessons.length > 0 && (
                  <div className="pt-1 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-amber-400 mb-1">
                      💡 Bài Học Đúc Kết Cho Phiên Ngày Mai:
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {data.audit.lessons.map((l, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 shrink-0">•</span>
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-[#070a12] border-t border-slate-800">
          <div className="text-xs">
            {savedSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4" />
                Đã ghim bài học này vào Tab "Sổ Tay Ghi Chú & Kỷ Luật"!
              </span>
            ) : (
              <span className="text-slate-500 text-[11px]">
                💡 Bấm lưu để tự động ghim bản đúc kết này vào Sổ Tay Ghi Chú
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveToNote}
              disabled={savingNote || savedSuccess || !data}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                savedSuccess
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 disabled:opacity-50"
              }`}
            >
              {savingNote ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Lưu...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Đã Lưu Vào Sổ Tay</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lưu Vào Sổ Tay Ghi Chú</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
