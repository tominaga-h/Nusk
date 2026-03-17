/**
 * タスクストアで使用する型定義
 */
import type { List, Status, Task } from '@nusk/shared'
import type { Ref } from 'vue'

/** 日付グルーピング用のグループキー */
export const DateGroup = {
  OVERDUE: 'overdue',
  TODAY: 'today',
  TOMORROW: 'tomorrow',
  UPCOMING: 'upcoming',
  UNDATED: 'undated',
} as const;
export type DateGroupKey = (typeof DateGroup)[keyof typeof DateGroup];

/** 日付ビューで使用するグループ構造体 */
export interface DateGroup {
  key: DateGroupKey
  label: string
  tasks: Task[]
}

/** ステータスフィルターの値型 */
export const StatusFilter = {
  ALL: 'all',
  INCOMPLETE: 'incomplete',
  DONE: 'done',
} as const;
export type StatusFilterValue = (typeof StatusFilter)[keyof typeof StatusFilter];

/** 表示モードの値型 */
export const ViewMode = {
  LIST: 'list',
  DATE: 'date',
} as const;
export type ViewModeValue = (typeof ViewMode)[keyof typeof ViewMode];

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
  viewMode: Ref<ViewModeValue>
  statusFilter: Ref<StatusFilterValue>
  selectedDateGroup: Ref<DateGroupKey>
  isDraggingTask: Ref<boolean>
}
