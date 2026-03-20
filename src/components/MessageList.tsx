import { useRef, useEffect } from 'react'
import type { Message, LLMResponse } from '../types'
import { MessageBubble } from './MessageBubble'
import { APP_CONFIG, type QuickReply } from '../config'
import {
    ChatBubbleIcon,
    ChevronRightIcon,
    QUICK_REPLY_ICON_MAP,
    QUICK_REPLY_ICON_FALLBACK,
} from '../assets/icons'

interface Props {
    messages: Message[]
    isLoading: boolean
    isLoadingHistory: boolean
    primaryColor: string
    onQuickReply: (text: string, messageId?: string, llmResponse?: LLMResponse) => void
    /** Overrides APP_CONFIG.quickReplies when provided. */
    quickReplies?: QuickReply[]
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

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

// ─── Icon resolver ────────────────────────────────────────────────────────────
// Resolves a quick-reply icon key to a rendered element.
// Falls back to QUICK_REPLY_ICON_FALLBACK for unknown keys.

function QuickReplyIcon({ iconKey, className }: { iconKey: string; className?: string }) {
    const Icon = QUICK_REPLY_ICON_MAP[iconKey] ?? QUICK_REPLY_ICON_FALLBACK
    return <Icon className={className} />
}

// ─── Welcome screen ───────────────────────────────────────────────────────────

function WelcomeScreen({ quickReplies, onQuickReply, primaryColor }: {
    quickReplies: QuickReply[]
    onQuickReply: (text: string) => void
    primaryColor: string
}) {
    return (
        <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex flex-col items-center pt-8 pb-4 px-4">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md"
                    style={{ backgroundColor: primaryColor }}
                >
                    <ChatBubbleIcon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-base font-bold text-gray-800 mb-1">Welcome!</h2>
                <p className="text-xs text-gray-500 text-center">Ask me anything related to HWL</p>
            </div>

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
                            <QuickReplyIcon iconKey={qr.icon} className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-gray-700 flex-1 leading-snug font-medium">
                            {qr.text}
                        </span>
                        <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                    </button>
                ))}
            </div>
        </div>
    )
}

// ─── MessageList ──────────────────────────────────────────────────────────────

export function MessageList({
    messages, isLoading, isLoadingHistory, primaryColor, onQuickReply, quickReplies,
}: Props) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const id = setTimeout(() => {
            bottomRef.current?.scrollIntoView({
                behavior: isLoadingHistory ? 'instant' : 'smooth',
            })
        }, 100)
        return () => clearTimeout(id)
    }, [messages, isLoading, isLoadingHistory])

    // Fall back to the config-level defaults.
    // Cast is safe: APP_CONFIG.quickReplies satisfies QuickReply[].
    const suggestions: QuickReply[] = quickReplies ?? (APP_CONFIG.quickReplies as unknown as QuickReply[])

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