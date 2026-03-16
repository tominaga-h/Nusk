/**
 * APIペイロード・クエリ型定義
 *
 * createApiClient の各メソッドで使用するリクエストボディ・クエリパラメータの型。
 * Web（Nuxt）とCLI（Bun）の両方から共通で参照される。
 */
import type { StatusCategory } from './database/index'

// --- リスト（Lists） ---

/** リスト作成時のリクエストボディ */
export type CreateListPayload = {
  name: string
  is_inbox?: boolean
  sort_order?: number
}

/** リスト更新時のリクエストボディ（全フィールド任意） */
export type UpdateListPayload = {
  name?: string
  sort_order?: number
  is_inbox?: boolean
}

// --- ステータス（Statuses） ---

/** ステータス一覧取得時のクエリパラメータ */
export type GetStatusesQuery = {
  list_id?: string
}

/** ステータス作成時のリクエストボディ */
export type CreateStatusPayload = {
  name: string
  category?: StatusCategory
  color?: string
  sort_order?: number
  list_id?: string | null
}

/** ステータス更新時のリクエストボディ（全フィールド任意） */
export type UpdateStatusPayload = {
  name?: string
  category?: StatusCategory
  color?: string
  sort_order?: number
  list_id?: string | null
}

// --- タスク（Tasks） ---

/** タスク一覧取得時のクエリパラメータ */
export type GetTasksQuery = {
  list_id?: string
  scheduled_date?: string
  status_id?: string
}

/** タスク作成時のリクエストボディ */
export type CreateTaskPayload = {
  title: string
  list_id?: string
  status_id?: string
  scheduled_date?: string | null
}

/** タスク更新時のリクエストボディ（ステータス変更、リスト移動、リスケジュール、論理削除に対応） */
export type UpdateTaskPayload = {
  title?: string
  status_id?: string
  list_id?: string
  scheduled_date?: string | null
  sort_order?: number
  deleted_at?: string | null
}

// --- 初期セットアップ ---

/** 初期セットアップ時のリクエストボディ（リストとステータスを一括作成） */
export type SetupInitPayload = {
  lists?: Array<{ name: string; is_inbox: boolean }>
  statuses?: Array<{ name: string; category: StatusCategory; color: string }>
}
