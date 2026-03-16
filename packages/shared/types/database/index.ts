/**
 * データベース型定義のバレルファイル
 *
 * Supabase自動生成型（database.ts）を再エクスポートしつつ、
 * アプリケーションで使用する簡易型エイリアス（Task, List, StatusCategory等）を定義する。
 */
export {
  type Database,
  type Json,
  type TablesInsert,
  type TablesUpdate,
  type CompositeTypes,
  Constants,
} from './database';

import type { Database } from './database';

/** テーブルのRow型を簡易に取得するユーティリティ型 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

/** Enum型を簡易に取得するユーティリティ型 */
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// --- エンティティ型エイリアス ---
export type Task = Tables<'tasks'>;
export type List = Tables<'lists'>;
export type Status = Tables<'statuses'>;
export type PersonalAccessToken = Tables<'personal_access_tokens'>;
export type PushSubscription = Tables<'push_subscriptions'>;

// --- Enum型エイリアス ---
export type StatusCategory = Enums<'status_category'>;
