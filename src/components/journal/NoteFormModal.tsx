import React, { useState, useEffect } from "react";
import { X, Upload, Pin, FileText, Trash2 } from "lucide-react";
import { NoteEntry, NoteCategory } from "../../types";
import { UploadApi } from "../../services/api";

interface NoteFormModalProps {
  isOpen: boolean;
  initialData?: NoteEntry | null;
  onClose: () => void;
  onSave: (data: Partial<NoteEntry>) => Promise<void>;
}

const CATEGORIES: string[] = [
  "Tâm Lý & Kỷ Luật",
  "Phân Tích Thị Trường",
  "Kinh Nghiệm / Bài Học",
  "Kế Hoạch Trade",
  "Ghi Chú Chung",
];

export const NoteFormModal: React.FC<NoteFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("Tâm Lý & Kỷ Luật");
  const [content, setContent] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCategory(initialData.category || "Tâm Lý & Kỷ Luật");
      setContent(initialData.content || "");
      setDate(initialData.date || new Date().toISOString().split("T")[0]);
      setIsPinned(!!initialData.is_pinned);

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
      setTitle("");
      setCategory("Tâm Lý & Kỷ Luật");
      setContent("");
      setDate(new Date().toISOString().split("T")[0]);
      setIsPinned(false);
      setImages([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

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
        title,
        category,
        content,
        date,
        is_pinned: isPinned ? 1 : 0,
        images,
      });
      onClose();
    } catch (err: any) {
      alert("Lỗi lưu ghi chú: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onPaste={handlePaste}
    >
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {initialData?.id ? "Chỉnh Sửa Ghi Chú" : "Thêm Ghi Chú & Bài Học Kỷ Luật Mới"}
              </h3>
              <p className="text-xs text-slate-400">Hỗ trợ định dạng Markdown & đính kèm ảnh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Ngày Ghi Chú</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Danh Mục Phân Loại</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
                />
                <span>📌 Ghim lên đầu</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Tiêu Đề Ghi Chú</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Bài học sau cú dump BTC 4H, Kế hoạch tuần 36..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#070a12] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-400">Nội Dung Chi Tiết (Hỗ trợ Markdown)</label>
              <span className="text-[11px] text-slate-500">**In đậm**, *In nghiêng*, - Danh sách</span>
            </div>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ghi lại các nhận định thị trường, lỗi tâm lý cần tránh, quy tắc kỷ luật vừa áp dụng hoặc các cơ hội tiềm năng..."
              className="w-full bg-[#070a12] border border-slate-700 rounded-xl p-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400">📸 Đính Kèm Ảnh Minh Họa</label>
              <span className="text-[11px] text-purple-400 font-semibold">👉 Nhấn Cmd+V để dán trực tiếp ảnh!</span>
            </div>

            <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-purple-500/60 bg-[#070a12] cursor-pointer transition-colors group">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-purple-400 mb-1 transition-colors" />
              <div className="text-xs font-semibold text-slate-300">
                Kéo thả ảnh vào đây, hoặc <span className="text-purple-400 underline">chọn file</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {uploading ? "Đang tải ảnh lên..." : "Hỗ trợ PNG, JPG, WebP"}
              </div>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

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

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
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
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-md shadow-purple-600/30"
            >
              {saving ? "Đang Lưu..." : "Lưu Ghi Chú"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
