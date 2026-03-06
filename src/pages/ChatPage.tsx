/**
 * ChatPage.tsx
 * ------------
 * Full-page standalone chat — pure Tailwind, zero custom CSS classes.
 */

import { useState, useCallback } from "react";
import type { Message, Session } from "../types";
import { useSession } from "../hooks/useSession";
import { useMessages } from "../hooks/useMessages";
import { sendMessage } from "../api";
import { MessageList } from "../components/MessageList";
import { InputBar } from "../components/InputBar";
import { APP_CONFIG } from "../config";

export function ChatPage() {
    const { primaryColor, title, subtitle, placeholder } = APP_CONFIG;

    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [attachment, setAttachment] = useState<File | null>(null);

    const { sessionId, sessions, startNewSession, switchSession, updateSessionPreview, deleteSession } =
        useSession();
    const { messages, addMessage, clearMessages } = useMessages(sessionId);

    const send = useCallback(
        async (text: string) => {
            if (!text.trim() || isLoading) return;

            const userMsg: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: text,
                timestamp: new Date(),
                attachment: attachment ? { name: attachment.name, type: attachment.type } : undefined,
            };
            addMessage(userMsg);
            if (messages.length === 0) updateSessionPreview(sessionId, text);
            setInputValue("");
            const pendingFile = attachment;
            setAttachment(null);
            setIsLoading(true);

            try {
                const reply = await sendMessage(text, sessionId, pendingFile ?? undefined);
                addMessage({
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: reply,
                    timestamp: new Date(),
                });
            } catch {
                addMessage({
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: "⚠️ Sorry, I couldn't connect to the server. Please try again.",
                    timestamp: new Date(),
                });
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, attachment, messages.length, sessionId, addMessage, updateSessionPreview]
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
        clearMessages();
        startNewSession();
    }, [clearMessages, startNewSession]);

    const handleSwitchSession = useCallback(
        (id: string) => { switchSession(id); },
        [switchSession]
    );

    const displayName = "Guest User";

    return (
        // Root: full-screen two-column flex
        <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">

            {/* ════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════ */}
            <aside className="flex w-64 flex-shrink-0 flex-col bg-white border-r border-slate-200 overflow-hidden">

                {/* Brand header */}
                <div
                    className="flex items-center gap-3 px-5 py-5 flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)` }}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 flex-shrink-0">
                        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white leading-tight">{title}</p>
                        <p className="text-xs text-white/70 leading-tight mt-0.5">{subtitle}</p>
                    </div>
                </div>

                {/* New conversation button */}
                <div className="px-3 pt-4 pb-2 flex-shrink-0">
                    <button
                        onClick={handleNewChat}
                        className="flex w-full items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-xs font-medium transition-colors hover:bg-slate-50"
                        style={{ borderColor: `${primaryColor}50`, color: primaryColor }}
                    >
                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        New Conversation
                    </button>
                </div>

                {/* Session list */}
                <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5
                        [&::-webkit-scrollbar]:w-1.5
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-slate-200
                        [&::-webkit-scrollbar-thumb]:rounded-full">
                    {sessions.length === 0 ? (
                        <p className="px-3 py-4 text-center text-xs text-slate-400">No previous conversations</p>
                    ) : (
                        sessions
                            .slice()
                            .reverse()
                            .map((s: Session) => {
                                const isActive = s.sessionId === sessionId;
                                return (
                                    <button
                                        key={s.sessionId}
                                        onClick={() => handleSwitchSession(s.sessionId)}
                                        className={`group flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all ${isActive
                                            ? "border-slate-200 font-medium"
                                            : "border-transparent hover:bg-slate-50"
                                            }`}
                                        style={isActive ? { backgroundColor: `${primaryColor}12`, borderColor: `${primaryColor}30` } : {}}
                                    >
                                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                            className="flex-shrink-0 text-slate-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                d="M8 10h8M8 14h4m9 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="flex-1 truncate text-xs text-slate-600">{s.preview || "Untitled"}</span>
                                        <button
                                            title="Delete"
                                            onClick={(e) => { e.stopPropagation(); deleteSession(s.sessionId); }}
                                            className="hidden group-hover:flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-slate-400 hover:bg-red-100 hover:text-red-500 text-sm leading-none"
                                        >
                                            ×
                                        </button>
                                    </button>
                                );
                            })
                    )}
                </div>

                {/* User badge */}
                <div className="flex items-center gap-2.5 border-t border-slate-100 px-4 py-3.5">
                    <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                    >
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-xs font-semibold text-slate-700">{displayName}</span>
                        {APP_CONFIG.demoMode && (
                            <span className="w-fit rounded-full bg-amber-100 px-1.5 py-px text-[9px] font-bold tracking-wide text-amber-600">
                                DEMO
                            </span>
                        )}
                    </div>
                </div>
            </aside>

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
                        {APP_CONFIG.demoMode && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-600">
                                Demo Mode
                            </span>
                        )}
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
                            onFileSelect={setAttachment}
                            onFileClear={() => setAttachment(null)}
                            attachment={attachment}
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
