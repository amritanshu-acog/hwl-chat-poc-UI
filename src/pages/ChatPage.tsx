import { useState, useCallback } from "react";
import { flushSync } from "react-dom";
import type { Message, LLMResponse } from "../types";
import { useSession } from "../hooks/useSession";
import { useMessages } from "../hooks/useMessages";
import { sendMessage } from "../services/api";
import { QuotaExceededError, UnauthorizedError, ApiError } from "../services/errors";
import { MessageList } from "../components/MessageList";
import { InputBar } from "../components/InputBar";
import { Sidebar } from "../components/Sidebar";
import { ToastRegion, useToasts } from "../components/Toast";
import { APP_CONFIG, type QuickReply } from "../config";
import { DangerIcon } from "../assets/icons";

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

    const { toasts, pushToast, dismissToast } = useToasts();

    const {
        sessions,
        sessionsLoading,
        sessionsError,
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
        removeMessage,
        clearMessages,
        loadSessionHistory,
        updateMessageSelection,
    } = useMessages(token, onUnauthorized);

    // ─── Send ─────────────────────────────────────────────────────────────────

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

            // Optimistically show the user message.
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
                // ── Remove the optimistic user message so they can retype ──────
                // Only do this for transient/network errors — not quota (which
                // permanently locks the session).
                const isTransient = !(err instanceof QuotaExceededError);
                if (isTransient) removeMessage(userMsg.id);

                // ── Route each error class to the right UI surface ────────────

                if (err instanceof QuotaExceededError) {
                    // Permanent for this session → sticky banner above input.
                    setQuotaExceeded(true);

                } else if (err instanceof UnauthorizedError) {
                    // Token expired → Auth boundary handles full re-auth.
                    onUnauthorized();

                } else if (err instanceof ApiError) {
                    // Known server error (5xx, 4xx other than 401/429).
                    pushToast({
                        severity: 'error',
                        title: 'Server error',
                        message: `The server returned an error (HTTP ${err.status}). Your message was not sent.`,
                        action: { label: 'Retry', onClick: () => send(text) },
                    });

                } else {
                    // Network failure, JSON parse error, etc.
                    const isNetworkError = err instanceof TypeError && err.message.includes('fetch');
                    pushToast({
                        severity: 'error',
                        title: isNetworkError ? 'Connection error' : 'Something went wrong',
                        message: isNetworkError
                            ? 'Could not reach the server. Check your connection and try again.'
                            : (err instanceof Error ? err.message : 'An unexpected error occurred.'),
                        action: { label: 'Retry', onClick: () => send(text) },
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
            removeMessage,
            confirmSessionId,
            refreshSessions,
            onUnauthorized,
            pushToast,
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
            try {
                await loadSessionHistory(sessionId);
            } catch {
                pushToast({
                    severity: 'error',
                    title: 'Could not load conversation',
                    message: 'Failed to fetch session history. Please try again.',
                });
            }
        },
        [activeSessionId, setActiveSessionId, loadSessionHistory, pushToast],
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    const isWorking = isLoading || historyLoading;

    if (sessionsError && sessions.length === 0) {
        const isNetworkError = sessionsError instanceof TypeError && sessionsError.message.includes('fetch');
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50 px-6 font-sans">
                <div className="w-full max-w-sm rounded-xl border border-red-200 bg-white p-6 shadow-sm text-center flex flex-col items-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <DangerIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <h1 className="mb-2 text-base font-bold text-slate-800">
                        {isNetworkError ? "Connection Error" : "Server Error"}
                    </h1>
                    <p className="text-sm text-slate-500 mb-6 px-2 leading-relaxed">
                        {isNetworkError
                            ? "The backend server is unreachable. Please check your connection or verify the VITE_API_URL configuration."
                            : "An unexpected error occurred while connecting to the server. Please try again."}
                    </p>
                    <button
                        onClick={refreshSessions}
                        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Toast notifications — rendered outside the layout flow */}
            <ToastRegion toasts={toasts} onDismiss={dismissToast} />

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
                                quickReplies={APP_CONFIG.quickReplies as unknown as QuickReply[]}
                            />
                        )}
                    </div>

                    {/* ── Quota-exceeded banner (sticky, above input) ─────────── */}
                    {quotaExceeded && (
                        <div
                            role="alert"
                            className="flex-shrink-0 border-t border-amber-200 bg-amber-50 px-6 py-3 flex items-center justify-between gap-4"
                        >
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

                    {/* ── Input bar (hidden while quota is exceeded) ──────────── */}
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
        </>
    );
}