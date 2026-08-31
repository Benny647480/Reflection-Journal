import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import {
  Sparkles,
  Send,
  Save,
  Trash2,
  CheckCircle,
  Lightbulb,
  BookHeart,
  FileText,
  Bot,
  User,
} from "lucide-react";
import { InteractionTurn, JournalEntry, ReflectionMode } from "../types";
import { PromptIdeas } from "./PromptIdeas";
import { ErrorBanner } from "./ErrorBanner";
import { saveJournalEntry, saveInteraction } from "../lib/firebase";

interface EntryComposerProps {
  userId: string;
  onEntrySaved: (entry: JournalEntry) => void;
  onDiscard?: () => void;
}

export const EntryComposer: React.FC<EntryComposerProps> = ({
  userId,
  onEntrySaved,
  onDiscard,
}) => {
  const [title, setTitle] = useState(() => {
    const today = new Date();
    return `Reflection • ${today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  });

  const [mode, setMode] = useState<ReflectionMode>("reflect");
  const [turns, setTurns] = useState<InteractionTurn[]>([]);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll when new turn arrives
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [turns, isGenerating]);

  // Send turn to Gemini backend API
  const handleSendPrompt = async (overridePrompt?: string) => {
    const promptToSend = (overridePrompt || inputText).trim();
    if (!promptToSend || isGenerating) return;

    setErrorMessage(null);
    setIsGenerating(true);
    setInputText("");

    // Prepare previous turns for multi-turn conversational context
    const historyPayload = turns.map((t) => ({
      user: t.userText,
      gemini: t.geminiText,
    }));

    try {
      const response = await fetch("/api/gemini/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSend,
          history: historyPayload,
          mode,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to get response from Gemini.");
      }

      const newTurn: InteractionTurn = {
        id: `turn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userText: promptToSend,
        geminiText: data.text,
        timestamp: Date.now(),
        modelUsed: data.modelUsed,
      };

      // Realtime state update
      setTurns((prev) => [...prev, newTurn]);

      // Proactively save interaction to user's isolated subcollection in Firestore
      try {
        await saveInteraction(userId, newTurn);
      } catch (saveErr) {
        console.warn("Could not asynchronously write turn to Firestore:", saveErr);
      }
    } catch (err: any) {
      console.error("Gemini reflect error:", err);
      setErrorMessage(err?.message || "Failed to communicate with Gemini. Please try again.");
      // Restore input text on failure so user doesn't lose thoughts
      if (!overridePrompt) {
        setInputText(promptToSend);
      }
    } finally {
      setIsGenerating(false);
      textareaRef.current?.focus();
    }
  };

  // Quick prompt chip trigger
  const handleQuickAction = (quickPrompt: string) => {
    handleSendPrompt(quickPrompt);
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  // Save complete Journal Entry to Cloud Firestore
  const handleSaveFullEntry = async () => {
    if (turns.length === 0 && !inputText.trim()) {
      setErrorMessage("Please write a reflection or converse with Gemini before saving.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      // If user has unsent text in the box, send it first or bundle it
      let finalTurns = [...turns];
      if (inputText.trim()) {
        const tempTurn: InteractionTurn = {
          id: `turn-${Date.now()}`,
          userText: inputText.trim(),
          geminiText: "(Unprocessed note recorded at entry completion)",
          timestamp: Date.now(),
        };
        finalTurns.push(tempTurn);
      }

      // Compile full content for summarization
      const fullText = finalTurns
        .map((t) => `User:\n${t.userText}\n\nGemini:\n${t.geminiText}`)
        .join("\n\n---\n\n");

      // Generate smart insights & title if possible
      let insights: any = {};
      try {
        const sumRes = await fetch("/api/gemini/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: fullText, title }),
        });
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          insights = sumData.insights || {};
        }
      } catch (sumErr) {
        console.warn("Auto-summarization notice:", sumErr);
      }

      const entryId = `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const completedEntry: JournalEntry = {
        id: entryId,
        userId,
        title: title.trim() || insights.suggestedTitle || "Mindful Reflection",
        content: fullText,
        mode,
        turns: finalTurns,
        summary: insights.summary || "Completed reflection session.",
        oneLineTakeaway: insights.oneLineTakeaway || "Reflected on personal insights and progress.",
        mood: insights.mood || "Reflective",
        keyThemes: Array.isArray(insights.keyThemes) ? insights.keyThemes : ["Growth", "Reflection"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Persist to Cloud Firestore with strict zero-crash undefined-stripping
      await saveJournalEntry(userId, completedEntry);

      setSavedSuccess(true);
      setTimeout(() => {
        onEntrySaved(completedEntry);
      }, 700);
    } catch (err: any) {
      console.error("Failed to save entry to Firestore:", err);
      setErrorMessage(err?.message || "Failed to persist journal entry to Firestore. Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-20">
      {/* Top Controls & Meta */}
      <div className="bg-[#121214] rounded-2xl border border-zinc-800/90 shadow-sm p-6 mb-6">
        {errorMessage && (
          <ErrorBanner
            message={errorMessage}
            onRetry={turns.length > 0 ? () => handleSendPrompt() : undefined}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <input
            id="entry-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name your reflection..."
            className="text-xl sm:text-2xl font-serif font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-none bg-transparent w-full"
          />

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="save-entry-button"
              type="button"
              onClick={handleSaveFullEntry}
              disabled={isSaving || (turns.length === 0 && !inputText.trim())}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-amber-100 rounded-full animate-spin" />
                  <span>Saving to Firestore...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save to Firestore</span>
                </>
              )}
            </button>

            {onDiscard && (
              <button
                type="button"
                onClick={onDiscard}
                title="Discard draft"
                className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Reflection Mode Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs font-medium text-zinc-500 mr-1">Mode:</span>
          <button
            type="button"
            onClick={() => setMode("reflect")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === "reflect"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                : "bg-[#18181B] text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            <BookHeart className="w-3.5 h-3.5" />
            <span>Reflect & Unpack</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("brainstorm")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === "brainstorm"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                : "bg-[#18181B] text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Brainstorm & Ideate</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("summarize")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === "summarize"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                : "bg-[#18181B] text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Synthesize & Summarize</span>
          </button>
        </div>
      </div>

      {/* Mindful Starters (Visible if no turns yet) */}
      {turns.length === 0 && (
        <PromptIdeas
          onSelectPrompt={(suggestedPrompt, suggestedMode) => {
            setInputText(suggestedPrompt);
            if (suggestedMode) setMode(suggestedMode);
            textareaRef.current?.focus();
          }}
        />
      )}

      {/* Multi-Turn Conversation Thread */}
      {turns.length > 0 && (
        <div className="space-y-6 mb-6">
          {turns.map((turn, index) => (
            <div key={turn.id || index} className="space-y-4">
              {/* User Thought Bubble */}
              <div className="flex items-start justify-end gap-3">
                <div className="max-w-[85%] bg-[#222226] text-zinc-100 border border-zinc-700/60 rounded-2xl rounded-tr-none px-5 py-3.5 shadow-sm">
                  <p className="text-sm font-sans whitespace-pre-wrap leading-relaxed">
                    {turn.userText}
                  </p>
                  <span className="block text-[10px] text-zinc-400 text-right mt-1.5">
                    {new Date(turn.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 text-xs font-semibold">
                  <User className="w-4 h-4" />
                </div>
              </div>

              {/* Gemini Reflection Bubble */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 text-xs font-semibold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="max-w-[88%] bg-[#141416] border border-zinc-800/90 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm text-zinc-100">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-800/80 text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reflection Companion</span>
                    </span>
                    {turn.modelUsed && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                        {turn.modelUsed}
                      </span>
                    )}
                  </div>
                  <div className="markdown-body text-sm leading-relaxed">
                    <Markdown>{turn.geminiText}</Markdown>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Active Generation Indicator */}
          {isGenerating && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-[#141416] border border-zinc-800/90 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs text-zinc-400 font-medium">
                  Reflecting and synthesizing thoughts...
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      )}

      {/* Input Box & Follow-Up Bar */}
      <div className="sticky bottom-4 z-20 bg-[#141416]/95 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-2xl p-4 transition-all">
        {/* Quick Follow-Up Pills (if conversation is ongoing) */}
        {turns.length > 0 && !isGenerating && (
          <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-zinc-800 text-xs">
            <span className="text-[11px] font-semibold text-zinc-500">Follow-up:</span>
            <button
              type="button"
              onClick={() => handleQuickAction("Can you deepen this reflection and ask me a thought-provoking question?")}
              className="px-2.5 py-1 rounded-full bg-[#1F1F23] hover:bg-amber-950/40 text-zinc-300 hover:text-amber-300 border border-zinc-800 transition-colors"
            >
              💭 Deepen reflection
            </button>
            <button
              type="button"
              onClick={() => handleQuickAction("What are 3 practical action steps I can take based on this?")}
              className="px-2.5 py-1 rounded-full bg-[#1F1F23] hover:bg-amber-950/40 text-zinc-300 hover:text-amber-300 border border-zinc-800 transition-colors"
            >
              🎯 Extract 3 action steps
            </button>
            <button
              type="button"
              onClick={() => handleQuickAction("Summarize what this says about my core priorities.")}
              className="px-2.5 py-1 rounded-full bg-[#1F1F23] hover:bg-amber-950/40 text-zinc-300 hover:text-amber-300 border border-zinc-800 transition-colors"
            >
              ✨ Key priority takeaway
            </button>
          </div>
        )}

        {/* Text Input Area */}
        <div className="flex items-end gap-3">
          <textarea
            id="user-prompt-textarea"
            ref={textareaRef}
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              turns.length === 0
                ? "Write your unfiltered thoughts, a challenge you're facing, or a moment you want to explore..."
                : "Reply or ask a follow-up reflection question..."
            }
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed"
          />

          <button
            id="send-prompt-button"
            type="button"
            onClick={() => handleSendPrompt()}
            disabled={!inputText.trim() || isGenerating}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-sm"
          >
            {isGenerating ? (
              <span className="w-4 h-4 border-2 border-zinc-950 border-t-amber-100 rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 px-1">
          <span>Press <kbd className="font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">Cmd / Ctrl + Enter</kbd> to converse</span>
          <span>End-to-end Firestore persistence</span>
        </div>
      </div>
    </div>
  );
};
