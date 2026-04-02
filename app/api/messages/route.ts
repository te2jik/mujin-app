import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    if (!body.groupId || !body.body?.trim()) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // メンバー確認（admin client）
    const { data: membership } = await admin
      .from('group_members')
      .select('id')
      .eq('group_id', body.groupId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    const { error } = await admin.from('messages').insert({
      group_id: body.groupId,
      user_id: user.id,
      body: body.body.trim(),
      message_type: 'text',
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Message error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
