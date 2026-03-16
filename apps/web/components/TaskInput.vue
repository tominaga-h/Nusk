<script setup lang="ts">
const emit = defineEmits<{
  add: [title: string]
}>()

const title = ref('')

function submit() {
  const trimmed = title.value.trim()
  if (!trimmed) return
  emit('add', trimmed)
  title.value = ''
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
      placeholder="新しいタスクを追加..."
    />
    <div class="task-input__actions">
      <button type="button" class="task-input__icon-btn">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M5.5 1.5V4M12.5 1.5V4M1 7H17M2.5 3H15.5C16.0523 3 16.5 3.44772 16.5 4V15.5C16.5 16.0523 16.0523 16.5 15.5 16.5H2.5C1.94772 16.5 1.5 16.0523 1.5 15.5V4C1.5 3.44772 1.94772 3 2.5 3Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
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
  }

  &__submit {
    @include btn-primary;
    padding: spacing(2) spacing(5);
    font-size: font-size('base');
    font-weight: font-weight('bold');
  }
}
</style>
