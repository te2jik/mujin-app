import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import JoinClient from './JoinClient'

export const dynamic = 'force-dynamic'

export default async function JoinPage({
  params,
}: {
  params: Promise<{ inviteCode: string }>
}) {
  const { inviteCode } = await params
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // グループを招待コードで検索（admin client でRLSバイパス）
  const { data: group } = await admin
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode)
    .single()

  if (!group) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center p-6">
        <div className="glass-card-lg w-full max-w-sm p-8 text-center animate-in">
          <div className="mb-4 text-5xl">😔</div>
          <h2 className="text-xl font-bold mb-2">招待コードが見つかりません</h2>
          <p className="text-sm text-white/60 mb-6">
            リンクが間違っているか、グループが削除された可能性があります
          </p>
          <a href="/dashboard" className="btn btn-primary w-full">
            ホームへ戻る
          </a>
        </div>
      </main>
    )
  }

  // メンバー一覧を取得
  const { data: members } = await admin
    .from('group_members')
    .select('*, profiles(id, nickname, avatar_color)')
    .eq('group_id', group.id)
    .order('turn_order')

  // 既に参加済みかチェック
  const alreadyJoined = user && members?.some((m: any) => m.user_id === user.id)

  if (alreadyJoined) {
    redirect(`/groups/${group.id}`)
  }

  return (
    <JoinClient
      group={group}
      members={members || []}
      isLoggedIn={!!user}
    />
  )
}
