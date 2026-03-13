import { useState } from "react";

interface GlossaryItem {
    term: string;
    definition: string;
}

interface GlossaryProps {
    items: GlossaryItem[];
    placeholder?: string;
}

export function Glossary({
    items,
    placeholder = "Search fields...",
}: GlossaryProps) {
    const [query, setQuery] = useState("");

    const filtered = items.filter(
        (item) =>
            item.term.toLowerCase().includes(query.toLowerCase()) ||
            item.definition.toLowerCase().includes(query.toLowerCase())
    );

    const highlight = (text: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark
                    key={i}
                    className="bg-yellow-100 text-yellow-800 rounded px-0.5"
                >
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-gray-300 focus:bg-white focus:shadow-sm"
                />
                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Count */}
            <div className="flex items-center justify-between px-1">
                <p className="text-xs text-gray-400">
                    {filtered.length === items.length
                        ? `${items.length} fields`
                        : `${filtered.length} of ${items.length} fields`}
                </p>
                {query && filtered.length === 0 && (
                    <p className="text-xs text-gray-400">No matches found</p>
                )}
            </div>

            {/* Items */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <svg
                        className="text-gray-300"
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <p className="text-sm text-gray-400">
                        No fields match{" "}
                        <span className="font-medium text-gray-500">"{query}"</span>
                    </p>
                    <button
                        onClick={() => setQuery("")}
                        className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
                    >
                        Clear search
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filtered.map((item, i) => (
                        <div
                            key={i}
                            className="group flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-0 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition-all hover:border-gray-200 hover:shadow-md"
                        >
                            <div className="flex sm:w-48 shrink-0 items-center gap-2">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors" />
                                <span className="text-sm font-semibold text-gray-800">
                                    {highlight(item.term)}
                                </span>
                            </div>
                            <div className="sm:border-l sm:border-gray-100 sm:pl-4">
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {highlight(item.definition)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}