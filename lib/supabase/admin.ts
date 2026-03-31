import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// サーバーサイド専用: Service Role Key を使い RLS をバイパス
// API Route など、すでに手動で認証チェックを行っている箇所で使用
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createSupabaseClient(url, serviceKey, {
        auth: {
                autoRefreshToken: false,
                persistSession: false,
        },
  })
}
