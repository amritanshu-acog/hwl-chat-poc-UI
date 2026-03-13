import { getDummyResponse } from "../lib/dummy";
import { jsonToMdx } from "../lib/jsonToMdx";
import { APP_CONFIG } from "../config";
import type { LLMResponse } from "../types/llmResponse";
import type { SendMessageResponse } from "../types";

export async function sendMessage(
  message: string,
  sessionId: string,
  token: string,
  file?: File,
): Promise<SendMessageResponse> {
  // ── Demo mode ────────────────────────────────────────────────
  if (APP_CONFIG.demoMode) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));
    const json = getDummyResponse(message);
    return {
      body: jsonToMdx(json),
      citations: json.citations ?? [],
    };
  }

  // ── Production ───────────────────────────────────────────────
  const endpoint = APP_CONFIG.apiUrl;

  const reqBody: BodyInit = file
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
    body: reqBody,
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const raw = await res.text();

  try {
    const parsed = JSON.parse(raw) as LLMResponse;
    return {
      body: jsonToMdx(parsed),
      citations: parsed.citations ?? [],
    };
  } catch {
    return { body: raw, citations: [] };
  }
}
