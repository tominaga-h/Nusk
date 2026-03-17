<script setup lang="ts">
import type { List, Status, Task, UpdateTaskPayload } from '@nusk/shared'

const props = withDefaults(defineProps<{
  task: Task | null
  lists: List[]
  statuses: Status[]
  isSaving?: boolean
}>(), {
  isSaving: false,
})

const emit = defineEmits<{
  save: [payload: { taskId: string, payload: UpdateTaskPayload }]
  close: []
}>()

const titleInput = ref<HTMLInputElement | null>(null)
const formTitle = ref('')
const formListId = ref('')
const formStatusId = ref('')
const formScheduledDate = ref('')

/**
 * 選択中リストで利用可能なステータスだけを表示する。
 * グローバルステータス（list_id === null）も候補に含める。
 */
const selectableStatuses = computed(() =>
  props.statuses.filter(status =>
    status.list_id === formListId.value || status.list_id === null,
  ),
)

/**
 * リスト変更時に現在の status_id が無効なら、優先順で安全に補正する。
 * 1) 新リストの TODO 2) グローバル TODO 3) 候補先頭
 */
function resolveFallbackStatusId(nextListId: string): string {
  const candidates = props.statuses.filter(status =>
    status.list_id === nextListId || status.list_id === null,
  )
  if (candidates.length === 0) return ''

  const listTodo = candidates.find(status =>
    status.list_id === nextListId && status.category === 'TODO',
  )
  if (listTodo) return listTodo.id

  const globalTodo = candidates.find(status =>
    status.list_id === null && status.category === 'TODO',
  )
  if (globalTodo) return globalTodo.id

  return candidates[0].id
}

function syncForm(task: Task | null) {
  if (!task) return
  formTitle.value = task.title
  formListId.value = task.list_id
  formStatusId.value = task.status_id
  formScheduledDate.value = task.scheduled_date ?? ''

  const isCurrentStatusValid = props.statuses.some(status =>
    status.id === formStatusId.value
    && (status.list_id === formListId.value || status.list_id === null),
  )
  if (!isCurrentStatusValid) {
    formStatusId.value = resolveFallbackStatusId(formListId.value)
  }

  nextTick(() => {
    titleInput.value?.focus()
    titleInput.value?.select()
  })
}

watch(() => props.task, task => syncForm(task), { immediate: true })

watch(formListId, (nextListId) => {
  if (!nextListId) return
  const isCurrentStatusValid = selectableStatuses.value.some(status => status.id === formStatusId.value)
  if (!isCurrentStatusValid) {
    formStatusId.value = resolveFallbackStatusId(nextListId)
  }
})

const canSave = computed(() =>
  !!props.task
  && !props.isSaving
  && !!formListId.value
  && !!formStatusId.value
  && formTitle.value.trim().length > 0,
)

function toListLabel(list: List): string {
  if (list.is_inbox) return 'Inbox'
  return list.name
}

function handleSave() {
  if (!props.task) return
  const trimmedTitle = formTitle.value.trim()
  if (!trimmedTitle) return

  emit('save', {
    taskId: props.task.id,
    payload: {
      title: trimmedTitle,
      list_id: formListId.value,
      status_id: formStatusId.value,
      scheduled_date: formScheduledDate.value || null,
    },
  })
}

function handleClose() {
  if (props.isSaving) return
  emit('close')
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target !== event.currentTarget) return
  handleClose()
}

function handleEscKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.task) return
  handleClose()
}

