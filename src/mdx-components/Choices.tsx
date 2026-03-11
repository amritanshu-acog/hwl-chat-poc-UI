import { useState, useEffect } from 'react'

interface ChoiceOption {
    label: string
    value: string
    description?: string
}

interface Props {
    question: string
    options: ChoiceOption[]
    primaryColor?: string
    onSelect?: (value: string) => void
}

function makeKey(question: string) {
    const hash = question.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xfffffff, 0)
    return `choices-${hash}`
}

export function Choices({ question, options, primaryColor = '#0052CC', onSelect }: Props) {
    const storageKey = makeKey(question)

    const [selected, setSelected] = useState<string | null>(() => {
        try {
            const saved = localStorage.getItem(storageKey)
            return saved ?? null
        } catch {
            return null
        }
    })

    useEffect(() => {
        try {
            if (selected) localStorage.setItem(storageKey, selected)
        } catch { /* unavailable */ }
    }, [selected, storageKey])

    const handleSelect = (value: string) => {
        if (selected) return
        setSelected(value)
        onSelect?.(value)
    }

    return (
        <div className="my-2">
            <div className="space-y-2">
                {options.map((option, idx) => {
                    const val = option.value || option.label
                    const isSelected = selected === val
                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(val)}
                            disabled={selected !== null}
                            className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50'
                                } disabled:cursor-not-allowed`}
                        >
                            <div className="flex items-start gap-2">
                                <div
                                    className="flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all"
                                    style={{
                                        borderColor: isSelected ? primaryColor : '#d1d5db',
                                        backgroundColor: isSelected ? primaryColor : 'transparent',
                                    }}
                                >
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900">{option.label}</p>
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