import { useState } from 'react'
import type { ChoicesData } from '../types'

interface Props {
    data: ChoicesData
    onSelect?: (value: string) => void
    primaryColor: string
}

export function Choices({ data, onSelect, primaryColor }: Props) {
    const [selectedValue, setSelectedValue] = useState<string | null>(null)

    // Safety check
    if (!data || !data.options || !Array.isArray(data.options)) {
        console.error('❌ Choices component received invalid data:', data)
        return null
    }

    const handleSelect = (value: string) => {
        if (selectedValue) return // Prevent changing after selection
        setSelectedValue(value)
        onSelect?.(value)
    }

    return (
        <div className="my-2">
            <p className="text-xs font-medium text-gray-900 mb-2">{data.question}</p>
            <div className="space-y-2">
                {data.options.map((option, idx) => {
                    const optionValue = option.value || option.label
                    const isSelected = selectedValue === optionValue

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(optionValue)}
                            disabled={selectedValue !== null}
                            className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all group ${isSelected
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50'
                                } disabled:cursor-not-allowed`}
                        >
                            <div className="flex items-start gap-2">
                                <div
                                    className="flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 transition-all flex items-center justify-center"
                                    style={{
                                        borderColor: isSelected ? primaryColor : '#d1d5db',
                                        backgroundColor: isSelected ? primaryColor : 'transparent',
                                    }}
                                >
                                    {isSelected && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
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