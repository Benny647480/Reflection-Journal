import React from "react";
import { Sparkles, LogOut, PlusCircle, History, ShieldCheck } from "lucide-react";
import { UserProfile } from "../types";

interface DashboardHeaderProps {
  user: UserProfile;
  activeView: "compose" | "history";
  onViewChange: (view: "compose" | "history") => void;
  onSignOut: () => Promise<void>;
  entriesCount: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  activeView,
  onViewChange,
  onSignOut,
  entriesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#0E0E10]/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Connection Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-zinc-100">
                Reflection Journal
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[10px] font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Isolated DB</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center bg-[#18181B] p-1 rounded-xl border border-zinc-800/80">
          <button
            id="nav-compose-tab"
            onClick={() => onViewChange("compose")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === "compose"
                ? "bg-[#27272A] text-zinc-100 shadow-sm border border-zinc-700/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>New Reflection</span>
          </button>
          <button
            id="nav-history-tab"
            onClick={() => onViewChange("history")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === "history"
                ? "bg-[#27272A] text-zinc-100 shadow-sm border border-zinc-700/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span>Past Entries</span>
            {entriesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-300 border border-zinc-700">
                {entriesCount}
              </span>
            )}
          </button>
        </div>

        {/* User Profile & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-amber-300 flex items-center justify-center text-xs font-semibold">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-200 leading-tight">
                {user.displayName || "Authenticated User"}
              </span>
              <span className="text-[10px] text-zinc-400 truncate max-w-[140px]">
                {user.email || user.uid.slice(0, 8)}
              </span>
            </div>
          </div>

          <button
            id="signout-button"
            onClick={onSignOut}
            title="Sign Out"
            className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
