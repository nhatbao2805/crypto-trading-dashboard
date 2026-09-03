import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Trash2, Sparkles, Bot, User } from "lucide-react";
import { ChatMessage } from "../../types";
import { NewsApi } from "../../services/api";

const SUGGESTIONS = [
  "Tình hình có nên hold và trade BTC ở thời điểm này không?",
  "Phân tích các vùng cản 4H và điểm cắt lỗ an toàn cho ETH",
  "Đánh giá tỷ lệ Funding Rate và nguy cơ bị Long/Short Squeeze",
  "Hướng dẫn chiến lược DCA mua gom altcoin khi RSI khung Tuần dưới 35",
];

export const AgyChatTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const loadHistory = async () => {
    try {
      const res = await NewsApi.getAgyHistory();
      if (res.history) {
        const msgs: ChatMessage[] = [];
        res.history.forEach((h) => {
          msgs.push({
            id: `u_${h.id}`,
            sender: "user",
            text: h.prompt,
            timestamp: h.created_at,
          });
          msgs.push({
            id: `a_${h.id}`,
            sender: "agy",
            text: h.response,
            timestamp: h.created_at,
          });
        });
        setMessages(msgs);
      }
    } catch {}
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSendPrompt = async (customText?: string) => {
    const text = (customText || input).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const res = await NewsApi.execAgyPrompt({ prompt: text, coin: "BTC" });
      const agyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "agy",
        text: res.output || "Đã xử lý câu hỏi từ AGY Terminal.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, agyMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "agy",
          text: `⚠️ Lỗi kết nối AGY Engine: ${err.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await NewsApi.clearAgyHistory();
      setMessages([]);
    } catch {}
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="text-base font-extrabold text-sky-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>AGY TERMINAL STRATEGY CHATROOM</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tham vấn trực tiếp kịch bản Trade, Hold, quản lý vốn 1-2%, phân tích tâm lý nến với AGY Terminal Engine.
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-rose-300 border border-slate-700 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa Lịch Sử</span>
        </button>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-slate-400 font-semibold mr-1">Gợi ý câu hỏi:</span>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSendPrompt(s)}
            className="px-2.5 py-1 rounded-lg text-xs bg-[#070a12] hover:bg-slate-800 text-slate-300 hover:text-sky-300 border border-slate-800 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages History Container */}
      <div className="h-[440px] overflow-y-auto bg-[#070a12] border border-slate-800 rounded-xl p-4 space-y-3.5">
        {messages.length === 0 ? (
          <div className="text-center py-24 text-slate-500 text-xs sm:text-sm">
            Chưa có đoạn chat nào. Hãy nhập câu hỏi hoặc chọn gợi ý bên trên để bắt đầu trò chuyện với AGY Terminal!
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-none shadow-md"
                    : "bg-[#0f172a] border border-slate-800 text-slate-200 rounded-tl-none font-sans"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-sky-400 italic">
            <div className="w-3 h-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin"></div>
            <span>AGY Terminal đang xử lý phân tích dữ liệu...</span>
          </div>
        )}
      </div>

      {/* Input Toolbar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendPrompt();
          }}
          placeholder="Nhập câu hỏi tham vấn chiến lược cho AGY (Ví dụ: Đánh giá mô hình nến 4H của SOL hiện tại?)..."
          className="flex-1 bg-[#070a12] border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
        />

        <button
          onClick={() => handleSendPrompt()}
          disabled={loading || !input.trim()}
          className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition-colors flex items-center gap-1.5 shrink-0 shadow-md shadow-blue-600/30"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Gửi</span>
        </button>
      </div>
    </div>
  );
};
