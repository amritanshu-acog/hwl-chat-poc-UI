import { useState, useRef, useEffect } from "react";
import type { SessionListItem } from "../types";
import {
    MenuIcon, PlusIcon, ChatIcon,
    ChevronIcon, ProfileIcon, SettingsIcon, HelpIcon,
} from "../assets/icons";

interface SidebarProps {
    activeSessionId: string | null;
    sessions: SessionListItem[];
    sessionsLoading: boolean;
    displayName: string;
    primaryColor: string;
    title: string;
    isLoading: boolean;
    onNewChat: () => void;
    onSwitchSession: (sessionId: string) => void;
    onDeleteSession: (sessionId: string) => Promise<void>; // <-- NEW
}

interface UserMenuItem {
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
    danger: boolean;
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor(
        (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Trash icon (inline SVG, no extra dep) ───────────────────────────────────

function TrashIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    );
}

// ─── Confirmation modal ──────────────────────────────────────────────────────

interface ConfirmDeleteModalProps {
    sessionTitle: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
    primaryColor: string;
}

function ConfirmDeleteModal({
    sessionTitle,
    onConfirm,
    onCancel,
    isDeleting,
}: ConfirmDeleteModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isDeleting) onCancel();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isDeleting, onCancel]);

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !isDeleting) onCancel();
            }}
        >
            <div className="mx-4 w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-xl">
                {/* Icon */}
                <div className="flex flex-col items-center px-6 pt-6 pb-4 text-center">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">Delete conversation?</h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                        <span className="font-medium text-slate-700">
                            "{sessionTitle}"
                        </span>{" "}
                        will be permanently deleted and cannot be recovered.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-slate-100 px-6 py-4">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 rounded-xl bg-red-500 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                        {isDeleting ? (
                            <>
                                <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Deleting…
                            </>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({
    activeSessionId, sessions, sessionsLoading, displayName, primaryColor,
    title: _title, isLoading, onNewChat, onSwitchSession, onDeleteSession,
}: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // { sessionId, title } of the session pending deletion, or null
    const [pendingDelete, setPendingDelete] = useState<{ sessionId: string; title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
                setUserMenuOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (collapsed) setUserMenuOpen(false);
    }, [collapsed]);

    const handleDeleteClick = (
        e: React.MouseEvent,
        session: SessionListItem,
    ) => {
        e.stopPropagation(); // don't trigger onSwitchSession
        setPendingDelete({ sessionId: session.session_id, title: session.title || "Untitled" });
    };

    const handleConfirmDelete = async () => {
        if (!pendingDelete) return;
        setIsDeleting(true);
        try {
            await onDeleteSession(pendingDelete.sessionId);
        } finally {
            setIsDeleting(false);
            setPendingDelete(null);
        }
    };

    const userMenuItems: UserMenuItem[] = [
        { label: "Profile", icon: <ProfileIcon />, onClick: undefined, danger: false },
        { label: "Settings", icon: <SettingsIcon />, onClick: undefined, danger: false },
        { label: "Help", icon: <HelpIcon />, onClick: undefined, danger: false },
    ];

    return (
        <>
            {/* Confirmation modal — rendered outside the aside so it overlays everything */}
            {pendingDelete && (
                <ConfirmDeleteModal
                    sessionTitle={pendingDelete.title}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => !isDeleting && setPendingDelete(null)}
                    isDeleting={isDeleting}
                    primaryColor={primaryColor}
                />
            )}

            <aside
                className="flex flex-shrink-0 flex-col bg-white border-r border-slate-200 overflow-hidden transition-all duration-300 ease-in-out"
                style={{ width: collapsed ? 56 : 256 }}
            >
                {/* Header */}
                <div className="flex items-center gap-2 px-3 py-3.5 border-b border-slate-100">
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <MenuIcon />
                    </button>
                    {!collapsed && (
                        <img
                            src="/HWL.jpg"
                            alt="HWL"
                            className="h-6 w-auto object-contain"
                        />
                    )}
                </div>

                {/* Session list */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 space-y-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                    {sessionsLoading && !collapsed && (
                        <div className="space-y-1 px-1 py-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-8 rounded-lg bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    )}

                    {!sessionsLoading && !collapsed && sessions.length === 0 && (
                        <p className="px-3 py-6 text-center text-xs text-slate-400">
                            No conversations yet
                        </p>
                    )}

                    {sessions.map((s: SessionListItem) => {
                        const isActive = s.session_id === activeSessionId;
                        const isDisabled = isLoading;

                        return (
                            <button
                                key={s.session_id}
                                onClick={() => !isDisabled && onSwitchSession(s.session_id)}
                                title={collapsed ? (s.title || "Untitled") : undefined}
                                disabled={isDisabled}
                                className={`group flex w-full items-center gap-2 rounded-lg border px-2 py-2 text-left transition-all
                                    ${isDisabled
                                        ? 'cursor-not-allowed opacity-40'
                                        : isActive
                                            ? 'cursor-default border-slate-200'
                                            : 'cursor-pointer border-transparent hover:bg-slate-50'
                                    }`}
                                style={
                                    isActive
                                        ? { backgroundColor: `${primaryColor}12`, borderColor: `${primaryColor}30` }
                                        : {}
                                }
                            >
                                <ChatIcon size={14} color={isActive ? primaryColor : "#94a3b8"} />
                                {!collapsed && (
                                    <>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-xs font-medium text-slate-700 leading-snug">
                                                {s.title || "Untitled"}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                                <span>{formatDate(s.updated_at)}</span>
                                                <span>·</span>
                                                <span>{s.turn_count} {s.turn_count === 1 ? "turn" : "turns"}</span>
                                            </p>
                                        </div>

                                        {/* Delete button — visible on row hover, hidden when sidebar is loading */}
                                        <span
                                            role="button"
                                            tabIndex={isDisabled ? -1 : 0}
                                            onClick={(e) => !isDisabled && handleDeleteClick(e, s)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    if (!isDisabled) handleDeleteClick(e as any, s);
                                                }
                                            }}
                                            title="Delete conversation"
                                            className={`
                                                ml-auto flex-shrink-0 flex items-center justify-center
                                                h-5 w-5 rounded-md text-slate-300
                                                opacity-0 group-hover:opacity-100
                                                hover:!text-red-500 hover:bg-red-50
                                                transition-all duration-150
                                                ${isDisabled ? 'pointer-events-none' : ''}
                                            `}
                                        >
                                            <TrashIcon />
                                        </span>
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* New Chat button */}
                <div className={`border-t border-slate-100 ${collapsed ? "flex justify-center py-2.5 px-2" : "px-3 py-2.5"}`}>
                    {collapsed ? (
                        <button
                            onClick={onNewChat}
                            disabled={isLoading}
                            title="New Chat"
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={onNewChat}
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <PlusIcon className="w-4 h-4" />
                            New Chat
                        </button>
                    )}
                </div>

                {/* User badge */}
                <div className="relative border-t border-slate-100" ref={userMenuRef}>
                    {!collapsed && userMenuOpen && (
                        <div className="absolute bottom-full left-2 right-2 mb-1 rounded-xl border border-slate-100 bg-white shadow-lg overflow-hidden z-50">
                            <div className="px-3 py-2 border-b border-slate-100" style={{ backgroundColor: `${primaryColor}08` }}>
                                <p className="text-xs font-semibold text-slate-700 truncate">{displayName}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Manage your account</p>
                            </div>
                            <div className="py-1">
                                {userMenuItems.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { item.onClick?.(); setUserMenuOpen(false); }}
                                        className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors ${item.danger ? "text-red-500 hover:bg-red-50" : "text-slate-600"}`}
                                    >
                                        <span className={item.danger ? "text-red-400" : "text-slate-400"}>{item.icon}</span>
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => !collapsed && setUserMenuOpen(o => !o)}
                        title={collapsed ? displayName : undefined}
                        className="flex w-full items-center gap-2.5 px-3 py-3 hover:bg-slate-50 transition-colors"
                    >
                        <div
                            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                        >
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <>
                                <span className="flex-1 truncate text-xs font-medium text-slate-700">{displayName}</span>
                                <ChevronIcon open={userMenuOpen} />
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}