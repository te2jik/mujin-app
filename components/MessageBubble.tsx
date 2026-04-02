import { Message } from '@/types/db'

interface MessageBubbleProps {
  message: Message & { profiles?: { nickname: string; avatar_color: string } }
  isOwn: boolean
}

function formatTime(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'いま'
  if (diffMins < 60) return `${diffMins}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays === 1) return '昨日'
  if (diffDays < 7) return `${diffDays}日前`

  return d.toLocaleDateString('ja-JP')
}

export default function MessageBubble({
  message,
  isOwn,
}: MessageBubbleProps) {
  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center py-3">
        <div className="system-message">
          {message.body}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && (
        <div
          className="avatar w-8 h-8 text-xs flex-shrink-0"
          style={{ background: message.profiles?.avatar_color || '#6366f1' }}
        >
          {(message.profiles?.nickname || '?')[0]}
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <p className="text-xs text-white/60 mb-1 px-2">
            {message.profiles?.nickname}
          </p>
        )}
        <div className={`chat-bubble max-w-xs break-words ${isOwn ? 'chat-mine' : 'chat-other'}`}>
          {message.body}
        </div>
        <p className="text-xs text-white/40 mt-1 px-2">
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}
