<script setup lang="ts">
import { GripVertical, Plus, Pencil, Trash2, Settings, LayoutList, X } from 'lucide-vue-next'

definePageMeta({ layout: false })

const api = useApi()
const client = useSupabaseClient()
const user = useSupabaseUser()

const isInitialSetup = computed(() => !user.value?.user_metadata?.is_setup_complete)

interface ListItem {
  id: string
  name: string
  is_inbox: boolean
  sort_order: number
  isNew?: boolean
}

interface StatusItem {
  id: string
  name: string
  category: 'TODO' | 'IN_PROGRESS' | 'DONE'
  color: string
  sort_order: number
  isNew?: boolean
}

const lists = ref<ListItem[]>([])
const statuses = ref<StatusItem[]>([])
const saving = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)

const newListName = ref('')
const addingList = ref(false)
const newStatusName = ref('')
const newStatusCategory = ref<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO')
const newStatusColor = ref('#94a3b8')
const addingStatus = ref(false)

const editingListId = ref<string | null>(null)
const editingListName = ref('')
const editingStatusId = ref<string | null>(null)
const editingStatusName = ref('')

const categoryOptions: Array<{ value: 'TODO' | 'IN_PROGRESS' | 'DONE'; label: string; description: string }> = [
  { value: 'TODO', label: '未対応', description: '未着手のタスクに適用' },
  { value: 'IN_PROGRESS', label: '対応中', description: '作業中のタスクに適用' },
  { value: 'DONE', label: '完了', description: '完了したタスクに適用' },
]

const defaultStatuses: Omit<StatusItem, 'id'>[] = [
  { name: '未対応', category: 'TODO', color: '#94a3b8', sort_order: 0 },
  { name: '対応中', category: 'IN_PROGRESS', color: '#0ea5e9', sort_order: 1 },
  { name: '完了', category: 'DONE', color: '#10b981', sort_order: 2 },
]

const defaultLists: Omit<ListItem, 'id'>[] = [
  { name: 'Inbox', is_inbox: true, sort_order: 0 },
]

const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  error.value = null

  try {
    const [listsRes, statusesRes] = await Promise.all([
      api.lists.getAll(),
      api.statuses.getAll(),
    ])

    if ((listsRes as ListItem[]).length > 0) {
      lists.value = listsRes as ListItem[]
      statuses.value = statusesRes as StatusItem[]
    } else {
      lists.value = defaultLists.map((l) => ({
        ...l,
        id: generateTempId(),
        isNew: true,
      }))
      statuses.value = defaultStatuses.map((s) => ({
        ...s,
        id: generateTempId(),
        isNew: true,
      }))
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'データの読み込みに失敗しました'
    error.value = msg
  } finally {
    loading.value = false
  }
}

function startAddList() {
  addingList.value = true
  newListName.value = ''
}

function cancelAddList() {
  addingList.value = false
  newListName.value = ''
}

function confirmAddList() {
  const name = newListName.value.trim()
  if (!name) return

  lists.value.push({
    id: generateTempId(),
    name,
    is_inbox: false,
    sort_order: lists.value.length,
    isNew: true,
  })

  addingList.value = false
  newListName.value = ''
}

function startEditList(list: ListItem) {
  editingListId.value = list.id
  editingListName.value = list.name
}

function cancelEditList() {
  editingListId.value = null
  editingListName.value = ''
}

function confirmEditList(list: ListItem) {
  const name = editingListName.value.trim()
  if (!name) return

  list.name = name
  editingListId.value = null
  editingListName.value = ''
}

function removeList(index: number) {
  if (lists.value[index].is_inbox) return
  lists.value.splice(index, 1)
}

