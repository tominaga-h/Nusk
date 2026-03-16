<script setup lang="ts">
import { Calendar } from 'lucide-vue-next'
import type { Task } from '~/composables/useTaskStore'

const props = defineProps<{
  task: Task
  statusName: string
  statusCategory: 'TODO' | 'IN_PROGRESS' | 'DONE'
}>()

defineEmits<{
  'schedule-today': []
  'schedule-tomorrow': []
}>()

const { isToday, formatDate } = useTaskStore()

const dateDisplay = computed(() => {
  if (!props.task.scheduled_date) return { text: '日付なし', highlight: false }
  const formatted = formatDate(props.task.scheduled_date)
  if (isToday(props.task.scheduled_date)) {
    return { text: `${formatted}（今日）`, highlight: true }
  }
  return { text: formatted, highlight: false }
})
</script>

<template>
  <article class="task-item">
    <div class="task-item__content">
      <div
        class="task-item__check"
        :class="{ 'task-item__check--done': statusCategory === 'DONE' }"
      />
      <div class="task-item__info">
        <span
          class="task-item__title"
          :class="{ 'task-item__title--done': statusCategory === 'DONE' }"
        >{{ task.title }}</span>
        <span
          class="task-item__badge"
          :class="{
            'task-item__badge--todo': statusCategory === 'TODO',
            'task-item__badge--in-progress': statusCategory === 'IN_PROGRESS',
            'task-item__badge--done': statusCategory === 'DONE',
          }"
        >{{ statusName }}</span>
        <span
          class="task-item__date"
          :class="{ 'task-item__date--today': dateDisplay.highlight }"
        >
          <Calendar
            v-if="task.scheduled_date"
            class="task-item__date-icon"
            :size="14"
            :stroke-width="1.5"
          />
          {{ dateDisplay.text }}
        </span>
      </div>
    </div>
    <div class="task-item__actions">
      <button class="task-item__action-btn" @click="$emit('schedule-today')">
        今日やる
      </button>
      <button class="task-item__action-btn" @click="$emit('schedule-tomorrow')">
        明日やる
      </button>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: spacing(4);
  background: color('surface');
  border: 1px solid color('border-light');
  border-radius: radius('md');

  &__content {
    display: flex;
    align-items: center;
    gap: spacing(4);
    flex: 1;
    min-width: 0;
  }

  &__check {
    width: 20px;
    height: 20px;
    border: 1px solid color('text-disabled');
    border-radius: radius('sm');
    flex-shrink: 0;
    transition: all $transition-fast;

    &--done {
      background: color('status-green');
      border-color: color('status-green');
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 6px;
        width: 5px;
        height: 9px;
        border: solid color('surface');
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }

  &__info {
    display: flex;
    align-items: center;
    gap: spacing(3);
    flex: 1;
    min-width: 0;
  }

  &__title {
    @include typography('md', 'medium');
    color: color('text');
    white-space: nowrap;

    &--done {
      text-decoration: line-through;
      color: color('text-secondary');
    }
  }

  &__badge {
    flex-shrink: 0;

    &--todo {
      @include status-badge(color('border-light'), color('text-gray'));
    }

    &--in-progress {
      @include status-badge(color('status-blue-bg'), color('status-blue'));
    }

    &--done {
      @include status-badge(color('status-green-bg'), color('status-green'));
    }
  }

  &__date {
    display: flex;
    align-items: center;
    gap: spacing(1);
    font-size: font-size('base');
    color: color('text-secondary');
    white-space: nowrap;
    flex-shrink: 0;

    &--today {
      color: color('primary');
      font-weight: font-weight('medium');
    }
  }

  &__date-icon {
    flex-shrink: 0;
  }

  &__actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    margin-left: spacing(4);
  }

  &__action-btn {
    padding: 5px 13px;
    border: 1px solid color('border');
    border-radius: radius('md');
    background: transparent;
    font-family: $font-family-base;
    font-size: font-size('base-sm');
    color: color('text-secondary');
    cursor: pointer;
    white-space: nowrap;
    transition: all $transition-fast;

    &:hover {
      background: color('bg');
      border-color: color('text-disabled');
    }
  }
}
</style>
