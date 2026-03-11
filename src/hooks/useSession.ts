/**
 * useSession.ts
 * -------------
 * Manages session IDs and the sidebar session list.
 *
 * Session ID ownership:
 *   demoMode=true  → client generates IDs (crypto.randomUUID)
 *   demoMode=false → server returns session_id on first message;
 *                    call confirmSessionId() to sync it back here
 */

import { useState, useCallback } from "react";
import type { Session } from "../types";
import { APP_CONFIG } from "../config";

const CURRENT_KEY = "hwl_session_current";
const INDEX_KEY = "hwl_sessions_index";
const MAX_SESSIONS = 20;

function loadIndex(): Session[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<
      Omit<Session, "startedAt" | "messages"> & { startedAt: string }
    >;
    return parsed.map((s) => ({
      ...s,
      startedAt: new Date(s.startedAt),
      messages: [],
    }));
  } catch {
    return [];
  }
}

function saveIndex(sessions: Session[]): void {
  localStorage.setItem(
    INDEX_KEY,
    JSON.stringify(sessions.slice(-MAX_SESSIONS)),
  );
}

function getOrCreateSession(): string {
  const existing = localStorage.getItem(CURRENT_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(CURRENT_KEY, id);
  return id;
}

export function useSession() {
  const [sessionId, setSessionId] = useState<string>(getOrCreateSession);
  const [sessions, setSessions] = useState<Session[]>(loadIndex);

  const startNewSession = useCallback(() => {
    // In production the real session_id comes back from the server on
    // the first message. We use a temporary client UUID until then.
    const id = crypto.randomUUID();
    localStorage.setItem(CURRENT_KEY, id);
    setSessionId(id);
    return id;
  }, []);

  /**
   * Called by ChatPage after the first API response in a new session.
   * Replaces the temporary client UUID with the server-assigned session_id.
   * Only used in production mode — demo mode keeps client-generated IDs.
   */
  const confirmSessionId = useCallback((tempId: string, serverId: string) => {
    if (APP_CONFIG.demoMode) return;
    if (tempId === serverId) return;

    // Migrate localStorage keys
    const messages = localStorage.getItem(`hwl_session_${tempId}`);
    if (messages) {
      localStorage.setItem(`hwl_session_${serverId}`, messages);
      localStorage.removeItem(`hwl_session_${tempId}`);
    }

    localStorage.setItem(CURRENT_KEY, serverId);
    setSessionId(serverId);

    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.sessionId === tempId ? { ...s, sessionId: serverId } : s,
      );
      saveIndex(updated);
      return updated;
    });
  }, []);

  const switchSession = useCallback((id: string) => {
    localStorage.setItem(CURRENT_KEY, id);
    setSessionId(id);
  }, []);

  const updateSessionPreview = useCallback((id: string, preview: string) => {
    setSessions((prev) => {
      const exists = prev.find((s) => s.sessionId === id);
      let updated: Session[];
      if (exists) {
        updated = prev.map((s) => (s.sessionId === id ? { ...s, preview } : s));
      } else {
        const newSession: Session = {
          sessionId: id,
          startedAt: new Date(),
          preview,
          messages: [],
        };
        updated = [...prev, newSession];
      }
      saveIndex(updated);
      return updated;
    });
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      // ✅ FIX: use `updated` derived from React state instead of re-reading
      // localStorage via loadIndex(), which could be stale.
      setSessions((prev) => {
        const updated = prev.filter((s) => s.sessionId !== id);
        saveIndex(updated);

        if (id === sessionId) {
          if (updated.length > 0) {
            // Switch to the most recent remaining session
            const nextId = updated[updated.length - 1].sessionId;
            localStorage.setItem(CURRENT_KEY, nextId);
            setSessionId(nextId);
          } else {
            // No sessions left — create a fresh one
            localStorage.removeItem(CURRENT_KEY);
            const newId = crypto.randomUUID();
            localStorage.setItem(CURRENT_KEY, newId);
            setSessionId(newId);
          }
        }

        return updated;
      });

      localStorage.removeItem(`hwl_session_${id}`);
    },
    [sessionId],
  );

  return {
    sessionId,
    sessions,
    startNewSession,
    switchSession,
    updateSessionPreview,
    confirmSessionId,
    deleteSession,
  };
}
