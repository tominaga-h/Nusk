<script setup lang="ts">
import { Calendar, GripVertical } from 'lucide-vue-next'
import type { Task } from '@nusk/shared'

const props = withDefaults(defineProps<{
  task: Task
  statusName: string
  statusCategory: 'TODO' | 'IN_PROGRESS' | 'DONE'
  /** 所属リスト名（日付ビューで表示。未指定時は非表示） */
  listName?: string
  /** trueの場合「今日やる」ボタンを非表示（日付ビュー: 今日グループ用） */
  hideScheduleToday?: boolean
  /** trueの場合「明日やる」ボタンを非表示（日付ビュー: 明日グループ用） */
  hideScheduleTomorrow?: boolean
}>(), {
  listName: undefined,
  hideScheduleToday: false,
  hideScheduleTomorrow: false,
})

defineEmits<{
  'complete': []
  'schedule-today': []
  'schedule-tomorrow': []
}>()

const { isToday, formatDate, isDraggingTask } = useTaskStore()

/** ドラッグ中フラグ（自身の半透明表示に使用） */
const isDragging = ref(false)

/**
 * ドラッグ開始: dataTransfer にタスクIDをセットし、グローバルのドラッグ状態を有効化
 */
function onDragStart(event: DragEvent) {
  if (!event.dataTransfer) return
  event.dataTransfer.setData('application/x-task-id', props.task.id)
  event.dataTransfer.effectAllowed = 'move'
  isDragging.value = true
  isDraggingTask.value = true
}

/**
 * ドラッグ終了: ドラッグ状態をリセット
 */
function onDragEnd() {
  isDragging.value = false
  isDraggingTask.value = false
}

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
  <article
    class="task-item"
    :class="{ 'task-item--dragging': isDragging }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="task-item__content">
      <!-- ホバー時に表示されるドラッグハンドル -->
      <GripVertical class="task-item__grip" :size="16" :stroke-width="1.5" />
      <input
        type="checkbox"
        class="task-item__check"
        :class="{ 'task-item__check--done': statusCategory === 'DONE' }"
        :checked="statusCategory === 'DONE'"
        @change="$emit('complete')"
      />
      <div class="task-item__info">
        <span
          class="task-item__title"
          :class="{ 'task-item__title--done': statusCategory === 'DONE' }"
        >{{ task.title }}</span>
        <!-- リスト名バッジ（日付ビュー時のみ親から渡される） -->
        <span v-if="listName" class="task-item__list-name">{{ listName }}</span>
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
    <div v-if="!hideScheduleToday || !hideScheduleTomorrow" class="task-item__actions">
      <button
        v-if="!hideScheduleToday"
        class="task-item__action-btn"
        @click="$emit('schedule-today')"
      >
        今日やる
      </button>
      <button
        v-if="!hideScheduleTomorrow"
        class="task-item__action-btn"
        @click="$emit('schedule-tomorrow')"
      >
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

  &--dragging {
    opacity: 0.4;
  }

  &__grip {
    color: color('text-disabled');
    flex-shrink: 0;
    cursor: grab;
    opacity: 0;
    transition: opacity $transition-fast;
  }

  &:hover &__grip {
    opacity: 1;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: spacing(4);
    flex: 1;
    min-width: 0;
  }

  &__check {
    appearance: none;
    margin: 0;
    padding: 0;
    cursor: pointer;
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

  &__list-name {
    flex-shrink: 0;
    @include status-badge(color('border-light'), color('text-secondary'));
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
