import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// 1. TOP-LEVEL REQUEST DESERIALIZATION (Body parsers mounted before routes)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// 2. GEMINI CLIENT (Lazy initialization + zero-hardcoding)
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// 3. RESILIENT MODEL FALLBACK LADDER
const MODEL_FALLBACK_LADDER = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash",
];

interface FallbackOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

async function generateContentWithFallback(
  contents: any,
  options?: FallbackOptions
): Promise<{ text: string; modelUsed: string }> {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: options?.systemInstruction,
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxOutputTokens ?? 2048,
        },
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || (err?.message?.includes("429") ? 429 : 500);
      console.warn(`[Gemini Fallback] Model ${model} failed (Status ${status}):`, err?.message || err);
      // Continue to next model in the fallback ladder
    }
  }

  throw new Error(
    `All Gemini fallback models exhausted. Last error: ${lastError?.message || "Unknown error"}`
  );
}

// 4. DEFENSIVE API ROUTES

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Reflect / Converse Endpoint
app.post("/api/gemini/reflect", async (req: Request, res: Response) => {
  try {
    const body = (req.body && typeof req.body === "object") ? req.body : {};
    const { prompt, history, mode } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      res.status(400).json({ error: "A valid non-empty 'prompt' is required." });
      return;
    }

    // Determine system persona based on mode (reflect, brainstorm, analyze, advise)
    let systemInstruction = `You are a mindful, insightful, and empathetic AI Journal & Reflection companion.
Your goal is to help the user unpack their thoughts, gain mental clarity, process emotions, and discover actionable personal insights.
Be warm, encouraging, grounded, and concise. Format key takeaways or follow-up reflection questions cleanly in markdown.
Do not act robotic; maintain an authentic conversational tone.`;

    if (mode === "brainstorm") {
      systemInstruction = `You are a creative brainstorming and ideation partner.
Help the user explore perspectives, innovative angles, potential solutions, and structured creative pathways.
Structure ideas with bullet points and highlight 2-3 bold next steps.`;
    } else if (mode === "summarize") {
      systemInstruction = `You are a synthesis specialist. Provide a clear, cohesive summary of the user's reflection, extracting key emotional themes, core breakthroughs, and mindful questions for tomorrow.`;
    }

    // Build multi-turn context payload safely
    const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const item of history) {
        if (item && typeof item === "object") {
          if (item.user && typeof item.user === "string") {
            formattedContents.push({
              role: "user",
              parts: [{ text: item.user.trim() }],
            });
          }
          if (item.gemini && typeof item.gemini === "string") {
            formattedContents.push({
              role: "model",
              parts: [{ text: item.gemini.trim() }],
            });
          }
        }
      }
    }

    // Append latest prompt
    formattedContents.push({
      role: "user",
      parts: [{ text: prompt.trim() }],
    });

    const result = await generateContentWithFallback(formattedContents, {
      systemInstruction,
      temperature: 0.75,
    });

    res.json({
      success: true,
      text: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error("[API Error] /api/gemini/reflect:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate reflection with Gemini.",
    });
  }
});

// Summary & Quick Insights Endpoint
app.post("/api/gemini/summarize", async (req: Request, res: Response) => {
  try {
    const body = (req.body && typeof req.body === "object") ? req.body : {};
    const { content, title } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      res.status(400).json({ error: "Valid 'content' string is required for summarization." });
      return;
    }

    const promptText = `Analyze this journal/reflection entry:
Title: ${title || "Untitled Entry"}
Content:
"""
${content.slice(0, 8000)}
"""

Provide a concise JSON response with:
1. "suggestedTitle": A thoughtful 3-6 word title capturing the essence (if original title is generic).
2. "oneLineTakeaway": A powerful, inspiring single sentence summarizing the main insight.
3. "mood": One or two feeling tags (e.g., "Grateful", "Determined", "Reflective", "Uncertain").
4. "keyThemes": An array of 2-4 key theme tags.
5. "summary": A brief 2-paragraph synthesis of the reflection.

Return ONLY raw JSON, with no markdown formatting or backticks.`;

    const result = await generateContentWithFallback(promptText, {
      systemInstruction: "You are an automated analytical metadata generator for personal journals. Return pure valid JSON only.",
      temperature: 0.2,
    });

    let cleanedText = result.text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsed = {};
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      parsed = {
        suggestedTitle: title || "Reflections & Insights",
        oneLineTakeaway: "Captured meaningful moments and reflections.",
        mood: "Reflective",
        keyThemes: ["Journaling", "Personal Growth"],
        summary: cleanedText,
      };
    }

    res.json({
      success: true,
      insights: parsed,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error("[API Error] /api/gemini/summarize:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate entry summary.",
    });
  }
});

// 5. SERVER INITIALIZATION & VITE INTEGRATION
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
