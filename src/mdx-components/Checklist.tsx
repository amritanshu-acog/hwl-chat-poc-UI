import { useState, useEffect, useMemo } from 'react'

interface Props {
    title?: string
    items: string[]
    primaryColor?: string
}

function makeKey(items: string[]) {
    const hash = items.join('|').split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xfffffff, 0)
    return `checklist-${hash}`
}

export function Checklist({ title, items, primaryColor = '#0052CC' }: Props) {
    const storageKey = makeKey(items)

    const [checked, setChecked] = useState<Record<number, boolean>>(() => {
        try {
            const saved = sessionStorage.getItem(storageKey)
            return saved ? JSON.parse(saved) : {}
        } catch { return {} }
    })

    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'done' | 'todo'>('all')

    useEffect(() => {
        try { sessionStorage.setItem(storageKey, JSON.stringify(checked)) }
        catch { /* unavailable */ }
    }, [checked, storageKey])

    function toggle(i: number) {
        setChecked(prev => ({ ...prev, [i]: !prev[i] }))
    }

    function clearAll() { setChecked({}) }
    function checkAll() {
        const all: Record<number, boolean> = {}
        items.forEach((_, i) => { all[i] = true })
        setChecked(all)
    }

    const checkedCount = Object.values(checked).filter(Boolean).length
    const total = items.length
    const allDone = checkedCount === total
    const progress = Math.round((checkedCount / total) * 100)

    const filtered = useMemo(() => {
        return items
            .map((item, i) => ({ item, i }))
            .filter(({ item, i }) => {
                const matchesSearch = !search.trim() || item.toLowerCase().includes(search.toLowerCase())
                const matchesFilter =
                    filter === 'all' ? true :
                        filter === 'done' ? !!checked[i] :
                            !checked[i]
                return matchesSearch && matchesFilter
            })
    }, [items, search, filter, checked])

    function highlight(text: string) {
        if (!search.trim()) return text
        const parts = text.split(new RegExp(`(${search})`, 'gi'))
        return parts.map(p =>
            p.toLowerCase() === search.toLowerCase()
                ? `<mark style="background:${primaryColor}22;border-radius:2px;padding:0 1px">${p}</mark>`
                : p
        ).join('')
    }

    return (
        <div className="my-2 rounded-xl border border-gray-200 bg-white overflow-hidden">

            {/* ── Header ── */}
            <div className="px-3 pt-3 pb-2 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-900">{'Checklist'}</span>
                    <div className="flex items-center gap-2">
                        <span
                            className="text-[10px] font-medium tabular-nums"
                            style={{ color: allDone ? '#16a34a' : primaryColor }}
                        >
                            {allDone ? '✓ All done' : `${checkedCount} / ${total}`}
                        </span>
                        {checkedCount > 0
                            ? <button onClick={clearAll} className="text-[10px] text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 transition-colors">Reset</button>
                            : <button onClick={checkAll} className="text-[10px] text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 transition-colors">Check all</button>
                        }
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden mb-2">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: allDone ? '#16a34a' : primaryColor }}
                    />
                </div>

                {/* Search */}
                <div className="relative mb-2">
                    <svg className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300" width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search items…"
                        className="w-full pl-6 pr-3 py-1 text-[11px] rounded-md border border-gray-200 bg-gray-50 placeholder-gray-300 focus:outline-none focus:border-blue-300 transition-colors"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1">
                    {(['all', 'todo', 'done'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className="text-[10px] px-2 py-0.5 rounded-md border transition-colors capitalize"
                            style={{
                                borderColor: filter === f ? primaryColor : '#e5e7eb',
                                backgroundColor: filter === f ? `${primaryColor}11` : 'transparent',
                                color: filter === f ? primaryColor : '#9ca3af',
                            }}
                        >
                            {f === 'all' ? `All (${total})` : f === 'done' ? `Done (${checkedCount})` : `To do (${total - checkedCount})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Items ── */}
            <div className="p-2 space-y-0.5">
                {filtered.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">
                        {search ? `No items match "${search}"` : `No ${filter} items`}
                    </p>
                )}
                {filtered.map(({ item, i }) => {
                    const isDone = !!checked[i]
                    return (
                        <button
                            key={i}
                            onClick={() => toggle(i)}
                            className="w-full flex items-start gap-2.5 text-left px-2 py-2 rounded-lg transition-all"
                            style={{ backgroundColor: isDone ? 'rgba(22,163,74,0.04)' : 'transparent' }}
                        >
                            {/* Checkbox */}
                            <div
                                className="flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 mt-0.5"
                                style={isDone
                                    ? { backgroundColor: '#16a34a', borderColor: '#16a34a' }
                                    : { borderColor: '#d1d5db' }
                                }
                            >
                                {isDone && (
                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                        <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>

                            {/* Index */}
                            <span className="flex-shrink-0 text-[10px] text-gray-300 mt-0.5 w-4 text-right tabular-nums">{i + 1}</span>

                            {/* Text */}
                            <span
                                className="text-xs flex-1 leading-relaxed transition-colors duration-200"
                                style={{ color: isDone ? '#9ca3af' : '#1f2937', textDecoration: isDone ? 'line-through' : 'none' }}
                                dangerouslySetInnerHTML={{ __html: highlight(item) }}
                            />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}