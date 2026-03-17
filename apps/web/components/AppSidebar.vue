<script setup lang="ts">
import { Calendar, AlarmClock, LogOut, Settings } from 'lucide-vue-next'

const client = useSupabaseClient()
const user = useSupabaseUser()
const {
  lists,
  viewMode,
  selectedListId,
  selectedDateGroup,
  taskCount,
  todayCount,
  tomorrowCount,
  switchToDateView,
  switchToListView,
} = useTaskStore()

async function logout() {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__logo">
      <AppLogo />
    </div>

    <nav class="sidebar__nav">
      <div class="sidebar__section-wrapper">
        <div class="sidebar__section">
          <span class="sidebar__section-label">リスト</span>
          <div class="sidebar__list">
            <!-- リスト一覧 -->
            <button
              v-for="list in lists"
              :key="list.id"
              class="sidebar__item"
              :class="{ 'sidebar__item--active': viewMode === 'list' && list.id === selectedListId }"
              @click="switchToListView(list.id)"
            >
              <span class="sidebar__item-left">
                <span class="sidebar__item-icon">{{ list.is_inbox ? '📥' : '📁' }}</span>
                <span class="sidebar__item-name">{{ list.name }}</span>
              </span>
              <span class="sidebar__item-count">{{ taskCount(list.id) }}</span>
            </button>
          </div>
        </div>
        <div class="sidebar__section">
          <span class="sidebar__section-label">日付</span>
          <div class="sidebar__list">
            <button
              class="sidebar__item"
              :class="{ 'sidebar__item--active': viewMode === 'date' && selectedDateGroup === 'today' }"
              @click="switchToDateView('today')"
            >
              <span class="sidebar__item-left">
                <Calendar class="sidebar__item-svg" :size="14" :stroke-width="1.5" />
                <span class="sidebar__item-name">今日</span>
              </span>
              <span class="sidebar__item-count">{{ todayCount }}</span>
            </button>
            <button
              class="sidebar__item"
              :class="{ 'sidebar__item--active': viewMode === 'date' && selectedDateGroup === 'tomorrow' }"
              @click="switchToDateView('tomorrow')"
            >
              <span class="sidebar__item-left">
                <AlarmClock class="sidebar__item-svg" :size="15" :stroke-width="1.5" />
                <span class="sidebar__item-name">明日</span>
              </span>
              <span class="sidebar__item-count">{{ tomorrowCount }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="sidebar__calender">
        <MiniCalendar />
      </div>
    </nav>

    <div class="sidebar__footer">
      <div v-if="user" class="sidebar__user">
        <img
          v-if="user.user_metadata?.avatar_url"
          :src="user.user_metadata.avatar_url"
          alt="avatar"
          class="sidebar__user-avatar"
        />
        <span class="sidebar__user-name">{{ user.user_metadata?.full_name || user.email }}</span>
      </div>
      <NuxtLink to="/config" class="sidebar__settings">
        <Settings :size="16" :stroke-width="1.5" />
        システム設定
      </NuxtLink>
      <button class="sidebar__logout" @click="logout">
        <LogOut :size="16" :stroke-width="1.5" />
        ログアウト
      </button>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.sidebar {
  width: $sidebar-width;
  background: color('surface');
  border-right: 1px solid color('border');
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100vh;
  position: sticky;
  top: 0;

  &__logo {
    padding: spacing(6);
  }

  &__nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: spacing(6);
    overflow-y: auto;
  }

  &__section-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: spacing(6);
    overflow-y: auto;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: spacing(2);
  }

  &__section-label {
    @include section-label;
    padding: 0 spacing(6);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: spacing(1);
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: spacing(2) spacing(6);
    border: none;
    background: transparent;
    font-size: font-size('md');
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
      padding-left: calc(#{spacing(6)} - 2px);
    }
  }

  &__item-left {
    display: flex;
    align-items: center;
    gap: spacing(3);
  }

  &__item-icon {
    font-size: 18px;
    width: 16px;
    text-align: center;
    line-height: 1;
  }

  &__item-svg {
    flex-shrink: 0;
  }

  &__item-name {
    text-align: left;
  }

  &__item-count {
    font-size: font-size('base');
    color: color('text-secondary');

    .sidebar__item--active & {
      color: color('primary');
      font-weight: font-weight('bold');
    }
  }

  &__calender {
    margin-bottom: spacing(6);
  }

  &__footer {
    padding: spacing(4);
    border-top: 1px solid color('border-light');
    display: flex;
    flex-direction: column;
    gap: spacing(4);
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
    flex-shrink: 0;
  }

  &__user-name {
    @include typography('base', 'medium');
    @include truncate;
    color: color('text');
  }

  &__settings {
    @include btn-ghost;
    width: 100%;
    padding: spacing(1) spacing(2);
    font-size: font-size('base');
    color: color('text-secondary');
    justify-content: flex-start;
    gap: spacing(2);
    text-decoration: none;
  }

  &__logout {
    @include btn-ghost;
    width: 100%;
    padding: spacing(1) spacing(2);
    font-size: font-size('base');
    color: color('text-secondary');
    justify-content: flex-start;
    gap: spacing(2);
  }
}
</style>
