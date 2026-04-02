'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CreateGroupModalProps {
  triggerText: string
  userId: string
}

export default function CreateGroupModal({ triggerText, userId }: CreateGroupModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    monthlyAmount: 10000,
    memberLimit: 10,
    startDate: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'グループの作成に失敗しました')
        setLoading(false)
        return
      }

      const data = await res.json()
      setIsOpen(false)
      router.push(`/groups/${data.id}`)
    } catch (err) {
      setError('エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary w-full"
      >
        {triggerText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end max-w-[480px] mx-auto">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full bg-gradient-to-b from-[#111827] to-[#0a0e1a] border-t border-white/10 rounded-t-2xl p-6 animate-in">
            <div className="mb-6">
              <h2 className="text-xl font-bold gradient-text">新しいグループを作成</h2>
              <p className="text-xs text-white/60 mt-1">信頼できるメンバーを集めてグループを始めましょう</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  グループ名
                </label>
                <input
                  type="text"
                  placeholder="例: オフィス無峽"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  月額（円）
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={formData.monthlyAmount}
                  onChange={(e) => setFormData({ ...formData, monthlyAmount: parseInt(e.target.value) })}
                  className="input-field w-full"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  メンバー上限
                </label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={formData.memberLimit}
                  onChange={(e) => setFormData({ ...formData, memberLimit: parseInt(e.target.value) })}
                  className="input-field w-full"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  開始日
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input-field w-full"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-secondary flex-1"
                  disabled={loading}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 disabled:opacity-50"
                  disabled={loading || !formData.name}
                >
                  {loading ? '作成中...' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
