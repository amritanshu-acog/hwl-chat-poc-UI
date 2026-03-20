import type { LucideIcon } from 'lucide-react'
import { WarningIcon, InfoIcon, DangerIcon } from '../assets/icons'

interface Props {
    severity: 'warning' | 'info' | 'danger'
    title: string
    body: string
}

// ─── Severity descriptor ──────────────────────────────────────────────────────
// Icon, colours, and ARIA role live in one place.
// To add a new severity level, add an entry here — nothing else needs changing.

interface SeverityDescriptor {
    Icon:       LucideIcon
    bg:         string
    border:     string
    iconClass:  string
    titleClass: string
    bodyClass:  string
    ariaRole:   'alert' | 'status'
}

const SEVERITY_CONFIG: Record<Props['severity'], SeverityDescriptor> = {
    warning: {
        Icon:       WarningIcon,
        bg:         'bg-amber-50',
        border:     'border-amber-200',
        iconClass:  'text-amber-600',
        titleClass: 'text-amber-900',
        bodyClass:  'text-amber-800',
        ariaRole:   'alert',
    },
    info: {
        Icon:       InfoIcon,
        bg:         'bg-blue-50',
        border:     'border-blue-200',
        iconClass:  'text-blue-600',
        titleClass: 'text-blue-900',
        bodyClass:  'text-blue-800',
        ariaRole:   'status',
    },
    danger: {
        Icon:       DangerIcon,
        bg:         'bg-red-50',
        border:     'border-red-200',
        iconClass:  'text-red-600',
        titleClass: 'text-red-900',
        bodyClass:  'text-red-800',
        ariaRole:   'alert',
    },
}

export function Alert({ severity, title, body }: Props) {
    const { Icon, bg, border, iconClass, titleClass, bodyClass, ariaRole } =
        SEVERITY_CONFIG[severity]

    return (
        <div
            role={ariaRole}
            className={`rounded-lg border-2 p-3 my-2 ${bg} ${border}`}
        >
            <div className="flex gap-2.5">
                <div className="flex-shrink-0 mt-0.5">
                    <Icon className={`w-5 h-5 ${iconClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-semibold ${titleClass} mb-1`}>{title}</h4>
                    <p  className={`text-xs leading-relaxed ${bodyClass}`}>{body}</p>
                </div>
            </div>
        </div>
    )
}