const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function onDragStart(index: number, event: DragEvent) {
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDragOver(index: number, event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragOverIndex.value = index
}

function onDrop(index: number) {
  if (dragIndex.value === null || dragIndex.value === index) return

  const item = lists.value.splice(dragIndex.value, 1)[0]
  lists.value.splice(index, 0, item)

  lists.value.forEach((list, i) => {
    list.sort_order = i
  })

  dragIndex.value = null
  dragOverIndex.value = null
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

function startAddStatus() {
  addingStatus.value = true
  newStatusName.value = ''
  newStatusCategory.value = 'TODO'
  newStatusColor.value = '#94a3b8'
}

function cancelAddStatus() {
  addingStatus.value = false
}

function confirmAddStatus() {
  const name = newStatusName.value.trim()
  if (!name) return

  statuses.value.push({
    id: generateTempId(),
    name,
    category: newStatusCategory.value,
    color: newStatusColor.value,
    sort_order: statuses.value.length,
    isNew: true,
  })

  addingStatus.value = false
  newStatusName.value = ''
}

function startEditStatus(status: StatusItem) {
  editingStatusId.value = status.id
  editingStatusName.value = status.name
}

function cancelEditStatus() {
  editingStatusId.value = null
  editingStatusName.value = ''
}

function confirmEditStatus(status: StatusItem) {
  const name = editingStatusName.value.trim()
  if (!name) return

  status.name = name
  editingStatusId.value = null
  editingStatusName.value = ''
}

function removeStatus(index: number) {
  statuses.value.splice(index, 1)
}

function getCategoryLabel(category: string): string {
  return categoryOptions.find((o) => o.value === category)?.description ?? ''
}

function lightenColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lr = Math.round(r + (255 - r) * 0.8)
  const lg = Math.round(g + (255 - g) * 0.8)
  const lb = Math.round(b + (255 - b) * 0.8)
  return `rgb(${lr}, ${lg}, ${lb})`
}

async function handleSave() {
  saving.value = true
  error.value = null

  try {
    if (isInitialSetup.value) {
      await api.setup.init({
        lists: lists.value.map((l) => ({ name: l.name, is_inbox: l.is_inbox })),
        statuses: statuses.value.map((s) => ({ name: s.name, category: s.category, color: s.color })),
      })

      await client.auth.refreshSession()
      navigateTo('/tasks')
    } else {
      for (const list of lists.value) {
        if (list.isNew) {
          await api.lists.create({ name: list.name, is_inbox: list.is_inbox, sort_order: list.sort_order })
        } else {
          await api.lists.update(list.id, { name: list.name, sort_order: list.sort_order })
        }
      }

      for (const status of statuses.value) {
        if (status.isNew) {
          await api.statuses.create({ name: status.name, category: status.category, color: status.color, sort_order: status.sort_order })
        } else {
          await api.statuses.update(status.id, { name: status.name, category: status.category, color: status.color, sort_order: status.sort_order })
        }
      }

      navigateTo('/tasks')
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '保存に失敗しました'
    error.value = msg
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  navigateTo('/tasks')
}
</script>

<template>
  <div class="config">
    <header class="config__header">
      <div class="config__header-inner">
        <div class="config__header-left">
          <AppLogo />
        </div>
        <div v-if="user" class="config__header-right">
          <img
            v-if="user.user_metadata?.avatar_url"
            :src="user.user_metadata.avatar_url"
            alt="avatar"
            class="config__header-avatar"
          />
          <span class="config__header-user">{{ user.user_metadata?.full_name || user.email }}</span>
        </div>
      </div>
    </header>

    <main class="config__main">
      <div class="config__title-section">
        <h1 class="config__title">システム設定</h1>
        <p class="config__subtitle">ワークスペース全体のリストとステータスの動作を管理します。</p>
      </div>

      <div v-if="loading" class="config__loading">読み込み中...</div>

      <template v-else>
        <div class="config__grid">
          <!-- リスト管理 -->
          <section class="config-section">
            <div class="config-section__header">
              <div class="config-section__header-left">
                <LayoutList :size="20" :stroke-width="1.5" class="config-section__icon" />
                <h2 class="config-section__title">リスト管理</h2>
              </div>
            </div>
            <div class="config-section__body">
              <div
                v-for="(list, index) in lists"
                :key="list.id"
                class="config-list-item"
                :class="{
                  'config-list-item--dragging': dragIndex === index,
                  'config-list-item--drag-over': dragOverIndex === index && dragIndex !== index,
                }"
                draggable="true"
                @dragstart="onDragStart(index, $event)"
                @dragover="onDragOver(index, $event)"
                @dragleave="dragOverIndex = null"
                @drop="onDrop(index)"
                @dragend="onDragEnd"
              >
                <template v-if="editingListId === list.id">
                  <input
                    v-model="editingListName"
                    class="config-list-item__input"
                    type="text"
                    @keyup.enter="confirmEditList(list)"
                    @keyup.escape="cancelEditList"
                  />
                  <div class="config-list-item__actions">
                    <button class="config-list-item__action-btn" @click="confirmEditList(list)">OK</button>
                    <button class="config-list-item__action-btn" @click="cancelEditList">
                      <X :size="14" :stroke-width="1.5" />
                    </button>
                  </div>
                </template>
                <template v-else>
                  <GripVertical :size="16" :stroke-width="1.5" class="config-list-item__grip" />
                  <span class="config-list-item__name">{{ list.name }}</span>
                  <div class="config-list-item__actions">
                    <button class="config-list-item__action-btn" @click="startEditList(list)">
                      <Pencil :size="12" :stroke-width="1.5" />
                    </button>
                    <button
                      v-if="!list.is_inbox"
                      class="config-list-item__action-btn"
                      @click="removeList(index)"
                    >
                      <Trash2 :size="12" :stroke-width="1.5" />
                    </button>
                  </div>
                </template>
              </div>

              <div v-if="addingList" class="config-list-item config-list-item--adding">
                <input
                  v-model="newListName"
                  class="config-list-item__input"
                  type="text"
                  placeholder="リスト名を入力..."
                  @keyup.enter="confirmAddList"
                  @keyup.escape="cancelAddList"
                />
                <div class="config-list-item__actions">
                  <button class="config-list-item__action-btn" @click="confirmAddList">OK</button>
                  <button class="config-list-item__action-btn" @click="cancelAddList">
                    <X :size="14" :stroke-width="1.5" />
                  </button>
                </div>
              </div>

              <button class="config-section__add-btn" @click="startAddList">
                <Plus :size="15" :stroke-width="1.5" />
                新しいリストを追加
              </button>
            </div>
          </section>

          <!-- ステータス管理 -->
          <section class="config-section">
            <div class="config-section__header">
              <div class="config-section__header-left">
                <Settings :size="20" :stroke-width="1.5" class="config-section__icon" />
                <h2 class="config-section__title">ステータス管理</h2>
              </div>
            </div>
            <div class="config-section__body config-section__body--statuses">
              <div
                v-for="(status, index) in statuses"
                :key="status.id"
                class="config-status-item"
              >
                <div class="config-status-item__left">
                  <div
                    class="config-status-item__badge"
                    :style="{ backgroundColor: lightenColor(status.color) }"
                  >
                    <div
                      class="config-status-item__dot"
                      :style="{ backgroundColor: status.color }"
                    />
                  </div>
                  <div class="config-status-item__info">
                    <template v-if="editingStatusId === status.id">
                      <input
                        v-model="editingStatusName"
                        class="config-status-item__input"
                        type="text"
                        @keyup.enter="confirmEditStatus(status)"
                        @keyup.escape="cancelEditStatus"
                      />
                    </template>
                    <template v-else>
                      <span class="config-status-item__name">{{ status.name }}</span>
                      <span class="config-status-item__desc">{{ getCategoryLabel(status.category) }}</span>
                    </template>
                  </div>
                </div>
                <div class="config-status-item__right">
                  <div class="config-status-item__actions">
                    <button
                      v-if="editingStatusId === status.id"
                      class="config-list-item__action-btn"
                      @click="confirmEditStatus(status)"
                    >OK</button>
                    <button
                      v-if="editingStatusId === status.id"
                      class="config-list-item__action-btn"
                      @click="cancelEditStatus"
                    >
                      <X :size="14" :stroke-width="1.5" />
                    </button>
                    <button
                      v-if="editingStatusId !== status.id"
                      class="config-list-item__action-btn"
                      @click="startEditStatus(status)"
                    >
                      <Pencil :size="12" :stroke-width="1.5" />
                    </button>
                    <button
                      v-if="editingStatusId !== status.id"
                      class="config-list-item__action-btn"
                      @click="removeStatus(index)"
                    >
                      <Trash2 :size="12" :stroke-width="1.5" />
                    </button>
                  </div>
                  <label
                    class="config-status-item__color-btn"
                    :style="{ backgroundColor: status.color, boxShadow: `0 0 0 2px white, 0 0 0 4px ${status.color}33` }"
                  >
                    <input
                      type="color"
                      :value="status.color"
                      class="config-status-item__color-input"
                      @input="status.color = ($event.target as HTMLInputElement).value"
                    />
                  </label>
                </div>
              </div>

              <div v-if="addingStatus" class="config-status-item config-status-item--adding">
                <div class="config-status-item__left">
                  <div
                    class="config-status-item__badge"
                    :style="{ backgroundColor: lightenColor(newStatusColor) }"
                  >
                    <div
                      class="config-status-item__dot"
                      :style="{ backgroundColor: newStatusColor }"
                    />
                  </div>
                  <div class="config-status-item__add-form">
                    <input
                      v-model="newStatusName"
                      class="config-status-item__input"
                      type="text"
                      placeholder="ステータス名..."
                      @keyup.enter="confirmAddStatus"
                      @keyup.escape="cancelAddStatus"
                    />
                    <select v-model="newStatusCategory" class="config-status-item__select">
                      <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}（{{ opt.value }}）
                      </option>
                    </select>
                  </div>
                </div>
                <div class="config-status-item__right">
                  <div class="config-status-item__actions">
                    <button class="config-list-item__action-btn" @click="confirmAddStatus">OK</button>
                    <button class="config-list-item__action-btn" @click="cancelAddStatus">
                      <X :size="14" :stroke-width="1.5" />
                    </button>
                  </div>
                  <label
                    class="config-status-item__color-btn"
                    :style="{ backgroundColor: newStatusColor, boxShadow: `0 0 0 2px white, 0 0 0 4px ${newStatusColor}33` }"
                  >
                    <input
                      type="color"
                      v-model="newStatusColor"
                      class="config-status-item__color-input"
                    />
                  </label>
                </div>
              </div>

              <button class="config-section__add-btn" @click="startAddStatus">
                <Plus :size="15" :stroke-width="1.5" />
                新しいステータスを追加
              </button>
            </div>
          </section>
        </div>

        <p v-if="error" class="config__error">{{ error }}</p>

        <footer class="config__footer">
          <div class="config__footer-left">
            <div class="config__footer-info-icon">i</div>
            <span class="config__footer-text">変更内容は保存ボタンで反映されます。</span>
          </div>
          <div class="config__footer-right">
            <button
              v-if="!isInitialSetup"
              class="config__cancel-btn"
              @click="handleCancel"
            >
              キャンセル
            </button>
            <button
              class="config__save-btn"
              :disabled="saving"
              @click="handleSave"
            >
              {{ saving ? '保存中...' : '設定を保存' }}
            </button>
          </div>
        </footer>
      </template>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.config {
  min-height: 100vh;
  background: color('bg');
  display: flex;
  flex-direction: column;
  align-items: center;

  &__header {
    width: 100%;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(6px);
    border-bottom: 1px solid color('border');
    position: sticky;
    top: 0;
    z-index: 10;
  }

  &__header-inner {
    max-width: 1024px;
    margin: 0 auto;
    padding: 0 spacing(6);
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: spacing(3);
  }

  &__header-right {
    display: flex;
    align-items: center;
    gap: spacing(2);
  }

  &__header-avatar {
    width: 32px;
    height: 32px;
    border-radius: radius('pill');
    border: 1px solid color('border-light');
    flex-shrink: 0;
  }

  &__header-user {
    @include typography('base', 'medium');
    color: color('text');
  }

  &__main {
    width: 100%;
    max-width: 1024px;
    padding: spacing(10) spacing(6);
    display: flex;
    flex-direction: column;
    gap: spacing(8);
  }

  &__title-section {
    display: flex;
    flex-direction: column;
    gap: spacing(2);
  }

  &__title {
    margin: 0;
    font-size: font-size('lg');
    font-weight: font-weight('regular');
    color: color('text');
  }

  &__subtitle {
    margin: 0;
    font-size: font-size('base');
    color: color('text-gray');
  }

  &__loading {
    text-align: center;
    padding: spacing(12) 0;
    color: color('text-secondary');
    font-size: font-size('md');
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: spacing(8);
  }

  &__error {
    color: color('danger-bg');
    font-size: font-size('base');
    text-align: center;
    padding: spacing(2);
    background: color('danger-light');
    border-radius: radius('md');
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: spacing(6);
    background: color('surface');
    border: 1px solid color('border');
    border-radius: radius('md');
  }

  &__footer-left {
    display: flex;
    align-items: center;
    gap: spacing(4);
  }

  &__footer-info-icon {
    width: 36px;
    height: 36px;
    border-radius: radius('pill');
    background: color('bg');
    border: 1px solid color('border');
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: font-size('base');
    font-weight: font-weight('medium');
    color: color('text-gray');
    flex-shrink: 0;
  }

  &__footer-text {
    font-size: font-size('base');
    color: color('text-gray');
  }

  &__footer-right {
    display: flex;
    align-items: center;
    gap: spacing(3);
  }

  &__cancel-btn {
    @include btn-ghost;
    padding: spacing(2) spacing(5);
    font-size: font-size('base');
    color: color('text-gray');
  }

  &__save-btn {
    @include btn-primary;
    padding: spacing(2) spacing(6);
    font-size: font-size('base');
    font-weight: font-weight('medium');
    box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.2), 0 4px 6px -4px rgba(249, 115, 22, 0.2);
  }
}

