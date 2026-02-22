import type { SummaryData } from '../types'

interface Props {
    data: SummaryData
    primaryColor: string
}

export function Summary({ data, primaryColor }: Props) {
    return (
        <div className="my-2 p-4 rounded-lg border-2" style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}08` }}>
            <div className="flex gap-3">
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{data.title}</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{data.body}</p>                    {data.actions && data.actions.length > 0 && (
                        <ul className="mt-2 space-y-1">
                            {data.actions.map((action, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-1.5">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span>{action}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}