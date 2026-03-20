/**
 * api.ts
 * ------
 * All backend communication: POST /answer, GET /sessions, GET /sessions/:id.
 *
 * Every function:
 *  - Guards against unconfigured VITE_API_URL
 *  - Pre-flight checks token expiry before the network call
 *  - Maps HTTP 401 → UnauthorizedError, 429 → QuotaExceededError, other → ApiError
 */

import { jsonToMdx } from "../lib/jsonToMdx";
import { APP_CONFIG } from "../config";
import type {
  ApiResponse,
  LLMResponse,
  SendMessageResponse,
  SessionListItem,
  SessionHistory,
} from "../types";
import { QuotaExceededError, UnauthorizedError, ApiError } from "./errors";
import { isTokenValid } from "../utils/jwt";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function requireEndpoint(): string {
  const endpoint = APP_CONFIG.apiUrl;
  if (!endpoint) {
    throw new Error(
      "VITE_API_URL is not configured. Add it to your .env file.",
    );
  }
  return endpoint;
}

function requireValidToken(token: string): void {
  if (!isTokenValid(token)) throw new UnauthorizedError();
}

async function handleResponse(res: Response): Promise<void> {
  if (res.status === 401) throw new UnauthorizedError();
  if (res.status === 429) throw new QuotaExceededError();
  if (!res.ok) throw new ApiError(res.status);
}

// ─── POST /answer ─────────────────────────────────────────────────────────────

export async function sendMessage(
  message: string,
  /**
   * Pass the server-confirmed session_id to continue an existing session.
   * Pass null on the first message — omits session_id from the request body
   * so the backend creates a fresh session.
   */
  sessionId: string | null,
  token: string,
  file?: File,
): Promise<SendMessageResponse> {
  const endpoint = requireEndpoint();
  requireValidToken(token);

  // Only include session_id when the server has assigned one.
  const fields: Record<string, string> = { message };
  if (sessionId) fields.session_id = sessionId;

  const reqBody: BodyInit = file
    ? (() => {
        const fd = new FormData();
        Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
        fd.append("file", file);
        return fd;
      })()
    : JSON.stringify(fields);

  const headers: HeadersInit = file
    ? { Authorization: `Bearer ${token}` }
    : {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

  const res = await fetch(`${endpoint}/answer`, {
    method: "POST",
    headers,
    body: reqBody,
  });

  await handleResponse(res);

  const raw = await res.text();
  let parsed: ApiResponse;
  try {
    parsed = JSON.parse(raw) as ApiResponse;
  } catch {
    throw new Error(
      "Server returned an unexpected response format. Please try again.",
    );
  }

  return {
    body: jsonToMdx(parsed as unknown as LLMResponse),
    citations: parsed.citations ?? [],
    action: parsed.action as Exclude<typeof parsed.action, "quota_exceeded">,
    responseType: parsed.response_type,
    serverSessionId: parsed.session_id,
    llmResponse: parsed as unknown as LLMResponse, // <-- add this
  };
}

// ─── GET /sessions ────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's session list, sorted by recency (server order).
 */
export async function fetchSessions(token: string): Promise<SessionListItem[]> {
  const endpoint = requireEndpoint();
  requireValidToken(token);

  const res = await fetch(`${endpoint}/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  await handleResponse(res);
  return res.json() as Promise<SessionListItem[]>;
}

// ─── GET /sessions/:id ────────────────────────────────────────────────────────

/**
 * Fetch the full turn history for a single session.
 * Throws a plain Error (not ApiError) on 404 so callers can handle it gracefully.
 */
export async function fetchSessionHistory(
  sessionId: string,
  token: string,
): Promise<SessionHistory> {
  const endpoint = requireEndpoint();
  requireValidToken(token);

  const res = await fetch(`${endpoint}/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) throw new Error(`Session not found: ${sessionId}`);
  await handleResponse(res);
  return res.json() as Promise<SessionHistory>;
}
