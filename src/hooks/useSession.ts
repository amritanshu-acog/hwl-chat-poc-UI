/**
 * useSession.ts
 * -------------
 * Manages the session list and the current active session ID.
 *
 * The server is the single source of truth:
 *   - Session list comes from GET /sessions (loaded on mount, refreshed after each turn)
 *   - No localStorage — nothing is persisted client-side
 *
 * activeSessionId:
 *   null          → new chat, no server session exists yet
 *   string (uuid) → server-assigned session ID for the current conversation
 */

import { useState, useEffect, useCallback } from "react";
import type { SessionListItem } from "../types";
import { fetchSessions } from "../services/api";
import { UnauthorizedError } from "../services/errors";

export function useSession(token: string, onUnauthorized: () => void) {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  /**
   * The server-assigned session ID for the current conversation.
   * null = new chat that the server hasn't seen yet.
   */
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  /** Pull the latest session list from the server. */
  const refreshSessions = useCallback(async () => {
    try {
      const list = await fetchSessions(token);
      setSessions(list); // server already sorts by recency
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        onUnauthorized();
      }
      // Other errors: silently retain the existing list
    }
  }, [token, onUnauthorized]);

  // Load session list on mount
  useEffect(() => {
    refreshSessions().finally(() => setSessionsLoading(false));
  }, [refreshSessions]);

  /** Start a new blank chat — clears the active session ID. */
  const startNewSession = useCallback(() => {
    setActiveSessionId(null);
  }, []);

  /**
   * Called after the first POST /answer response in a new session.
   * Records the server-assigned ID and refreshes the session list so
   * the new session appears in the sidebar.
   */
  const confirmSessionId = useCallback(
    (serverId: string) => {
      setActiveSessionId(serverId);
      refreshSessions();
    },
    [refreshSessions],
  );

  return {
    sessions,
    sessionsLoading,
    activeSessionId,
    setActiveSessionId,
    startNewSession,
    confirmSessionId,
    refreshSessions,
  };
}