onMounted(() => {
  window.addEventListener('keydown', handleEscKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="task-edit-panel-fade">
      <div
        v-if="task"
        class="task-edit-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-edit-panel-title"
        @click="handleBackdropClick"
      >
        <Transition name="task-edit-panel-slide">
          <aside v-if="task" class="task-edit-panel__panel">
            <header class="task-edit-panel__header">
              <h3 id="task-edit-panel-title" class="task-edit-panel__title">
                タスクを編集
              </h3>
              <button
                type="button"
                class="task-edit-panel__close-btn"
                :disabled="isSaving"
                aria-label="編集パネルを閉じる"
                @click="handleClose"
              >
                ×
              </button>
            </header>

            <div class="task-edit-panel__body">
              <label class="task-edit-panel__field">
                <span class="task-edit-panel__label">タイトル</span>
                <input
                  ref="titleInput"
                  v-model="formTitle"
                  class="task-edit-panel__input"
                  type="text"
                  placeholder="タスク名を入力"
                  :disabled="isSaving"
                >
              </label>

              <label class="task-edit-panel__field">
                <span class="task-edit-panel__label">リスト</span>
                <select
                  v-model="formListId"
                  class="task-edit-panel__select"
                  :disabled="isSaving"
                >
                  <option v-for="list in lists" :key="list.id" :value="list.id">
                    {{ toListLabel(list) }}
                  </option>
                </select>
              </label>

              <label class="task-edit-panel__field">
                <span class="task-edit-panel__label">ステータス</span>
                <select
                  v-model="formStatusId"
                  class="task-edit-panel__select"
                  :disabled="isSaving || selectableStatuses.length === 0"
                >
                  <option v-for="status in selectableStatuses" :key="status.id" :value="status.id">
                    {{ status.name }}
                  </option>
                </select>
              </label>

              <label class="task-edit-panel__field">
                <span class="task-edit-panel__label">着手予定日</span>
                <input
                  v-model="formScheduledDate"
                  class="task-edit-panel__input"
                  type="date"
                  :disabled="isSaving"
                >
              </label>
            </div>

            <footer class="task-edit-panel__footer">
              <button
                type="button"
                class="task-edit-panel__cancel-btn"
                :disabled="isSaving"
                @click="handleClose"
              >
                キャンセル
              </button>
              <button
                type="button"
                class="task-edit-panel__save-btn"
                :disabled="!canSave"
                @click="handleSave"
              >
                {{ isSaving ? '保存中...' : '保存する' }}
              </button>
            </footer>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.task-edit-panel {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.24);
  z-index: 100;
  display: flex;
  justify-content: flex-end;

  &__panel {
    width: 50%;
    min-width: 420px;
    height: 100%;
    background: color('surface');
    border-left: 1px solid color('border-light');
    box-shadow: shadow('elevated');
    display: flex;
    flex-direction: column;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: spacing(5) spacing(6);
    border-bottom: 1px solid color('border-light');
  }

  &__title {
    margin: 0;
    font-size: font-size('md');
    font-weight: font-weight('bold');
    color: color('text');
  }

  &__close-btn {
    @include btn-ghost;
    width: 32px;
    height: 32px;
    border-radius: radius('pill');
    font-size: font-size('md');
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: spacing(6);
    display: flex;
    flex-direction: column;
    gap: spacing(5);
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: spacing(2);
  }

  &__label {
    font-size: font-size('base-sm');
    font-weight: font-weight('bold');
    color: color('text-secondary');
  }

  &__input,
  &__select {
    width: 100%;
    height: 40px;
    padding: 0 spacing(3);
    border: 1px solid color('border');
    border-radius: radius('md');
    background: color('surface');
    color: color('text');
    font-family: $font-family-base;
    font-size: font-size('base');
    transition: border-color $transition-fast, box-shadow $transition-fast;

    &:focus {
      outline: none;
      border-color: color('primary');
      box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15);
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: spacing(3);
    padding: spacing(4) spacing(6);
    border-top: 1px solid color('border-light');
    background: color('surface');
  }

  &__cancel-btn {
    @include btn-secondary;
    min-width: 120px;
    height: 40px;
  }

  &__save-btn {
    @include btn-primary;
    min-width: 120px;
    height: 40px;
  }
}

.task-edit-panel-fade-enter-active,
.task-edit-panel-fade-leave-active {
  transition: opacity $transition-fast;
}

.task-edit-panel-fade-enter-from,
.task-edit-panel-fade-leave-to {
  opacity: 0;
}

.task-edit-panel-slide-enter-active,
.task-edit-panel-slide-leave-active {
  transition: transform 0.2s ease;
}

.task-edit-panel-slide-enter-from,
.task-edit-panel-slide-leave-to {
  transform: translateX(100%);
}

@media (max-width: 1024px) {
  .task-edit-panel {
    &__panel {
      width: 100%;
      min-width: 0;
    }
  }
}
</style>
