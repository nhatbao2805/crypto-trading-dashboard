import React, { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon, Trash2, CheckSquare, Sparkles } from "lucide-react";
import { TradeEntry, TradeType, TradeStatus } from "../../types";
import { UploadApi } from "../../services/api";

interface TradeFormModalProps {
  isOpen: boolean;
  initialData?: TradeEntry | null;
  onClose: () => void;
  onSave: (data: Partial<TradeEntry>) => Promise<void>;
}

const CHECKLIST_RULES = [
  "Đã phân tích Đa khung 4H ➔ 1H ➔ 15M (Chương 7)",
  "Đã đặt Stop Loss dưới râu nến (Chương 4 & 9)",
  "Tỷ lệ R:R ≥ 1:2 (Chương 9.2)",
  "Không FOMO/FUD/Giao dịch trả thù (Chương 9.3)",
  "Đã kiểm tra Volume nến (Chương 8.1)",
];

export const TradeFormModal: React.FC<TradeFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState<string>("");
  const [coin, setCoin] = useState<string>("BTC");
  const [type, setType] = useState<TradeType>("LONG");
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [exitPrice, setExitPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);
  const [positionSize, setPositionSize] = useState<number>(1000);
  const [pnlAmount, setPnlAmount] = useState<number>(0);
  const [pnlPercent, setPnlPercent] = useState<number>(0);
  const [status, setStatus] = useState<TradeStatus>("OPEN");
  const [notes, setNotes] = useState<string>("");
  const [rulesChecked, setRulesChecked] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date || new Date().toISOString().split("T")[0]);
      setCoin((initialData.coin || "BTC").toUpperCase());
      setType(initialData.type || "LONG");
      setEntryPrice(initialData.entry_price || 0);
      setExitPrice(initialData.exit_price || 0);
      setStopLoss(initialData.stop_loss || 0);
      setTakeProfit(initialData.take_profit || 0);
      setPositionSize(initialData.position_size || 1000);
      setPnlAmount(initialData.pnl_amount || 0);
      setPnlPercent(initialData.pnl_percent || 0);
      setStatus(initialData.status || "OPEN");
      setNotes(initialData.notes || "");

      let rules: string[] = [];
      if (Array.isArray(initialData.rules_checked)) {
        rules = initialData.rules_checked;
      } else if (typeof initialData.rules_checked === "string") {
        try {
          rules = JSON.parse(initialData.rules_checked);
        } catch {}
      }
      setRulesChecked(rules);

      let imgs: string[] = [];
      if (Array.isArray(initialData.images)) {
        imgs = initialData.images;
      } else if (typeof initialData.images === "string") {
        try {
          imgs = JSON.parse(initialData.images);
        } catch {}
      }
      setImages(imgs);
    } else {
      // Defaults for new entry
      setDate(new Date().toISOString().split("T")[0]);
      setCoin("BTC");
      setType("LONG");
      setEntryPrice(0);
      setExitPrice(0);
      setStopLoss(0);
      setTakeProfit(0);
      setPositionSize(1000);
      setPnlAmount(0);
      setPnlPercent(0);
      setStatus("OPEN");
      setNotes("");
      setRulesChecked([
        "Đã phân tích Đa khung 4H ➔ 1H ➔ 15M (Chương 7)",
        "Đã đặt Stop Loss dưới râu nến (Chương 4 & 9)",
        "Tỷ lệ R:R ≥ 1:2 (Chương 9.2)",
      ]);
      setImages([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Auto-calculate PnL Preview when entry/exit or size changes
  const handleCalculatePnlPreview = () => {
    if (entryPrice > 0 && exitPrice > 0) {
      const isShort = type.includes("SHORT") || type.includes("SELL");
      const pct = isShort
        ? ((entryPrice - exitPrice) / entryPrice) * 100
        : ((exitPrice - entryPrice) / entryPrice) * 100;
      const amt = positionSize > 0 ? positionSize * (pct / 100) : 0;

      setPnlPercent(Number(pct.toFixed(2)));
      setPnlAmount(Number(amt.toFixed(2)));

      if (amt > 0) setStatus("WIN");
      else if (amt < 0) setStatus("LOSS");
      else setStatus("BREAKEVEN");
    }
  };

  const handleToggleRule = (rule: string) => {
    if (rulesChecked.includes(rule)) {
      setRulesChecked(rulesChecked.filter((r) => r !== rule));
    } else {
      setRulesChecked([...rulesChecked, rule]);
    }
  };

  // Upload helper for Base64 image
  const processBase64Upload = async (base64Data: string) => {
    setUploading(true);
    try {
      const res = await UploadApi.uploadBase64(base64Data);
      if (res.success && res.url) {
        setImages((prev) => [...prev, res.url]);
      }
    } catch (err: any) {
      alert("Lỗi tải ảnh: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (uploadEvent) => {
            if (uploadEvent.target?.result) {
              processBase64Upload(uploadEvent.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          processBase64Upload(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(files[i]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        date,
        coin: coin.toUpperCase().trim(),
        type,
        entry_price: entryPrice,
        exit_price: exitPrice || 0,
        stop_loss: stopLoss || 0,
        take_profit: takeProfit || 0,
        position_size: positionSize || 1000,
        pnl_amount: pnlAmount || 0,
        pnl_percent: pnlPercent || 0,
        status,
        notes,
        rules_checked: rulesChecked,
        images,
      });
      onClose();
    } catch (err: any) {
      alert("Lỗi lưu lệnh: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const slDistance = entryPrice > 0 && stopLoss > 0 ? Math.abs(entryPrice - stopLoss) : 0;
  const slPct = entryPrice > 0 && stopLoss > 0 ? ((slDistance / entryPrice) * 100).toFixed(2) : null;
  const tpDistance = entryPrice > 0 && takeProfit > 0 ? Math.abs(takeProfit - entryPrice) : 0;
  const tpPct = entryPrice > 0 && takeProfit > 0 ? ((tpDistance / entryPrice) * 100).toFixed(2) : null;
  const computedRr = slDistance > 0 && tpDistance > 0 ? (tpDistance / slDistance).toFixed(1) : null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 bg-black/85 backdrop-blur-md flex justify-center items-start sm:items-center animate-fadeIn"
      onPaste={handlePaste}
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#0c121e] border border-slate-800 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col my-auto">
        {/* Sticky Header - Never cut off */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 bg-[#070a12] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  {initialData?.id ? `Chỉnh Sửa Lệnh #${initialData.id}` : "Thêm Lệnh Trade Mới"}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {coin}/USDT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Quản trị vốn 1-2% & Kiểm tra checklist hợp lưu chuẩn giáo trình
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-5 space-y-4 text-xs sm:text-sm">
            {/* Row 1: Date, Coin, Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Ngày Vào Lệnh
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#070a12] border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mã Đồng Coin
                </label>
                <input
                  type="text"
                  required
                  placeholder="BTC, ETH, SOL..."
                  value={coin}
                  onChange={(e) => setCoin(e.target.value.toUpperCase())}
                  className="w-full bg-[#070a12] border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-slate-100 font-mono uppercase font-bold focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Vị Thế (Position)
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TradeType)}
                  className="w-full bg-[#070a12] border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-slate-100 font-semibold focus:outline-none transition-colors"
                >
                  <option value="LONG">🟢 LONG (Mua Tăng)</option>
                  <option value="SHORT">🔴 SHORT (Bán Giảm)</option>
                  <option value="SPOT_BUY">🔵 SPOT BUY (Giao Ngay)</option>
                  <option value="SPOT_SELL">⚪ SPOT SELL (Bán Spot)</option>
                </select>
              </div>
            </div>

            {/* Row 2: Entry, SL, TP, Size */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Giá Vào (Entry)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={entryPrice || ""}
                    onChange={(e) => {
                      setEntryPrice(parseFloat(e.target.value) || 0);
                      handleCalculatePnlPreview();
                    }}
                    className="w-full bg-[#070a12] border border-slate-800 focus:border-sky-500 rounded-xl pl-6 pr-2.5 py-2 text-slate-100 font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1.5">
                  Cắt Lỗ (Stop Loss)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-rose-500/70 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={stopLoss || ""}
                    onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#070a12] border border-rose-500/40 focus:border-rose-500 rounded-xl pl-6 pr-2.5 py-2 text-rose-300 font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                  Chốt Lời (Take Profit)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-500/70 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={takeProfit || ""}
                    onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#070a12] border border-emerald-500/40 focus:border-emerald-500 rounded-xl pl-6 pr-2.5 py-2 text-emerald-300 font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Khối Lượng ($ Size)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="1000"
                    value={positionSize || ""}
                    onChange={(e) => {
                      setPositionSize(parseFloat(e.target.value) || 0);
                      handleCalculatePnlPreview();
                    }}
                    className="w-full bg-[#070a12] border border-slate-800 focus:border-sky-500 rounded-xl pl-6 pr-2.5 py-2 text-slate-100 font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* LIVE R:R & SL/TP METRICS BAR */}
            {entryPrice > 0 && (stopLoss > 0 || takeProfit > 0) && (
              <div className="bg-[#070a12] p-3 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">Tỷ Lệ Risk : Reward:</span>
                  {computedRr ? (
                    <span
                      className={`px-2 py-0.5 rounded-lg font-mono font-extrabold text-xs ${
                        Number(computedRr) >= 1.8
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      1 : {computedRr}
                    </span>
                  ) : (
                    <span className="text-slate-500 font-mono">-</span>
                  )}
                  {computedRr && Number(computedRr) < 1.8 && (
                    <span className="text-[10px] font-semibold text-amber-400">⚠️ Thấp hơn chuẩn (&lt; 1:1.8)</span>
                  )}
                  {computedRr && Number(computedRr) >= 1.8 && (
                    <span className="text-[10px] font-semibold text-emerald-400">✨ Đạt chuẩn giáo trình</span>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
                  {slPct && (
                    <span>
                      Cắt lỗ: <strong className="text-rose-400">-{slPct}%</strong> (${slDistance.toFixed(2)})
                    </span>
                  )}
                  {tpPct && (
                    <span>
                      Chốt lời: <strong className="text-emerald-400">+{tpPct}%</strong> (${tpDistance.toFixed(2)})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Row 3: Status & PnL Results */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#070a12] p-3.5 rounded-xl border border-slate-800">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Trạng Thái Lệnh
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TradeStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none"
                >
                  <option value="WIN">🏆 WIN (Thắng)</option>
                  <option value="LOSS">🛑 LOSS (Thua Lỗ)</option>
                  <option value="BREAKEVEN">⚖️ BREAKEVEN (Hòa)</option>
                  <option value="OPEN">⏳ OPEN (Đang Mở)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Lãi / Lỗ ($ PnL)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="+150 hoặc -50"
                  value={pnlAmount || ""}
                  onChange={(e) => setPnlAmount(parseFloat(e.target.value) || 0)}
                  className={`w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold focus:outline-none ${
                    pnlAmount > 0 ? "text-emerald-400" : pnlAmount < 0 ? "text-rose-400" : "text-slate-200"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Lãi / Lỗ (% PnL)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="+15%"
                  value={pnlPercent || ""}
                  onChange={(e) => setPnlPercent(parseFloat(e.target.value) || 0)}
                  className={`w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold focus:outline-none ${
                    pnlPercent > 0 ? "text-emerald-400" : pnlPercent < 0 ? "text-rose-400" : "text-slate-200"
                  }`}
                />
              </div>
            </div>

            {/* Row 4: Discipline Checklist */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                🎯 Checklist Kỷ Luật & Hợp Lưu Chuẩn Giáo Trình:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#070a12] p-3 rounded-xl border border-slate-800">
                {CHECKLIST_RULES.map((rule) => {
                  const isChecked = rulesChecked.includes(rule);
                  return (
                    <div
                      key={rule}
                      onClick={() => handleToggleRule(rule)}
                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer select-none transition-colors border ${
                        isChecked
                          ? "bg-blue-500/10 border-blue-500/40 text-slate-100"
                          : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 pointer-events-none"
                      />
                      <span className="text-xs">{rule}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Row 5: Notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Ghi Chú Chi Tiết & Bài Học Rút Ra
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Lý do vào lệnh, phản ứng tại vùng hỗ trợ/kháng cự, cảm xúc khi gồng lời/gồng lỗ..."
                className="w-full bg-[#070a12] border border-slate-800 focus:border-sky-500 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none leading-relaxed font-sans text-xs transition-colors"
              />
            </div>

            {/* Row 6: Image Upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  📸 Đính Kèm Ảnh Biểu Đồ TradingView
                </label>
                <span className="text-[11px] text-sky-400 font-semibold">
                  👉 Nhấn Cmd+V / Ctrl+V để dán trực tiếp ảnh!
                </span>
              </div>

              <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-800 hover:border-sky-500/60 bg-[#070a12] cursor-pointer transition-colors group">
                <Upload className="w-5 h-5 text-slate-500 group-hover:text-sky-400 mb-1 transition-colors" />
                <div className="text-xs font-semibold text-slate-300">
                  Kéo thả ảnh vào đây, hoặc <span className="text-sky-400 underline">chọn file</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {uploading ? "Đang tải ảnh lên..." : "Hỗ trợ PNG, JPG, WebP, GIF"}
                </div>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              {/* Uploaded Images Thumbnails */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2.5 mt-2.5">
                  {images.map((imgUrl, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-700 bg-black">
                      <img src={imgUrl} alt="Thumb" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 rounded bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Modal Footer - Always visible */}
          <div className="shrink-0 flex items-center justify-end gap-3 px-5 py-3.5 bg-[#070a12] border-t border-slate-800 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-600/30"
            >
              {saving ? "Đang Lưu..." : "Lưu Lệnh Trade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
