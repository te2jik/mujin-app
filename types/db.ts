export interface Profile {
  id: string
  nickname: string
  avatar_color: string
  created_at: string
}

export interface Group {
  id: string
  name: string
  monthly_amount: number
  member_limit: number
  start_date: string
  owner_id: string
  invite_code: string
  created_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  turn_order: number
  joined_at: string
}

export interface Payment {
  id: string
  group_id: string
  user_id: string
  target_month: string
  status: 'unpaid' | 'paid'
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  group_id: string
  user_id: string
  body: string
  created_at: string
}

export interface AuditLog {
  id: string
  actor_user_id: string
  group_id: string
  action_type: string
  payload: Record<string, unknown>
  created_at: string
}
