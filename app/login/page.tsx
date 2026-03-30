'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const signIn = async () => {
    if (!email || !nickname) return
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { nickname },
      },
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center p-6">
        <div className="mujin-card w-full max-w-sm p-8 text-center">
          <div className="mb-4 text-4xl">&#9993;</div>
          <h2 className="mb-2 text-xl font-bold">メールを確認してください</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {email} にログインリンクを送信しました。
            メール内のリンクをクリックしてログインしてください。
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold" style={{ color: 'var(--primary)' }}>
          無尽
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          信頼を育てる積立コミュニティ
        </p>
      </div>

      <div className="mujin-card w-full max-w-sm p-6">
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            ニックネーム
          </label>
          <input
            className="input"
            placeholder="表示名を入力"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            メールアドレス
          </label>
          <input
            className="input"
            type="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={signIn}
          disabled={loading || !email || !nickname}
        >
          {loading ? '送信中...' : 'ログインリンクを送る'}
        </button>
      </div>
    </main>
  )
}
