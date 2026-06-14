/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { generateChatResponse, generateSessionSummary } from "./server/llmService.js";
import { memoryStore } from "./server/memoryStore.js";
import { listLBH } from "./server/apiClients.js";
import { processDocumentOCR } from "./server/apiClients.js";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json({ limit: "25mb" }));

// Safe resolution of __dirname for ESM and CJS runtime
const getDirname = () => {
  try {
    const meta = import.meta;
    const url = (meta as any).url;
    return path.dirname(fileURLToPath(url));
  } catch {
    return typeof __dirname !== "undefined" ? __dirname : process.cwd();
  }
};
const __dirname = getDirname();

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", appName: "Hak.Ku" });
});

// GET LBH Directory list
app.get("/api/lbh", (req, res) => {
  const city = req.query.city as string | undefined;
  const list = listLBH(city);
  res.json({ success: true, list });
});

// POST simulated OCR Document Scanner
app.post("/api/ocr", async (req, res) => {
  try {
    const { filename, content } = req.body;
    if (!filename) {
      return res.status(400).json({ success: false, error: "Filename is required" });
    }
    const result = await processDocumentOCR(content || "", filename);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Chat Session Retrieval
app.post("/api/session/get", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }
  const session = memoryStore.getOrCreateSession(sessionId);
  res.json(session);
});

// POST Update Session Configuration / Preferences
app.post("/api/session/preferences", (req, res) => {
  const { sessionId, tone, lengthMode } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }
  memoryStore.updatePreferences(sessionId, { tone, lengthMode });
  res.json({ success: true });
});

// POST Toggle Save Session Memory
app.post("/api/session/remember", (req, res) => {
  const { sessionId, enabled } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }
  memoryStore.setRemember(sessionId, enabled);
  res.json({ success: true, rememberEnabled: enabled });
});

// POST Clear Session Logs
app.post("/api/session/clear", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }
  memoryStore.clearSession(sessionId);
  res.json({ success: true });
});

// POST generate actual legal assistant chat turns
app.post("/api/chat", async (req, res) => {
  try {
    const { sessionId, message, tone, lengthMode, temperature } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId and message are required" });
    }

    // Retrieve previous conversations
    const session = memoryStore.getOrCreateSession(sessionId);
    
    // Core response generator invoking modern @google/genai Gemini SDK
    const responseResult = await generateChatResponse({
      sessionId,
      message,
      history: session.messages,
      tone: tone || session.userPreferences?.tone || "ramah",
      lengthMode: lengthMode || session.userPreferences?.lengthMode || "standar",
      temperature: temperature !== undefined ? temperature : 0.4
    });

    // Save logs to durable memory store (filtered limits handled in store)
    memoryStore.saveMessage(sessionId, "user", message);
    memoryStore.saveMessage(sessionId, "assistant", responseResult.text);

    // Update preferences dynamically
    if (tone || lengthMode) {
      memoryStore.updatePreferences(sessionId, {
        tone: tone || session.userPreferences?.tone || "ramah",
        lengthMode: lengthMode || session.userPreferences?.lengthMode || "standar"
      });
    }

    // Trigger asynchronous conversational analysis summary generation
    const updatedSession = memoryStore.getOrCreateSession(sessionId);
    if (updatedSession.rememberEnabled && updatedSession.messages.length >= 2) {
      generateSessionSummary(updatedSession.messages)
        .then(summaryText => {
          if (summaryText) {
            memoryStore.setSummary(sessionId, summaryText);
          }
        })
        .catch(err => console.warn("Async summary warning:", err));
    }

    res.json({
      success: true,
      text: responseResult.text,
      groundedArticles: responseResult.groundedArticles,
      session: memoryStore.getOrCreateSession(sessionId)
    });

  } catch (error: any) {
    console.error("Express Chat backend error: ", error);
    res.status(500).json({ error: error.message || "Terjadi kesalahan internal pada asisten Hak.Ku" });
  }
});

// Boot sequence wrapping
async function bootstrap() {
  // Vite middleware / SPA static serving setup
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve frontend assets in production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // Fallback index.html router for SPA in production
    app.get("*", (req, res, next) => {
      // Pass API requests
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Default server port setting
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hak.Ku Full-Stack Server starting on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error("Fatality bootstrapping Hak.Ku server:", err);
});
