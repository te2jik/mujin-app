'use client'

import { useState } from 'react'

interface InviteSheetProps {
  groupId: string
  inviteCode: string
}

const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

export default function InviteSheet({ groupId, inviteCode }: InviteSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${inviteCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title: '無尽グループに参加しませんか?',
          text: '招待リンク:',
          url: inviteUrl,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      handleCopy()
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-secondary w-full"
      >
        📤 招待リンクを共有
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end max-w-[480px] mx-auto">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full bg-gradient-to-b from-[#111827] to-[#0a0e1a] border-t border-white/10 rounded-t-2xl p-6 animate-in">
            <h2 className="text-lg font-bold gradient-text mb-1">招待リンクを共有</h2>
            <p className="text-xs text-white/60 mb-4">
              このリンクで他のメンバーを招待できます
            </p>

            <div className="glass-card p-4 mb-4 break-all">
              <p className="text-sm text-white/80 font-mono">{inviteUrl}</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleShare}
                className="btn btn-primary w-full"
              >
                {canShare ? '📱 シェアする' : '📋 コピーする'}
              </button>

              {!canShare && (
                <button
                  onClick={handleCopy}
                  className={`btn w-full transition ${
                    copied
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {copied ? '✅ コピーしました' : '📋 リンクをコピー'}
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-secondary w-full"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
