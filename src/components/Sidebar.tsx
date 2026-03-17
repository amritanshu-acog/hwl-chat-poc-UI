import { useState, useRef, useEffect } from "react";
import type { Session } from "../types";
import {
    MenuIcon, PlusIcon, ChatIcon, DotsIcon, TrashIcon,
    ChevronIcon, ProfileIcon, SettingsIcon, HelpIcon,
} from "../assets/icons";

interface SidebarProps {
    sessionId: string;
    sessions: Session[];
    displayName: string;
    primaryColor: string;
    title: string;
    onNewChat: () => void;
    onSwitchSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
}

type SessionMenu = { id: string; action: "options" | "confirm-delete" };

interface UserMenuItem {
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
    danger: boolean;
}

export function Sidebar({
    sessionId, sessions, displayName, primaryColor, title,
    onNewChat, onSwitchSession, onDeleteSession,
}: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [sessionMenu, setSessionMenu] = useState<SessionMenu | null>(null);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const sessionMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
                setUserMenuOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (sessionMenuRef.current && !sessionMenuRef.current.contains(e.target as Node))
                if (sessionMenu?.action === "options") setSessionMenu(null);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [sessionMenu]);

    useEffect(() => {
        if (collapsed) { setSessionMenu(null); setUserMenuOpen(false); }
    }, [collapsed]);

    const userMenuItems: UserMenuItem[] = [
        { label: "Profile", icon: <ProfileIcon />, onClick: undefined, danger: false },
        { label: "Settings", icon: <SettingsIcon />, onClick: undefined, danger: false },
        { label: "Help", icon: <HelpIcon />, onClick: undefined, danger: false },
    ];

    return (
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

            {/* Sessions */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 space-y-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {!collapsed && sessions.length === 0 && (
                    <p className="px-3 py-4 text-center text-xs text-slate-400">No conversations yet</p>
                )}

                {sessions.slice().reverse().map((s: Session) => {
                    const isActive = s.sessionId === sessionId;
                    const menu = sessionMenu?.id === s.sessionId ? sessionMenu : null;

                    return (
                        <div key={s.sessionId}>
                            <div
                                onClick={() => onSwitchSession(s.sessionId)}
                                title={collapsed ? (s.preview || "Untitled") : undefined}
                                className={`group flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 cursor-pointer transition-all ${isActive ? "border-slate-200" : "border-transparent hover:bg-slate-50"}`}
                                style={isActive ? { backgroundColor: `${primaryColor}12`, borderColor: `${primaryColor}30` } : {}}
                            >
                                <ChatIcon color={isActive ? primaryColor : "#94a3b8"} />
                                {!collapsed && (
                                    <>
                                        <span className="flex-1 truncate text-xs text-slate-600">{s.preview || "Untitled"}</span>
                                        <button
                                            onClick={e => { e.stopPropagation(); setSessionMenu(prev => prev?.id === s.sessionId ? null : { id: s.sessionId, action: "options" }); }}
                                            className="hidden group-hover:flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-200 transition-colors"
                                        >
                                            <DotsIcon />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Options menu */}
                            {!collapsed && menu?.action === "options" && (
                                <div ref={sessionMenuRef} className="mx-1 mb-1 rounded-lg border border-slate-100 bg-white shadow-md overflow-hidden z-10">
                                    <button
                                        onClick={() => setSessionMenu({ id: s.sessionId, action: "confirm-delete" })}
                                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-slate-50 transition-colors"
                                    >
                                        <TrashIcon />
                                        Delete
                                    </button>
                                </div>
                            )}

                            {/* Delete confirm */}
                            {!collapsed && menu?.action === "confirm-delete" && (
                                <div className="mx-1 mb-1 rounded-lg border border-red-100 bg-red-50 px-2.5 py-2">
                                    <p className="text-[11px] text-red-600 font-medium mb-1.5">Delete this conversation?</p>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => { onDeleteSession(s.sessionId); setSessionMenu(null); }} className="flex-1 rounded-md bg-red-500 px-2 py-1 text-[11px] font-medium text-white hover:bg-red-600 transition-colors">Delete</button>
                                        <button onClick={() => setSessionMenu(null)} className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* New Chat button */}
            <div className={`border-t border-slate-100 ${collapsed ? "flex justify-center py-2.5 px-2" : "px-3 py-2.5"}`}>
                {collapsed ? (
                    <button
                        onClick={onNewChat}
                        title="New Chat"
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={onNewChat}
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
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
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
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
    );
}