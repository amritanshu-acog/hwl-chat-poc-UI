import { useEffect, useRef } from 'react'
import type React from 'react'
import type { Message } from '../types'
import { MessageBubble } from './MessageBubble'

interface QuickReply {
  icon: string
  text: string
}

interface Props {
  messages: Message[]
  isLoading: boolean
  primaryColor: string
  onQuickReply: (text: string) => void
  quickReplies?: QuickReply[]
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
          />
        ))}
      </div>
    </div>
  )
}

const defaultQuickReplies: QuickReply[] = [
  { icon: 'doc', text: 'How do I create a requisition?' },
  { icon: 'people', text: 'Explain the onboarding process' },

]

function getIcon(icon: string) {
  const iconMap: Record<string, React.ReactElement> = {
    doc: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    people: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    chart: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    shield: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  }
  return iconMap[icon] || iconMap['doc']
}

function WelcomeScreen({ quickReplies, onQuickReply, primaryColor }: {
  quickReplies: QuickReply[]
  onQuickReply: (text: string) => void
  primaryColor: string
}) {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Welcome hero */}
      <div className="flex flex-col items-center pt-8 pb-4 px-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-gray-800 mb-1">Welcome!</h2>
        <p className="text-xs text-gray-500 text-center">Ask me anything about the system</p>
      </div>

      {/* Quick reply buttons */}
      <div className="flex flex-col px-3 gap-2 pb-4">
        {quickReplies.map((qr, i) => (
          <button
            key={i}
            onClick={() => onQuickReply(qr.text)}
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-3 py-3 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              {getIcon(qr.icon)}
            </div>
            <span className="text-xs text-gray-700 flex-1 leading-snug font-medium">{qr.text}</span>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

export function MessageList({ messages, isLoading, primaryColor, onQuickReply, quickReplies }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const suggestions = quickReplies ?? defaultQuickReplies

  if (messages.length === 0 && !isLoading) {
    return (
      <WelcomeScreen
        quickReplies={suggestions}
        onQuickReply={onQuickReply}
        primaryColor={primaryColor}
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scroll-smooth">
      {messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
          primaryColor={primaryColor}
          onQuickReply={onQuickReply}
        />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}