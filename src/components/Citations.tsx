import { FileIcon } from '../assets/icons'

interface Citation {
    chunk_id: string
    source: string
}

interface Props {
    citations: Citation[]
}

export function Citations({ citations }: Props) {
    if (!citations || citations.length === 0) return null

    const uniqueSources = Array.from(
        new Map(citations.map(c => [c.source, c])).values()
    )

    return (
        <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Sources
            </p>
            <div className="flex flex-col gap-1.5">
                {uniqueSources.map((citation, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                            <FileIcon className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <span className="text-[11px] text-gray-500 leading-tight">{citation.source}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}