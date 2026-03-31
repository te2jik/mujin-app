import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import CreateGroupForm from '@/components/CreateGroupForm'
import GroupCard from '@/components/GroupCard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // 認証チェック（ユーザーの JWT を使用）
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // DB読み取りは admin クライアントで実行（RLS バイパス）
  const admin = createAdminClient()

  // プロフィール取得
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 所属グループ取得
  const { data: memberships } = await admin
    .from('group_members')
    .select('group_id, turn_order, groups(id, name, monthly_amount, member_limit, start_date, invite_code)')
    .eq('user_id', user.id)

  // 今月の支払い状況
  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: myPayments } = await admin
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .eq('target_month', currentMonth)

  return (
    <main className="p-5">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            おかえりなさい
          </p>
          <h1 className="text-2xl font-bold">{profile?.nickname || 'ゲスト'}</h1>
        </div>
        <div
          className="avatar"
          style={{ background: profile?.avatar_color || '#6366f1' }}
        >
          {(profile?.nickname || 'G')[0]}
        </div>
      </div>

      {/* 今月のサマリー */}
      {myPayments && myPayments.length > 0 && (
        <div className="mujin-card mb-5 p-4">
          <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            今月の支払い
          </h2>
          <div className="space-y-2">
            {myPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <span className="text-sm">{p.group_id.slice(0, 8)}...</span>
                <span className={`badge ${p.status === 'paid' ? 'badge-paid' : 'badge-unpaid'}`}>
                  {p.status === 'paid' ? '支払い済み' : '未払い'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* グループ一覧 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">参加中のグループ</h2>
      </div>

      {memberships && memberships.length > 0 ? (
        <div className="space-y-3">
          {memberships.map((m: any) => (
            <GroupCard
              key={m.group_id}
              group={m.groups}
              turnOrder={m.turn_order}
            />
          ))}
        </div>
      ) : (
        <div className="mujin-card p-8 text-center">
          <p className="mb-2 text-lg">まだグループがありません</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            新しいグループを作成するか、招待リンクから参加しましょう
          </p>
        </div>
      )}

      {/* グループ作成 */}
      <div className="mt-6">
        <CreateGroupForm />
      </div>
    </main>
  )
}
