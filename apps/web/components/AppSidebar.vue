<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const { lists, selectedListId, taskCount, todayCount, tomorrowCount } = useTaskStore()

async function logout() {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__logo">
      <img class="sidebar__logo-icon" src="/img/icon.png" alt="Nusk">
      <h1 class="sidebar__logo-text">Nusk</h1>
    </div>

    <nav class="sidebar__nav">
      <div class="sidebar__section-wrapper">
        <div class="sidebar__section">
          <span class="sidebar__section-label">リスト</span>
          <div class="sidebar__list">
            <button
              v-for="list in lists"
              :key="list.id"
              class="sidebar__item"
              :class="{ 'sidebar__item--active': list.id === selectedListId }"
              @click="selectedListId = list.id"
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
            <button class="sidebar__item">
              <span class="sidebar__item-left">
                <svg class="sidebar__item-svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                  <path d="M4.5 1.5V3.5M9.5 1.5V3.5M1 6H13M2 3H12C12.5523 3 13 3.44772 13 4V13C13 13.5523 12.5523 14 12 14H2C1.44772 14 1 13.5523 1 13V4C1 3.44772 1.44772 3 2 3Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span class="sidebar__item-name">今日</span>
              </span>
              <span class="sidebar__item-count">{{ todayCount }}</span>
            </button>
            <button class="sidebar__item">
              <span class="sidebar__item-left">
                <svg class="sidebar__item-svg" width="15" height="17" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.2" />
                  <path d="M8 5.5V8.5L10 10.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M3 14.5L5 12.5M13 14.5L11 12.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                  <path d="M4.5 2L3 1M11.5 2L13 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                </svg>
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
      <button class="sidebar__logout" @click="logout">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6M11 11L14 8M14 8L11 5M14 8H6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
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
    display: flex;
    align-items: center;
    gap: 10px;
    padding: spacing(6);
  }

  &__logo-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
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
