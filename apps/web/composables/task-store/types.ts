/**
 * タスクストアで使用する型定義
 */
import type { List, Status, Task } from '@nusk/shared'
import type { Ref } from 'vue'

/** 日付グルーピング用のグループキー */
export type DateGroupKey = 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'undated'

/** 日付ビューで使用するグループ構造体 */
export interface DateGroup {
  key: DateGroupKey
  label: string
  tasks: Task[]
}

/** ステータスフィルターの値型 */
export type StatusFilterValue = 'all' | 'incomplete' | 'done'

/**
 * useTaskState() が返す共有ステートのインターフェース
 *
 * 各サブモジュール（actions, filters, navigation）が
 * 必要なステートを受け取るための型定義。
 */
export interface TaskState {
  lists: Ref<List[]>
  statuses: Ref<Status[]>
  tasks: Ref<Task[]>
  loading: Ref<boolean>
  loaded: Ref<boolean>
  selectedListId: Ref<string>
  viewMode: Ref<'list' | 'date'>
  statusFilter: Ref<StatusFilterValue>
  selectedDateGroup: Ref<DateGroupKey>
  isDraggingTask: Ref<boolean>
}
