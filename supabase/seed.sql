-- =============================================================
-- ローカル開発用シードデータ
-- `supabase db reset` 実行時に自動で適用される
-- =============================================================
-- テストユーザー: test@example.com / password123
-- =============================================================

-- テストユーザーを auth.users に作成
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'authenticated', 'authenticated', 'test@example.com',
  crypt('password123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test User"}',
  now(), now(),
  '', '', '', ''
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  jsonb_build_object('sub', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'email', 'test@example.com'),
  'email',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  now(), now(), now()
);

-- シードデータ投入
DO $$
DECLARE
  test_user_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  inbox_id UUID;
  status_todo UUID;
BEGIN
  -- Inbox リスト
  INSERT INTO lists (user_id, name, is_inbox)
  VALUES (test_user_id, 'Inbox', TRUE)
  RETURNING id INTO inbox_id;

  -- デフォルトステータス
  INSERT INTO statuses (list_id, name, category, sort_order)
  VALUES
    (inbox_id, '未対応', 'TODO', 0),
    (inbox_id, '対応中', 'IN_PROGRESS', 1),
    (inbox_id, '完了', 'DONE', 2);

  SELECT id INTO status_todo FROM statuses
    WHERE list_id = inbox_id AND category = 'TODO' LIMIT 1;

  -- サンプルタスク
  INSERT INTO tasks (user_id, list_id, status_id, title, scheduled_date, sort_order)
  VALUES
    (test_user_id, inbox_id, status_todo, 'Nusk の初期セットアップを完了する', CURRENT_DATE, 0),
    (test_user_id, inbox_id, status_todo, 'フェーズ2: 認証基盤の実装', CURRENT_DATE + 1, 1),
    (test_user_id, inbox_id, status_todo, 'フェーズ3: WebフロントエンドのUI構築', NULL, 2);

  RAISE NOTICE 'Seed data created for user %', test_user_id;
END $$;
