import { useState } from 'react'

interface ChoiceOption {
    label: string
    value: string
    description?: string
}

interface Props {
    question: string
    options: ChoiceOption[]
    messageId?: string
    primaryColor?: string
    selectedOption?: string  // set by jsonToMdx when restoring from session
    onSelect?: (value: string) => void
}

const SOMETHING_ELSE_VALUES = ['something else', 'other', 'something_else']

function isSomethingElse(value: string) {
    return SOMETHING_ELSE_VALUES.includes(value.toLowerCase().trim())
}

export function Choices({ options, primaryColor = '#0052CC', selectedOption, onSelect }: Props) {
    const [selected, setSelected] = useState<string | null>(selectedOption ?? null)
    const [showInput, setShowInput] = useState(false)
    const [customText, setCustomText] = useState('')

    const handleSelect = (value: string) => {
        if (selected) return

        if (isSomethingElse(value)) {
            setSelected(value)
            setShowInput(true)
            return
        }

        setSelected(value)
        onSelect?.(value)
    }

    const handleCustomSubmit = () => {
        const text = customText.trim()
        if (!text) return
        setShowInput(false)
        onSelect?.(text)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleCustomSubmit()
    }

    // ── Frozen view — after selection (live click or session restore) ──────────
    if (selected !== null && !showInput) {
        return (
            <div className="my-2">
                <div className="space-y-2">
                    {options.map((option, idx) => {
                        const val = option.value || option.label
                        const isSelected = selected === val
                        return (
                            <div
                                key={idx}
                                className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all
                                    ${isSelected
                                        ? 'border-blue-400 bg-blue-50'
                                        : 'border-gray-100 bg-gray-50 opacity-50'
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    <div
                                        className="flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center"
                                        style={{
                                            borderColor: isSelected ? primaryColor : '#d1d5db',
                                            backgroundColor: isSelected ? primaryColor : 'transparent',
                                        }}
                                    >
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {option.label}
                                        </p>
                                        {option.description && (
                                            <p className="text-[11px] text-gray-400 mt-0.5">{option.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* Custom free text — shown when "something else" was typed */}
                    {!options.find(o => o.value === selected) && !isSomethingElse(selected) && (
                        <div className="px-3 py-2 rounded-lg border-2 border-blue-400 bg-blue-50">
                            <p className="text-xs font-medium text-gray-900">✓ {selected}</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ── Input mode — "Something else" clicked, waiting for typed text ──────────
    if (showInput) {
        return (
            <div className="my-2">
                <div className="space-y-2">
                    {options.map((option, idx) => {
                        const val = option.value || option.label
                        const isSelected = selected === val
                        return (
                            <div
                                key={idx}
                                className={`w-full text-left px-3 py-2.5 rounded-lg border-2
                                    ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-gray-50 opacity-50'}`}
                            >
                                <div className="flex items-start gap-2">
                                    <div
                                        className="flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center"
                                        style={{
                                            borderColor: isSelected ? primaryColor : '#d1d5db',
                                            backgroundColor: isSelected ? primaryColor : 'transparent',
                                        }}
                                    >
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {option.label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    <div className="flex gap-2 pt-1">
                        <input
                            autoFocus
                            type="text"
                            value={customText}
                            onChange={e => setCustomText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe what you need…"
                            className="flex-1 text-xs px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:outline-none bg-white"
                        />
                        <button
                            onClick={handleCustomSubmit}
                            disabled={!customText.trim()}
                            className="px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ── Interactive — nothing selected yet ─────────────────────────────────────
    return (
        <div className="my-2">
            <div className="space-y-2">
                {options.map((option, idx) => {
                    const val = option.value || option.label
                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(val)}
                            className="w-full text-left px-3 py-2.5 rounded-lg border-2 border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 transition-all"
                        >
                            <div className="flex items-start gap-2">
                                <div
                                    className="flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5"
                                    style={{ borderColor: '#d1d5db' }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900">{option.value}</p>
                                    {option.description && (
                                        <p className="text-[11px] text-gray-600 mt-0.5">{option.description}</p>
                                    )}
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}