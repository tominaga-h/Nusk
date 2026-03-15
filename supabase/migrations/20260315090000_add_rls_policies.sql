-- =============================================================
-- すべてのテーブルに対するRLSポリシー
-- 各ユーザーは auth.uid() を通じて自分自身のデータのみアクセス可能
-- =============================================================

-- ----- lists -----
CREATE POLICY "Users can view own lists"
  ON lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lists"
  ON lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists"
  ON lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists"
  ON lists FOR DELETE
  USING (auth.uid() = user_id);

-- ----- statuses -----
-- Statuses belong to lists, so ownership is checked via the parent list.
CREATE POLICY "Users can view statuses of own lists"
  ON statuses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM lists WHERE lists.id = statuses.list_id AND lists.user_id = auth.uid()
  ));

CREATE POLICY "Users can create statuses on own lists"
  ON statuses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM lists WHERE lists.id = statuses.list_id AND lists.user_id = auth.uid()
  ));

CREATE POLICY "Users can update statuses on own lists"
  ON statuses FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM lists WHERE lists.id = statuses.list_id AND lists.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM lists WHERE lists.id = statuses.list_id AND lists.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete statuses on own lists"
  ON statuses FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM lists WHERE lists.id = statuses.list_id AND lists.user_id = auth.uid()
  ));

-- ----- tasks -----
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ----- personal_access_tokens -----
CREATE POLICY "Users can view own tokens"
  ON personal_access_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tokens"
  ON personal_access_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
  ON personal_access_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens"
  ON personal_access_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- ----- push_subscriptions -----
CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);
