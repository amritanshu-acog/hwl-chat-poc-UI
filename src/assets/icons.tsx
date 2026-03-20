/**
 * icons.tsx
 * ---------
 * Single source of truth for all icons used in the application.
 *
 * All icons are thin re-exports from lucide-react so we get:
 *  - Tree-shaking (only imported icons are bundled)
 *  - Consistent strokeWidth and sizing API across the app
 *  - Easy icon swaps in one file — zero other files need editing
 *
 * QUICK-REPLY ICON MAP
 * --------------------
 * `QUICK_REPLY_ICON_MAP` is a registry of icon keys to Lucide components.
 * Keys are the string values used in APP_CONFIG.quickReplies[].icon.
 * To add a new icon variant: add a key here and use it in config.ts.
 */

import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

export {
    // ── Input / Actions ──────────────────────────────────────────────
    Send         as SendIcon,
    Paperclip    as AttachIcon,
    Plus         as PlusIcon,
    Trash2       as TrashIcon,
    MoreHorizontal as DotsIcon,
    LogOut       as SignOutIcon,

    // ── Navigation ───────────────────────────────────────────────────
    Menu         as MenuIcon,
    ChevronRight as ChevronRightIcon,

    // ── Messaging ────────────────────────────────────────────────────
    MessageSquare  as ChatBubbleIcon,
    MessageCircle  as ChatIcon,

    // ── Files / Content ──────────────────────────────────────────────
    FileText     as FileIcon,
    FileText     as DocIcon,

    // ── People / Identity ────────────────────────────────────────────
    Users        as PeopleIcon,
    User         as ProfileIcon,

    // ── Data / Status ────────────────────────────────────────────────
    TrendingUp   as ChartIcon,
    Shield       as ShieldIcon,
    Clock        as ClockIcon,

    // ── Feedback / Alerts ────────────────────────────────────────────
    AlertTriangle as WarningIcon,
    Info          as InfoIcon,
    XCircle       as DangerIcon,
    Check         as CheckIcon,
    CheckCircle   as CheckCircleIcon,

    // ── Support ───────────────────────────────────────────────────────
    Headphones   as SupportIcon,

    // ── Account / Settings ────────────────────────────────────────────
    Settings     as SettingsIcon,
    HelpCircle   as HelpIcon,
} from 'lucide-react';

// ─── ChevronIcon (stateful wrapper) ──────────────────────────────────────────
// Kept as a thin wrapper because it carries open/close rotation logic that
// the raw lucide component intentionally does not.

export function ChevronIcon({
    open,
    className,
}: {
    open: boolean;
    className?: string;
}) {
    return (
        <ChevronDown
            width={11}
            height={11}
            className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''} ${className ?? ''}`}
        />
    );
}

// ─── Quick-reply icon registry ────────────────────────────────────────────────
// Maps the string keys used in APP_CONFIG.quickReplies[].icon to Lucide
// components. Add new keys here; the rest of the app picks them up automatically.

import {
    FileText,
    Users,
    TrendingUp,
    Shield,
    Clock,
    HelpCircle,
    Briefcase,
    Bell,
} from 'lucide-react';

export const QUICK_REPLY_ICON_MAP: Record<string, LucideIcon> = {
    doc:      FileText,
    people:   Users,
    chart:    TrendingUp,
    shield:   Shield,
    clock:    Clock,
    help:     HelpCircle,
    briefcase: Briefcase,
    bell:     Bell,
};

/** Fallback icon used when a key is not found in QUICK_REPLY_ICON_MAP. */
export const QUICK_REPLY_ICON_FALLBACK: LucideIcon = FileText;