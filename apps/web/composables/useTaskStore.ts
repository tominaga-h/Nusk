/**
 * タスク管理メインストア composable
 *
 * リスト・ステータス・タスクのグローバル状態を管理し、
 * データ取得・タスク追加・スケジュール変更・完了トグルなどの
 * アクション関数を提供する。useStateによるSSR対応のシングルトンストア。
 */
import type { List, Status, Task } from '@nusk/shared'

/** 日付グルーピング用のグループキー */
export type DateGroupKey = 'today' | 'tomorrow' | 'laterThisWeek' | 'undated'

/** 日付ビューで使用するグループ構造体 */
export interface DateGroup {
  key: DateGroupKey
  label: string
  tasks: Task[]
}

/** Date オブジェクトを "YYYY-MM-DD" 形式の文字列に変換するユーティリティ */
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** 日付文字列を "M月D日" 形式にフォーマットするユーティリティ */
const toJpDateLabel = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * 今週の日曜日（週末）の日付文字列を返す
 * 日曜始まりの場合、今週の最終日は土曜。ここでは日曜＝週の最終日として扱う。
 */
const getEndOfWeekStr = (today: Date) => {
  const dayOfWeek = today.getDay()
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + daysUntilSunday)
  return toDateStr(endOfWeek)
}

