-- =============================================
-- 無尽デジタル MVP - Row Level Security
-- schema.sql の後に実行してください
-- =============================================

-- ========== profiles ==========
alter table profiles enable row level security;

create policy "profiles: 誰でも読める"
on profiles for select using (true);

create policy "profiles: 本人だけ更新"
on profiles for update using (auth.uid() = id);

-- ========== groups ==========
alter table groups enable row level security;

create policy "groups: メンバーなら読める"
on groups for select using (
  exists (
    select 1 from group_members gm
    where gm.group_id = groups.id
      and gm.user_id = auth.uid()
  )
);

create policy "groups: ログイン済みなら作成可"
on groups for insert with check (auth.uid() = owner_id);

create policy "groups: オーナーだけ更新"
on groups for update using (auth.uid() = owner_id);

create policy "groups: 招待コードで検索可"
on groups for select using (true);

-- ========== group_members ==========
alter table group_members enable row level security;

create policy "group_members: メンバーなら読める"
on group_members for select using (
  exists (
    select 1 from group_members gm
    where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
  )
);

create policy "group_members: ログイン済みなら参加可"
on group_members for insert with check (auth.uid() = user_id);

-- ========== payments ==========
alter table payments enable row level security;

create policy "payments: メンバーなら読める"
on payments for select using (
  exists (
    select 1 from group_members gm
    where gm.group_id = payments.group_id
      and gm.user_id = auth.uid()
  )
);

create policy "payments: 本人が作成可"
on payments for insert with check (auth.uid() = user_id);

create policy "payments: 本人が更新可"
on payments for update using (auth.uid() = user_id);

-- ========== messages ==========
alter table messages enable row level security;

create policy "messages: メンバーなら読める"
on messages for select using (
  exists (
    select 1 from group_members gm
    where gm.group_id = messages.group_id
      and gm.user_id = auth.uid()
  )
);

create policy "messages: メンバーなら投稿可"
on messages for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from group_members gm
    where gm.group_id = messages.group_id
      and gm.user_id = auth.uid()
  )
);

-- ========== audit_logs ==========
alter table audit_logs enable row level security;

create policy "audit_logs: メンバーなら読める"
on audit_logs for select using (
  exists (
    select 1 from group_members gm
    where gm.group_id = audit_logs.group_id
      and gm.user_id = auth.uid()
  )
);

create policy "audit_logs: サーバー側からのみ書き込み"
on audit_logs for insert with check (auth.uid() = actor_user_id);

-- ========== Realtime を有効にする ==========
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table payments;
