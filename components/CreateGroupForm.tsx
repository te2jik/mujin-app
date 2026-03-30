'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateGroupForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [monthlyAmount, setMonthlyAmount] = useState(10000)
  const [memberLimit, setMemberLimit] = useState(5)
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!name || !startDate) return
    setLoading(true)

    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, monthlyAmount, memberLimit, startDate }),
    })

    setLoading(false)

    if (!res.ok) {
      alert('作成に失敗しました')
      return
    }

    setOpen(false)
    setName('')
    setStartDate('')
    router.refresh()
  }

  if (!open) {
    return (
      <button className="btn btn-primary w-full" onClick={() => setOpen(true)}>
        + 新しいグループを作成
      </button>
    )
  }

  return (
    <div className="mujin-card p-5">
      <h2 className="mb-4 font-bold">新しいグループを作成</h2>

      <div className="mb-3">
        <label className="mb-1 block text-sm" style={{ color: 'var(--text-muted)' }}>
          グループ名
        </label>
        <input
          className="input"
          placeholder="例: 月曜無尽会"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm" style={{ color: 'var(--text-muted)' }}>
            月額（円）
          </label>
          <input
            className="input"
            type="number"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm" style={{ color: 'var(--text-muted)' }}>
            定員
          </label>
          <input
            className="input"
            type="number"
            value={memberLimit}
            onChange={(e) => setMemberLimit(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm" style={{ color: 'var(--text-muted)' }}>
          開始日
        </label>
        <input
          className="input"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <button
          className="btn btn-outline flex-1"
          onClick={() => setOpen(false)}
        >
          キャンセル
        </button>
        <button
          className="btn btn-primary flex-1"
          onClick={submit}
          disabled={loading || !name || !startDate}
        >
          {loading ? '作成中...' : '作成'}
        </button>
      </div>
    </div>
  )
}
