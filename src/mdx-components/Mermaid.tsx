import { useEffect, useRef, useState, useCallback, useId, type MouseEvent as RMouseEvent } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Download, Maximize2, Minimize2, X } from "lucide-react";

interface MermaidProps {
    chart: string;
    label?: string;
}

const SCALE_MIN = 0.15;
const SCALE_MAX = 3.5;
const STEP = 0.2;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function Mermaid({ chart, label = "Diagram" }: MermaidProps) {
    const uid = useId();
    const viewportRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string | null>(null);
    const [error, setError] = useState(false);

    const scaleRef = useRef(0.6);
    const panRef = useRef({ x: 0, y: 0 });
    const [, tick] = useState(0);
    const update = useCallback(() => tick(n => n + 1), []);

    const isPanning = useRef(false);
    const panStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
    const touchRef = useRef<{ type: "pan" | "pinch"; mx: number; my: number; px: number; py: number; dist: number } | null>(null);
    const rafRef = useRef<number | null>(null);
    const [fullscreen, setFullscreen] = useState(false);
    const fsRef = useRef<HTMLDivElement>(null);

    // Render
    useEffect(() => {
        if (!chart?.trim()) return;
        let cancelled = false;
        setSvg(null); setError(false);
        import("mermaid").then(async (m) => {
            if (cancelled) return;
            m.default.initialize({ startOnLoad: false, theme: "neutral", suppressErrorRendering: true });
            const id = `mmd-${uid.replace(/:/g, "")}-${Date.now()}`;
            try {
                const res = await m.default.render(id, chart.trim());
                if (!cancelled) setSvg(res.svg);
            } catch {
                document.getElementById(id)?.remove();
                if (!cancelled) setError(true);
            }
        });
        return () => { cancelled = true; };
    }, [chart, uid]);

    // Reset
    const reset = useCallback(() => {
        scaleRef.current = 0.6;
        panRef.current = { x: 0, y: 0 };
        update();
    }, [update]);

    // Zoom (animated)
    const zoom = useCallback((delta: number) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const from = scaleRef.current;
        const to = clamp(from + delta, SCALE_MIN, SCALE_MAX);
        const t0 = performance.now();
        const run = (now: number) => {
            const p = Math.min(1, (now - t0) / 150);
            scaleRef.current = from + (to - from) * (1 - Math.pow(1 - p, 3));
            update();
            if (p < 1) rafRef.current = requestAnimationFrame(run);
        };
        rafRef.current = requestAnimationFrame(run);
    }, [update]);

    useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

    // Wheel + touch (non-passive)
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            scaleRef.current = clamp(scaleRef.current + (e.deltaY < 0 ? 0.1 : -0.1), SCALE_MIN, SCALE_MAX);
            update();
        };
        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 1)
                touchRef.current = { type: "pan", mx: e.touches[0].clientX, my: e.touches[0].clientY, px: panRef.current.x, py: panRef.current.y, dist: 0 };
            else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                touchRef.current = { type: "pinch", mx: 0, my: 0, px: 0, py: 0, dist: Math.hypot(dx, dy) };
            }
        };
        const onTouchMove = (e: TouchEvent) => {
            if (!touchRef.current) return;
            e.preventDefault();
            if (touchRef.current.type === "pan" && e.touches.length === 1) {
                panRef.current = { x: touchRef.current.px + (e.touches[0].clientX - touchRef.current.mx), y: touchRef.current.py + (e.touches[0].clientY - touchRef.current.my) };
                update();
            } else if (touchRef.current.type === "pinch" && e.touches.length === 2) {
                const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                if (touchRef.current.dist > 0) { scaleRef.current = clamp(scaleRef.current * (d / touchRef.current.dist), SCALE_MIN, SCALE_MAX); update(); }
                touchRef.current.dist = d;
            }
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        el.addEventListener("touchstart", onTouchStart, { passive: false });
        el.addEventListener("touchmove", onTouchMove, { passive: false });
        el.addEventListener("touchend", () => { touchRef.current = null; });
        return () => {
            el.removeEventListener("wheel", onWheel);
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
        };
    }, [update]);

    // Mouse pan
    const onMouseDown = useCallback((e: RMouseEvent) => {
        if (e.button !== 0) return;
        isPanning.current = true;
        panStart.current = { mx: e.clientX, my: e.clientY, px: panRef.current.x, py: panRef.current.y };
    }, []);
    const onMouseMove = useCallback((e: RMouseEvent) => {
        if (!isPanning.current) return;
        panRef.current = { x: panStart.current.px + (e.clientX - panStart.current.mx), y: panStart.current.py + (e.clientY - panStart.current.my) };
        update();
    }, [update]);
    const onMouseUp = useCallback(() => { isPanning.current = false; }, []);

    // Fullscreen
    const openFs = useCallback(() => { reset(); setFullscreen(true); }, [reset]);
    const closeFs = useCallback(() => { reset(); setFullscreen(false); }, [reset]);
    useEffect(() => {
        if (!fullscreen || !fsRef.current) return;
        fsRef.current.requestFullscreen?.().catch(() => { });
        const onChange = () => { if (!document.fullscreenElement) closeFs(); };
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, [fullscreen, closeFs]);
    useEffect(() => {
        if (!fullscreen) return;
        const fn = (e: KeyboardEvent) => { if (e.key === "Escape") closeFs(); };
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, [fullscreen, closeFs]);
    useEffect(() => {
        document.body.style.overflow = fullscreen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [fullscreen]);

    // Download
    const download = useCallback(() => {
        if (!svg) return;
        const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })), download: "diagram.svg" });
        a.click(); URL.revokeObjectURL(a.href);
    }, [svg]);

    // Controls
    const Controls = () => (
        <div className="flex items-center gap-0.5 rounded-lg border border-black/10 bg-white/90 px-1 py-0.5 shadow-sm backdrop-blur-sm"
            onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
            <Btn onClick={() => zoom(STEP)} title="Zoom in"><ZoomIn size={12} /></Btn>
            <Btn onClick={() => zoom(-STEP)} title="Zoom out"><ZoomOut size={12} /></Btn>
            <Btn onClick={reset} title="Reset"><RotateCcw size={12} /></Btn>
            <div className="mx-1 h-3.5 w-px bg-gray-200" />
            <span className="min-w-[32px] px-1 text-center font-mono text-[10px] tabular-nums text-gray-400">
                {Math.round(scaleRef.current * 100)}%
            </span>
            <div className="mx-1 h-3.5 w-px bg-gray-200" />
            {svg && <Btn onClick={download} title="Download SVG"><Download size={12} /></Btn>}
            <Btn onClick={fullscreen ? closeFs : openFs} title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
                {fullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </Btn>
        </div>
    );

    // Viewport
    const Viewport = ({ fs }: { fs: boolean }) => (
        <div ref={viewportRef} role="img" aria-label={label} tabIndex={0}
            className={`relative overflow-hidden w-full select-none touch-none bg-slate-50 border border-slate-200 outline-none transition-colors focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 ${fs ? "flex-1 min-h-0 rounded-none border-0" : "rounded-xl [height:clamp(180px,46vw,380px)]"}`}
            style={{ cursor: isPanning.current ? "grabbing" : "grab" }}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>

            <div className="w-full h-full flex items-center justify-center p-6 will-change-transform"
                style={{ transform: `translate(${panRef.current.x}px,${panRef.current.y}px) scale(${scaleRef.current})`, transformOrigin: "center" }}
                aria-hidden="true">
                {svg && <div className="[&_svg]:max-w-full [&_svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />}
                {!svg && !error && <span className="h-7 w-7 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin block" />}
                {error && <p className="text-sm text-red-400">Failed to render diagram.</p>}
            </div>

            <div className="absolute bottom-2.5 right-2.5 z-10"><Controls /></div>
            <p className="absolute top-2 left-2.5 pointer-events-none text-[10px] text-gray-400/60 select-none">
                <span className="hidden sm:inline">Scroll to zoom · Drag to pan</span>
                <span className="sm:hidden">Pinch · Drag</span>
            </p>
        </div>
    );

    return (
        <div className="w-full">
            <Viewport fs={false} />
            {fullscreen && (
                <div ref={fsRef} role="dialog" aria-modal="true"
                    className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md">
                    <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
                        <span className="text-xs font-medium uppercase tracking-widest text-white/40">{label}</span>
                        <button onClick={closeFs}
                            className="flex items-center gap-1.5 rounded border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/40 hover:bg-white/10 hover:text-white/80 transition-colors">
                            <X size={11} /> esc
                        </button>
                    </div>
                    <div className="flex flex-1 min-h-0 flex-col [&_.bg-slate-50]:bg-slate-900 [&_.border-slate-200]:border-slate-700/50">
                        <Viewport fs={true} />
                    </div>
                </div>
            )}
        </div>
    );
}

function Btn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
    return (
        <button onClick={onClick} title={title} aria-label={title}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
            {children}
        </button>
    );
}