import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  History,
  Rocket,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  Trash2,
  CheckCircle2,
  AlertOctagon,
  Percent,
  TrendingUp,
  DollarSign,
  Scale,
  Sparkles
} from "lucide-react";
import { AiReviewPeriod, TradeReviewResult, SavedTradeReview } from "../../types";
import { JournalApi } from "../../services/api";

interface AuditorTabProps {
  onOpenHistory: () => void;
  livePrices: Record<string, number>;
}

const PERIOD_PILLS: { id: AiReviewPeriod; label: string }[] = [
  { id: "TODAY", label: "⚡ Hôm Nay (24h)" },
  { id: "WEEK", label: "📅 Tuần Này (7 Ngày)" },
  { id: "MONTH", label: "🗓️ Tháng Này (30 Ngày)" },
  { id: "YEAR", label: "🏛️ Năm Nay (2026)" },
  { id: "ALL", label: "✨ Toàn Bộ Lịch Sử" },
  { id: "CUSTOM", label: "⚙️ Tùy Chỉnh Ngày" },
];

export const AuditorTab: React.FC<AuditorTabProps> = ({ onOpenHistory, livePrices }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<AiReviewPeriod>("WEEK");
  const [coinFilter, setCoinFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reviewResult, setReviewResult] = useState<TradeReviewResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // AI Coach Chat
  const [coachMessages, setCoachMessages] = useState<Array<{ sender: "user" | "coach"; text: string }>>([]);
  const [coachInput, setCoachInput] = useState<string>("");
  const [coachLoading, setCoachLoading] = useState<boolean>(false);
  const [coachCollapsed, setCoachCollapsed] = useState<boolean>(true);

  const handleRunAudit = async () => {
    setLoading(true);
    try {
      const res = await JournalApi.runAiReview({
        periodType: selectedPeriod,
        coinFilter,
        startDate: selectedPeriod === "CUSTOM" ? startDate : undefined,
        endDate: selectedPeriod === "CUSTOM" ? endDate : undefined,
        save: true,
        livePrices,
      });

      if (res.success && res.review) {
        setReviewResult(res.review);
      }
    } catch (err: any) {
      alert("Lỗi chẩn đoán kỷ luật: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCoach = async () => {
    const prompt = coachInput.trim();
    if (!prompt) return;

    setCoachMessages((prev) => [...prev, { sender: "user", text: prompt }]);
    setCoachInput("");
    setCoachLoading(true);

    try {
      const res = await JournalApi.sendCoachChat(prompt, livePrices);
      const reply = res.output || res.response || "Đã nhận phân tích từ AI Coach.";
      setCoachMessages((prev) => [...prev, { sender: "coach", text: reply }]);
    } catch (err: any) {
      setCoachMessages((prev) => [
        ...prev,
        { sender: "coach", text: `⚠️ Không thể phản hồi: ${err.message}` },
      ]);
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. AUDITOR MASTER CARD */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-sky-400 border border-blue-500/30 font-mono tracking-wider">
                RULE-BASED EXPERT ENGINE
              </span>
              <span className="text-xs text-slate-400">Chuẩn 12 Chương Giáo Trình</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>🛡️</span> AUDITOR CHẨN ĐOÁN KỶ LUẬT GIAO DỊCH
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rà soát toàn diện: Stop Loss bắt buộc, Tỷ lệ R:R ≥ 1:2, Overtrading, Revenge Trading & Tính toán Live PnL Binance.
            </p>
          </div>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors shadow-sm"
          >
            <History className="w-4 h-4 text-sky-400" />
            <span>Lịch Sử Review</span>
          </button>
        </div>

        {/* Period Selector Pills */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2.5">
            ⏱️ 1. Chọn mốc thời gian muốn rà soát:
          </label>
          <div className="flex flex-wrap gap-2">
            {PERIOD_PILLS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedPeriod === p.id
                    ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                    : "bg-[#070a12] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters & Launch Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3">
            {selectedPeriod === "CUSTOM" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Từ:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#070a12] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
                <span className="text-xs text-slate-400 font-semibold">Đến:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#070a12] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Lọc Coin:</span>
              <select
                value={coinFilter}
                onChange={(e) => setCoinFilter(e.target.value)}
                className="bg-[#070a12] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">Tất cả các Coin</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="SOL">SOL (Solana)</option>
                <option value="BNB">BNB (Binance)</option>
                <option value="SUI">SUI (Sui)</option>
                <option value="DOGE">DOGE</option>
                <option value="XRP">XRP</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30"
          >
            <Rocket className="w-4 h-4" />
            <span>{loading ? "Đang Rà Soát..." : "Kích Hoạt Chẩn Đoán Kỷ Luật"}</span>
          </button>
        </div>

        {/* 2. STATE CONTAINER (Placeholder, Loading, or Results) */}
        {loading ? (
          <div className="text-center py-20 bg-[#070a12] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h4 className="text-base font-bold text-white">Đang rà soát dữ liệu nhật ký & kiểm tra checklist kỷ luật...</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Đang tính toán Stop Loss, R:R, tần suất vào lệnh và quét dấu hiệu tâm lý giao dịch trả thù...
            </p>
          </div>
        ) : reviewResult ? (
          <div className="space-y-6 pt-2">
            {/* Score & Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Discipline Score Gauge */}
              <div className="md:col-span-1 bg-[#070a12] border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <div className="text-xs font-bold text-slate-400 mb-2">ĐIỂM KỶ LUẬT KÉP</div>
                <div
                  className={`text-4xl font-black font-mono my-1 ${
                    reviewResult.disciplineScore >= 80
                      ? "text-emerald-400"
                      : reviewResult.disciplineScore >= 50
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {reviewResult.disciplineScore}
                  <span className="text-sm text-slate-500 font-normal">/100</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  {reviewResult.disciplineScore >= 80
                    ? "🌟 Kỷ Luật Rất Tốt"
                    : reviewResult.disciplineScore >= 50
                    ? "⚠️ Cần Cải Thiện"
                    : "🚨 Cảnh Báo Vi Phạm"}
                </div>
              </div>

              {/* Stats Summary Row */}
              <div className="md:col-span-3 grid grid-cols-3 gap-3">
                <div className="bg-[#070a12] border border-slate-800 rounded-2xl p-4 flex flex-col justify-center">
                  <div className="text-[11px] font-semibold text-slate-400">Tổng Số Lệnh Rà Soát</div>
                  <div className="text-xl font-black font-mono text-white mt-1">
                    {reviewResult.totalTrades}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Thời gian: {reviewResult.periodType}</div>
                </div>

                <div className="bg-[#070a12] border border-slate-800 rounded-2xl p-4 flex flex-col justify-center">
                  <div className="text-[11px] font-semibold text-slate-400">Tỷ Lệ Thắng (Win Rate)</div>
                  <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                    {typeof reviewResult.winRate === "number" ? `${reviewResult.winRate.toFixed(1)}%` : String(reviewResult.winRate || "0%")}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Win / Loss</div>
                </div>

                <div className="bg-[#070a12] border border-slate-800 rounded-2xl p-4 flex flex-col justify-center">
                  <div className="text-[11px] font-semibold text-slate-400">Tổng Lợi Nhuận ($)</div>
                  <div
                    className={`text-xl font-black font-mono mt-1 ${
                      (Number(reviewResult.totalPnl) || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {(Number(reviewResult.totalPnl) || 0) >= 0 ? "+" : ""}${(Number(reviewResult.totalPnl) || 0).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Profit Factor: {String(reviewResult.profitFactor || "0.00")}</div>
                </div>
              </div>
            </div>

            {/* Checklist Violations Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#070a12] border border-slate-800 p-3.5 rounded-xl">
                <div className="text-[11px] text-slate-400 font-semibold">Lệnh Thiếu Stop Loss</div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
                    reviewResult.checklistAnalysis?.missingSlCount > 0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {reviewResult.checklistAnalysis?.missingSlCount || 0} Lệnh
                </div>
              </div>

              <div className="bg-[#070a12] border border-slate-800 p-3.5 rounded-xl">
                <div className="text-[11px] text-slate-400 font-semibold">Tỷ Lệ R:R &lt; 1:2</div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
                    reviewResult.checklistAnalysis?.badRrCount > 0 ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {reviewResult.checklistAnalysis?.badRrCount || 0} Lệnh
                </div>
              </div>

              <div className="bg-[#070a12] border border-slate-800 p-3.5 rounded-xl">
                <div className="text-[11px] text-slate-400 font-semibold">Ngày Vào Lệnh Quá Mức</div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
                    reviewResult.checklistAnalysis?.overtradingDays > 0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {reviewResult.checklistAnalysis?.overtradingDays || 0} Ngày
                </div>
              </div>

              <div className="bg-[#070a12] border border-slate-800 p-3.5 rounded-xl">
                <div className="text-[11px] text-slate-400 font-semibold">Dấu Hiệu Trả Thù (Revenge)</div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
                    reviewResult.checklistAnalysis?.revengeTradeCount > 0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {reviewResult.checklistAnalysis?.revengeTradeCount || 0} Lần
                </div>
              </div>
            </div>

            {/* Recommendations Box */}
            {reviewResult.recommendations && reviewResult.recommendations.length > 0 && (
              <div className="bg-[#070a12] border border-blue-500/30 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="text-xs sm:text-sm font-extrabold text-sky-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Khuyến Nghị Khắc Phục Từ Auditor (Chuẩn 12 Chương):</span>
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-200">
                  {reviewResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-sky-400 mt-1">•</span>
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#070a12] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-sky-400 mx-auto text-2xl">
              🛡️
            </div>
            <h4 className="text-base font-bold text-white">Hệ thống Auditor sẵn sàng chẩn đoán</h4>
            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              Hệ thống sẽ đối chiếu 100% dữ liệu nhật ký lệnh với 12 Chương Giáo trình Crypto: phát hiện lệnh thiếu Stop Loss, R:R &lt; 1:2, Overtrading và tâm lý trả thù (Revenge Trading).
            </p>
            <button
              onClick={handleRunAudit}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/30"
            >
              ⚡ Bắt Đầu Chẩn Đoán Ngay ({PERIOD_PILLS.find((p) => p.id === selectedPeriod)?.label})
            </button>
          </div>
        )}
      </div>

      {/* 3. COLLAPSIBLE AI TRADE COACH CONSOLE */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div
          onClick={() => setCoachCollapsed(!coachCollapsed)}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-sky-400 flex items-center gap-1.5">
                <span>🧠</span> Tham Vấn Trực Tiếp Cùng AI Trade Coach
              </div>
              <div className="text-[11px] text-slate-400">
                Phân tích lệnh đã vào, lệnh đang mở và tâm lý kỷ luật thời gian thực
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCoachMessages([]);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              Xóa Chat
            </button>
            {coachCollapsed ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          </div>
        </div>

        {!coachCollapsed && (
          <div className="p-4 sm:p-5 pt-0 border-t border-slate-800/80 space-y-3.5 animate-fadeIn">
            {/* Chat message box */}
            <div className="h-64 overflow-y-auto bg-[#070a12] border border-slate-800 rounded-xl p-3.5 space-y-3">
              {coachMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs sm:text-sm">
                  🤖 Hãy đặt câu hỏi cho AI Trade Coach về các lệnh đã vào, lệnh đang mở, hoặc cách khắc phục lỗi tâm lý (Ví dụ: "Đánh giá chi tiết lệnh BTC #1 của tôi", "Lệnh ETH đang lãi có nên chốt không?")...
                </div>
              ) : (
                coachMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {coachLoading && (
                <div className="flex items-center gap-2 text-xs text-sky-400 italic">
                  <div className="w-3 h-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin"></div>
                  <span>AI Trade Coach đang phân tích dữ liệu lệnh...</span>
                </div>
              )}
            </div>

            {/* Input Toolbar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendCoach();
                }}
                placeholder="Nhập câu hỏi tham vấn cho AI Coach (Ví dụ: Lệnh #1 của tôi sai ở đâu?)..."
                className="flex-1 bg-[#070a12] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={handleSendCoach}
                disabled={coachLoading || !coachInput.trim()}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition-colors flex items-center gap-1.5 shrink-0 shadow-md shadow-blue-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
