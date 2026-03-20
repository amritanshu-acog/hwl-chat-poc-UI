interface Props {
    question: string;
    primaryColor?: string;
    onSelect?: (text: string) => void;
}

/**
 * FollowUp
 * --------
 * Renders a suggested follow-up question at the end of an assistant response.
 * Tapping it fires onSelect (same as a quick-reply) to pre-fill the input.
 */
export function FollowUp({ question, primaryColor = "#0052CC", onSelect }: Props) {
    return (
        <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-gray-400 flex-shrink-0">You might ask:</span>
            <button
                onClick={() => onSelect?.(question)}
                className="flex-1 text-left text-[11px] rounded-lg border px-2.5 py-1.5 transition-all hover:shadow-sm active:scale-[0.98]"
                style={{
                    color: primaryColor,
                    borderColor: `${primaryColor}30`,
                    backgroundColor: `${primaryColor}08`,
                }}
            >
                {question}
            </button>
        </div>
    );
}
