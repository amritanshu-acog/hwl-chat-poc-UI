interface Props {
    message?: string;
}

export function QuotaExceeded({ message }: Props) {
    return (
        <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-3 my-2">
            <div className="flex gap-2.5 items-start">
                <div className="flex-shrink-0 mt-0.5">
                    {/* Bolt / limit icon */}
                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-orange-900 mb-1">Quota Exceeded</h4>
                    <p className="text-xs leading-relaxed text-orange-800">
                        {message ?? "You've reached your usage limit. Please start a new chat to continue."}
                    </p>
                </div>
            </div>
        </div>
    );
}