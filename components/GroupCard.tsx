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
  }
  turnOrder: number
}

export default function GroupCard({ group, turnOrder }: GroupCardProps) {
  const router = useRouter()

  return (
    <div
      className="mujin-card cursor-pointer p-4 transition-shadow hover:shadow-md"
      onClick={() => router.push(`/groups/${group.id}`)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold">{group.name}</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            月額 {group.monthly_amount.toLocaleString()}円
          </p>
        </div>
        <div className="text-right">
          <div
            className="mb-1 inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: '#f0f0ff', color: 'var(--primary)' }}
          >
            #{turnOrder} 番目
          </div>
        </div>
      </div>
    </div>
  )
}
