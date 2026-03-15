<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()

const logout = async () => {
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &__card {
    background: #fff;
    border-radius: 12px;
    padding: 48px 40px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
    text-align: center;
    width: 100%;
    max-width: 480px;
  }

  &__title {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: #111;
  }

  &__subtitle {
    margin: 8px 0 0;
    color: #666;
    font-size: 0.9rem;
  }

  &__divider {
    height: 1px;
    background: #e5e5e5;
    margin: 32px 0;
  }

  &__status {
    display: inline-block;
    padding: 6px 16px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    border-radius: 20px;
    color: #059669;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 24px;
  }

  &__user-detail {
    display: flex;
    align-items: center;
    gap: 16px;
    text-align: left;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
    margin-bottom: 24px;
  }

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  &__name {
    margin: 0;
    font-weight: 600;
    color: #111;
  }

  &__email {
    margin: 4px 0 0;
    color: #666;
    font-size: 0.85rem;
  }

  &__provider {
    margin: 4px 0 0;
    color: #999;
    font-size: 0.8rem;
  }

  &__logout {
    padding: 10px 24px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: #f5f5f5;
    }
  }

  &__guest {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: #666;
  }

  &__login {
    display: inline-block;
    padding: 10px 24px;
    background: #111;
    color: #fff;
    border-radius: 8px;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: background 0.15s;

    &:hover {
      background: #333;
    }
  }
}
</style>
