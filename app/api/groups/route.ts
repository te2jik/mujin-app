import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const inviteCode = crypto.randomBytes(4).toString('hex')

    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        name: body.name,
        monthly_amount: body.monthlyAmount,
        member_limit: body.memberLimit,
        start_date: body.startDate,
        owner_id: user.id,
        invite_code: inviteCode,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      turn_order: 1,
    })

    const currentMonth = new Date().toISOString().slice(0, 7)
    await supabase.from('payments').insert({
      group_id: group.id,
      user_id: user.id,
      target_month: currentMonth,
      status: 'unpaid',
    })

    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      group_id: group.id,
      action_type: 'group_created',
      payload: { name: body.name, monthly_amount: body.monthlyAmount },
    })

    return NextResponse.json({ ok: true, group })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
