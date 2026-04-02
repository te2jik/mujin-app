'use client'

import { useState } from 'react'
import { Payment, GroupMember } from '@/types/db'
import Avatar from './Avatar'
import Badge from './Badge'

interface PaymentPanelProps {
  payments: Payment[]
  members: (GroupMember & { profiles?: { id: string; nickname: string; avatar_color: string } })[]
  currentUserId: string
  monthlyAmount: number
}

export default function PaymentPanel({
  payments,
  members,
  currentUserId,
  monthlyAmount,
}: PaymentPanelProps) {
  const [processing, setProcessing] = useState<string | null>(null)

  const handleMarkPaid = async (paymentId: string) => {
    setProcessing(paymentId)
    try {
      const res = await fetch(`/api/payments/${paymentId}/mark-paid`, {
        method: 'POST',
      })

      if (!res.ok) {
        alert('支払いのマーク付けに失敗しました')
      }
    } catch (err) {
      console.error('Failed to mark payment:', err)
      alert('エラーが発生しました')
    }
    setProcessing(null)
  }

  const paymentsByUser = members.map((member) => ({
    member,
    payment: payments.find((p) => p.user_id === member.user_id),
  }))

  const paidCount = payments.filter((p) => p.status === 'paid').length
  const unpaidCount = payments.filter((p) => p.status === 'unpaid').length

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
          今月の支払い状況
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-card p-3 text-center">
            <div className="text-lg font-bold text-emerald-400">{paidCount}</div>
            <div className="text-xs text-white/60 mt-1">支払済</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-lg font-bold text-amber-400">{unpaidCount}</div>
            <div className="text-xs text-white/60 mt-1">未払い</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {paymentsByUser.map(({ member, payment }) => (
          <div
            key={member.id}
            className="glass-card p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1">
              <Avatar
                nickname={member.profiles?.nickname || '?'}
                color={member.profiles?.avatar_color || '#6366f1'}
                size="sm"
              />
              <div className="flex-1">
                <p className="font-semibold text-sm text-white">
                  {member.profiles?.nickname}
                </p>
                <p className="text-xs text-white/60">
                  {monthlyAmount.toLocaleString()}円
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {payment ? (
                <>
                  <Badge
                    text={payment.status === 'paid' ? '支払済' : '未払い'}
                    variant={payment.status === 'paid' ? 'paid' : 'unpaid'}
                  />
                  {payment.status === 'unpaid' && member.user_id === currentUserId && (
                    <button
                      onClick={() => handleMarkPaid(payment.id)}
                      disabled={processing === payment.id}
                      className="btn btn-sm btn-primary disabled:opacity-50"
                    >
                      {processing === payment.id ? '...' : '支払う'}
                    </button>
                  )}
                </>
              ) : (
                <Badge text="支払い記録なし" variant="warning" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
