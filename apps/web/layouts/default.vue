<script setup lang="ts">
</script>

<template>
  <div class="layout">
    <AppSidebar />
    <main class="layout__main">
      <slot />
    </main>
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
