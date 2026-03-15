<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()

const logout = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="home-container">
    <div class="home-card">
      <h1>Nusk</h1>
      <p class="subtitle">次世代タスク管理システム</p>

      <div class="divider" />

      <div v-if="user" class="user-info">
        <p class="status">Supabase 接続成功</p>
        <div class="user-detail">
          <img
            v-if="user.user_metadata?.avatar_url"
            :src="user.user_metadata.avatar_url"
            alt="avatar"
            class="avatar"
          />
          <div>
            <p class="name">{{ user.user_metadata?.full_name || user.email }}</p>
            <p class="email">{{ user.email }}</p>
            <p class="provider">Provider: {{ user.app_metadata?.provider }}</p>
          </div>
        </div>
        <button class="btn-logout" @click="logout">ログアウト</button>
      </div>

      <div v-else class="not-logged-in">
        <p>ログインしていません</p>
        <NuxtLink to="/login" class="btn-login">ログインページへ</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.home-card {
  background: #fff;
  border-radius: 12px;
  padding: 48px 40px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
  width: 100%;
  max-width: 480px;
}

.home-card h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111;
}

.subtitle {
  margin: 8px 0 0;
  color: #666;
  font-size: 0.9rem;
}

.divider {
  height: 1px;
  background: #e5e5e5;
  margin: 32px 0;
}

.status {
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

.user-detail {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 24px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.name {
  margin: 0;
  font-weight: 600;
  color: #111;
}

.email {
  margin: 4px 0 0;
  color: #666;
  font-size: 0.85rem;
}

.provider {
  margin: 4px 0 0;
  color: #999;
  font-size: 0.8rem;
}

.btn-logout {
  padding: 10px 24px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-logout:hover {
  background: #f5f5f5;
}

.not-logged-in {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #666;
}

.btn-login {
  display: inline-block;
  padding: 10px 24px;
  background: #111;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.15s;
}

.btn-login:hover {
  background: #333;
}
</style>
