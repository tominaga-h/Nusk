/**
 * 共有APIクライアントファクトリ
 *
 * Web（Nuxt）とCLI（Bun）の両方から利用される、
 * Nusk APIへのリクエストを抽象化した中核モジュール。
 * fetcher関数を注入することで、環境に依存しないAPIクライアントを生成する。
 */
import type { List, Status, Task } from '../types/database'
import type {
  CreateListPayload,
  UpdateListPayload,
  GetStatusesQuery,
  CreateStatusPayload,
  UpdateStatusPayload,
  GetTasksQuery,
  CreateTaskPayload,
  UpdateTaskPayload,
  SetupInitPayload,
} from '../types/api'

/** HTTPリクエストの共通オプション型 */
interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: Record<string, unknown> | null
  query?: Record<string, string | undefined>
}

/** 汎用フェッチ関数の型エイリアス（Nuxtの$fetchやBunのfetchなどを受け取る） */
type Fetcher = <T = unknown>(url: string, options?: FetchOptions) => Promise<T>

/**
 * APIクライアントを生成するファクトリ関数
 *
 * 各リソース（lists, statuses, tasks, setup）に対するCRUD操作メソッドを返す。
 * @param fetcher - 環境固有のHTTPクライアント関数（Nuxtでは$fetch、CLIではfetchなど）
 * @returns リソースごとのAPI操作メソッドを持つオブジェクト
 */
export function createApiClient(fetcher: Fetcher) {
  return {
    // --- リスト（Lists）操作 ---
    lists: {
      /** 全リストを取得 */
      getAll: () =>
        fetcher<List[]>('/api/v1/lists'),

      /** 新規リストを作成 */
      create: (body: CreateListPayload) =>
        fetcher<List>('/api/v1/lists', { method: 'POST', body }),

      /** リストを部分更新 */
      update: (id: string, body: UpdateListPayload) =>
        fetcher<List>(`/api/v1/lists/${id}`, { method: 'PATCH', body }),

      /** リストを削除 */
      delete: (id: string) =>
        fetcher<null>(`/api/v1/lists/${id}`, { method: 'DELETE' }),
    },

    // --- ステータス（Statuses）操作 ---
    statuses: {
      /** 全ステータスを取得（リストIDで絞り込み可能） */
      getAll: (query?: GetStatusesQuery) =>
        fetcher<Status[]>('/api/v1/statuses', { query }),

      /** 新規ステータスを作成 */
      create: (body: CreateStatusPayload) =>
        fetcher<Status>('/api/v1/statuses', { method: 'POST', body }),

      /** ステータスを部分更新 */
      update: (id: string, body: UpdateStatusPayload) =>
        fetcher<Status>(`/api/v1/statuses/${id}`, { method: 'PATCH', body }),

      /** ステータスを削除 */
      delete: (id: string) =>
        fetcher<null>(`/api/v1/statuses/${id}`, { method: 'DELETE' }),
    },

    // --- タスク（Tasks）操作 ---
    tasks: {
      /** 全タスクを取得（リストID・着手予定日・ステータスIDで絞り込み可能） */
      getAll: (query?: GetTasksQuery) =>
        fetcher<Task[]>('/api/v1/tasks', { query }),

      /** 指定IDのタスクを1件取得 */
      get: (id: string) =>
        fetcher<Task>(`/api/v1/tasks/${id}`),

      /** 新規タスクを作成 */
      create: (body: CreateTaskPayload) =>
        fetcher<Task>('/api/v1/tasks', { method: 'POST', body }),

      /** タスクを部分更新（ステータス変更、リスト移動、リスケジュール、論理削除などに対応） */
      update: (id: string, body: UpdateTaskPayload) =>
        fetcher<Task>(`/api/v1/tasks/${id}`, { method: 'PATCH', body }),
    },

    // --- 初期セットアップ操作 ---
    setup: {
      /** デフォルトのリストとステータスを一括作成する初期化API */
      init: (body: SetupInitPayload) =>
        fetcher<unknown>('/api/v1/setup/init', { method: 'POST', body }),
    },
  }
}

/** createApiClientの戻り値から推論されるAPIクライアントの型（外部での型参照用） */
export type ApiClient = ReturnType<typeof createApiClient>
