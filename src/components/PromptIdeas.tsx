import React from "react";
import { Sparkles, Brain, Lightbulb, Compass, HeartHandshake } from "lucide-react";

interface PromptIdeasProps {
  onSelectPrompt: (prompt: string, suggestedMode?: "reflect" | "brainstorm" | "summarize") => void;
}

const PROMPT_TEMPLATES = [
  {
    icon: Compass,
    title: "Daily Breakthrough",
    prompt: "What went surprisingly well today, and what personal strength or decision made it happen?",
    mode: "reflect" as const,
  },
  {
    icon: HeartHandshake,
    title: "Overcoming Friction",
    prompt: "I experienced a moment of stress or frustration today when... Help me process why it triggered me and how to respond constructively.",
    mode: "reflect" as const,
  },
  {
    icon: Lightbulb,
    title: "Creative Brainstorming",
    prompt: "I want to brainstorm 4 creative strategies or habits to improve my focus and energy over the next 30 days.",
    mode: "brainstorm" as const,
  },
  {
    icon: Brain,
    title: "Decision Clarity",
    prompt: "I'm torn between two choices: Option A is ... and Option B is ... Help me evaluate the hidden trade-offs and clarify my core priorities.",
    mode: "brainstorm" as const,
  },
];

export const PromptIdeas: React.FC<PromptIdeasProps> = ({ onSelectPrompt }) => {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Mindful Starters</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PROMPT_TEMPLATES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt, item.mode)}
              className="text-left p-3.5 rounded-xl bg-[#121214] hover:bg-[#18181C] border border-zinc-800/90 hover:border-amber-500/40 transition-all duration-150 group shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-zinc-100">{item.title}</span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
