import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params
    const supabase = await createClient()
    const admin = createAdminClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 支払いレコード確認（admin client）
    const { data: payment } = await admin
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

    // ステータス更新（admin client）
    const { error } = await admin
      .from('payments')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)

    if (error) throw error

    // システムメッセージを追加
    await admin.from('messages').insert({
      group_id: payment.group_id,
      user_id: user.id,
      body: '支払いが完了しました',
      message_type: 'system',
      system_action: 'payment',
    })

    // 監査ログ（admin client）
    await admin.from('audit_logs').insert({
      actor_user_id: user.id,
      group_id: payment.group_id,
      action_type: 'payment_marked_paid',
      payload: { payment_id: paymentId, target_month: payment.target_month },
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Payment error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
