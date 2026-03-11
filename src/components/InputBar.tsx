import { type KeyboardEvent } from 'react'
import { SendIcon } from '../assets/icons'

interface Props {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  isLoading: boolean
  placeholder: string
  primaryColor: string
}

export function InputBar({
  value, onChange, onSend,
  isLoading, placeholder, primaryColor
}: Props) {

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && value.trim()) onSend()
    }
  }

  return (
    <div className="border-t border-gray-100 px-3 py-3">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 max-h-32 overflow-y-auto transition-shadow"
        />
        <button
          onClick={onSend}
          disabled={isLoading || !value.trim()}
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all hover:brightness-110 active:scale-95"
          style={{ backgroundColor: primaryColor }}
          title="Send message"
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}