import { WarningIcon, InfoIcon, DangerIcon } from '../assets/icons'

interface Props {
    severity: 'warning' | 'info' | 'danger'
    title: string
    body: string
}

const severityConfig = {
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', title: 'text-amber-900', body: 'text-amber-800' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', title: 'text-blue-900', body: 'text-blue-800' },
    danger: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', title: 'text-red-900', body: 'text-red-800' },
}

export function Alert({ severity, title, body }: Props) {
    const c = severityConfig[severity]

    const Icon =
        severity === 'warning' ? WarningIcon :
            severity === 'info' ? InfoIcon :
                DangerIcon

    return (
        <div className={`rounded-lg border-2 p-3 my-2 ${c.bg} ${c.border}`}>
            <div className="flex gap-2.5">
                <div className="flex-shrink-0 mt-0.5">
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-semibold ${c.title} mb-1`}>{title}</h4>
                    <p className={`text-xs leading-relaxed ${c.body}`}>{body}</p>
                </div>
            </div>
        </div>
    )
}