import React, { useState } from "react";
import { marked } from "marked";
import {
  FileText,
  Search,
  PlusCircle,
  Pin,
  Calendar,
  Edit3,
  Trash2,
  ExternalLink,
  Tag
} from "lucide-react";
import { NoteEntry, NoteCategory } from "../../types";

interface NotesTabProps {
  notes: NoteEntry[];
  onOpenAddNote: () => void;
  onEditNote: (note: NoteEntry) => void;
  onDeleteNote: (id: number) => void;
  onTogglePin: (id: number) => void;
  onSelectNoteDetail: (note: NoteEntry) => void;
  onOpenLightbox: (url: string) => void;
  onFilterChange: (filters: { category?: string; search?: string; date?: string }) => void;
}

const CATEGORIES: { id: NoteCategory; label: string }[] = [
  { id: "ALL", label: "Tất Cả Ghi Chú" },
  { id: "Tâm Lý & Kỷ Luật", label: "🧠 Tâm Lý & Kỷ Luật" },
  { id: "Phân Tích Thị Trường", label: "📈 Phân Tích Thị Trường" },
  { id: "Kinh Nghiệm / Bài Học", label: "💡 Kinh Nghiệm / Bài Học" },
  { id: "Kế Hoạch Trade", label: "📅 Kế Hoạch Trade" },
  { id: "Ghi Chú Chung", label: "📝 Ghi Chú Chung" },
];

export const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  onOpenAddNote,
  onEditNote,
  onDeleteNote,
  onTogglePin,
  onSelectNoteDetail,
  onOpenLightbox,
  onFilterChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>("ALL");
  const [search, setSearch] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");

  const handleApplyFilter = (cat?: NoteCategory, s?: string, d?: string) => {
    const c = cat !== undefined ? cat : selectedCategory;
    const term = s !== undefined ? s : search;
    const dt = d !== undefined ? d : filterDate;

    onFilterChange({
      category: c === "ALL" ? undefined : c,
      search: term || undefined,
      date: dt || undefined,
    });
  };

  const handleResetFilters = () => {
    setSelectedCategory("ALL");
    setSearch("");
    setFilterDate("");
    onFilterChange({});
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. FILTER TOOLBAR & CATEGORIES */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(c.id);
                  handleApplyFilter(c.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === c.id
                    ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                    : "bg-[#070a12] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenAddNote}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 border border-purple-500 transition-colors shadow-md shadow-purple-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Viết Ghi Chú Mới</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleApplyFilter(undefined, e.target.value);
              }}
              placeholder="🔍 Tìm kiếm theo tiêu đề hoặc nội dung ghi chú..."
              className="w-full bg-[#070a12] border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              handleApplyFilter(undefined, undefined, e.target.value);
            }}
            className="w-36 bg-[#070a12] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
          />

          <button
            onClick={handleResetFilters}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
          >
            Đặt Lại Lọc
          </button>
        </div>
      </div>

      {/* 2. NOTES GRID */}
      {notes.length === 0 ? (
        <div className="text-center py-20 bg-[#0f172a] border border-slate-800 rounded-2xl p-8">
          <div className="text-3xl mb-2">📒</div>
          <h4 className="text-base font-bold text-white mb-1">Chưa có ghi chú nào</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Ghi lại các nhận định thị trường, kế hoạch giao dịch tuần hoặc bài học tâm lý để rèn luyện kỷ luật thép.
          </p>
          <button
            onClick={onOpenAddNote}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
          >
            + Viết Ghi Chú Đầu Tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {notes.map((note) => {
            let imgsArr: string[] = [];
            if (Array.isArray(note.images)) imgsArr = note.images;
            else if (typeof note.images === "string") {
              try {
                imgsArr = JSON.parse(note.images);
              } catch {}
            }

            return (
              <div
                key={note.id}
                onClick={() => onSelectNoteDetail(note)}
                className={`bg-[#0f172a] border rounded-2xl p-5 shadow-sm transition-all hover:border-purple-500/50 cursor-pointer flex flex-col justify-between gap-3 ${
                  note.is_pinned ? "border-amber-500/50 bg-[#0f172a]/90" : "border-slate-800"
                }`}
              >
                <div>
                  {/* Category, Pinned & Top Actions */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                      {note.category}
                    </span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => note.id && onTogglePin(note.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          note.is_pinned
                            ? "text-amber-400 bg-amber-500/10"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                        title={note.is_pinned ? "Bỏ ghim" : "Ghim lên đầu"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditNote(note)}
                        className="p-1 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                        title="Sửa note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => note.id && onDeleteNote(note.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Xóa note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-2 mb-2">
                    {note.title}
                  </h4>

                  {/* Content Preview */}
                  <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed font-sans">
                    {note.content}
                  </p>
                </div>

                {/* Thumbnails & Date Footer */}
                <div>
                  {imgsArr.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5" onClick={(e) => e.stopPropagation()}>
                      {imgsArr.slice(0, 3).map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="Thumbnail"
                          onClick={() => onOpenLightbox(url)}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-700 cursor-pointer hover:border-purple-400 transition-colors"
                        />
                      ))}
                      {imgsArr.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                          +{imgsArr.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {note.date}
                    </span>
                    <span className="text-purple-400 hover:underline flex items-center gap-0.5 font-semibold">
                      Xem chi tiết <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
