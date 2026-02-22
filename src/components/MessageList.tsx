import { useEffect, useRef } from 'react'
import type { Message } from '../types'
import { MessageBubble } from './MessageBubble'

interface Props {
  messages: Message[]
  isLoading: boolean
  primaryColor: string
  onQuickReply: (text: string) => void
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

export function MessageList({ messages, isLoading, primaryColor, onQuickReply }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm px-6 text-center">
        <p>Send a message to get started</p>
      </div>
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
