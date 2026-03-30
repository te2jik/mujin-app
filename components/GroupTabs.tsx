'use client'

import { useState } from 'react'
import PaymentStatus from './PaymentStatus'
import ChatBox from './ChatBox'

interface GroupTabsProps {
  groupId: string
  userId: string
  members: any[]
  payments: any[]
  currentTurn: number
}

export default function GroupTabs({
  groupId,
  userId,
  members,
  payments,
  currentTurn,
}: GroupTabsProps) {
  const [tab, setTab] = useState<'overview' | 'payments' | 'chat'>('overview')

  return (
    <div>
      <div className="tab-bar mb-4">
        <button
          className={`tab-item ${tab === 'overview' ? 'active' : ''}`}
          onClick={() => setTab('overview')}
        >
          概要
        </button>
        <button
          className={`tab-item ${tab === 'payments' ? 'active' : ''}`}
          onClick={() => setTab('payments')}
        >
          支払い
        </button>
        <button
          className={`tab-item ${tab === 'chat' ? 'active' : ''}`}
          onClick={() => setTab('chat')}
        >
          チャット
        </button>
      </div>

      {tab === 'overview' && (
        <div className="mujin-card p-4">
          <h3 className="mb-3 font-semibold">メンバー一覧・順番</h3>
          <div className="space-y-2">
            {members.map((m: any) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl p-3"
                style={{
                  background:
                    m.turn_order === currentTurn ? '#f0f0ff' : 'transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="avatar"
                    style={{
                      background: m.profiles?.avatar_color || '#6366f1',
                      width: 36,
                      height: 36,
                      fontSize: 14,
                    }}
                  >
                    {(m.profiles?.nickname || '?')[0]}
                  </div>
                  <div>
                    <p className="font-medium">{m.profiles?.nickname}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {m.turn_order}番目
                    </p>
                  </div>
                </div>
                {m.turn_order === currentTurn && (
                  <span
                    className="badge"
                    style={{ background: '#e0e7ff', color: 'var(--primary)' }}
                  >
                    今月の受取人
                  </span>
                )}
                {m.user_id === userId && (
                  <span
                    className="badge"
                    style={{ background: '#f0fdf4', color: '#15803d' }}
                  >
                    あなた
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <PaymentStatus
          groupId={groupId}
          userId={userId}
          payments={payments}
          members={members}
        />
      )}

      {tab === 'chat' && <ChatBox groupId={groupId} userId={userId} />}
    </div>
  )
}
