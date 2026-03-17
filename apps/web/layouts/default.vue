<script setup lang="ts">
const { fetchData } = useTaskStore()

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="layout">
    <AppSidebar />
    <main class="layout__main">
      <slot />
    </main>
    <!-- グローバル Toast 通知 -->
    <AppToast />
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: color('bg');

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
}
</style>
