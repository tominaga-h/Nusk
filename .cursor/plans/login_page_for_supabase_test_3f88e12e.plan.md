---
name: Login page for Supabase test
overview: リモートSupabaseへの接続確認のため、Google/GitHub OAuth ログインボタンを持つ `/login` ページと、OAuthコールバック用の `/confirm` ページを作成する。
todos:
  - id: create-login-page
    content: apps/web/pages/login.vue を作成（Google/GitHub OAuth ボタン）
    status: completed
  - id: create-confirm-page
    content: apps/web/pages/confirm.vue を作成（OAuth コールバック処理）
    status: completed
  - id: update-index-page
    content: apps/web/pages/index.vue を更新（ユーザー情報表示・ログアウト）
    status: completed
  - id: test-connection
    content: dev サーバーを起動して /login ページでの接続テスト
    status: completed
isProject: false
---

# Supabase接続テスト用 /login ページの実装

## 前提

- `@nuxtjs/supabase` v2.0.4 が既にインストール・設定済み
- [nuxt.config.ts](apps/web/nuxt.config.ts) で `redirectOptions.login: '/login'`, `callback: '/confirm'` が設定済み
- `.env` にリモートSupabaseのURL/Keyが設定済み、`.env.local` はコメントアウト済み
- devスクリプトが `nuxt dev --dotenv ../../.env` でルートの `.env` を読み込む

## 実装内容

### 1. `/login` ページの作成

`apps/web/pages/login.vue` を新規作成する。

- Google OAuth ログインボタン
- GitHub OAuth ログインボタン
- `useSupabaseClient()` で `signInWithOAuth` を呼び出す
- `redirectTo` に `http://localhost:3000/confirm` を指定
- エラー表示用のUIも含める
- `@nuxtjs/supabase` のミドルウェアによるリダイレクトループを防ぐため、`definePageMeta` は不要（`/login` は `redirectOptions.login` に指定されているため自動的に除外される）

```vue
const client = useSupabaseClient()
const login = async (provider: 'google' | 'github') => {
  const { error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo: 'http://localhost:3000/confirm' }
  })
}
```

### 2. `/confirm` ページの作成

`apps/web/pages/confirm.vue` を新規作成する。

- `@nuxtjs/supabase` がOAuthコールバックのトークン交換を自動処理する
- 認証成功時は `/` にリダイレクト
- ローディング表示を含める

### 3. トップページ (`/`) の更新

`apps/web/pages/index.vue` にログイン状態の表示を追加する。

- `useSupabaseUser()` でユーザー情報を取得・表示
- ログアウトボタンを追加
- 接続成功を視覚的に確認できるようにする

## ファイル変更一覧

- **新規作成:** `apps/web/pages/login.vue`
- **新規作成:** `apps/web/pages/confirm.vue`
- **変更:** `apps/web/pages/index.vue`（ユーザー情報表示・ログアウト追加）
