'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface JoinClientProps {
  group: any
  members: any[]
  isLoggedIn: boolean
}

export default function JoinClient({ group, members, isLoggedIn }: JoinClientProps) {
  const router = useRouter()
  const [joining, setJoining] = useState(false)

  const join = async () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setJoining(true)
    const res = await fetch(`/api/groups/${group.id}/join`, {
      method: 'POST',
    })

    if (!res.ok) {
      const data = await res.json()
      alert(data.error || '参加に失敗しました')
      setJoining(false)
      return
    }

    router.push(`/groups/${group.id}`)
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="glass-card-lg animate-in">
          <div className="text-center mb-6">
            <div className="mb-4 text-5xl">🎉</div>
            <h1 className="text-2xl font-bold gradient-text mb-2">{group.name}</h1>
            <p className="text-sm text-white/60">
              無尽グループに招待されました
            </p>
          </div>

          <div className="space-y-3 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">月額</span>
              <span className="font-bold text-white">
                {group.monthly_amount.toLocaleString()}円
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">メンバー</span>
              <span className="font-bold text-white">
                {members.length}/{group.member_limit}人
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">開始日</span>
              <span className="font-bold text-white">
                {new Date(group.start_date).toLocaleDateString('ja-JP')}
              </span>
            </div>
          </div>

          {members.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-white/50 mb-3">参加中のメンバー</p>
              <div className="flex flex-wrap gap-2">
                {members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: member.profiles?.avatar_color || '#6366f1' }}
                    >
                      {(member.profiles?.nickname || '?')[0]}
                    </div>
                    <span className="text-sm text-white/80">{member.profiles?.nickname}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {members.length >= group.member_limit ? (
            <div className="text-center p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <p className="text-amber-300 text-sm font-semibold">メンバーが上限に達しています</p>
            </div>
          ) : (
            <button
              className="btn btn-primary w-full text-lg py-4 disabled:opacity-50"
              onClick={join}
              disabled={joining}
            >
              {joining ? '参加中...' : isLoggedIn ? 'このグループに参加する' : 'ログインして参加する'}
            </button>
          )}
        </div>

        <div className="text-center mt-4">
          <a href="/dashboard" className="text-xs text-white/40 hover:text-white/60 transition">
            ホームへ戻る
          </a>
        </div>
      </div>
    </main>
  )
}
