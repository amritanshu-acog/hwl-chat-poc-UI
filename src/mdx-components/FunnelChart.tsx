import { useState } from 'react'

interface FunnelStage {
    label: string
    description?: string
}

interface Props {
    title?: string
    stages: FunnelStage[]
    primaryColor?: string
}

export function FunnelChart({ title, stages, primaryColor = '#0F766E' }: Props) {
    const [expandedIdx, setExpandedIdx] = useState<Set<number>>(new Set())
    const [view, setView] = useState<'timeline' | 'funnel'>('timeline')
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

    const expandedAll = expandedIdx.size === stages.length

    function toggleAll() {
        setExpandedIdx(expandedAll ? new Set() : new Set(stages.map((_, i) => i)))
    }

    function toggleOne(idx: number) {
        setExpandedIdx(prev => {
            const next = new Set(prev)
            next.has(idx) ? next.delete(idx) : next.add(idx)
            return next
        })
    }

    function hexToRgb(hex: string) {
        const clean = hex.replace('#', '')
        const n = parseInt(clean, 16)
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
    }
    const rgb = hexToRgb(primaryColor)

    return (
        <div className="my-2 rounded-xl border border-gray-200 bg-white overflow-hidden">

            {/* Header */}
            <div className="px-3 pt-3 pb-2 border-b border-gray-100 flex items-center justify-between">
                {title && <h3 className="text-xs font-semibold text-gray-900">{title}</h3>}
                <div className="flex items-center gap-1 ml-auto">
                    <div className="flex rounded-md border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => setView('timeline')}
                            className="px-2 py-0.5 text-[10px] transition-colors"
                            style={{ backgroundColor: view === 'timeline' ? primaryColor : 'transparent', color: view === 'timeline' ? 'white' : '#6b7280' }}
                        >Timeline</button>
                        <button
                            onClick={() => setView('funnel')}
                            className="px-2 py-0.5 text-[10px] transition-colors"
                            style={{ backgroundColor: view === 'funnel' ? primaryColor : 'transparent', color: view === 'funnel' ? 'white' : '#6b7280' }}
                        >Funnel</button>
                    </div>
                    {view === 'timeline' && (
                        <button
                            onClick={toggleAll}
                            className="text-[10px] px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-400 transition-colors"
                        >
                            {expandedAll ? 'Collapse all' : 'Expand all'}
                        </button>
                    )}
                </div>
            </div>

            {/* Timeline view */}
            {view === 'timeline' && (
                <div className="p-3 pl-9 relative">
                    <div className="absolute left-[21px] top-4 bottom-4 w-px" style={{ backgroundColor: primaryColor, opacity: 0.2 }} />
                    <div className="flex flex-col gap-2">
                        {stages.map((stage, idx) => {
                            const isOpen = expandedIdx.has(idx)
                            return (
                                <div key={idx}>
                                    <button onClick={() => toggleOne(idx)} className="w-full text-left flex items-start gap-2.5 group">
                                        <div
                                            className="flex-shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white mt-0.5"
                                            style={{ backgroundColor: primaryColor, marginLeft: '-27px' }}
                                        >
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 flex items-center justify-between min-w-0 py-0.5">
                                            <span className="text-[12px] font-medium text-gray-800 group-hover:text-gray-900 leading-tight">{stage.label}</span>
                                            {stage.description && (
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0 ml-2 text-gray-400"
                                                    style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                                                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                    {stage.description && (
                                        <div style={{ maxHeight: isOpen ? '80px' : '0', overflow: 'hidden', transition: 'max-height 0.25s ease' }}>
                                            <p className="text-[11px] text-gray-500 leading-snug pl-[10px] pt-1 pb-1.5">{stage.description}</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Funnel view */}
            {view === 'funnel' && (
                <div className="p-4">
                    <div className="flex flex-col items-center gap-0">
                        {stages.map((stage, idx) => {
                            const total = stages.length
                            const widthPct = 100 - ((100 - 52) / (total - 1)) * idx
                            const opacity = 0.68 + (0.32 * idx) / (total - 1)
                            const isHovered = hoveredIdx === idx
                            const isLast = idx === total - 1
                            const isOpen = expandedIdx.has(idx)

                            return (
                                <div key={idx} className="flex flex-col items-center" style={{ width: `${widthPct}%`, transition: 'width 0.3s ease' }}>
                                    <div
                                        className="w-full px-3 py-2 cursor-pointer select-none transition-all duration-150"
                                        style={{
                                            backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`,
                                            filter: isHovered ? 'brightness(1.1)' : 'none',
                                            boxShadow: isHovered ? `0 2px 10px rgba(${rgb.r},${rgb.g},${rgb.b},0.3)` : 'none',
                                        }}
                                        onMouseEnter={() => setHoveredIdx(idx)}
                                        onMouseLeave={() => setHoveredIdx(null)}
                                        onClick={() => toggleOne(idx)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                                                style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white' }}>
                                                {idx + 1}
                                            </span>
                                            <span className="text-[11px] font-semibold text-white truncate flex-1">{stage.label}</span>
                                            {stage.description && (
                                                <svg width="9" height="9" viewBox="0 0 10 10" fill="none"
                                                    style={{ color: 'rgba(255,255,255,0.7)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', flexShrink: 0 }}>
                                                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        {stage.description && (
                                            <div style={{ maxHeight: isOpen ? '60px' : '0', overflow: 'hidden', transition: 'max-height 0.25s ease' }}>
                                                <p className="text-[10px] mt-1.5 leading-snug"
                                                    style={{ color: 'rgba(255,255,255,0.82)', borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: '6px' }}>
                                                    {stage.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {!isLast && (
                                        <div className="w-0 h-0" style={{
                                            borderLeft: '7px solid transparent',
                                            borderRight: '7px solid transparent',
                                            borderTop: `5px solid rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`,
                                        }} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-3">Click any stage to expand · hover to highlight</p>
                </div>
            )}
        </div>
    )
}