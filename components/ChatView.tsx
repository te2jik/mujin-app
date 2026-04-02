'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Message } from '@/types/db'
import MessageBubble from './MessageBubble'

interface ChatViewProps {
  groupId: string
  userId: string
  initialMessages: (Message & { profiles?: { id: string; nickname: string; avatar_color: string } })[]
}

export default function ChatView({
  groupId,
  userId,
  initialMessages,
}: ChatViewProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const channel = supabase
      .channel(`group_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload: any) => {
          setMessages((prev) => [
            ...prev,
            {
              ...payload.new,
              profiles: payload.new.profiles,
            },
          ])
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [groupId, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          body: newMessage,
        }),
      })

      if (res.ok) {
        setNewMessage('')
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm text-white/60">メッセージはまだありません</p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.user_id === userId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 border-t border-white/5 flex gap-2"
      >
        <input
          type="text"
          placeholder="メッセージを入力..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="btn btn-primary px-4 disabled:opacity-50"
        >
          送信
        </button>
      </form>
    </div>
  )
}
