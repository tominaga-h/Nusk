<script setup lang="ts">
import { List, Calendar } from 'lucide-vue-next'
import type { Status, UpdateTaskPayload } from '@nusk/shared'
import { ViewMode } from '~/composables/task-store/types'
const route = useRoute()

const {
  loading,
  viewMode,
  lists,
  statuses,
  selectedList,
  selectedListId,
  todayStr,
  tomorrowStr,
  tasks,
  filteredTasks,
  dateGroupedTasks,
  dateViewTotalCount,
  getStatus,
  addTask,
  scheduleTask,
  updateTask,
  completeTask,
  switchToDateView,
  switchToListView,
  syncFromRoute,
} = useTaskStore()

const { showToast } = useToast()

const isListView = computed(() => viewMode.value === ViewMode.LIST);
const isDateView = computed(() => viewMode.value === ViewMode.DATE);
const editingTaskId = ref<string | null>(null)
const isSavingEdit = ref(false)
const editingTask = computed(() =>
  tasks.value.find(task => task.id === editingTaskId.value) ?? null,
)

const listViewTitle = computed(() => {
  if (!selectedList.value) return ''
  return selectedList.value.is_inbox ? 'Inbox' : selectedList.value.name
})
const totalVisibleCount = computed(() =>
  viewMode.value === ViewMode.DATE ? dateViewTotalCount.value : filteredTasks.value.length,
)

/**
 * タスク追加ハンドラ: API経由で追加し、Toast で通知
 */
async function handleAddTask(payload: { title: string, scheduledDate: string | null }) {
  await addTask(payload.title, payload.scheduledDate)
  showToast(`「${payload.title}」を追加しました`)
}

/**
 * スケジュール変更ハンドラ: 着手予定日を更新し、Toast で通知
 */
async function handleSchedule(taskId: string, targetDate: string, previousDate: string | null, taskTitle: string) {
  if (previousDate === targetDate) return
  await scheduleTask(taskId, targetDate)
  const targetLabel = targetDate === todayStr.value ? '今日' : '明日'
  showToast(`「${taskTitle}」を${targetLabel}に移動しました`)
}

/**
 * 完了トグルハンドラ: 完了/未完了を切り替え、Toast で通知
 */
async function handleComplete(taskId: string) {
  const task = tasks.value.find(t => t.id === taskId)
  if (!task) return
  const currentStatus = getStatus(task.status_id)
  const wasDone = currentStatus?.category === 'DONE'
  await completeTask(taskId)
  showToast(wasDone ? `「${task.title}」を未完了に戻しました` : `「${task.title}」を完了しました`)
}

/**
 * 編集対象タスクを選択して編集パネルを開く。
 */
function handleEdit(taskId: string) {
  editingTaskId.value = taskId
}

/**
 * 編集パネルを閉じる（保存中は閉じない）。
 */
function handleCloseEditPanel() {
  if (isSavingEdit.value) return
  editingTaskId.value = null
}

/**
 * 指定リストで選択可能なステータスを返す。
 * リスト専用 + グローバル（list_id === null）を対象にする。
 */
function getSelectableStatuses(listId: string): Status[] {
  return statuses.value.filter(status =>
    status.list_id === listId || status.list_id === null,
  )
}

/**
 * リスト変更時の status_id 補正ルール。
 * 1) 新リストTODO 2) グローバルTODO 3) 候補先頭
 */
function resolveStatusIdForList(listId: string): string {
  const candidates = getSelectableStatuses(listId)
  if (candidates.length === 0) return ''

  const listTodo = candidates.find(status =>
    status.list_id === listId && status.category === 'TODO',
  )
  if (listTodo) return listTodo.id

  const globalTodo = candidates.find(status =>
    status.list_id === null && status.category === 'TODO',
  )
  if (globalTodo) return globalTodo.id

  return candidates[0].id
}

/**
 * 編集パネル保存ハンドラ。
 * 保存時に list/status の整合性を補正し、成功時のみパネルを閉じる。
 */
async function handleUpdateTask(event: { taskId: string, payload: UpdateTaskPayload }) {
  const currentTask = tasks.value.find(task => task.id === event.taskId)
  if (!currentTask) return

  const trimmedTitle = event.payload.title?.trim() ?? ''
  if (!trimmedTitle) {
    showToast('タイトルを入力してください')
    return
  }

  const nextListId = event.payload.list_id ?? currentTask.list_id
  const selectableStatuses = getSelectableStatuses(nextListId)
  if (selectableStatuses.length === 0) {
    showToast('このリストで選択できるステータスがありません')
    return
  }

  const currentStatusId = event.payload.status_id ?? currentTask.status_id
  const normalizedStatusId = selectableStatuses.some(status => status.id === currentStatusId)
    ? currentStatusId
    : resolveStatusIdForList(nextListId)

  if (!normalizedStatusId) {
    showToast('有効なステータスが見つかりませんでした')
    return
  }

  isSavingEdit.value = true
  try {
    await updateTask(event.taskId, {
      ...event.payload,
      title: trimmedTitle,
      list_id: nextListId,
      status_id: normalizedStatusId,
    })
    showToast(`「${trimmedTitle}」を更新しました`)
    editingTaskId.value = null
  } catch {
    showToast('タスクの更新に失敗しました')
  } finally {
    isSavingEdit.value = false
  }
}

