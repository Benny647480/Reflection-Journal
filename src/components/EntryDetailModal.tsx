import React, { useState } from "react";
import Markdown from "react-markdown";
import {
  X,
  Sparkles,
  Calendar,
  Tag,
  Bot,
  User,
  Quote,
  Trash2,
  Copy,
  Check,
  BookHeart,
  Lightbulb,
  FileText,
} from "lucide-react";
import { JournalEntry } from "../types";

interface EntryDetailModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
  onDelete: (entryId: string) => Promise<void>;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
  entry,
  onClose,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!entry) return null;

  const handleCopySummary = async () => {
    const textToCopy = `Title: ${entry.title}\nTakeaway: ${entry.oneLineTakeaway || ""}\nSummary: ${entry.summary || ""}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(entry.id);
      onClose();
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121214] text-zinc-100 w-full max-w-3xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-start justify-between gap-4 bg-[#161618]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {entry.mode === "brainstorm" ? (
                  <Lightbulb className="w-3 h-3" />
                ) : entry.mode === "summarize" ? (
                  <FileText className="w-3 h-3" />
                ) : (
                  <BookHeart className="w-3 h-3" />
                )}
                <span className="capitalize">{entry.mode}</span>
              </span>

              {entry.mood && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1F1F23] text-zinc-300 border border-zinc-700">
                  Mood: {entry.mood}
                </span>
              )}

              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Calendar className="w-3 h-3" />
                {new Date(entry.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-zinc-100">
              {entry.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopySummary}
              title="Copy takeaway & summary"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              disabled={isDeleting || showConfirmDelete}
              title="Delete from Firestore"
              className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert Banner */}
        {showConfirmDelete && (
          <div className="p-4 bg-red-950/50 border-b border-red-800/80 flex items-center justify-between gap-4 text-xs animate-in fade-in duration-150">
            <span className="text-red-200">
              Are you sure you want to permanently delete this reflection from Firestore?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Insight & One-Line Takeaway */}
          {entry.oneLineTakeaway && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3">
              <Quote className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                  Core Takeaway
                </h4>
                <p className="text-sm font-serif italic text-zinc-200 leading-relaxed">
                  "{entry.oneLineTakeaway}"
                </p>
              </div>
            </div>
          )}

          {/* AI Summary Box */}
          {entry.summary && (
            <div className="p-4 rounded-xl bg-[#18181C] border border-zinc-800 text-zinc-200">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Session Synthesis</span>
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {entry.summary}
              </p>
            </div>
          )}

          {/* Theme Badges */}
          {entry.keyThemes && entry.keyThemes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-500 mr-1" />
              {entry.keyThemes.map((theme, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#18181B] text-zinc-300 border border-zinc-800"
                >
                  #{theme}
                </span>
              ))}
            </div>
          )}

          {/* Multi-Turn Thread View */}
          <div className="pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
              Conversation Thread ({entry.turns?.length || 0} turns)
            </h3>

            <div className="space-y-4">
              {entry.turns?.map((turn, idx) => (
                <div key={turn.id || idx} className="space-y-3">
                  {/* User Part */}
                  <div className="flex items-start justify-end gap-2.5">
                    <div className="max-w-[85%] bg-[#222226] text-zinc-100 border border-zinc-700/60 rounded-2xl rounded-tr-none px-4 py-3 text-xs sm:text-sm shadow-sm">
                      <p className="whitespace-pre-wrap">{turn.userText}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 text-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Gemini Part */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="max-w-[88%] bg-[#18181C] border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs sm:text-sm text-zinc-200">
                      <div className="markdown-body text-xs sm:text-sm leading-relaxed">
                        <Markdown>{turn.geminiText}</Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#161618] flex items-center justify-between text-xs text-zinc-500">
          <span>Protected by user-isolated Firestore rules</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
