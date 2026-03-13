interface Props {
    title: string
    body: string
    actions?: string[]
    primaryColor?: string
}

export function Summary({ body, actions, primaryColor = '#0052CC' }: Props) {
    return (
        <div
            className="my-2 p-4 rounded-lg border-l-4"
            style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}08` }}
        >
            <p className="text-xs font-bold text-gray-900 leading-relaxed">{body}</p>
            {actions && actions.length > 0 && (
                <ul className="mt-2 space-y-1">
                    {actions.map((action, idx) => (
                        <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                            <span className="mt-0.5" style={{ color: primaryColor }}>✓</span>
                            <span>{action}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}