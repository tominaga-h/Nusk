<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()

const logout = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}

interface List {
  id: string
  name: string
  is_inbox: boolean
}

interface Status {
  id: string
  list_id: string
  name: string
  category: 'TODO' | 'IN_PROGRESS' | 'DONE'
}

interface Task {
  id: string
  list_id: string
  status_id: string
  title: string
  scheduled_date: string | null
  sort_order: number
}

const lists: List[] = [
  { id: 'list-1', name: 'Inbox', is_inbox: true },
  { id: 'list-2', name: '仕事', is_inbox: false },
  { id: 'list-3', name: 'プライベート', is_inbox: false },
]

const statuses: Status[] = [
  { id: 'status-1', list_id: 'list-1', name: '未対応', category: 'TODO' },
  { id: 'status-2', list_id: 'list-1', name: '対応中', category: 'IN_PROGRESS' },
  { id: 'status-3', list_id: 'list-1', name: '完了', category: 'DONE' },
  { id: 'status-4', list_id: 'list-2', name: '未対応', category: 'TODO' },
  { id: 'status-5', list_id: 'list-2', name: '対応中', category: 'IN_PROGRESS' },
  { id: 'status-6', list_id: 'list-2', name: '完了', category: 'DONE' },
  { id: 'status-7', list_id: 'list-3', name: '未対応', category: 'TODO' },
  { id: 'status-8', list_id: 'list-3', name: '対応中', category: 'IN_PROGRESS' },
  { id: 'status-9', list_id: 'list-3', name: '完了', category: 'DONE' },
]

const tasks: Task[] = [
  { id: 'task-1', list_id: 'list-1', status_id: 'status-1', title: 'プロジェクト計画書を作成する', scheduled_date: '2026-03-17', sort_order: 0 },
  { id: 'task-2', list_id: 'list-1', status_id: 'status-2', title: 'デザインレビューの準備', scheduled_date: '2026-03-16', sort_order: 1 },
  { id: 'task-3', list_id: 'list-1', status_id: 'status-1', title: '新しいライブラリの調査', scheduled_date: null, sort_order: 2 },
  { id: 'task-4', list_id: 'list-2', status_id: 'status-4', title: 'API エンドポイントの実装', scheduled_date: '2026-03-18', sort_order: 0 },
  { id: 'task-5', list_id: 'list-2', status_id: 'status-5', title: 'ユニットテストを書く', scheduled_date: '2026-03-16', sort_order: 1 },
  { id: 'task-6', list_id: 'list-2', status_id: 'status-6', title: 'CI/CD パイプラインの設定', scheduled_date: '2026-03-15', sort_order: 2 },
  { id: 'task-7', list_id: 'list-3', status_id: 'status-7', title: '歯医者の予約を取る', scheduled_date: '2026-03-20', sort_order: 0 },
  { id: 'task-8', list_id: 'list-3', status_id: 'status-9', title: '本を返却する', scheduled_date: '2026-03-14', sort_order: 1 },
]

const selectedListId = ref('list-1')

const selectedList = computed(() =>
  lists.find(l => l.id === selectedListId.value)!
)

const filteredTasks = computed(() =>
  tasks.filter(t => t.list_id === selectedListId.value)
)

const getStatus = (statusId: string) =>
  statuses.find(s => s.id === statusId)

const taskCount = (listId: string) =>
  tasks.filter(t => t.list_id === listId).length

