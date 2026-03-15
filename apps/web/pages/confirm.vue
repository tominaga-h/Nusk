<script setup lang="ts">
const user = useSupabaseUser()
const errorMsg = ref<string | null>(null)

watch(user, (newUser) => {
  if (newUser) {
    navigateTo('/')
  }
}, { immediate: true })

onMounted(() => {
  const hash = window.location.hash
  if (hash.includes('error_description')) {
    const params = new URLSearchParams(hash.substring(1))
    errorMsg.value = params.get('error_description') || '認証に失敗しました'
  }

  setTimeout(() => {
    if (!user.value && !errorMsg.value) {
      errorMsg.value = '認証がタイムアウトしました。もう一度お試しください。'
    }
  }, 10000)
})
</script>

<template>
  <div class="confirm-container">
    <div class="confirm-card">
      <div v-if="!errorMsg" class="loading">
        <div class="spinner" />
        <p>認証処理中...</p>
      </div>
      <div v-else class="error-state">
        <p class="error">{{ errorMsg }}</p>
        <NuxtLink to="/login" class="back-link">ログインページに戻る</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.confirm-card {
  background: #fff;
  border-radius: 12px;
  padding: 48px 40px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e5e5;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.error {
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.85rem;
  width: 100%;
}

.back-link {
  color: #111;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
