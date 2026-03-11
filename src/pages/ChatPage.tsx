/**
 * ChatPage.tsx
 * ------------
 * Full-page standalone chat — pure Tailwind, zero custom CSS classes.
 */

import { useState, useCallback, useRef } from "react";
import type { Message } from "../types";
import { useSession } from "../hooks/useSession";
import { useMessages } from "../hooks/useMessages";
import { sendMessage } from "../services/api";
import { MessageList } from "../components/MessageList";
import { InputBar } from "../components/InputBar";
import { Sidebar } from "../components/Sidebar";
import { APP_CONFIG } from "../config";

interface ChatPageProps {
    token: string;
    userId: string;
}

export function ChatPage({ token, userId }: ChatPageProps) {
    const { primaryColor, title, subtitle, placeholder } = APP_CONFIG;

    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [attachment, setAttachment] = useState<File | null>(null);

    // Tracks the real backend session ID returned after the first message.
    // Undefined on a fresh session — omitted from the first request so the
    // backend creates a new session and returns its ID.
    const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);

    const {
        sessionId,
        sessions,
        startNewSession,
        switchSession,
        updateSessionPreview,
        deleteSession,
        confirmSessionId,
    } = useSession();

    const { messages, addMessage } = useMessages(sessionId);

    // ✅ FIX: Use a ref to track whether this is the first message of a session
    // so we don't rely on messages.length (which is 0 on first render even for
    // resumed sessions due to the async useEffect in useMessages).
    const hasPreviewRef = useRef<Record<string, boolean>>({});

    const send = useCallback(
        async (text: string) => {
            if (!text.trim() || isLoading) return;

            const userMsg: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: text,
                timestamp: new Date(),
                attachment: attachment
                    ? { name: attachment.name, type: attachment.type }
                    : undefined,
            };
            addMessage(userMsg);

            // ✅ FIX: track first-message-per-session via a ref, not messages.length,
            // to avoid false positives when messages haven't loaded from storage yet.
            if (!hasPreviewRef.current[sessionId]) {
                hasPreviewRef.current[sessionId] = true;
                updateSessionPreview(sessionId, text);
            }

            setInputValue("");
            const pendingFile = attachment;
            setAttachment(null);
            setIsLoading(true);

            try {
                // In production: first message has no session_id — backend creates one.
                // Subsequent messages use the backend session_id returned from the first response.
                // In demo mode: use the local sessionId as before.
                const backendSessionId = APP_CONFIG.demoMode
                    ? sessionId
                    : activeSessionId;

                const raw = await sendMessage(
                    text,
                    backendSessionId ?? "",
                    token,
                    pendingFile ?? undefined,
                );

                addMessage({
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: raw,
                    timestamp: new Date(),
                });

                // Sync the backend session_id back so subsequent turns resume correctly.
                if (!APP_CONFIG.demoMode) {
                    try {
                        const parsed = JSON.parse(raw);
                        if (parsed?.session_id) {
                            setActiveSessionId(parsed.session_id);
                            if (parsed.session_id !== sessionId) {
                                confirmSessionId(sessionId, parsed.session_id);
                            }
                        }
                    } catch { /* not JSON — ignore */ }
                }
            } catch {
                addMessage({
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: '<Alert severity="danger" title="Connection error" body="Sorry, I couldn\'t connect to the server. Please try again." />',
                    timestamp: new Date(),
                });
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, attachment, sessionId, activeSessionId, token, addMessage, updateSessionPreview, confirmSessionId]
    );

    const handleSend = useCallback(() => send(inputValue), [send, inputValue]);

    const handleQuickReply = useCallback(
        (text: string) => {
            if (isLoading) return;
            setInputValue(text);
            setTimeout(() => send(text), 80);
        },
        [isLoading, send]
    );

    const handleNewChat = useCallback(() => {
        // ✅ FIX: call startNewSession() FIRST to get the new ID, THEN reset state.
        // Previously clearMessages() was called first with the old sessionId — that
        // part is fine — but the ordering caused useMessages' useEffect to run and
        // wipe in-flight state. Now we let useMessages naturally load an empty array
        // for the brand-new sessionId (nothing in storage yet), so no explicit clear needed.
        const newId = startNewSession();
        setActiveSessionId(undefined); // reset so backend creates a fresh session
        // Mark the new session as having no preview yet
        delete hasPreviewRef.current[newId];
    }, [startNewSession]);

    const handleSwitchSession = useCallback(
        (id: string) => {
            switchSession(id);
            setActiveSessionId(id); // resume the existing backend session
            // Mark as already having a preview so we don't overwrite it
            hasPreviewRef.current[id] = true;
        },
        [switchSession]
    );

    const displayName = userId || "Guest User";

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">

            {/* ════════════════════════════════════
                SIDEBAR
            ════════════════════════════════════ */}
            <Sidebar
                sessionId={sessionId}
                sessions={sessions}
                displayName={displayName}
                primaryColor={primaryColor}
                title={title}
                subtitle={subtitle}
                onNewChat={handleNewChat}
                onSwitchSession={handleSwitchSession}
                onDeleteSession={deleteSession}
            />

            {/* ════════════════════════════════════
                MAIN CHAT COLUMN
            ════════════════════════════════════ */}
            <main className="flex flex-1 flex-col min-w-0 bg-slate-50">

                {/* Top header */}
                <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="text-sm font-semibold text-slate-800">{title}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-500">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_#d1fae5]" />
                        <span>Online</span>
                    </div>
                </header>

                {/* Messages — scrollable */}
                <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
                    <MessageList
                        messages={messages}
                        isLoading={isLoading}
                        primaryColor={primaryColor}
                        onQuickReply={handleQuickReply}
                        quickReplies={APP_CONFIG.quickReplies as unknown as { icon: string; text: string }[]}
                    />
                </div>

                {/* Input bar */}
                <div className="flex-shrink-0 border-t border-slate-200 bg-white">
                    <div className="mx-auto max-w-3xl">
                        <InputBar
                            value={inputValue}
                            onChange={setInputValue}
                            onSend={handleSend}
                            isLoading={isLoading}
                            placeholder={placeholder}
                            primaryColor={primaryColor}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}