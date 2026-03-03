import type { Message, Session } from '../types'
import { MessageList } from './MessageList'
import { InputBar } from './InputBar'
import { ChatHistory } from './ChatHistory'
import { useState } from 'react'

interface Props {
  title: string
  subtitle?: string
  messages: Message[]
  isLoading: boolean
  inputValue: string
  attachment: File | null
  showHistory: boolean
  sessions: Session[]
  sessionId: string
  primaryColor: string
  placeholder: string
  quickReplies?: Array<{ icon: string; text: string }>
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

type Tab = 'chat' | 'faqs' | 'guides'

export function ChatWindow({
  title, subtitle = 'Your intelligent guide', messages, isLoading, inputValue, attachment,
  showHistory, sessions, sessionId, primaryColor, placeholder,
  quickReplies, onClose, onSend, onInputChange, onFileSelect, onFileClear,
  onToggleHistory, onSelectSession, onDeleteSession, onNewChat, onQuickReply
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('chat')

  const tabs: { key: Tab; label: string }[] = [
    // { key: 'chat', label: 'Chat' },
    // { key: 'faqs', label: 'FAQs' },
    // { key: 'guides', label: 'Guides' },
  ]

  return (
    <div className="flex flex-col w-[320px] h-[560px] bg-gray-50 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden font-sans">
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
          <div>
            <div className="text-white font-semibold text-sm leading-tight">{title}</div>
            <div className="text-white/70 text-xs leading-tight">{subtitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
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

      {/* Tabs */}
      {!showHistory && (
        <div className="flex bg-white border-b border-gray-100 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-xs font-medium py-2.5 transition-colors relative ${activeTab === tab.key ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
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
        ) : activeTab === 'chat' ? (
          <>
            <MessageList
              messages={messages}
              isLoading={isLoading}
              primaryColor={primaryColor}
              onQuickReply={onQuickReply}
              quickReplies={quickReplies}
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
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            {activeTab === 'faqs' ? 'FAQs coming soon' : 'Guides coming soon'}
          </div>
        )}
      </div>
    </div>
  )
}