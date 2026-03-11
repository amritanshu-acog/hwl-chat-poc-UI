/**
 * services/api.ts
 * ---------------
 * All network (and demo-mode) communication goes through here.
 *
 * demoMode=true  → uses lib/dummy.ts (no network), converts JSON → MDX
 * demoMode=false → calls apiUrl, parses LLMResponse JSON → MDX
 *
 * MessageBubble receives a plain MDX string in message.content.
 * It no longer needs to handle multiple JSON shapes.
 */

import { getDummyResponse } from "../lib/dummy";
import { jsonToMdx } from "../lib/jsonToMdx";
import { APP_CONFIG } from "../config";
import type { LLMResponse } from "../types/llmResponse";

/**
 * Send a user message and return an MDX string
 * that gets stored in message.content and rendered by MessageBubble.
 */
export async function sendMessage(
  message: string,
  sessionId: string,
  token: string,
  file?: File,
): Promise<string> {
  // ── Demo mode ────────────────────────────────────────────────
  if (APP_CONFIG.demoMode) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));
    const json = getDummyResponse(message);
    return jsonToMdx(json);
  }

  // ── Production ───────────────────────────────────────────────
  const endpoint = APP_CONFIG.apiUrl;

  const body: BodyInit = file
    ? (() => {
        const fd = new FormData();
        fd.append("message", message);
        fd.append("session_id", sessionId);
        fd.append("file", file);
        return fd;
      })()
    : JSON.stringify({ message, session_id: sessionId });

  const headers: HeadersInit = file
    ? { Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const res = await fetch(`${endpoint}/answer`, {
    method: "POST",
    headers,
    body,
  });

  // Handle quota exceeded
  if (res.status === 429) {
    const quotaMdx = jsonToMdx({
      action: "quota_exceeded",
      response_type: "quota_exceeded",
      alert: null,
      title: "Session Limit Reached",
      intro: null,
      steps: null,
      items: null,
      options: null,
      summary: null,
      escalation: {
        title: "Session limit reached",
        message:
          "You have reached the maximum number of messages for this session. Please start a new conversation to continue.",
      },
      chart: null,
      stages: null,
      followUp: null,
      citations: [],
      faqItems: null,
      quotaMessage:
        "You have reached the maximum number of messages for this session. Please start a new conversation to continue.",
    });
    return quotaMdx;
  }

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const raw = await res.text();

  // Parse the LLMResponse JSON and convert to MDX
  try {
    const parsed = JSON.parse(raw) as LLMResponse;
    return jsonToMdx(parsed);
  } catch {
    // Backend returned something unexpected — pass through as raw MDX
    return raw;
  }
}