.config-section {
  background: color('surface');
  border: 1px solid color('border');
  border-radius: radius('md');
  overflow: hidden;
  box-shadow: shadow('subtle');
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: spacing(5);
    border-bottom: 1px solid color('border-light');
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: spacing(2);
  }

  &__icon {
    color: color('text');
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: font-weight('regular');
    color: color('text');
  }

  &__body {
    padding: spacing(4);
    display: flex;
    flex-direction: column;
    gap: spacing(2);
    flex: 1;

    &--statuses {
      gap: spacing(4);
    }
  }

  &__add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: spacing(2);
    width: 100%;
    margin-top: auto;
    padding: spacing(3) spacing(1);
    border: 2px dashed color('border');
    border-radius: radius('md');
    background: transparent;
    font-family: $font-family-base;
    font-size: font-size('base');
    color: color('text-muted');
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      border-color: color('text-disabled');
      color: color('text-secondary');
      background: color('surface-muted');
    }
  }
}

.config-list-item {
  display: flex;
  align-items: center;
  gap: spacing(3);
  padding: spacing(3);
  background: color('surface-muted');
  border: 1px solid color('border');
  border-radius: radius('md');

  &__grip {
    color: color('text-disabled');
    flex-shrink: 0;
    cursor: grab;
  }

  &__name {
    flex: 1;
    @include typography('base', 'medium');
    color: color('text');
  }

  &__input {
    flex: 1;
    border: 1px solid color('border');
    border-radius: radius('sm');
    padding: spacing(1) spacing(2);
    font-family: $font-family-base;
    font-size: font-size('base');
    color: color('text');
    background: color('surface');
    outline: none;

    &:focus {
      border-color: color('primary');
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0;
    transition: opacity $transition-fast;
  }

  &:hover &__actions {
    opacity: 1;
  }

  &--dragging {
    opacity: 0.4;
  }

  &--drag-over {
    border-color: color('primary');
    box-shadow: 0 -2px 0 0 color('primary');
  }

  &--adding &__actions {
    opacity: 1;
  }

  &__action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: spacing(1);
    border-radius: radius('md');
    background: transparent;
    border: none;
    cursor: pointer;
    color: color('text-secondary');
    font-family: $font-family-base;
    font-size: font-size('base-sm');
    font-weight: font-weight('medium');
    transition: all $transition-fast;

    &:hover {
      background: color('bg');
      color: color('text');
    }
  }
}

