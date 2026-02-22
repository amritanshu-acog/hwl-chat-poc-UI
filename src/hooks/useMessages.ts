import { useState, useEffect, useCallback } from 'react'
import type { Message } from '../types'
// Phase 2: import { getChatHistory, saveMessage } from '../api'

const SESSION_KEY = (id: string) => `hwl_session_${id}`

function loadFromStorage(sessionId: string): Message[] {
  try {
    const raw = localStorage.getItem(SESSION_KEY(sessionId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<Omit<Message, 'timestamp'> & { timestamp: string }>
    return parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
  } catch {
    return []
  }
}

function saveToStorage(sessionId: string, messages: Message[]): void {
  // Phase 2: swap this line → await saveMessage(sessionId, messages[messages.length - 1])
  localStorage.setItem(SESSION_KEY(sessionId), JSON.stringify(messages))
}

export function useMessages(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([])

  // Reload messages when session changes
  // Phase 2: swap loadFromStorage → await getChatHistory(sessionId)
  useEffect(() => {
    setMessages(loadFromStorage(sessionId))
  }, [sessionId])

  // Auto-save on every change
  useEffect(() => {
    if (messages.length > 0) {
      saveToStorage(sessionId, messages)
    }
  }, [messages, sessionId])

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message])
  }, [])

  const clearMessages = useCallback(() => {
    localStorage.removeItem(SESSION_KEY(sessionId))
    setMessages([])
  }, [sessionId])

  return { messages, addMessage, clearMessages }
}
