/**
 * ビュー切り替え・URLナビゲーション関数
 *
 * サイドバーやフィルターバーからのビュー切り替え操作と、
 * URLクエリパラメータとストアステートの双方向同期を担う。
 */
import { DateGroup, StatusFilter, ViewMode } from './types'
import type { DateGroupKey, StatusFilterValue, ViewModeValue, TaskState } from './types'

/**
 * ステートを受け取り、ナビゲーション系アクション関数を返す
 * @param state - useTaskState() の返り値
 */
export function useTaskNavigation(state: TaskState) {
  const { viewMode, selectedListId, statusFilter, selectedDateGroup } = state

  /**
   * 日付ビューに切り替え、指定グループを選択する
   * サイドバーの「今日」「明日」クリック時や、ヘッダーの日付トグルから呼ばれる。
   *
   * 既に同じ日付ビュー・グループが選択済みの場合はURLを変更せず
   * 直接スクロールのみ実行する（同一URL遷移は Vue Router に無視されるため）。
   * @param group - スクロール先の日付グループ（デフォルト: 'today'）
   */
  function switchToDateView(group: DateGroupKey = DateGroup.TODAY) {
    if (viewMode.value === ViewMode.DATE && selectedDateGroup.value === group) return
    navigateTo({ path: '/tasks', query: { view: ViewMode.DATE, group, status: statusFilter.value } })
  }

  /**
   * リストビューに切り替え、指定リストを選択する
   * サイドバーのリスト項目クリック時に呼ばれる。
   *
   * 既に同じリストが選択済みの場合は何もしない。
   * @param listId - 選択するリストのID
   */
  function switchToListView(listId: string) {
    if (viewMode.value === ViewMode.LIST && selectedListId.value === listId) return
    navigateTo({ path: '/tasks', query: { view: ViewMode.LIST, list: listId, status: statusFilter.value } })
  }

  /**
   * ステータスフィルターを変更し、URLクエリに反映する
   * 現在の他のクエリパラメータ（view, list, group等）を保持したまま status のみ更新する。
   * @param status - 新しいステータスフィルター値
   */
  function switchStatusFilter(status: StatusFilterValue) {
    const route = useRoute()
    navigateTo({ path: '/tasks', query: { ...route.query, status } })
  }

  /**
   * URLクエリパラメータからストアステートを復元する
   * tasks.vue の route.query watcher から呼ばれ、URL → ストアの同期を担う。
   * クエリが空（/tasks）の場合はリストビュー + 現在のリスト選択を維持する。
   * @param query - route.query オブジェクト
   */
  function syncFromRoute(query: Record<string, string>) {
    const view = query.view as ViewModeValue | undefined
    if (view === ViewMode.DATE) {
      viewMode.value = ViewMode.DATE
      const group = (query.group as DateGroupKey) || DateGroup.TODAY
      selectedDateGroup.value = group
    } else if (view === ViewMode.LIST) {
      viewMode.value = ViewMode.LIST
      if (query.list) selectedListId.value = query.list
    }

    // ステータスフィルターの復元（未指定時は未完了をデフォルトとする）
    const status = query.status as StatusFilterValue | undefined
    statusFilter.value = status || StatusFilter.INCOMPLETE
  }

  return {
    switchToDateView,
    switchToListView,
    switchStatusFilter,
    syncFromRoute,
  }
}
