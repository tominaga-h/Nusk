/**
 * タスク管理メインストア composable
 *
 * リスト・ステータス・タスクのグローバル状態を管理し、
 * データ取得・タスク追加・スケジュール変更・完了トグルなどの
 * アクション関数を提供する。useStateによるSSR対応のシングルトンストア。
 *
 * 各責務は以下のサブモジュールに分割されている:
 * - state.ts: コアステート（useState宣言 + 基本computed）
 * - filters.ts: フィルタリング・日付グルーピング・カウント
 * - actions.ts: API通信を伴うデータ操作
 * - navigation.ts: ビュー切り替え・URL同期
 */
import { formatDateShort } from '~/lib/date-utils'
import { useTaskActions } from './actions'
import { useTaskFilters } from './filters'
import { useTaskNavigation } from './navigation'
import { useTaskState } from './state'

/** 型の再エクスポート（コンシューマ向け） */
export type { DateGroup, DateGroupKey, StatusFilterValue } from './types'

export const useTaskStore = () => {
  const state = useTaskState()
  const filters = useTaskFilters(state, state.todayStr, state.tomorrowStr)
  const actions = useTaskActions(state)
  const navigation = useTaskNavigation(state)

  /** 日付文字列を "M/D" 形式にフォーマット（nullの場合は空文字） */
  const formatDate = (date: string | null) => formatDateShort(date)

  return {
    // ステート
    lists: state.lists,
    statuses: state.statuses,
    tasks: state.tasks,
    loading: state.loading,
    loaded: state.loaded,
    selectedListId: state.selectedListId,
    viewMode: state.viewMode,
    statusFilter: state.statusFilter,
    selectedDateGroup: state.selectedDateGroup,
    isDraggingTask: state.isDraggingTask,
    // 算出プロパティ
    selectedList: state.selectedList,
    listedTasks: filters.listedTasks,
    filteredTasks: filters.filteredTasks,
    taskCount: filters.taskCount,
    dateGroupedTasks: filters.dateGroupedTasks,
    dateViewTotalCount: filters.dateViewTotalCount,
    // ユーティリティ
    getStatus: filters.getStatus,
    todayStr: state.todayStr,
    tomorrowStr: state.tomorrowStr,
    todayCount: filters.todayCount,
    tomorrowCount: filters.tomorrowCount,
    upcomingCount: filters.upcomingCount,
    overdueCount: filters.overdueCount,
    undatedCount: filters.undatedCount,
    isToday: filters.isToday,
    formatDate,
    // アクション
    fetchData: actions.fetchData,
    addTask: actions.addTask,
    scheduleTask: actions.scheduleTask,
    updateTask: actions.updateTask,
    completeTask: actions.completeTask,
    moveTaskToList: actions.moveTaskToList,
    // ナビゲーション
    switchToDateView: navigation.switchToDateView,
    switchToListView: navigation.switchToListView,
    switchStatusFilter: navigation.switchStatusFilter,
    // URL同期
    syncFromRoute: navigation.syncFromRoute,
  }
}
