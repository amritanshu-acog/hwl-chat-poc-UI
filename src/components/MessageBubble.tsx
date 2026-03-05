import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../types'
import type { Components } from 'react-markdown'
import { ResponseRenderer } from '../response-components'

interface Props {
  message: Message
  primaryColor: string
  onQuickReply?: (text: string) => void
  onCreateTicket?: () => void
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function MessageBubble({ message, primaryColor, onQuickReply, onCreateTicket }: Props) {
  const isUser = message.role === 'user'

  const markdownComponents: Components = {
    h1: ({ children }) => <h1 className="text-sm font-bold text-gray-900 mt-3 mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-sm font-bold text-gray-900 mt-3 mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xs font-semibold text-gray-900 mt-2 mb-1.5">{children}</h3>,
    p: ({ children }) => <p className="mb-2 leading-relaxed text-xs text-gray-800">{children}</p>,
    ul: ({ children }) => <ul className="ml-4 mb-2 space-y-1 list-disc">{children}</ul>,
    ol: ({ children }) => <ol className="ml-4 mb-2 space-y-1 list-decimal">{children}</ol>,
    li: ({ children }) => <li className="text-xs text-gray-800 leading-relaxed">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
    // @ts-expect-error inline is passed by older react-markdown or custom plugins but not in types
    code: ({ inline, children }) =>
      inline ? (
        <code className="px-1 py-0.5 bg-gray-200 rounded text-[11px] font-mono">{children}</code>
      ) : (
        <code className="block bg-gray-900 text-gray-100 p-2 rounded text-[11px] font-mono my-2 overflow-x-auto">{children}</code>
      ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-700">
        {children}
      </a>
    ),
  }

  const renderContent = () => {
    if (isUser) {
      return <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
    }

    const mdxResult = (
      <ResponseRenderer
        content={message.content}
        primaryColor={primaryColor}
        onChoiceSelect={onQuickReply}
        onCreateTicket={onCreateTicket}
      />
    )

    try {
      JSON.parse(message.content)
      return mdxResult
    } catch {
      return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {message.content}
        </ReactMarkdown>
      )
    }
  }

  return (
    <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs ${isUser
          ? 'text-white rounded-br-sm'
          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
          }`}
        style={isUser ? { backgroundColor: primaryColor } : undefined}
      >
        {renderContent()}
        {message.attachment && (
          <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-1.5 opacity-80">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <span className="text-[11px] truncate">{message.attachment.name}</span>
          </div>
        )}
      </div>
      <span className="text-[11px] text-gray-400 px-1">{formatTime(message.timestamp)}</span>
    </div>
  )
}