# Nusk 開発フェーズ計画

## フェーズ1: プロジェクト基盤構築とデータベース設計

- Bun Workspacesを用いたモノレポ構成の初期化 (`package.json`, `apps/web`, `apps/cli`, `packages/shared` の作成)
- Nuxt.js + Nitroプロジェクトのセットアップ (`apps/web`)
- Supabaseプロジェクトの作成とスキーマ定義の適用 (`docs/SCHEMA.md` のSQLを実行)
- 共通型定義の作成 (`packages/shared` へDBスキーマに基づくTypeScriptインターフェースを定義)

## フェーズ2: 認証基盤とコアAPIの実装

- GoogleとGitHubのOAuthクライアントの設定
- SupabaseのProvider設定（Google, GitHub）
- Supabase Authを用いたGoogle/GitHub OAuthログインの実装 (`apps/web`)
- CLI用パーソナルアクセストークン（PAT）の発行・管理機能の実装 (`personal_access_tokens` テーブル連携)
- NitroでのAPIミドルウェア実装（SupabaseセッションとPATの両方に対応した認証処理）
- タスクCRUD用APIエンドポイントの実装 (`docs/API_ENDPOINT.md` に基づく `/api/v1/tasks` のGET, POST, PATCH)

## フェーズ3: Webフロントエンド（PWA）のコア機能実装

- 基本的なUIレイアウトとルーティングの実装（Inbox、リストView、日付View）
- タスクの新規登録、編集、論理削除UIの実装
- リスト（箱）とステータス（状態）の管理UIの実装
- ワンタップ着手日変更（今日やる/明日やる）UIの実装

## フェーズ4: CLIツールの実装（爆速入力）

- Bunを用いたCLIアプリケーションの基盤構築 (`apps/cli`)
- API連携処理の実装（PATを用いた認証と `packages/shared` の型利用）
- `nusk add "タスク名"` コマンドの実装（Inboxへの即座登録）
- 引数なし `nusk add` 時の環境変数 `$EDITOR` 起動と保存検知機能の実装

## フェーズ5: 自動化・リマインド・拡張機能の実装

- 未完了タスクの自動リスケジュール（Overdue処理）のバッチまたはエッジ関数実装
- 繰り返しタスク（`recurrence_rule`）の完了時クローン生成ロジック実装
- Web Push通知機能の実装（`push_subscriptions` テーブルへの登録と通知送信処理）
- 拡張メタデータ（`metadata` JSONBカラム）のWeb UIからの編集機能実装

## フェーズ6: テスト・デプロイ・最終調整

- VercelへのWebアプリケーション（Nuxt）デプロイ設定
- CLIツールのビルドと配布フローの確立
- E2Eテストの実施と、CLIのレスポンスタイム（0.1秒以内）のパフォーマンスチューニング
