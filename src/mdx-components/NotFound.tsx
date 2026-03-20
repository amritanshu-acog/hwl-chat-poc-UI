interface NotFoundProps {
    title?: string;
    message?: string;
}

export function NotFound({
    title = "No results found",
    message = "Try rephrasing your question or asking about a specific HWL process.",
}: NotFoundProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 w-full box-border">
            <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
            <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
    );
}