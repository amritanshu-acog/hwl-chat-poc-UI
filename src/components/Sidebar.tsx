/**
 * Sidebar.tsx
 * -----------
 * Session sidebar — brand header, new-conversation button, session list, user badge.
 * Extracted from ChatPage for better separation of concerns.
 */

import type { Session } from "../types";
import { APP_CONFIG } from "../config";

interface SidebarProps {
    sessionId: string;
    sessions: Session[];
    displayName: string;
    primaryColor: string;
    title: string;
    subtitle: string;
    onNewChat: () => void;
    onSwitchSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
}

export function Sidebar({
    sessionId,
    sessions,
    displayName,
    primaryColor,
    title,
    subtitle,
    onNewChat,
    onSwitchSession,
    onDeleteSession,
}: SidebarProps) {
    return (
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
                    onClick={onNewChat}
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
                    <p className="px-3 py-4 text-center text-xs text-slate-400">
                        No previous conversations
                    </p>
                ) : (
                    sessions
                        .slice()
                        .reverse()
                        .map((s: Session) => {
                            const isActive = s.sessionId === sessionId;
                            return (
                                <div
                                    key={s.sessionId}
                                    onClick={() => onSwitchSession(s.sessionId)}
                                    className={`group flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all cursor-pointer ${isActive
                                        ? "border-slate-200 font-medium"
                                        : "border-transparent hover:bg-slate-50"
                                        }`}
                                    style={isActive
                                        ? { backgroundColor: `${primaryColor}12`, borderColor: `${primaryColor}30` }
                                        : {}
                                    }
                                >
                                    <svg
                                        width="12" height="12"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        className="flex-shrink-0 text-slate-400"
                                    >
                                        <path
                                            strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M8 10h8M8 14h4m9 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className="flex-1 truncate text-xs text-slate-600">
                                        {s.preview || "Untitled"}
                                    </span>
                                    <button
                                        title="Delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteSession(s.sessionId);
                                        }}
                                        className="hidden group-hover:flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-slate-400 hover:bg-red-100 hover:text-red-500 text-sm leading-none"
                                    >
                                        ×
                                    </button>
                                </div>
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
                    <span className="truncate text-xs font-semibold text-slate-700">
                        {displayName}
                    </span>
                </div>
            </div>
        </aside>
    );
}
