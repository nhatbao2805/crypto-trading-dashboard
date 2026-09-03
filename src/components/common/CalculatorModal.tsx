import React, { useState } from "react";
import { Calculator, X, ShieldAlert, ArrowRight, DollarSign, Percent } from "lucide-react";

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [capital, setCapital] = useState<number>(1000);
  const [riskPct, setRiskPct] = useState<number>(1.0);
  const [entry, setEntry] = useState<number>(100);
  const [sl, setSl] = useState<number>(95);
  const [tp, setTp] = useState<number>(110);

  if (!isOpen) return null;

  const riskAmount = (capital * riskPct) / 100;
  const slDistance = Math.abs(entry - sl);
  const slDistPct = entry > 0 ? (slDistance / entry) * 100 : 0;
  const positionSize = slDistance > 0 && entry > 0 ? riskAmount / (slDistance / entry) : 0;
  const tpDistance = Math.abs(tp - entry);
  const rrRatio = slDistance > 0 && tp > 0 ? (tpDistance / slDistance).toFixed(2) : "0.00";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-sky-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Máy Tính Quản Lý Vốn 1-2%</h3>
              <p className="text-xs text-slate-400">Chuẩn Chương 9.1 & 9.2 Giáo Trình Crypto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Tổng Vốn Tài Khoản ($ Capital)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={capital || ""}
                  onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  placeholder="1000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                % Rủi Ro / 1 Lệnh (Chuẩn 1% - 2%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={riskPct || ""}
                  onChange={(e) => setRiskPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  placeholder="1.0"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Giá Vào (Entry)</label>
              <input
                type="number"
                step="any"
                value={entry || ""}
                onChange={(e) => setEntry(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-2.5 py-2 text-slate-100 font-mono text-xs sm:text-sm focus:outline-none focus:border-sky-500"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Cắt Lỗ (SL)</label>
              <input
                type="number"
                step="any"
                value={sl || ""}
                onChange={(e) => setSl(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-2.5 py-2 text-rose-400 font-mono text-xs sm:text-sm focus:outline-none focus:border-rose-500"
                placeholder="95"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Chốt Lời (TP)</label>
              <input
                type="number"
                step="any"
                value={tp || ""}
                onChange={(e) => setTp(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-2.5 py-2 text-emerald-400 font-mono text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                placeholder="110"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="bg-[#070a12] border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Số tiền mất tối đa nếu dính SL:</span>
              <span className="font-mono font-bold text-rose-400">${riskAmount.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Khoảng cách Stop Loss:</span>
              <span className="font-mono font-bold text-slate-200">
                {slDistPct.toFixed(2)}% (${slDistance.toFixed(2)})
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-slate-800/80">
              <span className="text-slate-300 font-semibold">Khối lượng vị thế nên vào ($ Position Size):</span>
              <span className="font-mono font-extrabold text-emerald-400 text-base sm:text-lg">
                ${positionSize.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Tỷ lệ Lợi Nhuận / Rủi Ro (R:R):</span>
              <span
                className={`font-mono font-bold ${
                  parseFloat(rrRatio) >= 2 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                1 : {rrRatio} {parseFloat(rrRatio) >= 2 ? "✅ Đạt chuẩn" : "⚠️ Cần cân nhắc (chuẩn ≥ 1:2)"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Đóng Máy Tính
          </button>
        </div>
      </div>
    </div>
  );
};