export const useTaskStore = () => {
  const api = useApi()

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
  const viewMode = useState<'list' | 'date'>('view-mode', () => 'list')
  /** ステータスフィルター: all=全件, incomplete=未完了(TODO/IN_PROGRESS), done=完了(DONE) */
  const statusFilter = useState<'all' | 'incomplete' | 'done'>('status-filter', () => 'all')

  // --- 算出プロパティ（派生データ） ---

  /** 現在選択中のリストオブジェクト */
  const selectedList = computed(() =>
    lists.value.find(l => l.id === selectedListId.value),
  )

  /** 選択中リストに属するタスク一覧（リストIDのみでフィルタ） */
  const listedTasks = computed(() =>
    tasks.value.filter(t => t.list_id === selectedListId.value),
  )

  /** listedTasks にフィルターバー条件（ステータス等）を適用した最終表示用タスク一覧 */
  const filteredTasks = computed(() => {
    if (statusFilter.value === 'incomplete') {
      return listedTasks.value.filter(t => {
        const status = statuses.value.find(s => s.id === t.status_id)
        return status?.category !== 'DONE'
      })
    }
    if (statusFilter.value === 'done') {
      return listedTasks.value.filter(t => {
        const status = statuses.value.find(s => s.id === t.status_id)
        return status?.category === 'DONE'
      })
    }
    return listedTasks.value
  })

  // --- ユーティリティ関数 ---

  /** ステータスIDからステータスオブジェクトを検索 */
  const getStatus = (statusId: string) =>
    statuses.value.find(s => s.id === statusId)

  /** 指定リストに属するタスク数を返す（tasksの変化に追従するcomputed） */
  const taskCount = computed(() =>
    (listId: string) => tasks.value.filter(t => t.list_id === listId).length,
  )

  /** 今日の日付文字列（"YYYY-MM-DD"） */
  const todayStr = computed(() => toDateStr(new Date()))

  /** 明日の日付文字列（"YYYY-MM-DD"） */
  const tomorrowStr = computed(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return toDateStr(d)
  })

  /** 今週末（日曜）の日付文字列 */
  const endOfWeekStr = computed(() => getEndOfWeekStr(new Date()))

  /** 着手予定日が今日のタスク数 */
  const todayCount = computed(() =>
    tasks.value.filter(t => t.scheduled_date === todayStr.value).length,
  )

  /** 着手予定日が明日のタスク数 */
  const tomorrowCount = computed(() =>
    tasks.value.filter(t => t.scheduled_date === tomorrowStr.value).length,
  )

  /** 指定日付が今日かどうかを判定 */
  const isToday = (date: string | null) => date === todayStr.value

  /** 日付文字列を "M/D" 形式にフォーマット（nullの場合は空文字） */
  const formatDate = (date: string | null) => {
    if (!date) return ''
    const d = new Date(date + 'T00:00:00')
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  // --- 日付ビュー用 computed ---

  /** ステータスフィルターをタスク配列に適用するヘルパー */
  const applyStatusFilter = (taskList: Task[]): Task[] => {
    if (statusFilter.value === 'incomplete') {
      return taskList.filter(t => {
        const status = statuses.value.find(s => s.id === t.status_id)
        return status?.category !== 'DONE'
      })
    }
    if (statusFilter.value === 'done') {
      return taskList.filter(t => {
        const status = statuses.value.find(s => s.id === t.status_id)
        return status?.category === 'DONE'
      })
    }
    return taskList
  }

  /**
   * 日付ビュー用: 全タスクを「今日/明日/今週後半/未定」の4グループに分類
   *
   * - 今日: scheduled_date が今日
   * - 明日: scheduled_date が明日
   * - 今週後半: scheduled_date が明後日〜今週日曜
   * - 未定: scheduled_date が null
   * ステータスフィルターも適用済み。
   */
  const dateGroupedTasks = computed<DateGroup[]>(() => {
    const today = todayStr.value
    const tomorrow = tomorrowStr.value
    const endOfWeek = endOfWeekStr.value

    const todayTasks: Task[] = []
    const tomorrowTasks: Task[] = []
    const laterThisWeekTasks: Task[] = []
    const undatedTasks: Task[] = []

    for (const t of tasks.value) {
      const d = t.scheduled_date
      if (!d) {
        undatedTasks.push(t)
      } else if (d === today) {
        todayTasks.push(t)
      } else if (d === tomorrow) {
        tomorrowTasks.push(t)
      } else if (d > tomorrow && d <= endOfWeek) {
        laterThisWeekTasks.push(t)
      }
      // 今週以降のタスクは現時点では表示対象外
    }

    return [
      {
        key: 'today' as DateGroupKey,
        label: `今日 (${toJpDateLabel(today)})`,
        tasks: applyStatusFilter(todayTasks),
      },
      {
        key: 'tomorrow' as DateGroupKey,
        label: `明日 (${toJpDateLabel(tomorrow)})`,
        tasks: applyStatusFilter(tomorrowTasks),
      },
      {
        key: 'laterThisWeek' as DateGroupKey,
        label: '今週後半',
        tasks: applyStatusFilter(laterThisWeekTasks),
      },
      {
        key: 'undated' as DateGroupKey,
        label: '未定',
        tasks: applyStatusFilter(undatedTasks),
      },
    ]
  })

  /** 日付ビュー時の全グループ合計タスク数 */
  const dateViewTotalCount = computed(() =>
    dateGroupedTasks.value.reduce((sum, g) => sum + g.tasks.length, 0),
  )

  // --- アクション関数（API通信を伴うデータ操作） ---

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
   * 日付ビューに切り替える
   * サイドバーの「日付ビュー」「今日」「明日」クリック時に呼ばれる。
   */
  function switchToDateView() {
    viewMode.value = 'date'
  }

  /**
   * リストビューに切り替え、指定リストを選択する
   * サイドバーのリスト項目クリック時に呼ばれる。
   * @param listId - 選択するリストのID
   */
  function switchToListView(listId: string) {
    viewMode.value = 'list'
    selectedListId.value = listId
  }

  return {
    // ステート
    lists,
    statuses,
    tasks,
    loading,
    loaded,
    selectedListId,
    viewMode,
    statusFilter,
    // 算出プロパティ
    selectedList,
    listedTasks,
    filteredTasks,
    taskCount,
    dateGroupedTasks,
    dateViewTotalCount,
    // ユーティリティ
    getStatus,
    todayStr,
    tomorrowStr,
    todayCount,
    tomorrowCount,
    isToday,
    formatDate,
    // アクション
    fetchData,
    addTask,
    scheduleTask,
    completeTask,
    switchToDateView,
    switchToListView,
  }
}
