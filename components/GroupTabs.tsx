'use client'

import { useState } from 'react'
import { GroupMember, Payment, Message, Group } from '@/types/db'
import ChatView from './ChatView'
import MemberList from './MemberList'
import PaymentPanel from './PaymentPanel'
import InviteSheet from './InviteSheet'

interface GroupTabsProps {
  groupId: string
  userId: string
  members: (GroupMember & { profiles?: { id: string; nickname: string; avatar_color: string } })[]
  payments: Payment[]
  messages: (Message & { profiles?: { id: string; nickname: string; avatar_color: string } })[]
  currentTurn: number
  group: Group
}

type TabType = 'chat' | 'members' | 'payments' | 'settings'

export default function GroupTabs({
  groupId,
  userId,
  members,
  payments,
  messages,
  currentTurn,
  group,
}: GroupTabsProps) {
  const [tab, setTab] = useState<TabType>('chat')

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'chat', label: 'チャット', icon: '💬' },
    { id: 'members', label: 'メンバー', icon: '👥' },
    { id: 'payments', label: '支払い', icon: '💰' },
    { id: 'settings', label: '設定', icon: '⚙️' },
  ]

  return (
    <div className="flex flex-col h-full flex-1">
      {/* Tab Bar */}
      <div className="tab-bar p-4 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`btn-item flex-1 py-2 text-xs font-medium transition ${
              tab === t.id
                ? 'active text-white border-b-2 border-indigo-500'
                : 'text-white/60 border-b-2 border-transparent'
            }`}
          >
            <span className="mr-1">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'chat' && (
          <ChatView
            groupId={groupId}
            userId={userId}
            initialMessages={messages}
          />
        )}

        {tab === 'members' && (
          <MemberList
            members={members}
            currentUserId={userId}
            currentTurn={currentTurn}
          />
        )}

        {tab === 'payments' && (
          <PaymentPanel
            payments={payments}
            members={members}
            currentUserId={userId}
            monthlyAmount={group.monthly_amount}
          />
        )}

        {tab === 'settings' && (
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
                招待
              </h3>
              <InviteSheet groupId={groupId} inviteCode={group.invite_code} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
                グループ情報
              </h3>
              <div className="glass-card p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">名前</span>
                  <span className="font-semibold text-white">{group.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">月額</span>
                  <span className="font-semibold text-white">
                    {group.monthly_amount.toLocaleString()}円
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">メンバー上限</span>
                  <span className="font-semibold text-white">
                    {members.length}/{group.member_limit}人
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">開始日</span>
                  <span className="font-semibold text-white">
                    {new Date(group.start_date).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
            </div>

            {group.owner_id === userId && (
              <div>
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
                  オーナー操作
                </h3>
                <button className="btn btn-danger w-full">
                  🗑️ グループを削除
                </button>
              </div>
            )}

            { group.owner_id !== userId && (
              <div>
                <button className="btn btn-danger w-full">
                  က出
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  
h
}
