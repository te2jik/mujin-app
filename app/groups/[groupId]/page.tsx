import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import GroupTabs from '@/components/GroupTabs'

export const dynamic = 'force-dynamic'

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // グループ情報（admin client）
  const { data: group } = await admin
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (!group) redirect('/dashboard')

  // メンバー一覧（プロフィール付き、admin client）
  const { data: members } = await admin
    .from('group_members')
    .select('*, profiles(id, nickname, avatar_color)')
    .eq('group_id', groupId)
    .order('turn_order')

  // 今月の支払い状況（admin client）
  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: payments } = await admin
    .from('payments')
    .select('*')
    .eq('group_id', groupId)
    .eq('target_month', currentMonth)

  // メッセージ取得（admin client）
  const { data: messages } = await admin
    .from('messages')
    .select('*, profiles(id, nickname, avatar_color)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(50)

  // 今月の受取人（順番）
  const totalMembers = members?.length || 0
  const monthsSinceStart = getMonthsDiff(group.start_date, new Date())
  const currentTurn = totalMembers > 0 ? (monthsSinceStart % totalMembers) + 1 : 0

  return (
    <main className="flex flex-col h-screen bg-gradient-to-b from-transparent to-transparent">
      {/* ヘッダー */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0e1a]/80 border-b border-white/5">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <a
              href="/dashboard"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              ←
            </a>
            <div className="flex-1">
              <h1 className="text-xl font-bold gradient-text">{group.name}</h1>
              <div className="flex gap-3 text-xs text-white/50 mt-0.5">
                <span>💰 {group.monthly_amount.toLocaleString()}円/月</span>
                <span>👥 {totalMembers}/{group.member_limit}人</span>
              </div>
            </div>
          </div>

          {members && members.length > 0 && currentTurn > 0 && (
            <div className="glass-card p-3 flex items-center gap-3">
              <div className="text-2xl">👑</div>
              <div>
                <p className="text-xs text-white/50">今月の受取人</p>
                <p className="text-base font-bold text-white">
                  {members.find((m: any) => m.turn_order === currentTurn)?.profiles
                    ?.nickname || '未定'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* タブコンテンツ */}
      <GroupTabs
        groupId={groupId}
        userId={user.id}
        members={members || []}
        payments={payments || []}
        messages={messages || []}
        currentTurn={currentTurn}
        group={group}
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
