import { useState, useCallback } from "react";
import type { Message, SessionTurn, LLMResponse } from "../types";
import { fetchSessionHistory } from "../services/api";
import { UnauthorizedError } from "../services/errors";
import { jsonToMdx } from "../lib/jsonToMdx";

function turnToMessage(turn: SessionTurn, nextTurn?: SessionTurn): Message {
  if (turn.role === "assistant" && turn.response_type) {
    const selectedOption =
      turn.options?.length && nextTurn?.role === "user" && nextTurn.content
        ? nextTurn.content
        : undefined;

    return {
      id: crypto.randomUUID(),
      role: turn.role,
      content: jsonToMdx(turn as unknown as LLMResponse, selectedOption),
      action: turn.action,
      response_type: turn.response_type,
      citations: turn.citations ?? [],
      timestamp: new Date(turn.ts),
      isHistorical: false,
    };
  }

  return {
    id: crypto.randomUUID(),
    role: turn.role,
    content: turn.content,
    citations: turn.citations ?? [],
    timestamp: new Date(turn.ts),
    isHistorical: true,
  };
}

export function useMessages(token: string, onUnauthorized: () => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  /** Roll back an optimistic message (e.g. on API failure). */
  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * Re-renders a live assistant message's MDX with the chosen Choices option
   * frozen. Called immediately on click so the UI updates before the API reply.
   */
  const updateMessageSelection = useCallback(
    (messageId: string, llmResponse: LLMResponse, selectedOption: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: jsonToMdx(llmResponse, selectedOption) }
            : msg,
        ),
      );
    },
    [],
  );

  const loadSessionHistory = useCallback(
    async (sessionId: string) => {
      setHistoryLoading(true);
      setMessages([]);
      try {
        const history = await fetchSessionHistory(sessionId, token);
        setMessages(
          history.turns.map((turn, i) =>
            turnToMessage(turn, history.turns[i + 1]),
          ),
        );
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          onUnauthorized();
        } else {
          // Re-throw so callers (ChatPage) can show a toast.
          setMessages([]);
          throw err;
        }
      } finally {
        setHistoryLoading(false);
      }
    },
    [token, onUnauthorized],
  );

  return {
    messages,
    historyLoading,
    addMessage,
    removeMessage,
    clearMessages,
    loadSessionHistory,
    updateMessageSelection,
  };
}
