import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../types'
import type { Components } from 'react-markdown'
import { useMDX } from '../hooks/useMDX'
import { mdxComponents } from '../lib/mdxComponents'
import { Citations } from './Citations'

import type { Citation } from '../types'

interface Props {
  message: Message
  primaryColor: string
  onQuickReply?: (text: string) => void
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

interface ParsedContent {
  mdxBody: string | null
  citations: Citation[]
}

/**
 * Parses message.content and extracts mdxBody + citations.
 *
 * Shape 1: dummy.ts  — [{ type: "mdx", data: { body: "..." } }]
 * Shape 2: backend   — { response: "<MDX or markdown string>", citations: [...] }
 * Shape 3: raw string — plain markdown or MDX passed directly
 */
function parseContent(content: string): ParsedContent {
  try {
    const parsed = JSON.parse(content)

    // Shape 1: dummy.ts array wrapper
    const arr = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.response)
        ? parsed.response
        : null

    if (arr && arr.length > 0 && arr[0]?.type === 'mdx' && typeof arr[0]?.data?.body === 'string') {
      return { mdxBody: arr[0].data.body as string, citations: [] }
    }

    // Shape 2: real backend { response: "...", citations: [...] }
    // Return regardless of whether it contains MDX tags — MDX is a superset
    // of markdown so plain markdown responses render fine through useMDX.
    if (typeof parsed?.response === 'string') {
      return {
        mdxBody: parsed.response.trim(),
        citations: Array.isArray(parsed.citations) ? parsed.citations : [],
      }
    }

  } catch {
    // not JSON — fall through
  }

  // Shape 3: raw string — plain markdown or MDX passed directly
  return { mdxBody: content.trim(), citations: [] }
}

export function MessageBubble({ message, primaryColor, onQuickReply }: Props) {
  const isUser = message.role === 'user'

  const { mdxBody, citations } = isUser
    ? { mdxBody: null, citations: [] }
    : parseContent(message.content)

  const { Content: MDXContent, error: mdxError } = useMDX(mdxBody ?? '')

  const markdownComponents: Components = {
    h1: ({ children }) => <h1 className="text-sm font-bold text-gray-900 mt-3 mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-sm font-bold text-gray-900 mt-3 mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xs font-semibold text-gray-900 mt-2 mb-1.5">{children}</h3>,
    p: ({ children }) => <p className="mb-2 leading-relaxed text-xs text-gray-800">{children}</p>,
    ul: ({ children }) => <ul className="ml-4 mb-2 space-y-1 list-disc">{children}</ul>,
    ol: ({ children }) => <ol className="ml-4 mb-2 space-y-1 list-decimal">{children}</ol>,
    li: ({ children }) => <li className="text-xs text-gray-800 leading-relaxed">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
    // @ts-expect-error inline not in types
    code: ({ inline, children }) =>
      inline
        ? <code className="px-1 py-0.5 bg-gray-200 rounded text-[11px] font-mono">{children}</code>
        : <code className="block bg-gray-900 text-gray-100 p-2 rounded text-[11px] font-mono my-2 overflow-x-auto">{children}</code>,
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

    if (mdxBody !== null) {
      // MDX evaluation failed — fall back to ReactMarkdown
      if (mdxError) {
        return (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {mdxBody}
          </ReactMarkdown>
        )
      }

      // Still compiling
      if (!MDXContent) {
        return <p className="text-xs text-gray-400 animate-pulse">Rendering…</p>
      }

      const MDX = MDXContent as any
      const components = {
        ...markdownComponents,
        ...Object.fromEntries(
          Object.entries(mdxComponents).map(([key, Comp]) => [
            key,
            (props: any) => <Comp {...props} primaryColor={primaryColor} onSelect={onQuickReply} />,
          ])
        )
      }
      return <MDX components={components} />
    }

    // Fallback — should rarely be hit now
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {message.content}
      </ReactMarkdown>
    )
  }

  return (
    <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`rounded-2xl px-4 py-3 text-xs ${isUser
          ? 'max-w-[85%] text-white rounded-br-sm'
          : 'w-[60%] bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
          }`}
        style={isUser ? { backgroundColor: primaryColor } : undefined}
      >
        {renderContent()}

        {/* Citations rendered below MDX content — assistant only */}
        {!isUser && <Citations citations={citations} />}

        {message.attachment && (
          <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-1.5 opacity-80">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className="text-[11px] truncate">{message.attachment.name}</span>
          </div>
        )}
      </div>
      <span className="text-[11px] text-gray-400 px-1">{formatTime(message.timestamp)}</span>
    </div>
  )
}