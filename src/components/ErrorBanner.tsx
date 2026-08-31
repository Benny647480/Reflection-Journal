import React from "react";
import { AlertCircle, RefreshCw, X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry, onDismiss }) => {
  return (
    <div className="w-full mb-4 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-sm flex items-start justify-between gap-3 shadow-sm animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-red-300 text-xs uppercase tracking-wide">
            Operation Notice
          </h4>
          <p className="mt-0.5 text-red-300 text-xs leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-900 text-red-100 text-xs font-semibold transition-colors border border-red-700/50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg text-red-400 hover:text-red-200 hover:bg-red-900/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
