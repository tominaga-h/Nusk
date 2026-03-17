/**
 * タスクストアのコアステート定義
 *
 * 全 useState 宣言と基本的な派生 computed をまとめる。
 * SSR/CSR 間で共有されるシングルトンステートの唯一の定義元。
 */
import type { List, Status, Task } from '@nusk/shared'
import type { ComputedRef } from 'vue'
import { DateGroup, StatusFilter, ViewMode } from './types'
import type { DateGroupKey, StatusFilterValue, ViewModeValue, TaskState } from './types'
import { toDateStr } from '~/lib/date-utils'

/**
 * タスクストアのグローバルステートを生成して返す
 * @returns useState で管理される全リアクティブステートと基本 computed
 */
export function useTaskState(): TaskState & {
  /** 現在選択中のリストオブジェクト */
  selectedList: ComputedRef<List | undefined>
  /** 今日の日付文字列（"YYYY-MM-DD"） */
  todayStr: ComputedRef<string>
  /** 明日の日付文字列（"YYYY-MM-DD"） */
  tomorrowStr: ComputedRef<string>
} {
  // --- グローバルステート（useStateでSSR/CSR間で共有） ---
  const lists = useState<List[]>('task-lists', () => [])
  const statuses = useState<Status[]>('task-statuses', () => [])
  const tasks = useState<Task[]>('task-items', () => [])

  /** データ取得中フラグ */
  const loading = useState('task-loading', () => false)
  /** 初回データ取得完了フラグ（二重ロード防止に使用） */
  const loaded = useState('task-loaded', () => false)

  /** 現在選択中のリストID */
  const selectedListId = useState<string>('selected-list-id', () => '')
  /** 表示モード: "list"（リスト別） or "date"（日付別） */
  const viewMode = useState<ViewModeValue>('view-mode', () => ViewMode.LIST)
  /** ステータスフィルター: all=全件, incomplete=未完了(TODO/IN_PROGRESS), done=完了(DONE) */
  const statusFilter = useState<StatusFilterValue>('status-filter', () => StatusFilter.INCOMPLETE)
  /** 日付ビューで選択中のグループ（サイドバーのアクティブ表示・スクロール制御に使用） */
  const selectedDateGroup = useState<DateGroupKey>('selected-date-group', () => DateGroup.TODAY)
  /** タスクをドラッグ中かどうか（TaskItem↔AppSidebar間の状態共有に使用） */
  const isDraggingTask = useState('is-dragging-task', () => false)

  // --- 基本 computed ---

  /** 現在選択中のリストオブジェクト */
  const selectedList = computed(() =>
    lists.value.find(l => l.id === selectedListId.value),
  )

  /** 今日の日付文字列（"YYYY-MM-DD"） */
  const todayStr = computed(() => toDateStr(new Date()))

  /** 明日の日付文字列（"YYYY-MM-DD"） */
  const tomorrowStr = computed(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return toDateStr(d)
  })

  return {
    lists,
    statuses,
    tasks,
    loading,
    loaded,
    selectedListId,
    viewMode,
    statusFilter,
    selectedDateGroup,
    isDraggingTask,
    selectedList,
    todayStr,
    tomorrowStr,
  }
}
