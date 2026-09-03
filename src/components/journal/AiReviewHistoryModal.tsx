import React, { useState, useEffect } from "react";
import { X, History, Trash2, Calendar, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { SavedTradeReview, TradeReviewResult } from "../../types";
import { JournalApi } from "../../services/api";

interface AiReviewHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReview: (review: TradeReviewResult) => void;
}

export const AiReviewHistoryModal: React.FC<AiReviewHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectReview,
}) => {
  const [history, setHistory] = useState<SavedTradeReview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      JournalApi.getAiReviewHistory()
        .then((res) => {
          setHistory(res.history || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (id: number) => {
    try {
      await JournalApi.deleteAiReview(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err: any) {
      alert("Lỗi xóa review: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-sky-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Lịch Sử Các Bản Phân Tích AI Review Đã Lưu</h3>
              <p className="text-xs text-slate-400">Xem lại các lần chẩn đoán kỷ luật quá khứ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Đang tải lịch sử...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">Chưa có bản phân tích AI Review nào được lưu.</div>
          ) : (
            history.map((item) => {
              let parsedData: TradeReviewResult | null = null;
              if (typeof item.analysis_data === "object") {
                parsedData = item.analysis_data;
              } else if (typeof item.analysis_data === "string") {
                try {
                  parsedData = JSON.parse(item.analysis_data);
                } catch {}
              }

              return (
                <div
                  key={item.id}
                  className="bg-[#070a12] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-sky-400">
                        {item.period_type || "ALL"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        • {item.total_trades} Lệnh
                      </span>
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          item.discipline_score >= 80
                            ? "bg-emerald-500/20 text-emerald-300"
                            : item.discipline_score >= 50
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        Điểm Kỷ Luật: {item.discipline_score}/100
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Tạo lúc: {new Date(item.created_at).toLocaleString("vi-VN")}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {parsedData && (
                      <button
                        onClick={() => {
                          onSelectReview(parsedData!);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-colors"
                      >
                        Xem Lại
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
