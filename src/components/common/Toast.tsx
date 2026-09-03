import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { ToastInfo } from "../../types";

interface ToastProps {
  toasts: ToastInfo[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        let bg = "bg-slate-900/95 border-slate-700 text-slate-200";
        let icon = <Info className="w-4 h-4 text-sky-400 shrink-0" />;

        if (t.type === "success") {
          bg = "bg-slate-900/95 border-emerald-500/50 text-emerald-100 shadow-lg shadow-emerald-950/40";
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        } else if (t.type === "error") {
          bg = "bg-slate-900/95 border-rose-500/50 text-rose-100 shadow-lg shadow-rose-950/40";
          icon = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
        } else if (t.type === "warning") {
          bg = "bg-slate-900/95 border-amber-500/50 text-amber-100 shadow-lg shadow-amber-950/40";
          icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border backdrop-blur-md animate-fadeIn transition-all ${bg}`}
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
              {icon}
              <span className="leading-snug">{t.message}</span>
            </div>
            <button
              onClick={() => onRemove(t.id)}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
