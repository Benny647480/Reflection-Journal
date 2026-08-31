import React from "react";
import { Sparkles, Shield, Lock, BookOpen, Compass, ArrowRight, CheckCircle2 } from "lucide-react";

interface LandingPageProps {
  onSignIn: () => Promise<void>;
  loading: boolean;
  error?: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, loading, error }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-200">
      {/* Navigation Bar */}
      <header className="w-full border-b border-zinc-800/80 bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-zinc-100 font-sans">
              Reflection Journal
            </span>
          </div>

          <button
            id="nav-signin-button"
            onClick={onSignIn}
            disabled={loading}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-zinc-400 border-t-zinc-950 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{loading ? "Authenticating..." : "Sign in with Google"}</span>
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center justify-center">
        {error && (
          <div className="mb-8 w-full max-w-md p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm text-left flex items-start gap-3">
            <span className="font-semibold text-red-200">Authentication Notice:</span>
            <span>{error}</span>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-6">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>User-Isolated & End-to-End Secure</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-zinc-100 tracking-tight leading-[1.15] max-w-3xl mb-6">
          A thoughtful space for your reflections.
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 font-sans max-w-2xl leading-relaxed mb-10">
          Write unfiltered journal entries, explore your daily breakthroughs, and converse with
          an intelligent reflection companion. Stored securely in Cloud Firestore, strictly isolated to your account.
        </p>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button
            id="hero-signin-button"
            onClick={onSignIn}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-all duration-200 shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-zinc-400 border-t-zinc-950 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Start Journaling with Google</span>
            <ArrowRight className="w-4 h-4 text-amber-500" />
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-[#121214] border border-zinc-800/90 hover:border-zinc-700 transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mb-2">
                User-Isolated Firestore
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Rules-enforced Firestore paths guarantee your entries are only readable and writable by your authenticated UID.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center gap-2 text-xs font-medium text-zinc-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero cross-user data leakage</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121214] border border-zinc-800/90 hover:border-zinc-700 transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-amber-400 mb-4">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mb-2">
                AI Reflection Engine
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Experience high-speed reflection synthesis, thoughtful conversational follow-ups, and automated insight takeaways.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center gap-2 text-xs font-medium text-zinc-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Multi-model resilient fallback ladder</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121214] border border-zinc-800/90 hover:border-zinc-700 transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 mb-4">
                <BookOpen className="w-5 h-5 text-zinc-300" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mb-2">
                Multi-Turn History
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Review past entries anytime. Search by date or theme, analyze mood shifts, and preserve your personal growth story.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center gap-2 text-xs font-medium text-zinc-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Persistent cloud synchronization</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Reflection Journal. Built with Google AI Studio & Cloud Firestore.</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>AI-Powered Reflection</span>
            <span>•</span>
            <span>Firebase Authentication</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
