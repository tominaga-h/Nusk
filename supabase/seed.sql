-- =============================================================
-- ローカル開発用シードデータ
-- `supabase db reset` 実行時に利用
-- =============================================================
-- 注意: ローカル開発環境では、テストユーザーが Supabase により自動作成されます。
-- 以下はプレースホルダーUUIDを使用しています。適宜差し替えるか、
-- Supabaseダッシュボードでユーザーを作成し、IDを確認してシードを書き換えてください。
--
-- 手早く始めるには、Auth UI（http://127.0.0.1:54323/Supabase Studio）からユーザーを作成し、
--   supabase db reset
-- を実行してください。
-- このシードは、作成済みのテストユーザー用のInboxリストとデフォルトのステータスを生成します（ユーザーが存在する場合）。
-- =============================================================
-- 補助: 指定したユーザー用にデフォルトのInboxとステータスを作成する
-- この関数はシード用にのみ利用され、あとで削除しても良いです。
DO $$
DECLARE
  test_user_id UUID;
  inbox_id UUID;
  status_todo UUID;
BEGIN
  -- Try to find the first user in auth.users (created via Studio)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No user found in auth.users. Skipping seed data.';
    RETURN;
  END IF;

  -- Create Inbox list
  INSERT INTO lists (user_id, name, is_inbox)
  VALUES (test_user_id, 'Inbox', TRUE)
  RETURNING id INTO inbox_id;

  -- Create default statuses for Inbox
  INSERT INTO statuses (list_id, name, category, sort_order)
  VALUES
    (inbox_id, '未対応', 'TODO', 0),
    (inbox_id, '対応中', 'IN_PROGRESS', 1),
    (inbox_id, '完了', 'DONE', 2);

  -- Get the TODO status for sample tasks
  SELECT id INTO status_todo FROM statuses
    WHERE list_id = inbox_id AND category = 'TODO' LIMIT 1;

  -- Create sample tasks
  INSERT INTO tasks (user_id, list_id, status_id, title, scheduled_date, sort_order)
  VALUES
    (test_user_id, inbox_id, status_todo, 'Nusk の初期セットアップを完了する', CURRENT_DATE, 0),
    (test_user_id, inbox_id, status_todo, 'フェーズ2: 認証基盤の実装', CURRENT_DATE + 1, 1),
    (test_user_id, inbox_id, status_todo, 'フェーズ3: WebフロントエンドのUI構築', NULL, 2);

  RAISE NOTICE 'Seed data created for user %', test_user_id;
END $$;
