import { NextResponse } from 'next/server'
import { createClient } from 'A/lib/supabase/server'
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

    // メンバー数確認（admin client;）
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

    // デーヴ追