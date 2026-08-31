import React, { useState, useMemo } from "react";
import {
  Search,
  BookHeart,
  Lightbulb,
  FileText,
  Calendar,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  Quote,
} from "lucide-react";
import { JournalEntry, ReflectionMode } from "../types";

interface EntryHistoryProps {
  entries: JournalEntry[];
  loading: boolean;
  onSelectEntry: (entry: JournalEntry) => void;
  onNewReflection: () => void;
  onRefresh: () => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
}

export const EntryHistory: React.FC<EntryHistoryProps> = ({
  entries,
  loading,
  onSelectEntry,
  onNewReflection,
  onRefresh,
  onDeleteEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesFilter = selectedFilter === "all" || entry.mode === selectedFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesFilter;

      const matchesSearch =
        entry.title?.toLowerCase().includes(q) ||
        entry.summary?.toLowerCase().includes(q) ||
        entry.oneLineTakeaway?.toLowerCase().includes(q) ||
        entry.mood?.toLowerCase().includes(q) ||
        entry.keyThemes?.some((t) => t.toLowerCase().includes(q)) ||
        entry.content?.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [entries, selectedFilter, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto w-full pb-20">
      {/* Top Search & Filter Bar */}
      <div className="bg-[#121214] rounded-2xl border border-zinc-800/90 shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <h2 className="text-xl font-serif font-semibold text-zinc-100">
              Past Reflections
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Securely stored in your isolated Firestore collection ({entries.length} total)
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="p-2 rounded-xl border border-zinc-800 bg-[#18181B] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              title="Refresh from Firestore"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>
            <button
              onClick={onNewReflection}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Write Reflection</span>
            </button>
          </div>
        </div>

        {/* Search & Mode Tags */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, themes, or insights..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#18181B] border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {["all", "reflect", "brainstorm", "summarize"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                  selectedFilter === f
                    ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                    : "bg-[#18181B] text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                {f === "all" ? "All Entries" : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#121214] border border-zinc-800 animate-pulse space-y-3"
            >
              <div className="h-4 bg-zinc-800 rounded w-1/3" />
              <div className="h-3 bg-zinc-800/60 rounded w-2/3" />
              <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEntries.length === 0 && (
        <div className="p-12 text-center bg-[#121214] rounded-2xl border border-zinc-800/90 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <BookHeart className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-semibold text-zinc-100 mb-1">
            {searchQuery ? "No matching reflections found" : "No journal entries yet"}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
            {searchQuery
              ? "Try adjusting your search terms or filter mode."
              : "Start your first multi-turn reflection session and store your takeaways safely in Firestore."}
          </p>
          <button
            onClick={onNewReflection}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Start a New Reflection</span>
          </button>
        </div>
      )}

      {/* Entries List */}
      {!loading && filteredEntries.length > 0 && (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className="p-5 sm:p-6 rounded-2xl bg-[#121214] hover:bg-[#18181C] border border-zinc-800/90 hover:border-amber-500/40 transition-all duration-150 shadow-sm cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
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
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#18181B] text-zinc-300 border border-zinc-800">
                        {entry.mood}
                      </span>
                    )}

                    <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <span className="text-xs text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
                    <span>View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-serif font-semibold text-zinc-100 mb-2 group-hover:text-amber-300 transition-colors">
                  {entry.title}
                </h3>

                {entry.oneLineTakeaway && (
                  <div className="flex items-start gap-2 text-xs text-zinc-300 bg-[#18181C] rounded-xl p-3 border border-zinc-800/80 mb-3">
                    <Quote className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="font-serif italic line-clamp-2">
                      "{entry.oneLineTakeaway}"
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {entry.keyThemes?.slice(0, 3).map((theme, idx) => (
                    <span key={idx} className="bg-[#18181B] text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                      #{theme}
                    </span>
                  ))}
                </div>
                <span>{entry.turns?.length || 1} conversation turns</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
