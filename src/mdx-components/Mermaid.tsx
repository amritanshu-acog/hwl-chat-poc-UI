import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
    chart: string
}

export function Mermaid({ chart }: Props) {
    const [svgContent, setSvgContent] = useState<string>('')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [scale, setScale] = useState(0.5)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const panStart = useRef({ mx: 0, my: 0, px: 0, py: 0 })

    // Render mermaid once → store as SVG string in state
    // This means the SVG survives fullscreen toggles — no re-render needed
    useEffect(() => {
        if (!chart) return
        import('mermaid').then((m) => {
            m.default.initialize({ startOnLoad: false, theme: 'neutral' })
            const id = `mermaid-${Math.random().toString(36).slice(2)}`
            m.default.render(id, chart.trim())
                .then(({ svg }) => setSvgContent(svg))
                .catch(() => setSvgContent(`<pre style="color:red;font-size:11px;padding:8px">${chart}</pre>`))
        })
    }, [chart])

    function resetView() {
        setScale(0.5)
        setPan({ x: 0, y: 0 })
    }

    function zoom(delta: number) {
        setScale(prev => Math.min(3, Math.max(0.3, +(prev + delta).toFixed(2))))
    }

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return
        setIsPanning(true)
        panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y }
    }, [pan])

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isPanning) return
        setPan({
            x: panStart.current.px + (e.clientX - panStart.current.mx),
            y: panStart.current.py + (e.clientY - panStart.current.my),
        })
    }, [isPanning])

    const onMouseUp = useCallback(() => setIsPanning(false), [])

    const onWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault()
        zoom(e.deltaY < 0 ? 0.12 : -0.12)
    }, [])

    useEffect(() => {
        if (!isFullscreen) return
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { resetView(); setIsFullscreen(false) } }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isFullscreen])

    function Controls() {
        return (
            <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg px-1 py-0.5 shadow-sm">
                <button onClick={() => zoom(0.15)} title="Zoom in"
                    className="flex items-center justify-center w-6 h-6 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M5 3.5V6.5M3.5 5H6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M7.5 7.5L9.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                </button>
                <button onClick={() => zoom(-0.15)} title="Zoom out"
                    className="flex items-center justify-center w-6 h-6 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M3.5 5H6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M7.5 7.5L9.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                </button>
                <button onClick={resetView} title="Reset view"
                    className="flex items-center justify-center w-6 h-6 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M2 5.5A3.5 3.5 0 015.5 2a3.5 3.5 0 012.8 1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M8.3 2.5V4.5H6.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 5.5A3.5 3.5 0 015.5 9 3.5 3.5 0 012 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                </button>
                <div className="w-px h-3.5 bg-gray-200 mx-0.5" />
                <span className="text-[9px] text-gray-400 font-medium px-1 min-w-[28px] text-center tabular-nums">
                    {Math.round(scale * 100)}%
                </span>
                <div className="w-px h-3.5 bg-gray-200 mx-0.5" />
                <button
                    onClick={() => { resetView(); setIsFullscreen(f => !f) }}
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    className="flex items-center justify-center w-6 h-6 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                >
                    {isFullscreen
                        ? <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M4 1.5H2a.5.5 0 00-.5.5v2M7 1.5h2a.5.5 0 01.5.5v2M4 9.5H2a.5.5 0 01-.5-.5V7M7 9.5h2a.5.5 0 00.5-.5V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        : <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M1.5 4V2a.5.5 0 01.5-.5h2M7.5 1.5H9a.5.5 0 01.5.5v2M9.5 7v2a.5.5 0 01-.5.5H7M3.5 9.5H2a.5.5 0 01-.5-.5V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                    }
                </button>
            </div>
        )
    }

    // Single viewport component — receives SVG via dangerouslySetInnerHTML from state
    // so it always has the content regardless of fullscreen mount/unmount
    function Viewport({ fullscreen }: { fullscreen: boolean }) {
        return (
            <div
                className="relative overflow-hidden rounded-xl"
                style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    height: fullscreen ? '100%' : '360px',
                    cursor: isPanning ? 'grabbing' : 'grab',
                    userSelect: 'none',
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onWheel={onWheel}
            >
                <div
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                        transformOrigin: 'center center',
                        transition: isPanning ? 'none' : 'transform 0.15s ease',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        boxSizing: 'border-box',
                    }}
                >
                    {svgContent
                        ? <div
                            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                        />
                        : <span style={{ fontSize: '11px', color: '#94a3b8' }}>Loading diagram…</span>
                    }
                </div>

                <div className="absolute bottom-2 right-2 z-10" onMouseDown={e => e.stopPropagation()}>
                    <Controls />
                </div>

                <div className="absolute top-2 left-2 text-[9px] text-gray-400 pointer-events-none select-none">
                    Drag to pan · Scroll to zoom
                </div>
            </div>
        )
    }

    if (isFullscreen) {
        return (
            <div
                className="fixed inset-0 z-50 flex flex-col p-4"
                style={{ backgroundColor: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(4px)' }}
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-white text-xs font-medium opacity-70">Diagram</span>
                    <button
                        className="text-white text-xs opacity-60 hover:opacity-100 transition-opacity px-2 py-1 rounded border border-white/20"
                        onClick={() => { resetView(); setIsFullscreen(false) }}
                    >
                        esc · close
                    </button>
                </div>
                <div className="flex-1 min-h-0">
                    <Viewport fullscreen={true} />
                </div>
            </div>
        )
    }

    return (
        <div className="my-2">
            <Viewport fullscreen={false} />
        </div>
    )
}