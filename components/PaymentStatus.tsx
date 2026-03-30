'use client'

import { useRouter } from 'next/navigation'

interface PaymentStatusProps {
  groupId: string
  userId: string
  payments: any[]
  members: any[]
}

export default function PaymentStatus({
  groupId,
  userId,
  payments,
  members,
}: PaymentStatusProps) {
  const router = useRouter()

  const markPaid = async (paymentId: string) => {
    const res = await fetch(`/api/payments/${paymentId}/mark-paid`, {
      method: 'POST',
    })

    if (res.ok) {
      router.refresh()
    } else {
      alert('エラーが発生しました')
    }
  }

  const paymentWithMember = payments.map((p) => {
    const member = members.find((m: any) => m.user_id === p.user_id)
    return { ...p, nickname: member?.profiles?.nickname || '不明', color: member?.profiles?.avatar_color || '#888' }
  })

  const paidCount = payments.filter((p) => p.status === 'paid').length
  const totalCount = payments.length

  return (
    <div className="mujin-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">今月の支払い状況</h3>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {paidCount}/{totalCount} 完了
        </span>
      </div>

      <div
        className="mb-4 h-2 overflow-hidden rounded-full"
        style={{ background: '#e2e8f0' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: totalCount > 0 ? `${(paidCount / totalCount) * 100}%` : '0%',
            background: paidCount === totalCount ? '#22c55e' : 'var(--primary)',
          }}
        />
      </div>

      <div className="space-y-2">
        {paymentWithMember.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border p-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="avatar"
                style={{
                  background: p.color,
                  width: 32,
                  height: 32,
                  fontSize: 13,
                }}
              >
                {p.nickname[0]}
              </div>
              <span className="text-sm font-medium">
                {p.nickname}
                {p.user_id === userId ? '（あなた）' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {p.status === 'paid' ? (
                <span className="badge badge-paid">支払い済み</span>
              ) : p.user_id === userId ? (
                <button
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => markPaid(p.id)}
                >
                  支払いました
                </button>
              ) : (
                <span className="badge badge-unpaid">未払い</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {payments.length === 0 && (
        <p className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          今月の支払いデータがありません
        </p>
      )}
    </div>
  )
}
