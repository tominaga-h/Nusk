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
  <div class="confirm">
    <div class="confirm__card">
      <div v-if="!errorMsg" class="confirm__loading">
        <div class="confirm__spinner" />
        <p>認証処理中...</p>
      </div>
      <div v-else class="confirm__error-state">
        <p class="confirm__error">{{ errorMsg }}</p>
        <NuxtLink to="/login" class="confirm__back">ログインページに戻る</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.confirm {
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
    max-width: 400px;
  }

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: spacing(4);
    color: color('text-gray');
  }

  &__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid color('border');
    border-top-color: color('text');
    border-radius: radius('pill');
    animation: spin 0.8s linear infinite;
  }

  &__error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: spacing(4);
  }

  &__error {
    padding: spacing(3);
    background: color('danger-bg');
    border: 1px solid color('border-danger');
    border-radius: radius('md');
    color: color('danger');
    font-size: font-size('base');
    width: 100%;
  }

  &__back {
    color: color('text');
    font-weight: font-weight('medium');
    text-decoration: underline;
    text-underline-offset: 2px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
