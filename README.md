# 無尽 - Digital Mujin

信頼を育てる積立コミュニティプラットフォーム

## セットアップ手順

### 1. Supabase プロジェクト作成

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. Settings > API から以下を取得:
   - **Project URL** (\`NEXT_PUBLIC_SUPABASE_URL\`)
   - **anon public key** (\`NEXT_PUBLIC_SUPABASE_ANON_KEY\`)

### 2. データベース構築

Supabase の SQL Editor で以下を順番に実行:

1. \`supabase/schema.sql\` — テーブル・インデックス作成
2. \`supabase/rls.sql\` — Row Level Security ポリシー設定

### 3. Auth 設定

Supabase Dashboard > Authentication > Providers で:

- **Email** を有効化（Magic Link モード）
- Site URL に \`http://localhost:3000\` を設定
- Redirect URLs に \`http://localhost:3000/dashboard\` を追加

### 4. 環境変数

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

\`.env.local\` を編集して Supabase の値を設定。

### 5. 起動

\`\`\`bash
npm install
npm run dev
\`\`\`

http://localhost:3000 でアクセス。

## 技術スタック

- Next.js 15 (App Router)
- Supabase (Auth + Postgres + Realtime)
- Tailwind CSS 4
- TypeScript
