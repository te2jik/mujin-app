-- =============================================
-- 月次バッチ: 毎月1日に実行
-- 全グループの全メンバーに対し、今月分の支払いレコードを生成
-- Supabase の pg_cron か、外部 cron で実行してください
-- =============================================

insert into payments (group_id, user_id, target_month, status)
select
  gm.group_id,
  gm.user_id,
  to_char(now(), 'YYYY-MM'),
  'unpaid'
from group_members gm
where not exists (
  select 1 from payments p
  where p.group_id = gm.group_id
    and p.user_id = gm.user_id
    and p.target_month = to_char(now(), 'YYYY-MM')
);
