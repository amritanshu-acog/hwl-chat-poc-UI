interface NotFoundProps {
    title?: string;
    message?: string;
}

export function NotFound({
    title = "No results found",
    message = "I can help you troubleshoot — try rephrasing or asking something more specific. Here are a few examples of what I can help with:",
}: NotFoundProps) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
            <div className="mt-0.5 text-gray-400">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="11" />
                    <line x1="11" y1="14" x2="11.01" y2="14" />
                </svg>
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-sm text-gray-500">{message}</p>
            </div>
        </div>
    );
}