interface TextData {
    body: string
}

interface Props {
    data: TextData
}

export function Text({ data }: Props) {
    let body = data.body
    try {
        const parsed = JSON.parse(data.body)
        body = typeof parsed === "object"
            ? JSON.stringify(parsed, null, 2)
            : String(parsed)
        return (
            <div className="my-1">
                <pre className="text-sm text-gray-800 leading-relaxed bg-gray-100 rounded p-3 overflow-auto whitespace-pre-wrap">
                    {body}
                </pre>
            </div>
        )
    } catch {
        return (
            <div className="my-1">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {body}
                </p>
            </div>
        )
    }
}