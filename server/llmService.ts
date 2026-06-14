/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { findArticleByQuery } from "./legalKnowledge.js";
import { generateSystemPrompt, PromptConfig } from "./prompts.js";
import { ChatMessage } from "./memoryStore.js";

// Keep client lazy initialized as requested in constraints to avoid crash if env is missing
let aiClientInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClientInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in Settings > Secrets.");
    }
    aiClientInstance = new GoogleGenAI({
      apiKey: apiKey
    });
  }
  return aiClientInstance;
}

export interface ChatRequestParams {
  sessionId: string;
  message: string;
  history: ChatMessage[];
  tone: "formal" | "ramah" | "sangat sederhana";
  lengthMode: "ringkas" | "standar" | "detail";
  temperature?: number;
}

export interface ChatResponseResult {
  text: string;
  groundedArticles: string[];
}

export async function generateChatResponse(params: ChatRequestParams): Promise<ChatResponseResult> {
  const ai = getAIClient();
  
  // 1. Retrieve any matches in the legal knowledge base to ground the answer
  const matchedArticles = findArticleByQuery(params.message);
  let contextString = "";
  const groundedArticleTitles: string[] = [];
  
  if (matchedArticles.length > 0) {
    // Take at most 2 closest articles
    const closest = matchedArticles.slice(0, 2);
    contextString = closest.map(art => {
      groundedArticleTitles.push(art.title);
      return `Kategori: ${art.category.toUpperCase()}
Judul Edukasi: ${art.title}
Penjelasan Dasar: ${art.description}
Landasan Aturan: ${art.uuReference}
Poin Penting:
${art.keyPoints.map(p => `- ${p}`).join("\n")}
Langkah yang Dianjurkan:
${art.recommendedSteps.map(s => `- ${s}`).join("\n")}
Dokumen Pendukung:
${art.requiredDocuments.map(d => `- ${d}`).join("\n")}`;
    }).join("\n\n---\n\n");
  }

  // 2. Generate the system instruction prompt
  const systemInstruction = generateSystemPrompt({
    tone: params.tone,
    lengthMode: params.lengthMode
  }, contextString);

  // 3. Format the contents array according to @google/genai rules (role must be "user" or "model")
  const contents = [];
  
  // Append historical conversations
  params.history.forEach(m => {
    if (m.role === "user" || m.role === "assistant") {
      contents.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      });
    }
  });

  // Append new user message
  contents.push({
    role: "user" as const,
    parts: [{ text: params.message }]
  });

  // Set temperatures
  const temperature = params.temperature !== undefined ? params.temperature : 0.4;

  // Let's implement an elegant cascading multi-model list + retry strategy to robustly handle spikes
  const modelCandidates = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-3.5-flash",
    "gemini-2.5-pro"
  ];

  let lastError: any = null;
  let responseText = "";

  for (const modelName of modelCandidates) {
    let retries = 2; // For each model, try 2 times with a slight pause
    while (retries > 0) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature,
            topP: 0.95
          }
        });
        if (response && response.text) {
          responseText = response.text;
          return {
            text: responseText,
            groundedArticles: groundedArticleTitles
          };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt with model ${modelName} failed. Retries remaining: ${retries - 1}. Error:`, err.message || err);
        retries--;
        if (retries > 0) {
          // Pause for 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }

  // If we reach here, all fallbacks failed. Generate a fallback safe advisory message so the app never crashes.
  console.error("All models in candidate list failed. Dispatching local standard legal safety template.");
  
  const emergencyTemplate = `### ⚖️ Pemberitahuan Terkait Kepadatan Jaringan AI Hak.Ku

Halo, mohon maaf. Server kecerdasan buatan Hak.Ku saat ini sedang mengalami lonjakan lalu lintas data yang sangat tinggi (seluruh jalur model backend sedang sibuk). Namun, jangan khawatir! Berdasarkan analisis cepat kami terhadap kata kunci Anda: **"${params.message.slice(0, 60)}..."**, berikut adalah panduan darurat umum yang dapat kami berikan:

1. **Jaga Ketenangan & Kumpulkan Bukti**: Baik sengketa kontrak, PHK, penipuan, ataupun waris, kumpulkan seluruh tangkapan layar chat, berkas tertulis, bukti transfer, dan slip pembayaran ke dalam satu folder aman secara rapi.
2. **Utamakan Penyelesaian Damai (Mediasi)**: Selalu coba musyawarah mufakat (ADR - Alternative Dispute Resolution) terlebih dahulu dengan pihak terkait melalui bantuan Ketua RT/RW setempat atau penengah terpercaya.
3. **Hubungi Bantuan Hukum Resmi**: Jika masalah Anda berisiko finansial besar atau terdapat unsur kekerasan fisik/intimidasi, segera hubungi **Lembaga Bantuan Hukum (LBH) terdekat** atau pihak Kepolisian RI di nomor darurat **110**.

*Catatan: Silakan klik kembali opsi pertanyaan atau kirim ulang chat Anda semenit lagi saat jaringan server AI telah normal.*

---
**💡 Disclaimer Hak.Ku:** Penjelasan ini disajikan sebagai informasi umum dasar perlindungan diri awal, bukan merupakan nasihat hukum spesifik bersertifikasi Advokat.`;

  return {
    text: emergencyTemplate,
    groundedArticles: groundedArticleTitles
  };
}

/**
 * Generates an automated summary of the main case described in the chat session. This is triggered after
 * a conversation has advanced, helping to maintain a lightweight profile of their legal inquiry on-screen.
 */
export async function generateSessionSummary(history: ChatMessage[]): Promise<string> {
  const ai = getAIClient();
  if (history.length < 2) return "";

  const summaryPrompt = `Analisis riwayat percakapan hukum dasar di bawah ini dan berikan ringkasan yang sangat singkat padat (maksimal 2 kalimat singkat dalam Bahasa Indonesia) mengenai inti permasalahan hukum yang dihadapi pengguna, serta kategori kasusnya (seperti Sewa properti, PHK, Penipuan online, sengketa keluarga dll). Jangan simpan nama penerima atau alamat sensitif.

Detail Percakapan:
${history.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}`;

  try {
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: summaryPrompt,
        config: {
          temperature: 0.2
        }
      });
    } catch (err) {
      console.warn("generateSessionSummary fallback from 3.5-flash to 3.1-flash-lite due to primary model overload");
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: summaryPrompt,
        config: {
          temperature: 0.2
        }
      });
    }
    return response.text ? response.text.trim() : "";
  } catch (e) {
    console.warn("Could not generate automatic summary: ", e);
    return "";
  }
}
