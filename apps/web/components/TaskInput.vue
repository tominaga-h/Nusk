<script setup lang="ts">
import { Calendar } from 'lucide-vue-next'

const emit = defineEmits<{
  add: [payload: { title: string, scheduledDate: string | null }]
}>()

const title = ref('')
const scheduledDate = ref<string | null>(null)
const dateInput = ref<HTMLInputElement | null>(null)

function submit() {
  const trimmed = title.value.trim()
  if (!trimmed) return
  emit('add', {
    title: trimmed,
    scheduledDate: scheduledDate.value,
  })
  title.value = ''
  scheduledDate.value = null
}

function openDatePicker() {
  dateInput.value?.showPicker()
}

function onDateChange(event: Event) {
  const target = event.target as HTMLInputElement
  scheduledDate.value = target.value || null
}

function clearScheduledDate() {
  scheduledDate.value = null
  if (dateInput.value) {
    dateInput.value.value = ''
  }
}
</script>

<template>
  <form class="task-input" @submit.prevent="submit">
    <div class="task-input__checkbox">
      <div class="task-input__checkbox-inner" />
    </div>
    <input
      v-model="title"
      class="task-input__field"
      type="text"
      placeholder="タスク名を入力してEnterで追加（任意で日付）"
    />
    <div class="task-input__actions">
      <input
        ref="dateInput"
        class="task-input__date-native"
        type="date"
        :value="scheduledDate ?? ''"
        @change="onDateChange"
      >
      <button
        type="button"
        class="task-input__icon-btn"
        :class="{ 'task-input__icon-btn--active': !!scheduledDate }"
        title="着手予定日を選択"
        aria-label="着手予定日を選択"
        @click="openDatePicker"
      >
        <Calendar :size="18" :stroke-width="1.3" />
      </button>
      <button
        v-if="scheduledDate"
        type="button"
        class="task-input__date-chip"
        title="設定した日付を解除"
        @click="clearScheduledDate"
      >
        {{ scheduledDate }} ×
      </button>
      <button type="submit" class="task-input__submit">
        追加
      </button>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.task-input {
  display: flex;
  align-items: center;
  gap: spacing(4);
  padding: 17px;
  background: color('surface');
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: radius('lg');
  box-shadow: shadow('elevated');
  position: relative;

  &__checkbox {
    width: 20px;
    height: 20px;
    border: 2px dashed color('text-disabled');
    border-radius: radius('sm');
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__checkbox-inner {
    width: 8px;
    height: 8px;
    border-radius: radius('pill');
  }

  &__field {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: $font-family-base;
    font-size: font-size('md');
    color: color('text');

    &::placeholder {
      color: color('text-secondary');
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: spacing(3);
    flex-shrink: 0;
  }

  &__date-native {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
  }

  &__icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: spacing(1);
    background: none;
    border: none;
    cursor: pointer;
    color: color('text-secondary');
    transition: color $transition-fast;

    &:hover {
      color: color('text');
    }

    &--active {
      color: color('primary');
    }
  }

  &__date-chip {
    padding: 5px 9px;
    border: 1px solid color('border');
    border-radius: radius('pill');
    background: color('bg');
    font-family: $font-family-base;
    font-size: font-size('base-sm');
    color: color('text-secondary');
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      border-color: color('text-disabled');
      color: color('text');
    }
  }

  &__submit {
    @include btn-primary;
    padding: spacing(2) spacing(5);
    font-size: font-size('base');
    font-weight: font-weight('bold');
  }
}
</style>
