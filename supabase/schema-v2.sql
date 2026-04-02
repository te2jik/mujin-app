-- =============================================
-- 無尽デジタル v2 - Database Schema
-- Supabase SQL Editor で実行してください
-- =============================================

-- 1. プロフィール
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_color text default '#4a9eed',
  created_at timestamptz default now()
);

-- 新規ユーザー登録時にプロフィールを自動作成するトリガー
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', 'ゲスト')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. グループ
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  monthly_amount integer not null,
  member_limit integer not null default 10,
  start_date date not null,
  owner_id uuid not null references profiles(id) on delete cascade,
  invite_code text not null unique,
  created_at timestamptz default now()
);

-- 3. グループメンバー
create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  turn_order integer not null,
  joined_at timestamptz default now(),
  unique(group_id, user_id),
  unique(group_id, turn_order)
);

-- 4. 支払い
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  target_month text not null,
  status text not null default 'unpaid'
    check (status in ('unpaid', 'paid')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(group_id, user_id, target_month)
);

-- 5. メッセージ（チャット）
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  message_type text default 'text' check (message_type in ('text', 'system')),
  system_action text,
  created_at timestamptz default now()
);

-- 6. 監査ログ
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references profiles(id),
  group_id uuid references groups(id),
  action_type text not null,
  payload jsonb,
  created_at timestamptz default now()
);

-- インデックス
create index if not exists idx_group_members_group on group_members(group_id);
create index if not exists idx_group_members_user on group_members(user_id);
create index if not exists idx_payments_group_month on payments(group_id, target_month);
create index if not exists idx_messages_group on messages(group_id, created_at);
create index if not exists idx_audit_logs_group on audit_logs(group_id, created_at);

-- インデックスの作成（追加）
create index if not exists idx_profiles_id on profiles(id);
create index if not exists idx_groups_owner_id on groups(owner_id);
create index if not exists idx_messages_user_id on messages(user_id);
