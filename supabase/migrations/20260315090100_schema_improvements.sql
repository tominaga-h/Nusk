-- =============================================================
-- スキーマ改善: トリガー、制約、外部キーの動作
-- =============================================================

-- 1. updated_at auto-update trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_lists
  BEFORE UPDATE ON lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_statuses
  BEFORE UPDATE ON statuses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_tasks
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_push_subscriptions
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Partial unique index: one Inbox per user
CREATE UNIQUE INDEX idx_one_inbox_per_user
  ON lists (user_id)
  WHERE is_inbox = TRUE;

-- 3. tasks.status_id ON DELETE behavior
--    RESTRICT prevents deleting a status while tasks reference it.
ALTER TABLE tasks
  DROP CONSTRAINT tasks_status_id_fkey,
  ADD CONSTRAINT tasks_status_id_fkey
    FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE RESTRICT;
