import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(req: Request) {
    try {
          // 認証チェック（ユーザーの JWT を使用）
      const supabase = await createClient()
          const {
                  data: { user },
          } = await supabase.auth.getUser()

      if (!user) {
              return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await req.json()
          const inviteCode = crypto.randomBytes(4).toString('hex')

      // DB操作は admin クライアント（Service Role Key）で実行
      // RLS をバイパスし、確実にデータを書き込む
      const admin = createAdminClient()

      // プロフィールが存在するか確認（FK制約対策）
      const { data: profile } = await admin
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single()

      if (!profile) {
              // プロフィールがなければ作成
            const nickname =
                      user.user_metadata?.nickname || user.email?.split('@')[0] || 'ゲスト'
              await admin.from('profiles').insert({
                        id: user.id,
                        nickname,
              })
      }

      // グループ作成
      const { data: group, error } = await admin
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

      if (error) {
              console.error('groups insert error:', JSON.stringify(error))
              throw error
      }

      // 作成者を最初のメンバーとして追加
      const { error: memberError } = await admin.from('group_members').insert({
              group_id: group.id,
              user_id: user.id,
              turn_order: 1,
      })
          if (memberError) console.error('member insert error:', JSON.stringify(memberError))

      // 初月の支払いレコードを生成
      const currentMonth = new Date().toISOString().slice(0, 7)
          await admin.from('payments').insert({
                  group_id: group.id,
                  user_id: user.id,
                  target_month: currentMonth,
                  status: 'unpaid',
          })

      // 監査ログ
      await admin.from('audit_logs').insert({
              actor_user_id: user.id,
              group_id: group.id,
              action_type: 'group_created',
              payload: { name: body.name, monthly_amount: body.monthlyAmount },
      })

      return NextResponse.json({ ok: true, group })
    } catch (e: any) {
          console.error('API /api/groups error:', e.message, e.code, e.details, e.hint)
          return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
