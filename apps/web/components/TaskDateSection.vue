<script setup lang="ts">
/**
 * 日付ビューの1グループ（セクション）を表示するコンポーネント
 *
 * 区切り線付きのグループラベルと、グループに属するタスク一覧を描画する。
 * タスクが0件の場合は「タスクはありません」を表示する。
 */
import type { Task } from '@nusk/shared'
import type { DateGroupKey } from '~/composables/useTaskStore'

const props = defineProps<{
  /** グループのキー（today/tomorrow/laterThisWeek/undated） */
  groupKey: DateGroupKey
  /** グループのラベル（例: "今日 (3/17)"） */
  label: string
  /** グループに属するタスク配列 */
  tasks: Task[]
}>()

const {
  getStatus,
  todayStr,
  tomorrowStr,
  scheduleTask,
  completeTask,
} = useTaskStore()

/** グループキーに応じて「今日やる」ボタンを非表示にするか */
const hideScheduleToday = computed(() => props.groupKey === 'today')

/** グループキーに応じて「明日やる」ボタンを非表示にするか */
const hideScheduleTomorrow = computed(() => props.groupKey === 'tomorrow')
</script>

<template>
  <section :id="'date-section-' + groupKey" class="date-section">
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
        :status-name="getStatus(task.status_id)?.name ?? ''"
        :status-category="getStatus(task.status_id)?.category ?? 'TODO'"
        :hide-schedule-today="hideScheduleToday"
        :hide-schedule-tomorrow="hideScheduleTomorrow"
        @complete="completeTask(task.id)"
        @schedule-today="scheduleTask(task.id, todayStr)"
        @schedule-tomorrow="scheduleTask(task.id, tomorrowStr)"
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