.config-status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: spacing(2);
  border-bottom: 1px solid color('surface-muted');

  &:last-of-type {
    border-bottom: none;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: spacing(3);
  }

  &__badge {
    width: 32px;
    height: 32px;
    border-radius: radius('md');
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__dot {
    width: 16px;
    height: 16px;
    border-radius: radius('pill');
    border: 2px solid white;
  }

  &__info {
    display: flex;
    flex-direction: column;
  }

  &__name {
    @include typography('base', 'medium');
    color: color('text');
  }

  &__desc {
    font-size: font-size('xs');
    color: color('text-muted');
  }

  &__input {
    border: 1px solid color('border');
    border-radius: radius('sm');
    padding: spacing(1) spacing(2);
    font-family: $font-family-base;
    font-size: font-size('base');
    color: color('text');
    background: color('surface');
    outline: none;
    width: 140px;

    &:focus {
      border-color: color('primary');
    }
  }

  &__add-form {
    display: flex;
    flex-direction: column;
    gap: spacing(1);
  }

  &__select {
    border: 1px solid color('border');
    border-radius: radius('sm');
    padding: 2px spacing(2);
    font-family: $font-family-base;
    font-size: font-size('base-sm');
    color: color('text');
    background: color('surface');
    outline: none;

    &:focus {
      border-color: color('primary');
    }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: spacing(3);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0;
    transition: opacity $transition-fast;
  }

  &:hover &__actions {
    opacity: 1;
  }

  &--adding &__actions {
    opacity: 1;
  }

  &__color-btn {
    width: 36px;
    height: 36px;
    border-radius: radius('pill');
    border: 1px solid color('border');
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all $transition-fast;
    flex-shrink: 0;
  }

  &__color-input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }
}
</style>
