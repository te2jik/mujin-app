'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/browser'

interface ChatBoxProps {
  groupId: string
  userId: string
}

interface ChatMessage {
  id: string
  user_id: string
  body: string
  created_at: string
  profiles?: { nickname: string; avatar_color: string }
}

export default function ChatBox({ groupId, userId }: ChatBoxProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, profiles(nickname, avatar_color)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100)

      setMessages((data as ChatMessage[]) || [])
    }

    load()

    const channel = supabase
      .channel(`chat:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nickname, avatar_color')
            .eq('id', payload.new.user_id)
            .single()

          const newMsg = {
            ...payload.new,
            profiles: profile,
          } as ChatMessage

          setMessages((prev) => [...prev, newMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!body.trim() || sending) return
    setSending(true)

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, body: body.trim() }),
    })

    setBody('')
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="mujin-card flex flex-col" style={{ height: 480 }}>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p
            className="py-12 text-center text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            まだメッセージがありません。最初のメッセージを送りましょう！
          </p>
        )}

        <div className="space-y-3">
          {messages.map((m) => {
            const isMine = m.user_id === userId

            return (
              <div
                key={m.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                  {!isMine && (
                    <div
                      className="avatar flex-shrink-0"
                      style={{
                        background: m.profiles?.avatar_color || '#888',
                        width: 28,
                        height: 28,
                        fontSize: 11,
                      }}
                    >
                      {(m.profiles?.nickname || '?')[0]}
                    </div>
                  )}
                  <div>
                    {!isMine && (
                      <p
                        className="mb-1 text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {m.profiles?.nickname || '不明'}
                      </p>
                    )}
                    <div className={`chat-bubble ${isMine ? 'chat-mine' : 'chat-other'}`}>
                      {m.body}
                    </div>
                    <p
                      className={`mt-1 text-xs ${isMine ? 'text-right' : ''}`}
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {formatTime(m.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div
        className="flex gap-2 border-t p-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <input
          className="input flex-1"
          style={{ marginBottom: 0 }}
          placeholder="メッセージを入力..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn btn-primary"
          style={{ padding: '10px 16px' }}
          onClick={send}
          disabled={!body.trim() || sending}
        >
          送信
        </button>
      </div>
    </div>
  )
}
