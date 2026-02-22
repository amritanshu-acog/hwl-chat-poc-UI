import { useState, useCallback } from 'react'
import type { HWLAssistantProps, Message } from '../types'
import { useSession } from '../hooks/useSession'
import { useMessages } from '../hooks/useMessages'
import { sendMessage } from '../api'
import { ChatWindow } from './ChatWindow'

const DEFAULTS = {
  title: 'HWL Assistant',
  primaryColor: '#0066cc',
  placeholder: 'Ask me anything...',
}

export function HWLAssistant({
  apiUrl,
  title = DEFAULTS.title,
  theme,
  placeholder = DEFAULTS.placeholder,
}: HWLAssistantProps) {
  const primaryColor = theme?.primaryColor ?? DEFAULTS.primaryColor
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  const { sessionId, sessions, startNewSession, switchSession, updateSessionPreview, deleteSession } = useSession()
  const { messages, addMessage, clearMessages } = useMessages(sessionId)

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setHasUnread(false)
  }, [])

  const handleSend = useCallback(async () => {
    const text = inputValue.trim()
    if (!text || isLoading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      attachment: attachment ? { name: attachment.name, type: attachment.type } : undefined,
    }
    addMessage(userMsg)
    if (messages.length === 0) updateSessionPreview(sessionId, text)
    setInputValue('')
    const pendingFile = attachment
    setAttachment(null)
    setIsLoading(true)

    try {
      const reply = await sendMessage(text, sessionId, apiUrl, pendingFile ?? undefined)
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }
      addMessage(botMsg)
      if (!isOpen) setHasUnread(true)
    } catch {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '⚠️ Sorry, I couldn\'t connect to the server. Please try again.',
        timestamp: new Date(),
      }
      addMessage(errMsg)
    } finally {
      setIsLoading(false)
    }
  }, [inputValue, isLoading, attachment, messages.length, sessionId, apiUrl, addMessage, updateSessionPreview, isOpen])

  const handleQuickReply = useCallback((replyText: string) => {
    if (isLoading) return // Prevent sending while another message is processing

    // Fill the input with the quick reply text
    setInputValue(replyText)

    // Send immediately after a brief delay so user sees the input filled
    setTimeout(() => {
      const text = replyText.trim()
      if (!text) return

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      }
      addMessage(userMsg)
      if (messages.length === 0) updateSessionPreview(sessionId, text)
      setInputValue('')
      setIsLoading(true)

      sendMessage(text, sessionId, apiUrl)
        .then(reply => {
          const botMsg: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: reply,
            timestamp: new Date(),
          }
          addMessage(botMsg)
          if (!isOpen) setHasUnread(true)
        })
        .catch(() => {
          const errMsg: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '⚠️ Sorry, I couldn\'t connect to the server. Please try again.',
            timestamp: new Date(),
          }
          addMessage(errMsg)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }, 150)
  }, [isLoading, messages.length, sessionId, apiUrl, addMessage, updateSessionPreview, isOpen])

  const handleNewChat = useCallback(() => {
    clearMessages()
    startNewSession()
  }, [clearMessages, startNewSession])

  const handleSwitchSession = useCallback((id: string) => {
    switchSession(id)
  }, [switchSession])

  const handleDeleteSession = useCallback((id: string) => {
    deleteSession(id)
  }, [deleteSession])

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3">
      {isOpen && (
        <ChatWindow
          title={title}
          messages={messages}
          isLoading={isLoading}
          inputValue={inputValue}
          attachment={attachment}
          showHistory={showHistory}
          sessions={sessions}
          sessionId={sessionId}
          primaryColor={primaryColor}
          placeholder={placeholder}
          onClose={() => setIsOpen(false)}
          onSend={handleSend}
          onInputChange={setInputValue}
          onFileSelect={setAttachment}
          onFileClear={() => setAttachment(null)}
          onToggleHistory={() => setShowHistory(v => !v)}
          onSelectSession={handleSwitchSession}
          onDeleteSession={handleDeleteSession}
          onNewChat={handleNewChat}
          onQuickReply={handleQuickReply}
        />
      )}

      {/* Floating button */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 relative"
        style={{ backgroundColor: primaryColor }}
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        )}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>
    </div>
  )
}