/**
 * URLクエリパラメータの変更を監視し、ストアステートを同期する。
 * immediate: true で初回ロード時にもURLからステートを復元する。
 */
watch(() => route.query, (query) => {
  syncFromRoute(query as Record<string, string>)
}, { immediate: true })
</script>

<template>
  <div class="tasks">
    <div v-if="loading" class="tasks__loading">読み込み中...</div>

    <template v-else>
    <header class="tasks__header">
      <div class="tasks__title-row">
        <!-- リストビュー: リスト名、日付ビュー: "今後のタスク N件" -->
        <h2 class="tasks__title">
          {{ viewMode === ViewMode.DATE ? '今後のタスク' : listViewTitle }}
        </h2>
        <span class="tasks__count-badge">
          {{ totalVisibleCount }}件
        </span>
      </div>
      <div class="tasks__view-toggle">
        <button
          class="tasks__view-btn"
          :class="{ 'tasks__view-btn--active': isListView }"
          @click="switchToListView(selectedListId)"
        >
          <List :size="16" :stroke-width="1.3" />
          リスト
        </button>
        <button
          class="tasks__view-btn"
          :class="{ 'tasks__view-btn--active': isDateView }"
          @click="switchToDateView()"
        >
          <Calendar :size="16" :stroke-width="1.3" />
          日付
        </button>
      </div>
    </header>

    <div class="tasks__body">
      <div class="tasks__content">
        <!-- タスク入力フォーム -->
        <TaskInput @add="handleAddTask" />

        <!-- フィルターバー -->
        <TaskFilterBar
          :hide-due-filter="viewMode === ViewMode.DATE"
        />

        <!-- リストビュー: フラットなタスク一覧 -->
        <div v-if="isListView" class="tasks__list">
          <TaskItem
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            :status-name="getStatus(task.status_id)?.name ?? ''"
            :status-category="getStatus(task.status_id)?.category ?? 'TODO'"
            @complete="handleComplete(task.id)"
            @edit="handleEdit(task.id)"
            @schedule-today="handleSchedule(task.id, todayStr, task.scheduled_date, task.title)"
            @schedule-tomorrow="handleSchedule(task.id, tomorrowStr, task.scheduled_date, task.title)"
          />
          <div v-if="filteredTasks.length === 0" class="tasks__empty">
            タスクがありません
          </div>
        </div>

        <!-- 日付ビュー: グループごとのタスク一覧 -->
        <div v-else class="tasks__date-groups">
          <TaskDateSection
            v-for="group in dateGroupedTasks"
            :key="group.key"
            :group-key="group.key"
            :label="group.label"
            :tasks="group.tasks"
            @edit-task="handleEdit"
            @schedule-task="handleSchedule"
          />
        </div>
      </div>
    </div>
    <TaskEditPanel
      :task="editingTask"
      :lists="lists"
      :statuses="statuses"
      :is-saving="isSavingEdit"
      @save="handleUpdateTask"
      @close="handleCloseEditPanel"
    />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.tasks {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    display: flex;
    flex-direction: column;
    gap: spacing(6);
    padding: spacing(8) spacing(10) spacing(4);
    background: color('bg');
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: spacing(2);
  }

  &__title {
    margin: 0;
    font-size: font-size('lg');
    font-weight: font-weight('bold');
    color: color('text');
  }

  &__count-badge {
    font-size: font-size('base');
    font-weight: font-weight('regular');
    color: color('text-secondary');
    padding: spacing(1) spacing(2);
    background: color('border-light');
    border-radius: radius('sm');
  }

  &__view-toggle {
    display: flex;
    gap: spacing(2);
  }

  &__view-btn {
    @include btn-base;
    gap: spacing(2);
    padding: 7px spacing(4);
    font-size: font-size('base');
    font-weight: font-weight('medium');
    background: color('surface');
    border: 1px solid color('border');
    border-radius: radius('md');
    color: color('text');
    box-shadow: shadow('subtle');

    &--active {
      background: color('primary');
      color: color('surface');
      border-color: color('primary');
      box-shadow: shadow('subtle');
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: spacing(4) spacing(10);
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: spacing(4);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: spacing(3);
  }

  &__date-groups {
    display: flex;
    flex-direction: column;
    gap: spacing(6);
  }

  &__empty {
    text-align: center;
    padding: spacing(12) 0;
    color: color('text-secondary');
    font-size: font-size('base');
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: color('text-secondary');
    font-size: font-size('md');
  }

}
</style>
