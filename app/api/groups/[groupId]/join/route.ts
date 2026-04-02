import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const supabase = await createClient()
    const admin = createAdminClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 既に参加しているか確認（admin client）
    const { data: existing } = await admin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: '既に参加しています' }, { status: 400 })
    }

    // メンバー数確認（admin client）
    const { count } = await admin
      .from('group_members')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', groupId)

    const { data: group } = await admin
      .from('groups')
      .select('member_limit')
      .eq('id', groupId)
      .single()

    if (group && count !== null && count >= group.member_limit) {
      return NextResponse.json({ error: '定員に達しています' }, { status: 400 })
    }

    const nextOrder = (count || 0) + 1

    // メンバー追加（admin client）
    const { error } = await admin.from('group_members').insert({
      group_id: groupId,
      user_id: user.id,
      turn_order: nextOrder,
    })

    if (error) throw error

    // 今月分の支払いレコード生成（admin client）
    const currentMonth = new Date().toISOString().slice(0, 7)
    await admin.from('payments').insert({
      group_id: groupId,
      user_id: user.id,
      target_month: currentMonth,
      status: 'unpaid',
    })

    // システムメッセージを追加（admin client）
    await admin.from('messages').insert({
      group_id: groupId,
      user_id: user.id,
      body: 'グループに参加しました',
      message_type: 'system',
      system_action: 'joined',
    })

    // 監査ログ（admin client）
    await admin.from('audit_logs').insert({
      actor_user_id: user.id,
      group_id: groupId,
      action_type: 'member_joined',
      payload: { turn_order: nextOrder },
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Join error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
