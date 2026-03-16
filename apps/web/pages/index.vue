<script setup lang="ts">
definePageMeta({ layout: false })

const client = useSupabaseClient()
const user = useSupabaseUser()

async function logout() {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="home">
    <div class="home__card">
      <h1 class="home__title">Nusk</h1>
      <p class="home__subtitle">次世代タスク管理システム</p>

      <div class="home__divider" />

      <div v-if="user" class="home__user-info">
        <p class="home__status">Supabase 接続成功</p>
        <div class="home__user-detail">
          <img
            v-if="user.user_metadata?.avatar_url"
            :src="user.user_metadata.avatar_url"
            alt="avatar"
            class="home__avatar"
          />
          <div>
            <p class="home__name">{{ user.user_metadata?.full_name || user.email }}</p>
            <p class="home__email">{{ user.email }}</p>
            <p class="home__provider">Provider: {{ user.app_metadata?.provider }}</p>
          </div>
        </div>
        <button class="home__logout" @click="logout">ログアウト</button>
      </div>

      <div v-else class="home__guest">
        <p>ログインしていません</p>
        <NuxtLink to="/login" class="home__login">ログインページへ</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  @include flex-center;
  background: color('bg');

  &__card {
    background: color('surface');
    border-radius: radius('lg');
    padding: spacing(12) spacing(10);
    box-shadow: shadow('input');
    text-align: center;
    width: 100%;
    max-width: 480px;
  }

  &__title {
    margin: 0;
    font-family: $font-family-logo;
    font-size: font-size('xl');
    font-weight: font-weight('bold');
    color: color('text');
  }

  &__subtitle {
    margin: spacing(2) 0 0;
    color: color('text-gray');
    font-size: font-size('base');
  }

  &__divider {
    height: 1px;
    background: color('border');
    margin: spacing(8) 0;
  }

  &__status {
    display: inline-block;
    padding: 6px spacing(4);
    background: color('status-green-bg');
    border: 1px solid #a7f3d0;
    border-radius: radius('pill');
    color: color('status-green');
    font-size: font-size('base');
    font-weight: font-weight('medium');
    margin-bottom: spacing(6);
  }

  &__user-detail {
    display: flex;
    align-items: center;
    gap: spacing(4);
    text-align: left;
    padding: spacing(4);
    background: color('surface-muted');
    border-radius: radius('md');
    margin-bottom: spacing(6);
  }

  &__avatar {
    width: spacing(12);
    height: spacing(12);
    border-radius: radius('pill');
  }

  &__name {
    margin: 0;
    font-weight: font-weight('medium');
    color: color('text');
  }

  &__email {
    margin: spacing(1) 0 0;
    color: color('text-gray');
    font-size: font-size('base');
  }

  &__provider {
    margin: spacing(1) 0 0;
    color: color('text-secondary');
    font-size: font-size('base-sm');
  }

  &__logout {
    @include btn-secondary;
    padding: 10px spacing(6);
    font-size: font-size('base');
  }

  &__guest {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: spacing(4);
    color: color('text-gray');
  }

  &__login {
    display: inline-block;
    padding: 10px spacing(6);
    background: color('text');
    color: color('surface');
    border-radius: radius('md');
    font-size: font-size('base');
    font-weight: font-weight('medium');
    transition: background $transition-fast;

    &:hover {
      background: #333;
    }
  }
}
</style>
