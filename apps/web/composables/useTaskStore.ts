/**
 * タスク管理メインストア composable
 *
 * リスト・ステータス・タスクのグローバル状態を管理し、
 * データ取得・タスク追加・スケジュール変更・完了トグルなどの
 * アクション関数を提供する。useStateによるSSR対応のシングルトンストア。
 */
import type { List, Status, Task } from '@nusk/shared'

/** 日付グルーピング用のグループキー */
export type DateGroupKey = 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'undated'

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
  const statusFilter = useState<'all' | 'incomplete' | 'done'>('status-filter', () => 'incomplete')
  /** 日付ビューで選択中のグループ（サイドバーのアクティブ表示・スクロール制御に使用） */
  const selectedDateGroup = useState<DateGroupKey>('selected-date-group', () => 'today')
  /** タスクをドラッグ中かどうか（TaskItem↔AppSidebar間の状態共有に使用） */
  const isDraggingTask = useState('is-dragging-task', () => false)

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
   * 日付ビュー用: 全タスクを「過去/今日/明日/明日以降/未定」の5グループに分類
   *
   * - 過去: scheduled_date が今日より前（期限超過）
   * - 今日: scheduled_date が今日
   * - 明日: scheduled_date が明日
   * - 明日以降: scheduled_date が明後日以降（期限なし）
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
        key: 'overdue' as DateGroupKey,
        label: '過去',
        tasks: applyStatusFilter(overdueTasks),
      },
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
        key: 'upcoming' as DateGroupKey,
        label: '明日以降',
        tasks: applyStatusFilter(upcomingTasks),
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

  /**
   * 日付ビューに切り替え、指定グループを選択する
   * サイドバーの「今日」「明日」クリック時や、ヘッダーの日付トグルから呼ばれる。
   *
   * 既に同じ日付ビュー・グループが選択済みの場合はURLを変更せず
   * 直接スクロールのみ実行する（同一URL遷移は Vue Router に無視されるため）。
   * @param group - スクロール先の日付グループ（デフォルト: 'today'）
   */
  function switchToDateView(group: DateGroupKey = 'today') {
    if (viewMode.value === 'date' && selectedDateGroup.value === group) return
    navigateTo({ path: '/tasks', query: { view: 'date', group, status: statusFilter.value } })
  }

  /**
   * リストビューに切り替え、指定リストを選択する
   * サイドバーのリスト項目クリック時に呼ばれる。
   *
   * 既に同じリストが選択済みの場合は何もしない。
   * @param listId - 選択するリストのID
   */
  function switchToListView(listId: string) {
    if (viewMode.value === 'list' && selectedListId.value === listId) return
    navigateTo({ path: '/tasks', query: { view: 'list', list: listId, status: statusFilter.value } })
  }

  /**
   * ステータスフィルターを変更し、URLクエリに反映する
   * 現在の他のクエリパラメータ（view, list, group等）を保持したまま status のみ更新する。
   * @param status - 新しいステータスフィルター値
   */
  function switchStatusFilter(status: 'all' | 'incomplete' | 'done') {
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
    const view = query.view as 'list' | 'date' | undefined
    if (view === 'date') {
      viewMode.value = 'date'
      const group = (query.group as DateGroupKey) || 'today'
      selectedDateGroup.value = group
    } else if (view === 'list') {
      viewMode.value = 'list'
      if (query.list) selectedListId.value = query.list
    }

    // ステータスフィルターの復元（未指定時は未完了をデフォルトとする）
    const status = query.status as 'all' | 'incomplete' | 'done' | undefined
    statusFilter.value = status || 'incomplete'
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
    selectedDateGroup,
    isDraggingTask,
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
    upcomingCount,
    overdueCount,
    undatedCount,
    isToday,
    formatDate,
    // アクション
    fetchData,
    addTask,
    scheduleTask,
    completeTask,
    moveTaskToList,
    switchToDateView,
    switchToListView,
    switchStatusFilter,
    // URL同期
    syncFromRoute,
  }
}
