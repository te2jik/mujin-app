'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async () => {
    if (!email || !nickname) return
    setError(null)
    setLoading(true)

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { nickname },
      },
    })

    setLoading(false)

    if (err) {
      setError(err.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center p-6">
        <div className="glass-card-lg w-full max-w-sm text-center animate-in">
          <div className="mb-4 text-5xl">✉️</div>
          <h2 className="mb-3 text-2xl font-bold gradient-text">メール確認</h2>
          <p className="text-sm text-white/70 mb-4">
            {email} にログインリンクを送信しました。
          </p>
          <p className="text-xs text-white/50">
            メール内のリンクをクリックしてログインしてください。
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 text-5xl">🔄</div>
          <h1 className="mb-2 text-4xl font-bold gradient-text">無尽</h1>
          <p className="text-sm text-white/60">信頼を育てる積立コミュニティ</p>
        </div>

        {/* Login Card */}
        <div className="glass-card-lg animate-in">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-white/90">
              ニックネーム
            </label>
            <input
              className="input-field w-full"
              placeholder="表示名を入力（例: 太郎）"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-white/90">
              メールアドレス
            </label>
            <input
              className="input-field w-full"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={signIn}
            disabled={loading || !email || !nickname}
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                送信中...
              </>
            ) : (
              'ログインリンクを送る'
            )}
          </button>

          <p className="mt-4 text-center text-xs text-white/50">
            ログインリンクはメールで届きます
          </p>
        </div>
      </div>
    </main>
  )
}
