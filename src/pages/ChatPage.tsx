import { useState, useCallback } from "react";
import { flushSync } from "react-dom";
import type { Message, LLMResponse } from "../types";
import { useSession } from "../hooks/useSession";
import { useMessages } from "../hooks/useMessages";
import { sendMessage } from "../services/api";
import { QuotaExceededError, UnauthorizedError } from "../services/errors";
import { MessageList } from "../components/MessageList";
import { InputBar } from "../components/InputBar";
import { Sidebar } from "../components/Sidebar";
import { APP_CONFIG } from "../config";

interface ChatPageProps {
    token: string;
    userId: string;
    displayName: string;
    onUnauthorized: () => void;
}

export function ChatPage({
    token,
    userId: _userId,
    displayName,
    onUnauthorized,
}: ChatPageProps) {
    const { primaryColor, title, placeholder } = APP_CONFIG;

    const [isLoading, setIsLoading] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [quotaExceeded, setQuotaExceeded] = useState(false);

    const {
        sessions,
        sessionsLoading,
        activeSessionId,
        setActiveSessionId,
        startNewSession,
        confirmSessionId,
        refreshSessions,
    } = useSession(token, onUnauthorized);

    const {
        messages,
        historyLoading,
        addMessage,
        clearMessages,
        loadSessionHistory,
        updateMessageSelection,
    } = useMessages(token, onUnauthorized);

    // ─── Send ──────────────────────────────────────────────────────────────────

    const send = useCallback(
        async (text: string) => {
            if (!text.trim() || isLoading || quotaExceeded) return;

            const userMsg: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: text,
                timestamp: new Date(),
                attachment: attachment
                    ? { name: attachment.name, type: attachment.type }
                    : undefined,
            };

            const confirmedId = activeSessionId;
            const pendingFile = attachment;
            setAttachment(null);
            setIsLoading(true);

            flushSync(() => addMessage(userMsg));

            try {
                const { body, citations, action, responseType, serverSessionId, llmResponse } =
                    await sendMessage(
                        text,
                        confirmedId,
                        token,
                        pendingFile ?? undefined,
                    );

                flushSync(() =>
                    addMessage({
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: body,
                        citations,
                        action,
                        response_type: responseType,
                        timestamp: new Date(),
                        llmResponse,
                    }),
                );

                if (serverSessionId && serverSessionId !== confirmedId) {
                    confirmSessionId(serverSessionId);
                } else {
                    refreshSessions();
                }
            } catch (err) {
                if (err instanceof QuotaExceededError) {
                    setQuotaExceeded(true);
                    addMessage({
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: err.message,
                        citations: [],
                        timestamp: new Date(),
                    });
                } else if (err instanceof UnauthorizedError) {
                    onUnauthorized();
                } else {
                    addMessage({
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content:
                            err instanceof Error
                                ? err.message
                                : "An unexpected error occurred. Please try again.",
                        citations: [],
                        timestamp: new Date(),
                    });
                }
            } finally {
                setIsLoading(false);
            }
        },
        [
            isLoading,
            quotaExceeded,
            attachment,
            activeSessionId,
            token,
            addMessage,
            confirmSessionId,
            refreshSessions,
            onUnauthorized,
        ],
    );

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleQuickReply = useCallback(
        (text: string, messageId?: string, llmResponse?: LLMResponse) => {
            if (isLoading || quotaExceeded) return;
            if (messageId && llmResponse) {
                updateMessageSelection(messageId, llmResponse, text);
            }
            setTimeout(() => send(text), 80);
        },
        [isLoading, quotaExceeded, send, updateMessageSelection],
    );

    const handleNewChat = useCallback(() => {
        startNewSession();
        clearMessages();
        setQuotaExceeded(false);
    }, [startNewSession, clearMessages]);

    const handleSwitchSession = useCallback(
        async (sessionId: string) => {
            if (sessionId === activeSessionId) return;
            setActiveSessionId(sessionId);
            setQuotaExceeded(false);
            await loadSessionHistory(sessionId);
        },
        [activeSessionId, setActiveSessionId, loadSessionHistory],
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    const isWorking = isLoading || historyLoading;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">

            <Sidebar
                activeSessionId={activeSessionId}
                sessions={sessions}
                sessionsLoading={sessionsLoading}
                displayName={displayName}
                primaryColor={primaryColor}
                title={title}
                isLoading={isWorking}
                onNewChat={handleNewChat}
                onSwitchSession={handleSwitchSession}
            />

            <main className="flex flex-1 flex-col min-w-0 bg-slate-50">

                <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                        <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: primaryColor }}
                        />
                        <span className="text-sm font-semibold text-slate-800">{title}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-500">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_#d1fae5]" />
                        <span>Online</span>
                    </div>
                </header>

                <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
                    {historyLoading ? (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div
                                    className="h-6 w-6 animate-spin rounded-full border-2 border-transparent border-t-current"
                                    style={{ color: primaryColor }}
                                />
                                <p className="text-xs text-slate-400">Loading conversation…</p>
                            </div>
                        </div>
                    ) : (
                        <MessageList
                            messages={messages}
                            isLoading={isLoading}
                            isLoadingHistory={historyLoading}
                            primaryColor={primaryColor}
                            onQuickReply={handleQuickReply}
                            quickReplies={
                                APP_CONFIG.quickReplies as unknown as {
                                    icon: string;
                                    text: string;
                                }[]
                            }
                        />
                    )}
                </div>

                {quotaExceeded && (
                    <div className="flex-shrink-0 border-t border-amber-200 bg-amber-50 px-6 py-3 flex items-center justify-between gap-4">
                        <p className="text-xs text-amber-800 font-medium">
                            Session limit reached — start a new chat to continue.
                        </p>
                        <button
                            onClick={handleNewChat}
                            className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-95"
                            style={{ backgroundColor: primaryColor }}
                        >
                            New chat
                        </button>
                    </div>
                )}

                {!quotaExceeded && (
                    <div className="flex-shrink-0 border-t border-slate-200 bg-white">
                        <div className="mx-auto max-w-3xl">
                            <InputBar
                                onSend={send}
                                isLoading={isWorking}
                                placeholder={placeholder}
                                primaryColor={primaryColor}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}