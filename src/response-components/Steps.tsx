import type { StepsData } from '../types'

interface Props {
    data: StepsData
    primaryColor: string
}

export function Steps({ data, primaryColor }: Props) {
    return (
        <div className="my-2">
            {data.title && (
                <h3 className="text-xs font-semibold text-gray-900 mb-2">{data.title}</h3>
            )}
            {data.intro && (
                <p className="text-xs text-gray-700 mb-3 leading-relaxed">{data.intro}</p>
            )}
            <div className="space-y-3">
                {data.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                        <div
                            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-gray-900 mb-1">{step.title}</h4>
                            <p className="text-xs text-gray-700 leading-relaxed">{step.body}</p>
                        </div>
                    </div>
                ))}
            </div>
            {data.followUp && (
                <p className="text-xs text-gray-700 mt-3 leading-relaxed">{data.followUp}</p>
            )}
        </div>
    )
}