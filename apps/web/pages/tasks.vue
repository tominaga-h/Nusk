<script setup lang="ts">
import { List, Calendar } from 'lucide-vue-next'
import { ViewMode } from '~/composables/task-store/types'
const route = useRoute()

const {
  loading,
  viewMode,
  selectedList,
  selectedListId,
  todayStr,
  tomorrowStr,
  filteredTasks,
  dateGroupedTasks,
  dateViewTotalCount,
  getStatus,
  addTask,
  scheduleTask,
  completeTask,
  switchToDateView,
  switchToListView,
  syncFromRoute,
} = useTaskStore()

const isListView = computed(() => viewMode.value === ViewMode.LIST);
const isDateView = computed(() => viewMode.value === ViewMode.DATE);
const listViewTitle = computed(() => {
  if (!selectedList.value) return ''
  return selectedList.value.is_inbox ? 'Inbox' : selectedList.value.name
})
const totalVisibleCount = computed(() =>
  viewMode.value === ViewMode.DATE ? dateViewTotalCount.value : filteredTasks.value.length,
)

const undoTaskId = ref<string | null>(null)
const undoPrevDate = ref<string | null>(null)
const undoMessage = ref('')
const showUndo = ref(false)
const undoTimer = ref<ReturnType<typeof setTimeout> | null>(null)

function handleAddTask(payload: { title: string, scheduledDate: string | null }) {
  addTask(payload.title, payload.scheduledDate)
}

function clearUndoTimer() {
  if (!undoTimer.value) return
  clearTimeout(undoTimer.value)
  undoTimer.value = null
}

function openUndoToast(message: string, taskId: string, previousDate: string | null) {
  clearUndoTimer()
  undoMessage.value = message
  undoTaskId.value = taskId
  undoPrevDate.value = previousDate
  showUndo.value = true
  undoTimer.value = setTimeout(() => {
    showUndo.value = false
    undoTaskId.value = null
    undoPrevDate.value = null
    undoMessage.value = ''
    undoTimer.value = null
  }, 5000)
}

async function scheduleWithUndo(taskId: string, targetDate: string, previousDate: string | null, taskTitle: string) {
  if (previousDate === targetDate) return
  await scheduleTask(taskId, targetDate)
  const targetLabel = targetDate === todayStr.value ? '今日' : '明日'
  openUndoToast(`「${taskTitle}」を${targetLabel}に移動しました`, taskId, previousDate)
}

async function undoSchedule() {
  if (!undoTaskId.value) return
  await scheduleTask(undoTaskId.value, undoPrevDate.value)
  clearUndoTimer()
  showUndo.value = false
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
            @complete="completeTask(task.id)"
            @schedule-today="scheduleWithUndo(task.id, todayStr, task.scheduled_date, task.title)"
            @schedule-tomorrow="scheduleWithUndo(task.id, tomorrowStr, task.scheduled_date, task.title)"
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
            @schedule-task="scheduleWithUndo"
          />
        </div>
      </div>
    </div>
    <div v-if="showUndo" class="tasks__undo-toast">
      <span class="tasks__undo-message">{{ undoMessage }}</span>
      <button class="tasks__undo-btn" @click="undoSchedule">
        元に戻す
      </button>
    </div>
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

  &__undo-toast {
    position: fixed;
    right: spacing(8);
    bottom: spacing(8);
    z-index: 20;
    display: flex;
    align-items: center;
    gap: spacing(3);
    padding: spacing(3) spacing(4);
    border: 1px solid color('border');
    border-radius: radius('md');
    background: color('surface');
    box-shadow: shadow('elevated');
  }

  &__undo-message {
    font-size: font-size('base');
    color: color('text');
  }

  &__undo-btn {
    @include btn-ghost;
    padding: spacing(1) spacing(2);
    color: color('primary');
    font-weight: font-weight('bold');
  }
}
</style>
