import type { ImageBlockData } from '../types'

interface Props {
    data: ImageBlockData
}

export function ImageBlock({ data }: Props) {
    const altText = data.alt ?? data.altText ?? ""
    const hasSrc = !!data.src

    return (
        <div className="my-3">
            {hasSrc ? (
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={data.src} alt={altText} className="w-full h-auto" loading="lazy" />
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 flex gap-3 items-start">
                    <span className="text-2xl flex-shrink-0">🖼️</span>
                    <div>
                        {data.caption && <p className="text-sm font-medium text-gray-800 mb-0.5">{data.caption}</p>}
                        {data.description && <p className="text-sm text-gray-600 leading-relaxed">{data.description}</p>}
                    </div>
                </div>
            )}
            {hasSrc && data.caption && (
                <p className="text-xs text-gray-600 mt-1.5 italic">{data.caption}</p>
            )}
        </div>
    )
}