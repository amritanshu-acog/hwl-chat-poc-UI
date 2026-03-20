import { SupportIcon, PlusIcon } from '../assets/icons'
import { APP_CONFIG } from '../config'

interface Props {
    title: string
    message: string
    reason?: string
    /** Defaults to APP_CONFIG.primaryColor — no magic fallback strings. */
    primaryColor?: string
    onCreateTicket?: () => void
}

export function Escalation({
    title,
    message,
    reason,
    primaryColor = APP_CONFIG.primaryColor,
    onCreateTicket,
}: Props) {
    return (
        <div className="my-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex gap-3">
                <div className="flex-shrink-0">
                    <SupportIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                    <h4 className="text-xs font-semibold text-gray-900 mb-1">{title}</h4>
                    <p className="text-xs text-gray-700 leading-relaxed mb-3">{message}</p>
                    {reason && (
                        <p className="text-[11px] text-gray-600 italic mb-3">{reason}</p>
                    )}
                    <button
                        onClick={onCreateTicket}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-medium transition-all hover:brightness-110 active:scale-95"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <PlusIcon className="w-4 h-4" />
                        Create Support Ticket
                    </button>
                </div>
            </div>
        </div>
    )
}