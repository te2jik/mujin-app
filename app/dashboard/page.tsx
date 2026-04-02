import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import GroupCard from '@/components/GroupCard'
import CreateGroupModal from '@/components/CreateGroupModal'
import BottomNav from '@/components/BottomNav'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // プロフィール取得（admin client）
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 所属グループ取得（admin client）
  const { data: memberships } = await admin
    .from('group_members')
    .select('group_id, turn_order, groups(id, name, monthly_amount, member_limit, start_date, invite_code, owner_id)')
    .eq('user_id', user.id)

  // 今月の支払い状況（admin client）
  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: myPayments } = await admin
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .eq('target_month', currentMonth)

  const paidCount = myPayments?.filter(p => p.status === 'paid').length || 0
  const unpaidCount = myPayments?.filter(p => p.status === 'unpaid').length || 0

  return (
    <main className="flex-1 flex flex-col overflow-y-auto pb-20">
      {/* ヘッダー */}
      <div className="sticky top-0 z-40 backdrop-blur bg-black/20 border-b border-white/5">
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">おかえりなさい</p>
            <h1 className="text-2xl font-bold gradient-text">{profile?.nickname || 'ゲスト'}</h1>
          </div>
          <div
            className="avatar w-14 h-14 text-xl"
            style={{ background: profile?.avatar_color || '#6366f1' }}
          >
            {(profile?.nickname || 'G')[0]}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* 統計サマリー */}
        {myPayments && myPayments.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="glass-card text-center py-3">
              <div className="text-xl font-bold gradient-text">{memberships?.length || 0}</div>
              <div className="text-xs text-white/60 mt-1">グループ</div>
            </div>
            <div className="glass-card text-center py-3">
              <div className="text-xl font-bold text-emerald-400">{paidCount}</div>
              <div className="text-xs text-white/60 mt-1">支払済</div>
            </div>
            <div className="glass-card text-center py-3">
              <div className="text-xl font-bold text-amber-400">{unpaidCount}</div>
              <div className="text-xs text-white/60 mt-1">未払い</div>
            </div>
          </div>
        )}

        {/* グループセクション */}
        <div>
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3 px-1">
            参加中のグループ
          </h2>

          {memberships && memberships.length > 0 ? (
            <div className="space-y-3">
              {memberships.map((m: any) => (
                <GroupCard
                  key={m.group_id}
                  group={m.groups}
                  turnOrder={m.turn_order}
                  userId={user.id}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center animate-in">
              <div className="mb-3 text-4xl">👋</div>
              <h3 className="text-lg font-semibold mb-2">グループに参加しましょう</h3>
              <p className="text-sm text-white/60 mb-4">
                グループを作成するか、招待リンクから参加してください
              </p>
              <CreateGroupModal triggerText="グループを作成" userId={user.id} />
            </div>
          )}
        </div>

        {/* グループ作成ボタン（グループがある場合） */}
        {memberships && memberships.length > 0 && (
          <div className="pt-2">
            <CreateGroupModal triggerText="新しいグループを作成" userId={user.id} />
          </div>
        )}
      </div>

      <BottomNav userId={user.id} />
    </main>
  )
}
