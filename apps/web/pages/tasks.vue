<script setup lang="ts">
import { List, Calendar } from 'lucide-vue-next'

const {
  loading,
  viewMode,
  selectedList,
  selectedDateGroup,
  filteredTasks,
  dateGroupedTasks,
  dateViewTotalCount,
  getStatus,
  todayStr,
  tomorrowStr,
  addTask,
  scheduleTask,
  completeTask,
  switchToDateView,
} = useTaskStore()

/**
 * selectedDateGroup の変更を監視し、日付ビュー時に該当セクションへスクロールする。
 * DOM描画完了後（nextTick）にスクロールを実行する。
 */
watch(selectedDateGroup, (group) => {
  if (viewMode.value !== 'date') return
  nextTick(() => {
    document
      .getElementById(`date-section-${group}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
})
</script>

<template>
  <div class="tasks">
    <div v-if="loading" class="tasks__loading">読み込み中...</div>

    <template v-else>
    <header class="tasks__header">
      <div class="tasks__title-row">
        <!-- リストビュー: リスト名、日付ビュー: "今後のタスク N件" -->
        <h2 class="tasks__title">
          {{ viewMode === 'date' ? '今後のタスク' : selectedList?.name }}
        </h2>
        <span v-if="viewMode === 'date'" class="tasks__count-badge">
          {{ dateViewTotalCount }}件
        </span>
      </div>
      <div class="tasks__view-toggle">
        <button
          class="tasks__view-btn"
          :class="{ 'tasks__view-btn--active': viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          <List :size="16" :stroke-width="1.3" />
          リスト
        </button>
        <button
          class="tasks__view-btn"
          :class="{ 'tasks__view-btn--active': viewMode === 'date' }"
          @click="switchToDateView()"
        >
          <Calendar :size="16" :stroke-width="1.3" />
          日付
        </button>
      </div>
    </header>

    <div class="tasks__body">
      <div class="tasks__content">
        <TaskInput @add="addTask" />
        <TaskFilterBar
          :count="viewMode === 'date' ? dateViewTotalCount : filteredTasks.length"
          :hide-due-filter="viewMode === 'date'"
        />

        <!-- リストビュー: フラットなタスク一覧 -->
        <div v-if="viewMode === 'list'" class="tasks__list">
          <TaskItem
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            :status-name="getStatus(task.status_id)?.name ?? ''"
            :status-category="getStatus(task.status_id)?.category ?? 'TODO'"
            @complete="completeTask(task.id)"
            @schedule-today="scheduleTask(task.id, todayStr)"
            @schedule-tomorrow="scheduleTask(task.id, tomorrowStr)"
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
          />
        </div>
      </div>
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
}
</style>
