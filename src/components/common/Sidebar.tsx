import React from "react";
import {
  TrendingUp,
  BookOpen,
  Target,
  FileSpreadsheet,
  Zap,
  Bot,
  UserCheck,
  Calculator,
  PlusCircle,
  FileEdit,
  ChevronLeft,
  ChevronRight,
  X,
  Cpu,
  Database
} from "lucide-react";
import { MainTab } from "../../types";

interface SidebarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpenCalculator: () => void;
  onOpenAddTrade: () => void;
  onOpenAddNote: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: MainTab;
  name: string;
  shortName: string;
  badge: string;
  icon: React.ElementType;
  gradient?: string;
  activeColor: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "theory",
    name: "1. Lý Thuyết",
    shortName: "Lý Thuyết",
    badge: "12 Chương",
    icon: BookOpen,
    activeColor: "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border-blue-500/40"
  },
  {
    id: "practice",
    name: "2. Bài Tập",
    shortName: "Bài Tập",
    badge: "Case Study",
    icon: Target,
    activeColor: "bg-sky-600 text-white shadow-lg shadow-sky-600/30 border-sky-500/40"
  },
  {
    id: "journal",
    name: "3. Nhật Ký",
    shortName: "Nhật Ký",
    badge: "Sổ Lệnh & PnL",
    icon: FileSpreadsheet,
    activeColor: "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border-indigo-500/40"
  },
  {
    id: "news",
    name: "4. Lọc Tin",
    shortName: "Lọc Tin",
    badge: "AGY Impact",
    icon: Zap,
    activeColor: "bg-amber-600 text-white shadow-lg shadow-amber-600/30 border-amber-500/40"
  },
  {
    id: "ai_trader",
    name: "5. AI Trader",
    shortName: "AI Trader",
    badge: "4 Tác Tử AI",
    icon: Bot,
    gradient: "from-purple-600 to-indigo-600",
    activeColor: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border-purple-400/40"
  },
  {
    id: "human_trader",
    name: "6. Người Trader",
    shortName: "Người Trader",
    badge: "Paper Live",
    icon: UserCheck,
    gradient: "from-emerald-600 to-teal-600",
    activeColor: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 border-emerald-400/40"
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenCalculator,
  onOpenAddTrade,
  onOpenAddNote,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) => {
  return (
    <>
      {/* 1. Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* 2. Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#070b13] border-r border-slate-800/80 transition-all duration-300 ease-in-out lg:static ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-[68px]" : "w-[240px]"} shrink-0`}
      >
        {/* TOP BRAND HEADER */}
        <div className="h-[52px] px-3.5 flex items-center justify-between border-b border-slate-800/80 bg-[#05080f]/60">
          <div
            onClick={() => {
              onTabChange("theory");
              onCloseMobile();
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none overflow-hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="font-black text-xs tracking-tight text-white flex items-center gap-1.5 leading-none">
                  <span className="truncate">CRYPTO MASTER</span>
                  <span className="text-[8px] font-extrabold uppercase px-1 py-0.5 rounded bg-blue-500/20 text-sky-400 border border-blue-500/30 shrink-0">
                    PRO
                  </span>
                </div>
                <div className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                  Trading & AI Terminal
                </div>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MIDDLE NAVIGATION MENU */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto no-scrollbar">
          {/* Main Navigation Tabs */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Phân Hệ Chính
              </div>
            )}

            <nav className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      onCloseMobile();
                    }}
                    title={isCollapsed ? item.name : undefined}
                    className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isActive
                        ? item.activeColor
                        : "border-transparent text-slate-300 hover:text-white hover:bg-slate-800/60 hover:border-slate-700/50"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? "text-white"
                          : item.id === "ai_trader"
                          ? "text-purple-400"
                          : item.id === "human_trader"
                          ? "text-emerald-400"
                          : item.id === "news"
                          ? "text-amber-400"
                          : "text-slate-400"
                      }`}
                    />

                    {!isCollapsed && (
                      <>
                        <span className="truncate text-left flex-1">{item.name}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-800/80 text-slate-400 group-hover:text-slate-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Actions Section */}
          <div className="pt-2 border-t border-slate-800/60">
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Thao Tác Nhanh
              </div>
            )}

            <div className="space-y-1.5">
              <button
                onClick={() => {
                  onOpenCalculator();
                  onCloseMobile();
                }}
                title={isCollapsed ? "Tính Vốn 1-2%" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all ${
                  isCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <Calculator className="w-4 h-4 text-sky-400 shrink-0" />
                {!isCollapsed && <span className="truncate">Tính Vốn 1-2%</span>}
              </button>

              <button
                onClick={() => {
                  onOpenAddTrade();
                  onCloseMobile();
                }}
                title={isCollapsed ? "+ Thêm Lệnh Trade" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-500 transition-all shadow-md shadow-blue-600/20 ${
                  isCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">+ Lệnh Trade Mới</span>}
              </button>

              <button
                onClick={() => {
                  onOpenAddNote();
                  onCloseMobile();
                }}
                title={isCollapsed ? "Viết Note Bài Học" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all ${
                  isCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <FileEdit className="w-4 h-4 text-purple-400 shrink-0" />
                {!isCollapsed && <span className="truncate">Viết Note / Tâm Lý</span>}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM STATUS & COLLAPSE TOGGLE */}
        <div className="p-3 border-t border-slate-800/80 bg-[#05080f]/70 space-y-2">
          {!isCollapsed ? (
            <div className="p-2.5 rounded-xl bg-[#080d1a] border border-slate-800 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AGY Engine</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  v1.1.19
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span>Database</span>
                </span>
                <span className="font-mono text-sky-400 text-[10px] font-semibold">SQLite Ready</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="AGY Engine Active"></span>
            </div>
          )}

          {/* Desktop Toggle Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/80 transition-all text-xs font-semibold"
            title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Thu Gọn Menu</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
