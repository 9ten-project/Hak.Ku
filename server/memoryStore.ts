/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface ChatHistory {
  sessionId: string;
  messages: ChatMessage[];
  rememberEnabled: boolean;
  userPreferences?: {
    tone: string;
    lengthMode: string;
  };
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

class MemoryStore {
  private store: Map<string, ChatHistory> = new Map();

  public getOrCreateSession(sessionId: string): ChatHistory {
    let session = this.store.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        messages: [],
        rememberEnabled: true, // starts enabled by default
        userPreferences: {
          tone: "ramah",
          lengthMode: "standar"
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.store.set(sessionId, session);
    }
    return session;
  }

  public saveMessage(sessionId: string, role: "user" | "assistant", content: string) {
    const session = this.getOrCreateSession(sessionId);
    session.messages.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    session.updatedAt = new Date().toISOString();
    
    // Auto trim to last 30 messages if not remembering, or keep 50 if remembering
    const maxLimit = session.rememberEnabled ? 50 : 10;
    if (session.messages.length > maxLimit) {
      session.messages = session.messages.slice(-maxLimit);
    }
    
    this.store.set(sessionId, session);
  }

  public setRemember(sessionId: string, enabled: boolean) {
    const session = this.getOrCreateSession(sessionId);
    session.rememberEnabled = enabled;
    if (!enabled) {
      // If disabled, wipe historic messages except the current interaction
      if (session.messages.length > 2) {
        session.messages = session.messages.slice(-2);
      }
      session.summary = undefined;
    }
    session.updatedAt = new Date().toISOString();
    this.store.set(sessionId, session);
  }

  public updatePreferences(sessionId: string, preferences: { tone: string; lengthMode: string }) {
    const session = this.getOrCreateSession(sessionId);
    session.userPreferences = preferences;
    session.updatedAt = new Date().toISOString();
    this.store.set(sessionId, session);
  }

  public setSummary(sessionId: string, summary: string) {
    const session = this.getOrCreateSession(sessionId);
    session.summary = summary;
    session.updatedAt = new Date().toISOString();
    this.store.set(sessionId, session);
  }

  public clearSession(sessionId: string) {
    const session = this.store.get(sessionId);
    if (session) {
      this.store.set(sessionId, {
        sessionId,
        messages: [],
        rememberEnabled: session.rememberEnabled,
        userPreferences: session.userPreferences,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  public deleteSession(sessionId: string) {
    this.store.delete(sessionId);
  }
}

export const memoryStore = new MemoryStore();
