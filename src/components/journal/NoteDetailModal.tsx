import React from "react";
import { marked } from "marked";
import { X, Calendar, Pin, Edit3, Trash2, Tag } from "lucide-react";
import { NoteEntry } from "../../types";

interface NoteDetailModalProps {
  note: NoteEntry | null;
  onClose: () => void;
  onEdit: (note: NoteEntry) => void;
  onDelete: (id: number) => void;
  onOpenLightbox: (url: string) => void;
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  note,
  onClose,
  onEdit,
  onDelete,
  onOpenLightbox,
}) => {
  if (!note) return null;

  let imgs: string[] = [];
  if (Array.isArray(note.images)) imgs = note.images;
  else if (typeof note.images === "string") {
    try {
      imgs = JSON.parse(note.images);
    } catch {}
  }

  const renderedContent = marked.parse(note.content || "", { gfm: true, breaks: true }) as string;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl shadow-black/80">
        <div className="flex items-start justify-between pb-3.5 mb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                {note.category}
              </span>
              {note.is_pinned ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                  <Pin className="w-2.5 h-2.5" /> Đã ghim
                </span>
              ) : null}
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">{note.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Ngày: {note.date}</span>
          </div>

          <div
            className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-[#070a12] p-4 rounded-xl border border-slate-800 theory-markdown"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />

          {imgs.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-2">Ảnh Minh Họa ({imgs.length}):</div>
              <div className="grid grid-cols-2 gap-2.5">
                {imgs.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Note attachment"
                    onClick={() => onOpenLightbox(url)}
                    className="w-full h-36 object-cover rounded-xl border border-slate-800 cursor-pointer hover:border-sky-500/60 transition-colors"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(note);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> Chỉnh Sửa
            </button>
            <button
              onClick={() => {
                if (note.id) onDelete(note.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
