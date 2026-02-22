import { useState, useCallback } from "react";
import type { Session } from "../types";

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
  const trimmed = sessions.slice(-MAX_SESSIONS);
  localStorage.setItem(INDEX_KEY, JSON.stringify(trimmed));
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
    const id = crypto.randomUUID();
    localStorage.setItem(CURRENT_KEY, id);
    setSessionId(id);
    return id;
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
      setSessions((prev) => {
        const updated = prev.filter((s) => s.sessionId !== id);
        saveIndex(updated);
        return updated;
      });
      // Also remove the actual message content
      localStorage.removeItem(`hwl_session_${id}`);

      // If we deleted the current session, we need to handle it
      if (id === sessionId) {
        const remainingSessions = loadIndex();
        if (remainingSessions.length > 0) {
          const nextId = remainingSessions[0].sessionId;
          localStorage.setItem(CURRENT_KEY, nextId);
          setSessionId(nextId);
        } else {
          localStorage.removeItem(CURRENT_KEY);
          const newId = crypto.randomUUID();
          localStorage.setItem(CURRENT_KEY, newId);
          setSessionId(newId);
        }
      }
    },
    [sessionId],
  );

  return {
    sessionId,
    sessions,
    startNewSession,
    switchSession,
    updateSessionPreview,
    deleteSession,
  };
}
