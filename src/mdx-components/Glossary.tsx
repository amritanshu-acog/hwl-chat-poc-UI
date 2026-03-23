import { useState, useId } from "react";

export interface GlossaryItem {
    term: string;
    definition: string;
    category?: string;
}

export interface GlossaryProps {
    items: GlossaryItem[];
    title?: string;
    showCategories?: boolean;
}

interface RowProps {
    item: GlossaryItem;
    termId: string;
    defId: string;
}

function GlossaryRow({ item, termId, defId }: RowProps) {
    return (
        <div
            role="row"
            className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition-all hover:border-gray-200 hover:shadow-md"
            aria-labelledby={termId}
            aria-describedby={defId}
        >
            <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300 transition-colors group-hover:bg-gray-500" aria-hidden="true" />
                <dt id={termId} className="text-sm font-semibold text-gray-800">
                    {item.term}
                </dt>
                {item.category && (
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
                        {item.category}
                    </span>
                )}
            </div>
            <dd
                id={defId}
                role="cell"
                className="pl-[22px] text-sm text-gray-500 leading-relaxed"
            >
                {item.definition}
            </dd>
        </div>
    );
}

export function Glossary({ items, title, showCategories = true }: GlossaryProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const uid = useId();

    const categories = showCategories
        ? Array.from(new Set(items.flatMap((i) => (i.category ? [i.category] : [])))).sort()
        : [];

    const filtered = items.filter(
        (item) => !activeCategory || item.category === activeCategory
    );

    return (
        <div className="flex flex-col gap-3 w-full box-border">
            {title && (
                <h2 className="text-base font-semibold text-gray-800">{title}</h2>
            )}

            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                    <button
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${activeCategory === null
                            ? "border-gray-800 bg-gray-800 text-white"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveCategory(null)}
                        aria-pressed={activeCategory === null}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${activeCategory === cat
                                ? "border-gray-800 bg-gray-800 text-white"
                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                }`}
                            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                            aria-pressed={activeCategory === cat}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <p className="px-1 text-xs text-gray-400">
                {filtered.length === items.length
                    ? `${items.length} term${items.length !== 1 ? "s" : ""}`
                    : `${filtered.length} of ${items.length} terms`}
            </p>

            <dl
                id={`${uid}-list`}
                className="flex flex-col gap-2"
                role="grid"
                aria-label="Glossary entries"
                aria-rowcount={filtered.length}
            >
                {filtered.map((item, i) => (
                    <GlossaryRow
                        key={`${item.term}-${i}`}
                        item={item}
                        termId={`${uid}-term-${i}`}
                        defId={`${uid}-def-${i}`}
                    />
                ))}
            </dl>
        </div>
    );
}