/**
 * タスクのフィルタリング・日付グルーピング computed
 *
 * リストビュー用のフィルタ済みタスク一覧、日付ビュー用のグループ分類、
 * サイドバーで使用する各種カウント computed をまとめる。
 */
import type { Task } from '@nusk/shared'
import type { ComputedRef } from 'vue'
import { DateGroup, StatusFilter } from './types'
import type { DateGroupKey, TaskState } from './types'
import { toJpDateLabel } from '~/lib/date-utils'

/**
 * ステートを受け取り、フィルタリング・グルーピング系の computed を返す
 * @param state - useTaskState() の返り値
 * @param todayStr - 今日の "YYYY-MM-DD" computed
 * @param tomorrowStr - 明日の "YYYY-MM-DD" computed
 */
export function useTaskFilters(
  state: TaskState,
  todayStr: ComputedRef<string>,
  tomorrowStr: ComputedRef<string>,
) {
  const { tasks, statuses, selectedListId, statusFilter } = state

  // --- リストビュー用 ---

  /** 選択中リストに属するタスク一覧（リストIDのみでフィルタ） */
  const listedTasks = computed(() =>
    tasks.value.filter(t => t.list_id === selectedListId.value),
  )

  /** ステータスフィルターをタスク配列に適用するヘルパー */
  const applyStatusFilter = (taskList: Task[]): Task[] => {
    if (statusFilter.value === StatusFilter.INCOMPLETE) {
      return taskList.filter(t => {
        const status = statuses.value.find(s => s.id === t.status_id)
        return status?.category !== 'DONE'
      })
    }
    if (statusFilter.value === StatusFilter.DONE) {
      return taskList.filter(t => {
        const status = statuses.value.find(s => s.id === t.status_id)
        return status?.category === 'DONE'
      })
    }
    return taskList
  }

  /** listedTasks にフィルターバー条件（ステータス等）を適用した最終表示用タスク一覧 */
  const filteredTasks = computed(() => applyStatusFilter(listedTasks.value))

  // --- 日付ビュー用 ---

  /**
   * 全タスクを「過去/今日/明日/明日以降/未定」の5グループに分類
   *
   * - 過去: scheduled_date が今日より前（期限超過）
   * - 今日: scheduled_date が今日
   * - 明日: scheduled_date が明日
   * - 明日以降: scheduled_date が明後日以降
   * - 未定: scheduled_date が null
   * ステータスフィルターも適用済み。
   */
  const dateGroupedTasks = computed<DateGroup[]>(() => {
    const today = todayStr.value
    const tomorrow = tomorrowStr.value

    const overdueTasks: Task[] = []
    const todayTasks: Task[] = []
    const tomorrowTasks: Task[] = []
    const upcomingTasks: Task[] = []
    const undatedTasks: Task[] = []

    for (const t of tasks.value) {
      const d = t.scheduled_date
      if (!d) {
        undatedTasks.push(t)
      } else if (d < today) {
        overdueTasks.push(t)
      } else if (d === today) {
        todayTasks.push(t)
      } else if (d === tomorrow) {
        tomorrowTasks.push(t)
      } else {
        upcomingTasks.push(t)
      }
    }

    return [
      {
        key: DateGroup.OVERDUE,
        label: '過去',
        tasks: applyStatusFilter(overdueTasks),
      },
      {
        key: DateGroup.TODAY,
        label: `今日 (${toJpDateLabel(today)})`,
        tasks: applyStatusFilter(todayTasks),
      },
      {
        key: DateGroup.TOMORROW,
        label: `明日 (${toJpDateLabel(tomorrow)})`,
        tasks: applyStatusFilter(tomorrowTasks),
      },
      {
        key: DateGroup.UPCOMING,
        label: '明日以降',
        tasks: applyStatusFilter(upcomingTasks),
      },
      {
        key: DateGroup.UNDATED,
        label: '未定',
        tasks: applyStatusFilter(undatedTasks),
      },
    ]
  })

  /** 日付ビュー時の全グループ合計タスク数 */
  const dateViewTotalCount = computed(() =>
    dateGroupedTasks.value.reduce((sum, g) => sum + g.tasks.length, 0),
  )

  // --- サイドバー用カウント ---

  /** 指定リストに属するタスク数を返す（tasksの変化に追従するcomputed） */
  const taskCount = computed(() =>
    (listId: string) => tasks.value.filter(t => t.list_id === listId).length,
  )

  /** 着手予定日が今日のタスク数 */
  const todayCount = computed(() =>
    tasks.value.filter(t => t.scheduled_date === todayStr.value).length,
  )

  /** 着手予定日が明日のタスク数 */
  const tomorrowCount = computed(() =>
    tasks.value.filter(t => t.scheduled_date === tomorrowStr.value).length,
  )

  /** 着手予定日が明後日以降のタスク数 */
  const upcomingCount = computed(() =>
    tasks.value.filter(t => t.scheduled_date && t.scheduled_date > tomorrowStr.value).length,
  )

  /** 着手予定日が過去（今日より前）のタスク数 */
  const overdueCount = computed(() =>
    tasks.value.filter(t => t.scheduled_date && t.scheduled_date < todayStr.value).length,
  )

  /** 着手予定日が未設定のタスク数 */
  const undatedCount = computed(() =>
    tasks.value.filter(t => !t.scheduled_date).length,
  )

  // --- ユーティリティ ---

  /** ステータスIDからステータスオブジェクトを検索 */
  const getStatus = (statusId: string) =>
    statuses.value.find(s => s.id === statusId)

  /** 指定日付が今日かどうかを判定 */
  const isToday = (date: string | null) => date === todayStr.value

  return {
    listedTasks,
    filteredTasks,
    dateGroupedTasks,
    dateViewTotalCount,
    taskCount,
    todayCount,
    tomorrowCount,
    upcomingCount,
    overdueCount,
    undatedCount,
    getStatus,
    isToday,
  }
}
