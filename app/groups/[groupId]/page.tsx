import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GroupTabs from '@/components/GroupTabs'

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (!group) redirect('/dashboard')

  const { data: members } = await supabase
    .from('group_members')
    .select('*, profiles(nickname, avatar_color)')
    .eq('group_id', groupId)
    .order('turn_order')

  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('group_id', groupId)
    .eq('target_month', currentMonth)

  const totalMembers = members?.length || 0
  const monthsSinceStart = getMonthsDiff(group.start_date, new Date())
  const currentTurn = (monthsSinceStart % totalMembers) + 1

  return (
    <main className="p-5">
      <a
        href="/dashboard"
        className="mb-4 inline-flex items-center text-sm"
        style={{ color: 'var(--primary)' }}
      >
        &larr; ダッシュボード
      </a>

      <div className="mujin-card mb-5 p-5">
        <h1 className="mb-2 text-xl font-bold">{group.name}</h1>
        <div className="flex gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          <span>月額 {group.monthly_amount.toLocaleString()}円</span>
          <span>{totalMembers}/{group.member_limit}人</span>
        </div>

        {members && members.length > 0 && (
          <div
            className="mt-3 rounded-xl p-3"
            style={{ background: '#f0f0ff' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              今月の受取人
            </p>
            <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
              {members.find((m: any) => m.turn_order === currentTurn)?.profiles
                ?.nickname || '未定'}
            </p>
          </div>
        )}

        <div className="mt-3">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            招待コード: {group.invite_code}
          </p>
        </div>
      </div>

      <GroupTabs
        groupId={groupId}
        userId={user.id}
        members={members || []}
        payments={payments || []}
        currentTurn={currentTurn}
      />
    </main>
  )
}

function getMonthsDiff(startDate: string, now: Date): number {
  const start = new Date(startDate)
  return (
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth())
  )
}
