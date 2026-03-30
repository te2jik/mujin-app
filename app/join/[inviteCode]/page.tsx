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
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode)
        .single()

      if (!data) {
        setError('招待コードが無効です')
      } else {
        setGroup(data)
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
        <p>読み込み中...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center p-6">
        <div className="mujin-card p-8 text-center">
          <p className="mb-4 text-lg">{error}</p>
          <a href="/dashboard" className="btn btn-primary">
            ダッシュボードへ
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="mujin-card w-full max-w-sm p-6 text-center">
        <h1 className="mb-2 text-xl font-bold">{group.name}</h1>
        <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          月額 {group.monthly_amount.toLocaleString()}円 / 最大{group.member_limit}人
        </p>
        <button
          className="btn btn-primary w-full"
          onClick={join}
          disabled={joining}
        >
          {joining ? '参加中...' : 'このグループに参加する'}
        </button>
      </div>
    </main>
  )
}
