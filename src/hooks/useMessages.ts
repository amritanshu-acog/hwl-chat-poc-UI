import { useState, useEffect, useCallback } from "react";
import type { Message } from "../types";
// Phase 2: import { getChatHistory, saveMessage } from '../api'

const SESSION_KEY = (id: string) => `hwl_session_${id}`;

function loadFromStorage(sessionId: string): Message[] {
  try {
    const raw = localStorage.getItem(SESSION_KEY(sessionId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<
      Omit<Message, "timestamp"> & { timestamp: string }
    >;
    return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return [];
  }
}

function saveToStorage(sessionId: string, messages: Message[]): void {
  // Phase 2: swap this line → await saveMessage(sessionId, messages[messages.length - 1])
  localStorage.setItem(SESSION_KEY(sessionId), JSON.stringify(messages));
}

export function useMessages(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>(() =>
    loadFromStorage(sessionId),
  );

  // Reload messages when session switches
  // Phase 2: swap loadFromStorage → await getChatHistory(sessionId)
  useEffect(() => {
    setMessages(loadFromStorage(sessionId));
  }, [sessionId]);

  const addMessage = useCallback(
    (message: Message) => {
      // ✅ FIX: derive next state from React state (prev), not by re-reading localStorage.
      // This avoids stale reads and race conditions.
      setMessages((prev) => {
        const next = [...prev, message];
        saveToStorage(sessionId, next);
        return next;
      });
    },
    [sessionId],
  );

  const clearMessages = useCallback(() => {
    localStorage.removeItem(SESSION_KEY(sessionId));
    setMessages([]);
  }, [sessionId]);

  return { messages, addMessage, clearMessages };
}
