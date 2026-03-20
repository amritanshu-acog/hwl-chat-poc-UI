interface Props {
    title: string
    body: string
    actions?: string[]
    primaryColor?: string
}

export function Summary({ title, body, actions, primaryColor = '#0052CC' }: Props) {
    return (
        <div
            className="my-2 p-3 sm:p-4 rounded-lg border-l-4 w-full box-border"
            style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}08` }}
        >
            {/* Title was unused in original — now rendered */}
            {title && (
                <p className="text-xs font-bold text-gray-900 mb-1 break-words">{title}</p>
            )}
            <p className="text-xs font-bold text-gray-900 leading-relaxed break-words">{body}</p>
            {actions && actions.length > 0 && (
                <ul className="mt-2 space-y-1">
                    {actions.map((action, idx) => (
                        <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                            <span className="mt-0.5 flex-shrink-0" style={{ color: primaryColor }}>✓</span>
                            {/* min-w-0 + break-words handles long action text */}
                            <span className="break-words min-w-0">{action}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}