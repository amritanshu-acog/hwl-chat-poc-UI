interface StepItem {
    title: string;
    body: string;
}

interface Props {
    title?: string;
    intro?: string;
    steps: StepItem[];
    followUp?: string;
    primaryColor?: string;
}

function html(body: string) {
    return { __html: body.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") };
}

export function Steps({
    title,
    intro,
    steps,
    followUp,
    primaryColor = "#0052CC",
}: Props) {
    return (
        <div className="my-2 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
            {title && (
                <h3 className="text-xs font-semibold text-gray-900 mb-2">{title}</h3>
            )}
            {intro && (
                <p className="text-xs text-gray-500 mb-3">{intro}</p>
            )}

            <div className="flex flex-col gap-0">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex items-stretch">
                        {/* Timeline column */}
                        <div className="flex flex-col items-center w-8 flex-shrink-0">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {idx + 1}
                            </div>
                            {idx < steps.length - 1 && (
                                <div className="flex-1 flex flex-col items-center py-0.5">
                                    <div className="w-px flex-1 bg-gray-200" />
                                    <svg width="8" height="6" viewBox="0 0 8 6">
                                        <path d="M4 6L0 0h8z" fill="#d1d5db" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4 last:pb-0 pl-2 pt-0.5">
                            <p className="text-xs font-semibold text-gray-900">{step.title}</p>
                            <p
                                className="text-xs text-gray-500 mt-0.5 leading-relaxed"
                                dangerouslySetInnerHTML={html(step.body)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}