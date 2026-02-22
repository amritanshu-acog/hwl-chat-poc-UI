import { useRef, type KeyboardEvent } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onFileSelect: (file: File) => void
  onFileClear: () => void
  attachment: File | null
  isLoading: boolean
  placeholder: string
  primaryColor: string
}

export function InputBar({
  value, onChange, onSend, onFileSelect, onFileClear,
  attachment, isLoading, placeholder, primaryColor
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && value.trim()) onSend()
    }
  }

  return (
    <div className="border-t border-gray-100 px-3 py-3 flex flex-col gap-2">
      {attachment && (
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 text-xs text-gray-600">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span className="truncate flex-1">{attachment.name}</span>
          <button onClick={onFileClear} className="text-gray-400 hover:text-gray-600 flex-shrink-0">✕</button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isLoading}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-40 rounded-lg hover:bg-gray-100 transition-colors"
          title="Attach file"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
          onChange={e => { if (e.target.files?.[0]) onFileSelect(e.target.files[0]); e.target.value = '' }} />
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
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
