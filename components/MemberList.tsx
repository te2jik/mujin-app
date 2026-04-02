'use client'

import { GroupMember } from '@/types/db'
import Avatar from './Avatar'

interface MemberListProps {
  members: (GroupMember & { profiles?: { id: string; nickname: string; avatar_color: string } })[]
  currentUserId: string
  currentTurn: number
}

export default function MemberList({
  members,
  currentUserId,
  currentTurn,
}: MemberListProps) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-4">
        メンバー（{members.length}名）
      </h3>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="glass-card p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1">
              <Avatar
                nickname={member.profiles?.nickname || '?'}
                color={member.profiles?.avatar_color || '#6366f1'}
                size="md"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-white">
                    {member.profiles?.nickname}
                  </p>
                  {member.user_id === currentUserId && (
                    <span className="text-xs badge badge-primary">あなた</span>
                  )}
                </div>
                <p className="text-xs text-white/60">
                  {member.turn_order === currentTurn ? '（現在の受取人）' : `${member.turn_order}番目`}
                </p>
              </div>
            </div>

            {member.turn_order === currentTurn && (
              <div className="text-xl">👑</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
