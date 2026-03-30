import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (!payment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (payment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (payment.status === 'paid') {
      return NextResponse.json({ error: '既に支払い済みです' }, { status: 400 })
    }

    const { error } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)

    if (error) throw error

    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      group_id: payment.group_id,
      action_type: 'payment_marked_paid',
      payload: { payment_id: paymentId, target_month: payment.target_month },
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
