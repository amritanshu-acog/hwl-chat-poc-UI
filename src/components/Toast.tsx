/**
 * Toast.tsx
 * ---------
 * A lightweight, auto-dismissing notification for transient errors.
 *
 * Usage:
 *   const { toasts, pushToast, dismissToast } = useToasts()
 *   …
 *   <ToastRegion toasts={toasts} onDismiss={dismissToast} />
 *
 * Design decisions:
 *  - Rendered in a fixed portal-like region (top-right) so it never
 *    overlaps or displaces chat content.
 *  - Auto-dismisses after `duration` ms (default 5 s) via a CSS animation
 *    — no timers leak if the component unmounts early because the animation
 *    is purely declarative.
 *  - The close button triggers instant dismiss for power-users.
 *  - Supports 'error' | 'warning' severity variants.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { XCircle, AlertTriangle, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastSeverity = 'error' | 'warning'

export interface ToastItem {
    id: string
    severity: ToastSeverity
    title: string
    message: string
    /** Auto-dismiss after this many ms. Default: 6000. Set to 0 to disable. */
    duration?: number
    /** Optional CTA label + handler shown beside the dismiss button. */
    action?: { label: string; onClick: () => void }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToasts() {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
        const id = crypto.randomUUID()
        setToasts(prev => [...prev, { ...toast, id }])
        return id
    }, [])

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return { toasts, pushToast, dismissToast }
}

// ─── Single toast ─────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<ToastSeverity, {
    container: string
    iconClass: string
    Icon: typeof XCircle
}> = {
    error: {
        container: 'bg-white border border-red-200 shadow-red-100',
        iconClass: 'text-red-500',
        Icon: XCircle,
    },
    warning: {
        container: 'bg-white border border-amber-200 shadow-amber-100',
        iconClass: 'text-amber-500',
        Icon: AlertTriangle,
    },
}

function ToastCard({
    toast,
    onDismiss,
}: {
    toast: ToastItem
    onDismiss: (id: string) => void
}) {
    const { id, severity, title, message, duration = 6000, action } = toast
    const { container, iconClass, Icon } = SEVERITY_STYLES[severity]
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (!duration) return
        timerRef.current = setTimeout(() => onDismiss(id), duration)
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [id, duration, onDismiss])

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={`
                flex w-80 items-start gap-3 rounded-xl p-3.5 shadow-lg
                animate-in slide-in-from-right-5 fade-in duration-200
                ${container}
            `}
        >
            <div className="flex-shrink-0 mt-0.5">
                <Icon className={`w-5 h-5 ${iconClass}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 leading-snug">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{message}</p>
                {action && (
                    <button
                        onClick={() => { action.onClick(); onDismiss(id) }}
                        className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                    >
                        {action.label}
                    </button>
                )}
            </div>
            <button
                onClick={() => onDismiss(id)}
                aria-label="Dismiss notification"
                className="flex-shrink-0 rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}

// ─── Region (render this once near the root) ──────────────────────────────────

export function ToastRegion({
    toasts,
    onDismiss,
}: {
    toasts: ToastItem[]
    onDismiss: (id: string) => void
}) {
    if (toasts.length === 0) return null

    return (
        <div
            aria-label="Notifications"
            className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        >
            {toasts.map(t => (
                <div key={t.id} className="pointer-events-auto">
                    <ToastCard toast={t} onDismiss={onDismiss} />
                </div>
            ))}
        </div>
    )
}
