import { CheckCircleIcon } from '../assets/icons'

interface Props {
    title: string
    body: string
    actions?: string[]
    primaryColor?: string
}

export function Summary({ title, body, actions, primaryColor = '#0052CC' }: Props) {
    return (
        <div
            className="my-2 p-4 rounded-lg border-2"
            style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}08` }}
        >
            <div className="flex gap-3">
                <div className="flex-shrink-0">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                    </div>
                </div>
                <div className="flex-1">
                    <h4 className="text-xs font-semibold text-gray-900 mb-1">{title}</h4>
                    <p className="text-xs text-gray-700 leading-relaxed">{body}</p>
                    {actions && actions.length > 0 && (
                        <ul className="mt-2 space-y-1">
                            {actions.map((action, idx) => (
                                <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
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