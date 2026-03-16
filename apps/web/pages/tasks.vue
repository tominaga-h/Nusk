<script setup lang="ts">
const {
  viewMode,
  selectedList,
  filteredTasks,
  getStatus,
  todayStr,
  tomorrowStr,
  addTask,
  scheduleTask,
} = useTaskStore()
</script>

<template>
  <div class="tasks">
    <header class="tasks__header">
      <div class="tasks__title-row">
        <h2 class="tasks__title">{{ selectedList.name }}</h2>
        <span class="tasks__count-badge">{{ filteredTasks.length }}件のタスク</span>
      </div>
      <div class="tasks__view-toggle">
        <button
          class="tasks__view-btn"
          :class="{ 'tasks__view-btn--active': viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5.5 3H14M5.5 8H14M5.5 13H14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
            <circle cx="2.5" cy="3" r="1" fill="currentColor" />
            <circle cx="2.5" cy="8" r="1" fill="currentColor" />
            <circle cx="2.5" cy="13" r="1" fill="currentColor" />
          </svg>
          リスト
        </button>
        <button
          class="tasks__view-btn"
          :class="{ 'tasks__view-btn--active': viewMode === 'date' }"
          @click="viewMode = 'date'"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 1.5V3.5M11 1.5V3.5M1.5 6.5H14.5M2.5 3H13.5C14.0523 3 14.5 3.44772 14.5 4V14C14.5 14.5523 14.0523 15 13.5 15H2.5C1.94772 15 1.5 14.5523 1.5 14V4C1.5 3.44772 1.94772 3 2.5 3Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          日付
        </button>
      </div>
    </header>

    <div class="tasks__body">
      <div class="tasks__content">
        <TaskInput @add="addTask" />
        <TaskFilterBar />
        <div class="tasks__list">
          <TaskItem
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            :status-name="getStatus(task.status_id)?.name ?? ''"
            :status-category="getStatus(task.status_id)?.category ?? 'TODO'"
            @schedule-today="scheduleTask(task.id, todayStr)"
            @schedule-tomorrow="scheduleTask(task.id, tomorrowStr)"
          />
          <div v-if="filteredTasks.length === 0" class="tasks__empty">
            タスクがありません
          </div>
        </div>
      </div>
    </div>
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
    padding: 5px 9px;
    background: color('surface');
    border: 1px solid color('border');
    border-radius: radius('pill');
    font-size: font-size('base');
    color: color('text-secondary');
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

  &__empty {
    text-align: center;
    padding: spacing(12) 0;
    color: color('text-secondary');
    font-size: font-size('base');
  }
}
</style>
