import type { Message, Session } from '../types'
import { MessageList } from './MessageList'
import { InputBar } from './InputBar'
import { ChatHistory } from './ChatHistory'

interface Props {
  title: string
  messages: Message[]
  isLoading: boolean
  inputValue: string
  attachment: File | null
  showHistory: boolean
  sessions: Session[]
  sessionId: string
  primaryColor: string
  placeholder: string
  onClose: () => void
  onSend: () => void
  onInputChange: (v: string) => void
  onFileSelect: (f: File) => void
  onFileClear: () => void
  onToggleHistory: () => void
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
  onNewChat: () => void
  onQuickReply: (text: string) => void
}

export function ChatWindow({
  title, messages, isLoading, inputValue, attachment,
  showHistory, sessions, sessionId, primaryColor, placeholder,
  onClose, onSend, onInputChange, onFileSelect, onFileClear,
  onToggleHistory, onSelectSession, onDeleteSession, onNewChat, onQuickReply
}: Props) {
  return (
    <div className="flex flex-col w-[800px] h-[580px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleHistory}
            className={`p-1.5 rounded-lg transition-colors ${showHistory ? 'bg-white/30' : 'hover:bg-white/20'}`}
            title="Chat history"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Close">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body: chat or history */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {showHistory ? (
          <ChatHistory
            sessions={sessions}
            currentSessionId={sessionId}
            onSelectSession={id => { onSelectSession(id); onToggleHistory() }}
            onDeleteSession={onDeleteSession}
            onNewChat={() => { onNewChat(); onToggleHistory() }}
            onBack={onToggleHistory}
            primaryColor={primaryColor}
          />
        ) : (
          <>
            <MessageList
              messages={messages}
              isLoading={isLoading}
              primaryColor={primaryColor}
              onQuickReply={onQuickReply}
            />
            <InputBar
              value={inputValue}
              onChange={onInputChange}
              onSend={onSend}
              onFileSelect={onFileSelect}
              onFileClear={onFileClear}
              attachment={attachment}
              isLoading={isLoading}
              placeholder={placeholder}
              primaryColor={primaryColor}
            />
          </>
        )}
      </div>
    </div>
  )
}
