import type { Message } from "./types";
import { getDummyResponse } from "./dummy";
import { APP_CONFIG } from "./config";

/**
 * Send a message.
 * - demoMode=true  → uses dummy.ts (no network)
 * - demoMode=false → calls the real API
 */
export async function sendMessage(
  message: string,
  sessionId: string,
  _file?: File,
): Promise<string> {
  if (APP_CONFIG.demoMode) {
    // Simulate a short network delay so the UI feels real
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));
    const components = getDummyResponse(message);
    return JSON.stringify({ response: components });
  }

  const res = await fetch(`${APP_CONFIG.apiUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.text();
}

/**
 * Upload a document (Phase 2).
 */
export async function uploadDocument(file: File): Promise<void> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${APP_CONFIG.apiUrl}/documents`, {
    method: "POST",
    body,
  });
  if (!res.ok) throw new Error(`Upload error: ${res.status}`);
}

/**
 * Load chat history for a session.
 * Phase 1: localStorage. Phase 2: swap one line → fetch from backend.
 */
export async function getChatHistory(sessionId: string): Promise<Message[]> {
  const raw = localStorage.getItem(`hwl_session_${sessionId}`);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as Array<
    Omit<Message, "timestamp"> & { timestamp: string }
  >;
  return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
}

/**
 * Save a message.
 * Phase 1: localStorage. Phase 2: POST to backend.
 */
export async function saveMessage(
  sessionId: string,
  message: Message,
): Promise<void> {
  const existing = await getChatHistory(sessionId);
  const updated = [...existing, message];
  localStorage.setItem(`hwl_session_${sessionId}`, JSON.stringify(updated));
}
