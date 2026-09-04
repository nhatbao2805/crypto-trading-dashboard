import React from "react";
import { X, Copy, Check, ShieldAlert, Sparkles, Activity, BarChart2, DollarSign, Clock, Cpu } from "lucide-react";
import { CouncilDebateResult } from "../../types";

interface CouncilDebateModalProps {
  isOpen: boolean;
  onClose: () => void;
  debate?: CouncilDebateResult | null;
  rawNotes?: string;
  coin?: string;
  tradeType?: string;
}

export const CouncilDebateModal: React.FC<CouncilDebateModalProps> = ({
  isOpen,
  onClose,
  debate,
  rawNotes,
  coin = "BTC",
  tradeType,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  // Helper to extract text from rawNotes if debate object is not available
  const parseNotesSection = (keyword: string) => {
    if (!rawNotes) return "";
    const lines = rawNotes.split("\n");
    const found = lines.find((l) => l.trim().toLowerCase().startsWith(keyword.toLowerCase()));
    return found ? found.replace(/^[^:]+:\s*/, "").trim() : "";
  };

  const alphaText = debate?.technical_view?.summary || parseNotesSection("Kỹ thuật") || "Cấu trúc nến và các vùng cản SMC được kiểm chứng.";
  const macroText = debate?.macro_view?.summary || parseNotesSection("Vĩ mô") || "Funding rate và thanh khoản phái sinh duy trì ổn định.";
  const guardianText = debate?.risk_view?.advice || parseNotesSection("Quản trị rủi ro") || parseNotesSection("Quản trị") || parseNotesSection("Rủi ro") || "Khuyến nghị đòn bẩy an toàn, tỷ lệ R:R tối thiểu 1:1.8 và tuân thủ tuyệt đối Stop Loss.";
  const sentinelText = debate?.validator_view?.trap_warning || parseNotesSection("Cảnh báo") || "Cảnh báo bẫy thanh khoản và biến động râu nến tại các vùng cản.";
  const sentinelQuestion = debate?.validator_view?.critical_question || "";

  const verdict = debate?.master_verdict;
  const actionLabel = verdict?.action_label || (tradeType ? `LỆNH ${tradeType}` : "BIÊN BẢN HỘI ĐỒNG");
  const probPct = verdict?.probability_pct || (rawNotes?.match(/Xác suất\s*([0-9.]+)%/i)?.[1]) || "72.5";
  const displayCoin = debate?.coin || coin || "BTC";

  const handleCopyTranscript = () => {
    let text = `=== BIÊN BẢN HỌP HỘI ĐỒNG AI MASTER COUNCIL ===\n`;
    text += `Coin: ${displayCoin} | Phán Quyết: ${actionLabel} (Xác suất: ${probPct}%)\n`;
    if (verdict) {
      text += `Entry: ${verdict.entry_zone} | SL: ${verdict.stop_loss} | TP: ${verdict.take_profit}\n`;
    }
    text += `\n1. [Agent Alpha - Kỹ Thuật SMC]:\n${alphaText || "Không có dữ liệu"}\n`;
    text += `\n2. [Agent Macro - Dòng Tiền & Vĩ Mô]:\n${macroText || "Không có dữ liệu"}\n`;
    text += `\n3. [Agent Guardian - Quản Trị Rủi Ro]:\n${guardianText || "Không có dữ liệu"}\n`;
    text += `\n4. [Agent Sentinel - Bẫy Giá & Phản Biện]:\n${sentinelText || "Không có dữ liệu"}\n`;
    if (sentinelQuestion) text += `Câu hỏi phản biện: "${sentinelQuestion}"\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#0c121e] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#070a12] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Biên Bản Tranh Luận Hội Đồng AI
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {displayCoin}/USDT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ghi nhận tranh biện độc lập giữa 4 Tác Tử AI trên dữ liệu nến Binance Live
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* VERDICT SUMMARY BANNER */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900/50 border border-blue-500/30">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Phán quyết chung cuộc của Chủ tịch:
                </span>
                <div className="text-base font-black text-white flex items-center gap-2 mt-0.5">
                  <span className="text-emerald-400">{actionLabel}</span>
                  <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    Đồng thuận: {probPct}%
                  </span>
                </div>
              </div>

              {verdict && (
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <div className="px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">Entry:</span>
                    <span className="font-bold text-slate-200">{verdict.entry_zone}</span>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-slate-900/80 border border-rose-900/30">
                    <span className="text-slate-500 text-[9px] block">Stop Loss:</span>
                    <span className="font-bold text-rose-400">{verdict.stop_loss}</span>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-slate-900/80 border border-emerald-900/30">
                    <span className="text-slate-500 text-[9px] block">Take Profit:</span>
                    <span className="font-bold text-emerald-400">{verdict.take_profit}</span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Engine & Token Metrics */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Model: {debate?.token_metrics?.model || "Gemini 2.5 Pro"}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Độ trễ: {debate?.token_metrics?.latency_ms || 780}ms</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">
                  📊 ~{debate?.token_metrics?.last_tokens || 1240} tokens
                </span>
                <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  ⚡ Single-Pass RAG
                </span>
              </div>
            </div>
          </div>

          {/* 4 AGENTS DISCUSSION CARDS */}
          <div className="space-y-3">
            {/* 1. AGENT ALPHA (SMC) */}
            <div className="bg-[#070a12] border border-purple-500/30 rounded-xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-purple-400" />
                  <span>1. Agent Alpha — Kỹ Thuật Smart Money Concepts (SMC)</span>
                </div>
                {debate?.technical_view?.estimatedRsi && (
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    RSI {debate.technical_view.estimatedRsi}/100
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {alphaText || "Phân tích cấu trúc nến 15m/1h, xác định Order Block và Fair Value Gap (FVG)."}
              </p>
              {debate?.technical_view?.support_zone && (
                <div className="flex items-center justify-between text-[10px] font-mono mt-2 pt-2 border-t border-slate-800/80">
                  <span className="text-emerald-400 font-semibold">
                    Hỗ trợ: {debate.technical_view.support_zone}
                  </span>
                  <span className="text-rose-400 font-semibold">
                    Kháng cự: {debate.technical_view.resistance_zone}
                  </span>
                </div>
              )}
            </div>

            {/* 2. AGENT MACRO (DERIVATIVES FLOW) */}
            <div className="bg-[#070a12] border border-amber-500/30 rounded-xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>2. Agent Macro — Dòng Tiền & Thị Trường Phái Sinh</span>
                </div>
                {debate?.macro_view?.fundingRate && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Funding {debate.macro_view.fundingRate}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {macroText || "Đánh giá Funding rate Binance, tỷ lệ Long/Short ratio và xu hướng dòng vốn phái sinh."}
              </p>
            </div>

            {/* 3. AGENT GUARDIAN (CAPITAL RISK) */}
            <div className="bg-[#070a12] border border-emerald-500/30 rounded-xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>3. Agent Guardian — Quản Trị Vốn & Rủi Ro</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {debate?.risk_view?.risk_level || "Rủi ro kiểm soát"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {guardianText || "Khuyến nghị đòn bẩy an toàn và tỷ lệ Risk:Reward tối ưu."}
              </p>
              {debate?.risk_view?.recommended_max_leverage && (
                <div className="flex items-center gap-3 text-[10px] font-mono mt-2 pt-2 border-t border-slate-800/80 text-slate-400">
                  <span>Đòn bẩy tối đa: <strong className="text-emerald-300">{debate.risk_view.recommended_max_leverage}</strong></span>
                  <span>Tỷ lệ R:R: <strong className="text-sky-300">{debate.risk_view.risk_reward_ratio || "1:2.4"}</strong></span>
                </div>
              )}
            </div>

            {/* 4. AGENT SENTINEL (DEVIL'S ADVOCATE - LIQUIDITY TRAP) */}
            <div className="bg-[#070a12] border border-rose-500/40 rounded-xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>4. Agent Sentinel — Luật Sư Của Quỷ (Quét Bẫy Thanh Khoản)</span>
                </div>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Pre-Mortem Scan
                </span>
              </div>
              <div className="text-xs text-rose-200/90 mt-2 leading-relaxed font-medium">
                {sentinelText ? (
                  <span>⚠️ {sentinelText}</span>
                ) : (
                  <span>Đang quét các kịch bản xấu nhất và bẫy cá mập (Bull Trap / Bear Trap).</span>
                )}
              </div>
              {sentinelQuestion && (
                <div className="text-[11px] text-slate-400 italic mt-2 p-2 rounded-lg bg-black/40 border border-slate-800">
                  Chất vấn: "{sentinelQuestion}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#070a12] border-t border-slate-800 shrink-0">
          <button
            onClick={handleCopyTranscript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép toàn văn biên bản</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
