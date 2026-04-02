'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const inviteCode = params.inviteCode as string

  const [group, setGroup] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: groupData } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode)
        .single()

      if (!groupData) {
        setError('招待コードが無効です')
      } else {
        setGroup(groupData)

        // メンバーを取得
        const { data: membersData } = await supabase
          .from('group_members')
          .select('*, profiles(id, nickname, avatar_color)')
          .eq('group_id', groupData.id)
          .order('turn_order')

        setMembers(membersData || [])
      }
      setLoading(false)
    }
    load()
  }, [inviteCode, supabase])

  const join = async () => {
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

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="inline-flex w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-3"></div>
          <p className="text-white/60">読み込み中...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center p-6">
        <div className="glass-card-lg w-full max-w-sm p-8 text-center animate-in">
          <div className="mb-4 text-5xl">❌</div>
          <p className="mb-4 text-lg">{error}</p>
          <a href="/dashboard" className="btn btn-primary w-full">
            ダッシュボードへ
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
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
              招待されました
            </p>
          </div>

          {/* グループ情報 */}
          <div className="space-y-3 mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">月額</span>
              <span className="font-semibold text-white">
                {group.monthly_amount.toLocaleString()}円
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">メンバー数</span>
              <span className="font-semibold text-white">
                {members.length}/{group.member_limit}人
              </span>
            </div>
          </div>

          {/* メンバーアバター */}
          {members.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-white/60 mb-3 uppercase tracking-wide">メンバー</p>
              <div className="flex flex-wrap gap-2">
                {members.map((member: any) => (
                  <div
                    key={member.id}
                    className="avatar w-10 h-10 text-xs"
                    style={{ background: member.profiles?.avatar_color || '#6366f1' }}
                  >
                    {(member.profiles?.nickname || '?')[0]}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className="btn btn-primary w-full disabled:opacity-50"
            onClick={join}
            disabled={joining}
          >
            {joining ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                参加中...
              </>
            ) : (
              'このグループに参加する'
            )}
          </button>
        </div>

        <div className="text-center mt-4">
          <a href="/dashboard" className="text-xs text-white/50 hover:text-white/70 transition">
            ダッシュボードへ戻る
          </a>
        </div>
      </div>
    </main>
  )
}
