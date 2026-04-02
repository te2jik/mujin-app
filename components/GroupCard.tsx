'use client'

import { useRouter } from 'next/navigation'

interface GroupCardProps {
  group: {
    id: string
    name: string
    monthly_amount: number
    member_limit: number
    start_date: string
    invite_code: string
    owner_id: string
  }
  turnOrder: number
  userId: string
}

export default function GroupCard({ group, turnOrder, userId }: GroupCardProps) {
  const router = useRouter()
  const isOwner = group.owner_id === userId

  return (
    <div
      className="glass-card p-4 cursor-pointer transition-all hover:bg-white/8 active:scale-95"
      onClick={() => router.push(`/groups/${group.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white">{group.name}</h3>
            {isOwner && <span className="text-xs badge badge-primary">オーナー</span>}
          </div>
          <p className="text-xs text-white/60 mb-2">
            💰 {group.monthly_amount.toLocaleString()}円 / 月
          </p>
          <div className="badge badge-primary">
            #{turnOrder} 順番
          </div>
        </div>
        <div className="text-2xl">👥</div>
      </div>
    </div>
  )
}
