export type ReflectionMode = "reflect" | "brainstorm" | "summarize";

export interface InteractionTurn {
  id: string;
  userText: string;
  geminiText: string;
  timestamp: number;
  modelUsed?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mode: "reflect" | "brainstorm" | "summarize";
  turns: InteractionTurn[];
  summary?: string;
  oneLineTakeaway?: string;
  mood?: string;
  keyThemes?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
