export interface List {
  id: string
  name: string
  is_inbox: boolean
}

export interface Status {
  id: string
  list_id: string
  name: string
  category: 'TODO' | 'IN_PROGRESS' | 'DONE'
}

export interface Task {
  id: string
  list_id: string
  status_id: string
  title: string
  scheduled_date: string | null
  sort_order: number
}

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const useTaskStore = () => {
  const lists = useState<List[]>('task-lists', () => [
    { id: 'list-1', name: 'Inbox', is_inbox: true },
    { id: 'list-2', name: '仕事', is_inbox: false },
    { id: 'list-3', name: 'プライベート', is_inbox: false },
  ])

  const statuses = useState<Status[]>('task-statuses', () => [
    { id: 'status-1', list_id: 'list-1', name: '未対応', category: 'TODO' },
    { id: 'status-2', list_id: 'list-1', name: '対応中', category: 'IN_PROGRESS' },
    { id: 'status-3', list_id: 'list-1', name: '完了', category: 'DONE' },
    { id: 'status-4', list_id: 'list-2', name: '未対応', category: 'TODO' },
    { id: 'status-5', list_id: 'list-2', name: '対応中', category: 'IN_PROGRESS' },
    { id: 'status-6', list_id: 'list-2', name: '完了', category: 'DONE' },
    { id: 'status-7', list_id: 'list-3', name: '未対応', category: 'TODO' },
    { id: 'status-8', list_id: 'list-3', name: '対応中', category: 'IN_PROGRESS' },
    { id: 'status-9', list_id: 'list-3', name: '完了', category: 'DONE' },
  ])

  const tasks = useState<Task[]>('task-items', () => [
    { id: 'task-1', list_id: 'list-1', status_id: 'status-1', title: 'プロジェクト計画書を作成する', scheduled_date: '2026-03-17', sort_order: 0 },
    { id: 'task-2', list_id: 'list-1', status_id: 'status-2', title: 'デザインレビューの準備', scheduled_date: '2026-03-16', sort_order: 1 },
    { id: 'task-3', list_id: 'list-1', status_id: 'status-1', title: '新しいライブラリの調査', scheduled_date: null, sort_order: 2 },
    { id: 'task-4', list_id: 'list-2', status_id: 'status-4', title: 'API エンドポイントの実装', scheduled_date: '2026-03-18', sort_order: 0 },
    { id: 'task-5', list_id: 'list-2', status_id: 'status-5', title: 'ユニットテストを書く', scheduled_date: '2026-03-16', sort_order: 1 },
    { id: 'task-6', list_id: 'list-2', status_id: 'status-6', title: 'CI/CD パイプラインの設定', scheduled_date: '2026-03-15', sort_order: 2 },
    { id: 'task-7', list_id: 'list-3', status_id: 'status-7', title: '歯医者の予約を取る', scheduled_date: '2026-03-20', sort_order: 0 },
    { id: 'task-8', list_id: 'list-3', status_id: 'status-9', title: '本を返却する', scheduled_date: '2026-03-14', sort_order: 1 },
  ])

  const selectedListId = useState('selected-list-id', () => 'list-1')
  const viewMode = useState<'list' | 'date'>('view-mode', () => 'list')

  const selectedList = computed(() =>
    lists.value.find(l => l.id === selectedListId.value)!,
  )

  const filteredTasks = computed(() =>
    tasks.value.filter(t => t.list_id === selectedListId.value),
  )

  const getStatus = (statusId: string) =>
    statuses.value.find(s => s.id === statusId)

  const taskCount = (listId: string) =>
    tasks.value.filter(t => t.list_id === listId).length

  const todayStr = computed(() => toDateStr(new Date()))

  const tomorrowStr = computed(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return toDateStr(d)
  })

  const todayCount = computed(() =>
    tasks.value.filter(t => t.scheduled_date === todayStr.value).length,
  )

  const tomorrowCount = computed(() =>
    tasks.value.filter(t => t.scheduled_date === tomorrowStr.value).length,
  )

  const isToday = (date: string | null) => date === todayStr.value

  const formatDate = (date: string | null) => {
    if (!date) return ''
    const d = new Date(date + 'T00:00:00')
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  const addTask = (title: string) => {
    const defaultStatus = statuses.value.find(
      s => s.list_id === selectedListId.value && s.category === 'TODO',
    )
    tasks.value.push({
      id: `task-${Date.now()}`,
      list_id: selectedListId.value,
      status_id: defaultStatus?.id || '',
      title,
      scheduled_date: null,
      sort_order: filteredTasks.value.length,
    })
  }

  const scheduleTask = (taskId: string, date: string) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) task.scheduled_date = date
  }

  return {
    lists,
    statuses,
    tasks,
    selectedListId,
    viewMode,
    selectedList,
    filteredTasks,
    getStatus,
    taskCount,
    todayStr,
    tomorrowStr,
    todayCount,
    tomorrowCount,
    isToday,
    formatDate,
    addTask,
    scheduleTask,
  }
}
