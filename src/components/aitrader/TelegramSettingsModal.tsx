import React, { useState, useEffect } from "react";
import { Send, Shield, Bell, Check, X, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { AiTraderApi } from "../../services/api";

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type: "success" | "error" | "warning" | "info") => void;
}

export const TelegramSettingsModal: React.FC<TelegramSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [token, setToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      AiTraderApi.getTelegramStatus()
        .then((res) => {
          setIsConfigured(res.configured);
          if (res.chatId) setChatId(res.chatId);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token && !chatId) {
      onShowToast("Vui lòng nhập Bot Token và Chat ID", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const res = await AiTraderApi.updateTelegramConfig(token, chatId);
      setIsConfigured(res.configured);
      onShowToast("Đã lưu cấu hình Bot Telegram thành công!", "success");
    } catch (err: any) {
      onShowToast(err.message || "Lỗi lưu cấu hình Telegram", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    setIsTesting(true);
    try {
      const res = await AiTraderApi.sendTestTelegramAlert();
      if (res.success) {
        onShowToast("✅ Đã gửi tín hiệu kiểm tra thành công tới Telegram!", "success");
      } else {
        onShowToast(res.message || "Không thể gửi tin nhắn thử nghiệm", "error");
      }
    } catch (err: any) {
      onShowToast(err.message || "Lỗi gửi test alert", "error");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f172a] border border-blue-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-blue-500/10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Cấu Hình Cảnh Báo Telegram 24/7
                {isConfigured ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-normal">
                    Đang Hoạt Động
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-normal">
                    Chưa Kết Nối
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Nhận tín hiệu Breakout và bẫy giá tức thì vào điện thoại</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSaveConfig} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/30 text-xs text-blue-300 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-blue-200 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-400" />
              Cách tạo Bot Telegram miễn phí trong 1 phút:
            </p>
            <p>1. Mở Telegram, tìm <b>@BotFather</b> và gửi lệnh <code>/newbot</code> để lấy <b>Bot Token</b>.</p>
            <p>2. Tìm bot <b>@userinfobot</b> và bấm Start để lấy <b>Chat ID</b> cá nhân của bạn.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Telegram Bot Token (HTTP API):</label>
            <input
              type="password"
              placeholder="VD: 7123456789:AAHxxxxx_xxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Telegram Chat ID (Cá nhân hoặc Nhóm):</label>
            <input
              type="text"
              placeholder="VD: 123456789 hoặc -100123456789"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Lưu Cấu Hình
            </button>

            <button
              type="button"
              onClick={handleSendTest}
              disabled={isTesting}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition flex items-center justify-center gap-2"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-blue-400" /> : <Send className="w-4 h-4 text-blue-400" />}
              Gửi Thử Nghiệm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
