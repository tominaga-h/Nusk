<script setup lang="ts">
/**
 * 日付ビューの1グループ（セクション）を表示するコンポーネント
 *
 * 区切り線付きのグループラベルと、グループに属するタスク一覧を描画する。
 * タスクが0件の場合は「タスクはありません」を表示する。
 */
import type { Task } from '@nusk/shared'
import { DateGroup } from '~/composables/task-store/types'
import type { DateGroupKey } from '~/composables/task-store/types'

const props = defineProps<{
  /** グループのキー（overdue/today/tomorrow/upcoming/undated） */
  groupKey: DateGroupKey
  /** グループのラベル（例: "今日 (3月17日)"） */
  label: string
  /** グループに属するタスク配列 */
  tasks: Task[]
}>()

const emit = defineEmits<{
  'schedule-task': [taskId: string, targetDate: string, previousDate: string | null, taskTitle: string]
  'edit-task': [taskId: string]
}>()

const {
  lists,
  getStatus,
  todayStr,
  tomorrowStr,
  completeTask,
} = useTaskStore()

const { showToast } = useToast()

/**
 * 完了トグルハンドラ: 完了/未完了を切り替え、Toast で通知
 */
async function handleComplete(task: Task) {
  const currentStatus = getStatus(task.status_id)
  const wasDone = currentStatus?.category === 'DONE'
  await completeTask(task.id)
  showToast(wasDone ? `「${task.title}」を未完了に戻しました` : `「${task.title}」を完了しました`)
}

/** task.list_id から所属リスト名を引く */
function getListName(listId: string) {
  const list = lists.value.find(l => l.id === listId)
  if (!list) return ''
  if (list.is_inbox) return 'Inbox'
  return list.name
}

/** グループキーに応じて「今日やる」ボタンを非表示にするか */
const hideScheduleToday = computed(() => props.groupKey === DateGroup.TODAY)

/** グループキーに応じて「明日やる」ボタンを非表示にするか */
const hideScheduleTomorrow = computed(() => props.groupKey === DateGroup.TOMORROW)
</script>

<template>
  <section class="date-section">
    <!-- 区切り線 + グループラベル -->
    <div class="date-section__header">
      <span class="date-section__label">{{ label }}</span>
      <span class="date-section__line" />
    </div>

    <!-- タスク一覧 -->
    <div v-if="tasks.length > 0" class="date-section__list">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :list-name="getListName(task.list_id)"
        :status-name="getStatus(task.status_id)?.name ?? ''"
        :status-category="getStatus(task.status_id)?.category ?? 'TODO'"
        :hide-schedule-today="hideScheduleToday"
        :hide-schedule-tomorrow="hideScheduleTomorrow"
        @complete="handleComplete(task)"
        @edit="emit('edit-task', task.id)"
        @schedule-today="emit('schedule-task', task.id, todayStr, task.scheduled_date, task.title)"
        @schedule-tomorrow="emit('schedule-task', task.id, tomorrowStr, task.scheduled_date, task.title)"
      />
    </div>

    <!-- 空状態 -->
    <div v-else class="date-section__empty">
      タスクはありません
    </div>
  </section>
</template>

<style lang="scss" scoped>
.date-section {
  display: flex;
  flex-direction: column;
  gap: spacing(3);

  &__header {
    display: flex;
    align-items: center;
    gap: spacing(3);
  }

  &__label {
    font-size: font-size('base');
    font-weight: font-weight('medium');
    color: color('text-secondary');
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__line {
    flex: 1;
    height: 1px;
    background: color('border');
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: spacing(3);
  }

  &__empty {
    text-align: center;
    padding: spacing(4) 0;
    color: color('text-disabled');
    font-size: font-size('base');
  }
}
</style>
