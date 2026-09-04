import React, { useState, useEffect } from "react";
import { FileSpreadsheet, BookOpen, ShieldCheck } from "lucide-react";
import {
  TradeEntry,
  TradeStatsSummary,
  NoteEntry,
  JournalSubTab,
  TradeReviewResult
} from "../../types";
import { JournalApi, NotesApi } from "../../services/api";
import { TradeJournalTab } from "./TradeJournalTab";
import { NotesTab } from "./NotesTab";
import { AuditorTab } from "./AuditorTab";
import { TradeFormModal } from "./TradeFormModal";
import { NoteFormModal } from "./NoteFormModal";
import { NoteDetailModal } from "./NoteDetailModal";
import { AiReviewHistoryModal } from "./AiReviewHistoryModal";

interface JournalModuleProps {
  livePrices: Record<string, number>;
  onOpenLightbox: (url: string) => void;
  isAddTradeOpen: boolean;
  onCloseAddTrade: () => void;
  isAddNoteOpen: boolean;
  onCloseAddNote: () => void;
}

export const JournalModule: React.FC<JournalModuleProps> = ({
  livePrices,
  onOpenLightbox,
  isAddTradeOpen,
  onCloseAddTrade,
  isAddNoteOpen,
  onCloseAddNote,
}) => {
  const [subTab, setSubTab] = useState<JournalSubTab>("trades");
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [stats, setStats] = useState<TradeStatsSummary | null>(null);

  // Modals state
  const [editingTrade, setEditingTrade] = useState<TradeEntry | null>(null);
  const [editingNote, setEditingNote] = useState<NoteEntry | null>(null);
  const [viewingNote, setViewingNote] = useState<NoteEntry | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [selectedAiReview, setSelectedAiReview] = useState<TradeReviewResult | null>(null);

  const loadTrades = async (filters?: any) => {
    try {
      const res = await JournalApi.getEntries(filters);
      setTrades(res.entries || []);
      const statsRes = await JournalApi.getStats();
      if (statsRes.stats) setStats(statsRes.stats);
    } catch (err: any) {
      console.error("Error loading trades:", err);
    }
  };

  const loadNotes = async (filters?: any) => {
    try {
      const res = await NotesApi.getAllNotes(filters);
      setNotes(res.notes || []);
    } catch (err: any) {
      console.error("Error loading notes:", err);
    }
  };

  useEffect(() => {
    loadTrades();
    loadNotes();
  }, []);

  const handleSaveTrade = async (data: Partial<TradeEntry>) => {
    if (editingTrade?.id) {
      await JournalApi.updateEntry(editingTrade.id, data);
    } else {
      await JournalApi.createEntry(data);
    }
    setEditingTrade(null);
    onCloseAddTrade();
    loadTrades();
  };

  const handleDeleteTrade = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa lệnh giao dịch này khỏi nhật ký?")) {
      await JournalApi.deleteEntry(id);
      loadTrades();
    }
  };

  const handleCloseLiveTrade = async (id: number, livePrice: number) => {
    try {
      await JournalApi.closeLiveTrade(id, livePrice);
      loadTrades();
    } catch (err: any) {
      alert("Lỗi chốt lệnh live: " + err.message);
    }
  };

  const handleSaveNote = async (data: Partial<NoteEntry>) => {
    if (editingNote?.id) {
      await NotesApi.updateNote(editingNote.id, data);
    } else {
      await NotesApi.createNote(data);
    }
    setEditingNote(null);
    onCloseAddNote();
    loadNotes();
  };

  const handleDeleteNote = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) {
      await NotesApi.deleteNote(id);
      loadNotes();
    }
  };

  const handleTogglePin = async (id: number) => {
    try {
      await NotesApi.togglePin(id);
      loadNotes();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Sub-Tab Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 bg-[#070a12] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSubTab("trades")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "trades"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>1. Nhật Ký Lệnh Trade</span>
          </button>

          <button
            onClick={() => setSubTab("notes")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "notes"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>2. Sổ Tay Ghi Chú & Kỷ Luật</span>
          </button>

          <button
            onClick={() => setSubTab("aireview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "aireview"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>3. Auditor & Chẩn Đoán Kỷ Luật</span>
          </button>
        </div>
      </div>

      {/* SubTab Views */}
      {subTab === "trades" && (
        <TradeJournalTab
          entries={trades}
          stats={stats}
          livePrices={livePrices}
          onOpenAddModal={() => setEditingTrade(null)}
          onEditTrade={(t) => setEditingTrade(t)}
          onDeleteTrade={handleDeleteTrade}
          onCloseLiveTrade={handleCloseLiveTrade}
          onSwitchToAiReview={() => setSubTab("aireview")}
          onOpenLightbox={onOpenLightbox}
          onFilterChange={loadTrades}
        />
      )}

      {subTab === "notes" && (
        <NotesTab
          notes={notes}
          onOpenAddNote={() => setEditingNote(null)}
          onEditNote={(n) => setEditingNote(n)}
          onDeleteNote={handleDeleteNote}
          onTogglePin={handleTogglePin}
          onSelectNoteDetail={(n) => setViewingNote(n)}
          onOpenLightbox={onOpenLightbox}
          onFilterChange={loadNotes}
        />
      )}

      {subTab === "aireview" && (
        <AuditorTab
          onOpenHistory={() => setIsHistoryModalOpen(true)}
          livePrices={livePrices}
          initialReview={selectedAiReview}
        />
      )}

      {/* Modals */}
      <TradeFormModal
        isOpen={isAddTradeOpen || !!editingTrade}
        initialData={editingTrade}
        onClose={() => {
          setEditingTrade(null);
          onCloseAddTrade();
        }}
        onSave={handleSaveTrade}
      />

      <NoteFormModal
        isOpen={isAddNoteOpen || !!editingNote}
        initialData={editingNote}
        onClose={() => {
          setEditingNote(null);
          onCloseAddNote();
        }}
        onSave={handleSaveNote}
      />

      <NoteDetailModal
        note={viewingNote}
        onClose={() => setViewingNote(null)}
        onEdit={(n) => {
          setViewingNote(null);
          setEditingNote(n);
        }}
        onDelete={handleDeleteNote}
        onOpenLightbox={onOpenLightbox}
      />

      <AiReviewHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectReview={(r) => {
          setSelectedAiReview(r);
        }}
      />
    </div>
  );
};
