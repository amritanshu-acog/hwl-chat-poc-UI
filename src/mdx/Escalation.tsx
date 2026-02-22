import type { EscalationData } from '../types'

interface Props {
    data: EscalationData
    primaryColor: string
    onCreateTicket?: () => void
}

export function Escalation({ data, primaryColor, onCreateTicket }: Props) {
    return (
        <div className="my-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex gap-3 mb-3">
                <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{data.title}</h4>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{data.message}</p>
                    {data.reason && (
                        <p className="text-xs text-gray-600 italic mb-3">{data.reason}</p>
                    )}
                    <button
                        onClick={onCreateTicket}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:brightness-110 active:scale-95"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Support Ticket
                    </button>
                </div>
            </div>
        </div>
    )
}