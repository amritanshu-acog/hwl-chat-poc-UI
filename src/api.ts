import type { Message } from "./types";

// TODO: Replace with actual backend URL from HWLAssistantProps.apiUrl
const BASE_URL = "http://localhost:3000/api";

/**
 * Send a message to the AI backend and get a response.
 * TODO: Implement streaming support in Phase 2 using ReadableStream.
 */
export async function sendMessage(
  message: string,
  sessionId: string,
  apiUrl: string = BASE_URL,
  file?: File,
): Promise<string> {
  const res = await fetch(`${apiUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  // Backend streams plain text
  return res.text();
}

/**
 * Upload a standalone document (e.g., for RAG context).
 * TODO: Connect to document ingestion pipeline in Phase 2.
 */
export async function uploadDocument(
  file: File,
  apiUrl: string = BASE_URL,
): Promise<void> {
  const body = new FormData();
  body.append("file", file);

  // TODO: Replace with real endpoint
  const res = await fetch(`${apiUrl}/documents`, { method: "POST", body });
  if (!res.ok) throw new Error(`Upload error: ${res.status}`);
}

/**
 * Load chat history for a session.
 * Phase 1: Uses localStorage (implemented in useMessages hook).
 * Phase 2: Swap this to fetch from backend — one-line change in useMessages.ts.
 */
export async function getChatHistory(sessionId: string): Promise<Message[]> {
  // TODO Phase 2: Replace with fetch(`${BASE_URL}/sessions/${sessionId}/messages`)
  const raw = localStorage.getItem(`hwl_session_${sessionId}`);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as Array<
    Omit<Message, "timestamp"> & { timestamp: string }
  >;
  return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
}

/**
 * Save a message for a session.
 * Phase 1: Uses localStorage (implemented in useMessages hook).
 * Phase 2: Swap this to POST to backend — one-line change in useMessages.ts.
 */
export async function saveMessage(
  sessionId: string,
  message: Message,
): Promise<void> {
  // TODO Phase 2: Replace with fetch(`${BASE_URL}/sessions/${sessionId}/messages`, { method:'POST', body:JSON.stringify(message) })
  const existing = await getChatHistory(sessionId);
  const updated = [...existing, message];
  localStorage.setItem(`hwl_session_${sessionId}`, JSON.stringify(updated));
}

/**
 * Phase 2: Create a HubSpot support ticket from the current session.
 * TODO: Implement when HubSpot integration is ready.
 */
export async function createHubSpotTicket(
  _sessionId: string,
  _apiUrl: string = BASE_URL,
): Promise<void> {
  // TODO Phase 2: POST to ${apiUrl}/hubspot/ticket
  throw new Error("HubSpot integration not yet implemented");
}

/**
 * Phase 2: Hand off session to a live agent.
 * TODO: Implement when live agent feature is ready.
 */
export async function requestLiveAgent(
  _sessionId: string,
  _apiUrl: string = BASE_URL,
): Promise<void> {
  // TODO Phase 2: POST to ${apiUrl}/handoff
  throw new Error("Live agent handoff not yet implemented");
}
