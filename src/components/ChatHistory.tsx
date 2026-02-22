import type { Session } from '../types'

interface Props {
  sessions: Session[]
  currentSessionId: string
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
  onNewChat: () => void
  onBack: () => void
  primaryColor: string
}

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function ChatHistory({ sessions, currentSessionId, onSelectSession, onDeleteSession, onNewChat, onBack, primaryColor }: Props) {
  const sorted = [...sessions].sort((a, b) =>
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-semibold text-gray-800 text-sm">Chat History</h3>
        <button
          onClick={onNewChat}
          className="text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-all hover:brightness-110"
          style={{ backgroundColor: primaryColor }}
        >
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-8 px-4">No previous conversations</p>
        ) : (
          sorted.map(session => (
            <div key={session.sessionId} className="group relative border-b border-gray-50">
              <button
                onClick={() => onSelectSession(session.sessionId)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors pr-10 ${session.sessionId === currentSessionId ? 'bg-blue-50' : ''
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{formatDate(new Date(session.startedAt))}</span>
                  {session.sessionId === currentSessionId && (
                    <span className="text-xs font-medium" style={{ color: primaryColor }}>Active</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 line-clamp-2 leading-snug">
                  {session.preview || 'Empty conversation'}
                </p>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Delete this conversation?')) {
                    onDeleteSession(session.sessionId)
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                title="Delete conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
