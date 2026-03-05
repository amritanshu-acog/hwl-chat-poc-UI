import { useState } from 'react'
import type { ChecklistData } from '../types'

interface Props {
    data: ChecklistData
    primaryColor: string
}

export function Checklist({ data, primaryColor }: Props) {
    const normalizedItems = data.items.map((item, index) => ({
        id: typeof item === "string" ? String(index) : item.id,
        label: typeof item === "string" ? item : item.label,
        checked: typeof item === "string" ? false : (item.checked ?? false),
    }))

    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
        normalizedItems.reduce((acc, item) => {
            acc[item.id] = item.checked
            return acc
        }, {} as Record<string, boolean>)
    )

    const toggleItem = (id: string) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }))
    }

    return (
        <div className="my-2">
            {data.title && (
                <h4 className="text-xs font-semibold text-gray-900 mb-2">{data.title}</h4>
            )}
            <div className="space-y-2">
                {normalizedItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className="w-full flex items-start gap-2.5 text-left p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${checkedItems[item.id] ? 'border-transparent' : 'border-gray-300'
                                    }`}
                                style={checkedItems[item.id] ? { backgroundColor: primaryColor } : undefined}
                            >
                                {checkedItems[item.id] && (
                                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className={`text-xs flex-1 ${checkedItems[item.id] ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}