const formatDate = (date: string | null) => {
  if (!date) return ''
  const d = new Date(date + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<template>
  <div class="tasks">
    <aside class="tasks__sidebar">
      <div class="tasks__logo">
        <h1 class="tasks__logo-text">Nusk</h1>
      </div>

      <nav class="tasks__nav">
        <button
          v-for="list in lists"
          :key="list.id"
          class="tasks__nav-item"
          :class="{ 'tasks__nav-item--active': list.id === selectedListId }"
          @click="selectedListId = list.id"
        >
          <span class="tasks__nav-icon">{{ list.is_inbox ? '📥' : '📁' }}</span>
          <span class="tasks__nav-name">{{ list.name }}</span>
          <span class="tasks__nav-count">{{ taskCount(list.id) }}</span>
        </button>
      </nav>

      <div class="tasks__sidebar-footer">
        <div v-if="user" class="tasks__user">
          <img
            v-if="user.user_metadata?.avatar_url"
            :src="user.user_metadata.avatar_url"
            alt="avatar"
            class="tasks__user-avatar"
          />
          <span class="tasks__user-name">{{ user.user_metadata?.full_name || user.email }}</span>
        </div>
        <button class="tasks__logout-btn" @click="logout">ログアウト</button>
      </div>
    </aside>

    <main class="tasks__main">
      <header class="tasks__header">
        <div>
          <h2 class="tasks__list-name">{{ selectedList.name }}</h2>
          <p class="tasks__list-count">{{ filteredTasks.length }} 件のタスク</p>
        </div>
      </header>

      <div class="tasks__list">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="tasks__item"
          :class="{ 'tasks__item--done': getStatus(task.status_id)?.category === 'DONE' }"
        >
          <div
            class="tasks__check"
            :class="{ 'tasks__check--done': getStatus(task.status_id)?.category === 'DONE' }"
          />

          <span class="tasks__item-title">{{ task.title }}</span>

          <span
            class="tasks__badge"
            :class="{
              'tasks__badge--todo': getStatus(task.status_id)?.category === 'TODO',
              'tasks__badge--in-progress': getStatus(task.status_id)?.category === 'IN_PROGRESS',
              'tasks__badge--done': getStatus(task.status_id)?.category === 'DONE',
            }"
          >
            {{ getStatus(task.status_id)?.name }}
          </span>

          <span v-if="task.scheduled_date" class="tasks__date">
            {{ formatDate(task.scheduled_date) }}
          </span>
        </div>

        <div v-if="filteredTasks.length === 0" class="tasks__empty">
          タスクがありません
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.tasks {
  display: flex;
  min-height: 100vh;
  background: color('bg');

  &__sidebar {
    width: $sidebar-width;
    background: color('surface');
    border-right: 1px solid color('border');
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  &__logo {
    padding: spacing(6) spacing(5);
    border-bottom: 1px solid color('border');
  }

  &__logo-text {
    margin: 0;
    font-family: $font-family-logo;
    font-size: font-size('lg');
    font-weight: font-weight('bold');
    color: color('text');
  }

  &__nav {
    flex: 1;
    padding: spacing(3) spacing(2);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px spacing(3);
    border: none;
    border-radius: radius('md');
    background: transparent;
    font-size: font-size('base');
    color: color('text');
    cursor: pointer;
    transition: background $transition-fast;

    &:hover {
      background: color('bg');
    }

    &--active {
      background: color('primary-light');
      color: color('primary');
      font-weight: font-weight('medium');
      border-left: 2px solid color('primary');
    }
  }

  &__nav-icon {
    font-size: font-size('md');
    width: spacing(6);
    text-align: center;
  }

  &__nav-name {
    flex: 1;
    text-align: left;
  }

  &__nav-count {
    font-size: font-size('base');
    color: color('text-secondary');
    font-weight: font-weight('bold');

    .tasks__nav-item--active & {
      color: color('primary');
    }
  }

  &__sidebar-footer {
    padding: spacing(4) spacing(4);
    border-top: 1px solid color('border-light');
    display: flex;
    flex-direction: column;
    gap: spacing(3);
  }

  &__user {
    display: flex;
    align-items: center;
    gap: spacing(3);
  }

  &__user-avatar {
    width: 40px;
    height: 40px;
    border-radius: radius('pill');
    border: 1px solid color('border-light');
  }

  &__user-name {
    @include typography('base', 'medium');
    @include truncate;
    color: color('text');
  }

  &__logout-btn {
    @include btn-ghost;
    width: 100%;
    padding: spacing(1) spacing(2);
    font-size: font-size('base');
    color: color('text-secondary');
    justify-content: flex-start;
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__header {
    padding: spacing(6) spacing(8);
    background: color('bg');
    @include flex-between;
  }

  &__list-name {
    margin: 0;
    font-size: font-size('lg');
    font-weight: font-weight('bold');
    color: color('text');
  }

  &__list-count {
    margin: spacing(1) 0 0;
    font-size: font-size('base');
    color: color('text-secondary');
  }

  &__list {
    flex: 1;
    padding: spacing(4) spacing(8);
    display: flex;
    flex-direction: column;
    gap: spacing(3);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: spacing(3);
    padding: spacing(4);
    @include card;
    box-shadow: shadow('card');
    transition: box-shadow $transition-fast;

    &:hover {
      box-shadow: shadow('card-hover');
    }

    &--done {
      opacity: 0.6;
    }
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

  &__item-title {
    flex: 1;
    @include typography('md', 'medium');
    @include truncate;
    color: color('text');

    .tasks__item--done & {
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
    font-size: font-size('base');
    color: color('text-secondary');
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__empty {
    text-align: center;
    padding: spacing(12) 0;
    color: color('text-secondary');
    font-size: font-size('base');
  }
}
</style>
