import React, { useEffect, useState } from "react";
import {
  Menu,
  BookOpen,
  Target,
  FileSpreadsheet,
  Zap,
  Bot,
  UserCheck,
  Sun,
  Moon
} from "lucide-react";
import { MainTab } from "../../types";
import { binanceService, formatCoinPrice } from "../../services/binance";
import { DailyReviewModal } from "../briefing/DailyReviewModal";

interface HeaderProps {
  activeTab: MainTab;
  onOpenMobileSidebar: () => void;
  onNavigateTab?: (tab: MainTab) => void;
}

const TICKER_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "SUI", "DOGE", "XRP"];

const TAB_META: Record<MainTab, { label: string; icon: React.ElementType; badge: string; color: string }> = {
  theory: {
    label: "1. Lý Thuyết & Cẩm Nang Crypto",
    icon: BookOpen,
    badge: "12 Chương Toàn Tập",
    color: "text-blue-400"
  },
  practice: {
    label: "2. Bài Tập & Case Study Thực Chiến",
    icon: Target,
    badge: "Trắc Nghiệm & SMC",
    color: "text-sky-400"
  },
  journal: {
    label: "3. Nhật Ký Giao Dịch & AI Coach",
    icon: FileSpreadsheet,
    badge: "Quản Lý Vốn & PnL",
    color: "text-indigo-400"
  },
  news: {
    label: "4. Bản Tin & Chiến Lược AI",
    icon: Zap,
    badge: "Chuyên Gia Vĩ Mô",
    color: "text-amber-400"
  },
  ai_trader: {
    label: "5. Hội Đồng AI Trader Đa Tác Tử",
    icon: Bot,
    badge: "4 Chuyên Gia Multi-Agent",
    color: "text-purple-400"
  },
  human_trader: {
    label: "6. Người Trader (Paper Trading Realtime)",
    icon: UserCheck,
    badge: "Khớp Lệnh Live Binance",
    color: "text-emerald-400"
  }
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onNavigateTab
}) => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [flashStates, setFlashStates] = useState<Record<string, "up" | "down" | null>>({});
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    let prevPrices: Record<string, number> = {};

    const unsubscribe = binanceService.subscribe((coin, price, change24h) => {
      const upper = coin.toUpperCase();
      const prev = prevPrices[upper];

      if (prev !== undefined && prev !== price) {
        const direction = price > prev ? "up" : "down";
        setFlashStates((f) => ({ ...f, [upper]: direction }));
        setTimeout(() => {
          setFlashStates((f) => ({ ...f, [upper]: null }));
        }, 700);
      }

      prevPrices[upper] = price;
      setPrices((p) => ({ ...p, [upper]: price }));
      setChanges((c) => ({ ...c, [upper]: change24h }));
    });

    return () => unsubscribe();
  }, []);

  const meta = TAB_META[activeTab] || TAB_META.theory;
  const TabIcon = meta.icon;

  return (
    <header className="sticky top-0 z-30 bg-[#070b13]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 h-[52px] flex items-center justify-between gap-3 transition-all">
      {/* Left: Mobile Toggle & Active Module Info */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Mở menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-center">
            <TabIcon className={`w-4 h-4 ${meta.color}`} />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-black text-white tracking-tight whitespace-nowrap">
              {meta.label}
            </h1>
            <span className="hidden md:inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/80">
              {meta.badge}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Action Buttons for Pre-Market Briefing & Post-Market Review */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            if (onNavigateTab) {
              onNavigateTab("news");
            }
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-sm hover:shadow-amber-500/10 active:scale-95"
          title="Bản tin khởi động phiên & Toàn cảnh thị trường hôm nay"
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Bản Tin Ngày</span>
        </button>

        <button
          onClick={() => setIsReviewOpen(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all shadow-sm hover:shadow-purple-500/10 active:scale-95"
          title="Review & Tổng kết toàn bộ lệnh đã đánh trong ngày hôm nay"
        >
          <Moon className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Review Lệnh Ngày</span>
        </button>
      </div>

      {/* Right: Sleek Binance Live Ticker Pills + Status */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-[11px] py-1">
        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold text-[10px] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
          <span>LIVE</span>
        </div>

        {TICKER_SYMBOLS.map((symbol) => {
          const price = prices[symbol];
          const change = changes[symbol] || 0;
          const isPos = change >= 0;
          const flash = flashStates[symbol];

          return (
            <div
              key={symbol}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-800/80 bg-[#05080f]/80 transition-colors shrink-0 text-[10px] sm:text-[11px] ${
                flash === "up" ? "tick-flash-up" : flash === "down" ? "tick-flash-down" : ""
              }`}
            >
              <span className="font-bold text-slate-400">{symbol}</span>
              <span className="text-slate-100 font-semibold">
                {price ? `$${formatCoinPrice(price)}` : "..."}
              </span>
              <span className={`${isPos ? "text-emerald-400" : "text-rose-400"} text-[10px]`}>
                {isPos ? "+" : ""}{change.toFixed(1)}%
              </span>
            </div>
          );
        })}

        <div className="hidden 2xl:flex items-center gap-1.5 text-slate-400 shrink-0 text-[10px] pl-2 border-l border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>AGY v1.1</span>
        </div>
      </div>

      {/* Pop-up Modals */}
      <DailyReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
    </header>
  );
};
