-- =============================================================
-- スキーマ変更: statuses.list_id NULL許容化 + lists.sort_order 追加
-- =============================================================

-- 1. statuses テーブルに user_id カラムを追加（一時的に NULL 許容で追加しバックフィル後に NOT NULL 化）
ALTER TABLE statuses
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE statuses
  SET user_id = lists.user_id
  FROM lists
  WHERE statuses.list_id = lists.id;

ALTER TABLE statuses
  ALTER COLUMN user_id SET NOT NULL;

-- 2. statuses.list_id の NOT NULL 制約を解除
ALTER TABLE statuses
  ALTER COLUMN list_id DROP NOT NULL;

-- 3. statuses.user_id にインデックスを追加
CREATE INDEX idx_statuses_user_id ON statuses(user_id);

-- 4. lists テーブルに sort_order カラムを追加
ALTER TABLE lists
  ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- 5. statuses の RLS ポリシーを user_id ベースに変更
DROP POLICY IF EXISTS "Users can view statuses of own lists" ON statuses;
DROP POLICY IF EXISTS "Users can create statuses on own lists" ON statuses;
DROP POLICY IF EXISTS "Users can update statuses on own lists" ON statuses;
DROP POLICY IF EXISTS "Users can delete statuses on own lists" ON statuses;

CREATE POLICY "Users can view own statuses"
  ON statuses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own statuses"
  ON statuses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own statuses"
  ON statuses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own statuses"
  ON statuses FOR DELETE
  USING (auth.uid() = user_id);
