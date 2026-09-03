import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Target,
  CheckCircle2,
  Percent,
  Flame,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sparkles,
  ShieldAlert,
  Award
} from "lucide-react";
import { practiceScenarios } from "../../data/practiceData";
import { PracticeScenario, PracticeStats } from "../../types";
import { PracticeApi } from "../../services/api";
import { ChartVisualizer } from "../theory/ChartVisualizer";
import { ConfirmModal } from "../common/ConfirmModal";

const CATEGORIES = [
  { id: "ALL", label: "Tất Cả (30 Case Study)" },
  { id: "whale_traps", label: "🐋 Bẫy Cá Mập & Quét Sàn" },
  { id: "derivatives_data", label: "📊 Phái Sinh & Squeeze" },
  { id: "macro_cycle", label: "🌊 Vĩ Mô, Chu Kỳ & SMC" },
  { id: "risk_execution", label: "🛡️ Quản Trị Rủi Ro & Kỷ Luật" },
  { id: "technical_basics", label: "🕯️ Phân Tích Kỹ Thuật Cơ Bản" },
];

export const PracticeModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [stats, setStats] = useState<PracticeStats>({
    total: 0,
    correct: 0,
    streak: 0,
    answered: {},
    chapterStats: {},
  });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Load progress from backend & localStorage
  useEffect(() => {
    const local = localStorage.getItem("practice_stats_v2");
    if (local) {
      try {
        setStats(JSON.parse(local));
      } catch {}
    }

    PracticeApi.getProgress()
      .then((res) => {
        if (res.success && res.progress) {
          setStats(res.progress);
          localStorage.setItem("practice_stats_v2", JSON.stringify(res.progress));
        }
      })
      .catch(() => {});
  }, []);

  const filteredScenarios = practiceScenarios.filter((s) => {
    if (selectedCategory === "ALL") return true;
    return s.category === selectedCategory;
  });

  const currentScenario: PracticeScenario | undefined = filteredScenarios[currentIndex] || filteredScenarios[0];
  const currentAnswer = currentScenario ? stats.answered[currentScenario.id] : undefined;

  const handleSelectOption = (optionId: "A" | "B" | "C" | "D") => {
    if (!currentScenario || currentAnswer) return;

    const chosen = currentScenario.options.find((o) => o.id === optionId);
    const isCorrect = chosen ? chosen.isCorrect : false;

    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    const newStreak = isCorrect ? stats.streak + 1 : 0;
    const newTotal = stats.total + 1;
    const newCorrect = isCorrect ? stats.correct + 1 : stats.correct;

    const newAnswered = {
      ...stats.answered,
      [currentScenario.id]: {
        chosenOption: optionId,
        isCorrect,
        timestamp: new Date().toISOString(),
      },
    };

    const newStats: PracticeStats = {
      ...stats,
      total: newTotal,
      correct: newCorrect,
      streak: newStreak,
      answered: newAnswered,
    };

    setStats(newStats);
    localStorage.setItem("practice_stats_v2", JSON.stringify(newStats));
    PracticeApi.saveProgress(newStats).catch(() => {});
  };

  const handleResetQuiz = () => {
    const emptyStats: PracticeStats = {
      total: 0,
      correct: 0,
      streak: 0,
      answered: {},
      chapterStats: {},
    };
    setStats(emptyStats);
    localStorage.removeItem("practice_stats_v2");
    PracticeApi.saveProgress(emptyStats).catch(() => {});
    setIsResetConfirmOpen(false);
  };

  const handleNavigate = (dir: number) => {
    const next = currentIndex + dir;
    if (next >= 0 && next < filteredScenarios.length) {
      setCurrentIndex(next);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const accuracyPct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="space-y-4 animate-fadeIn w-full">
      {/* 1. TOP COMPACT PROGRESS & STREAK RIBBON */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-3 sm:px-5 sm:py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 flex-1 min-w-[280px]">
          {/* Progress bar */}
          <div className="flex-1 min-w-[160px]">
            <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
              <span className="text-slate-400">Tiến Độ: <b className="text-white font-mono">{Object.keys(stats.answered).length}/{practiceScenarios.length}</b></span>
              <span className="text-sky-400 font-mono font-bold">{Math.round((Object.keys(stats.answered).length / practiceScenarios.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(Object.keys(stats.answered).length / practiceScenarios.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Correct */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Số Câu Đúng</div>
              <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono leading-none">
                {stats.correct} ({accuracyPct}%)
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Streak */}
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Chuỗi Thắng</div>
              <div className="text-xs sm:text-sm font-black text-amber-400 font-mono leading-none">
                🔥 {stats.streak}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 bg-[#070a12] hover:bg-slate-800 hover:text-white border border-slate-800 transition-colors ml-auto"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Làm Lại</span>
        </button>
      </div>

      {/* 2. CATEGORY PILLS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedCategory(c.id);
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
              selectedCategory === c.id
                ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                : "bg-[#070a12] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 3. SCENARIO CARD CONTAINER */}
      {currentScenario ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-sky-400">
                CASE {currentIndex + 1} / {filteredScenarios.length}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300">
                Chương {currentScenario.chapterId}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {currentScenario.levelLabel}
              </span>
            </div>

            <div className="text-xs text-slate-400 font-semibold">{currentScenario.categoryName}</div>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white mb-2">{currentScenario.title}</h3>
            <div
              className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#070a12] p-4 rounded-xl border border-slate-800"
              dangerouslySetInnerHTML={{ __html: currentScenario.description }}
            />
          </div>

          {/* SVG Candlestick Chart */}
          {currentScenario.chartConfig && (
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#06090e]">
              <div
                dangerouslySetInnerHTML={{
                  __html: ChartVisualizer.renderChartSvg({
                    ...currentScenario.chartConfig,
                    width: 720,
                    height: 320,
                  }),
                }}
              />
            </div>
          )}

          {/* Question & Options */}
          <div className="space-y-3.5 pt-2">
            <div className="text-xs sm:text-sm font-bold text-sky-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>{currentScenario.question}</span>
            </div>

            <div className="space-y-2.5">
              {currentScenario.options.map((opt) => {
                const isSelected = currentAnswer?.chosenOption === opt.id;
                const isThisCorrect = opt.isCorrect;
                const showResults = !!currentAnswer;

                let btnStyle = "bg-[#070a12] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40";
                if (showResults) {
                  if (isThisCorrect) {
                    btnStyle = "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold";
                  } else if (isSelected && !isThisCorrect) {
                    btnStyle = "bg-rose-950/40 border-rose-500/60 text-rose-200";
                  } else {
                    btnStyle = "bg-[#070a12]/50 border-slate-900 text-slate-500 opacity-60";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={showResults}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${btnStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg font-mono font-bold flex items-center justify-center shrink-0 text-xs ${
                        showResults && isThisCorrect
                          ? "bg-emerald-500 text-slate-950"
                          : showResults && isSelected && !isThisCorrect
                          ? "bg-rose-500 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="flex-1 mt-0.5">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation Box (Revealed when answered) */}
          {currentAnswer && (
            <div
              className={`p-4 rounded-xl border leading-relaxed text-xs sm:text-sm animate-fadeIn ${
                currentAnswer.isCorrect
                  ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                  : "bg-rose-950/30 border-rose-500/40 text-rose-200"
              }`}
            >
              <div className="font-bold mb-1.5 flex items-center gap-1.5">
                {currentAnswer.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>CHÍNH XÁC! TUYỆT VỜI!</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>CHƯA CHÍNH XÁC - HÃY XEM GIẢI THÍCH CHI TIẾT:</span>
                  </>
                )}
              </div>
              <div
                className="text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentScenario.explanation }}
              />
            </div>
          )}

          {/* Navigation Buttons Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => handleNavigate(-1)}
              disabled={currentIndex <= 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 border border-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Câu Trước
            </button>

            <button
              onClick={() => handleNavigate(1)}
              disabled={currentIndex >= filteredScenarios.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors"
            >
              Câu Tiếp Theo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400">Không có bài tập trong danh mục này.</div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Làm Lại Tất Cả Bài Tập?"
        message="Hành động này sẽ xóa sạch toàn bộ điểm số, chuỗi đúng và lịch sử trả lời của bạn để bạn có thể luyện tập lại từ đầu. Bạn có chắc chắn muốn thực hiện?"
        confirmText="Làm Lại Từ Đầu"
        cancelText="Giữ Lại Điểm"
        onConfirm={handleResetQuiz}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
