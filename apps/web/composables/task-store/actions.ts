/**
 * タスクのAPIアクション関数
 *
 * API通信を伴うデータ操作（CRUD・完了トグル・リスト移動）をまとめる。
 * 各関数は楽観的にローカルステートも更新する。
 */
import type { TaskState } from './types'

/**
 * ステートを受け取り、API通信を伴うアクション関数群を返す
 * @param state - useTaskState() の返り値
 */
export function useTaskActions(state: TaskState) {
  const api = useApi()
  const { lists, statuses, tasks, loading, loaded, selectedListId } = state

  /**
   * リスト・ステータス・タスクの初回一括取得
   *
   * 全データをPromise.allで並列取得し、ローカルステートに格納する。
   * 初回ロード済みの場合はスキップ。取得後、Inboxリストを自動選択する。
   */
  async function fetchData() {
    if (loaded.value) return
    loading.value = true
    try {
      const [listsRes, statusesRes, tasksRes] = await Promise.all([
        api.lists.getAll(),
        api.statuses.getAll(),
        api.tasks.getAll(),
      ])
      lists.value = listsRes
      statuses.value = statusesRes
      tasks.value = tasksRes

      // 未選択の場合、Inboxリストをデフォルト選択
      const inbox = lists.value.find(l => l.is_inbox)
      if (inbox && !selectedListId.value) {
        selectedListId.value = inbox.id
      }
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  /**
   * 現在選択中のリストに新規タスクを追加
   * @param title - タスクのタイトル
   */
  async function addTask(title: string) {
    const task = await api.tasks.create({
      title,
      list_id: selectedListId.value,
    })
    tasks.value.push(task)
  }

  /**
   * タスクの着手予定日（scheduled_date）を変更
   * @param taskId - 対象タスクのID
   * @param date - 新しい着手予定日（"YYYY-MM-DD"形式）
   */
  async function scheduleTask(taskId: string, date: string) {
    const updated = await api.tasks.update(taskId, { scheduled_date: date })
    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) tasks.value[index] = updated
  }

  /**
   * タスクの完了/未完了をトグルする
   *
   * 現在のステータスカテゴリがDONEならTODOへ、TODOならDONEへ切り替える。
   * 同じリスト（またはグローバル）に属する対象カテゴリのステータスを自動検索し、
   * そのステータスIDでタスクを更新する。
   * @param taskId - 対象タスクのID
   */
  async function completeTask(taskId: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return

    // 現在のステータスカテゴリを判定し、トグル先カテゴリを決定
    const currentStatus = statuses.value.find(s => s.id === task.status_id)
    const targetCategory = currentStatus?.category === 'DONE' ? 'TODO' : 'DONE'
    // 同一リストまたはグローバル（list_id === null）のステータスから対象カテゴリを検索
    const newStatus = statuses.value.find(
      s => (s.list_id === task.list_id || s.list_id === null) && s.category === targetCategory,
    )
    if (!newStatus) return

    const updated = await api.tasks.update(taskId, { status_id: newStatus.id })
    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) tasks.value[index] = updated
  }

  /**
   * タスクを別のリストに移動する
   *
   * API経由で list_id を更新し、ローカルの tasks 配列も即座に反映する。
   * 既に同じリストに属している場合は何もしない。
   * @param taskId - 移動対象のタスクID
   * @param listId - 移動先のリストID
   */
  async function moveTaskToList(taskId: string, listId: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task || task.list_id === listId) return

    const updated = await api.tasks.update(taskId, { list_id: listId })
    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) tasks.value[index] = updated
  }

  return {
    fetchData,
    addTask,
    scheduleTask,
    completeTask,
    moveTaskToList,
  }
}
