interface FaqItem {
    question: string;
    answer: string;
}

interface Props {
    items: FaqItem[];
}

export function Faq({ items }: Props) {
    return (
        <div className="my-2 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white overflow-hidden">
            {items.map((item, i) => (
                <div key={i} className="px-4 py-3">
                    <p className="text-xs leading-relaxed text-gray-600">{item.answer}</p>
                </div>
            ))}
        </div>
    );
}