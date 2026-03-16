<script setup lang="ts">
withDefaults(defineProps<{ size?: 'md' | 'lg' }>(), { size: 'md' })
</script>

<template>
  <div class="app-logo" :class="`app-logo--${size}`">
    <img class="app-logo__icon" src="/img/icon.png" alt="Nusk" />
    <h1 class="app-logo__text">Nusk</h1>
  </div>
</template>

<style lang="scss" scoped>
.app-logo {
  display: flex;
  align-items: center;
  gap: spacing(2);

  &__icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  &__text {
    margin: 0;
    font-family: $font-family-logo;
    font-weight: font-weight('bold');
    color: color('text');
  }

  &--md {
    .app-logo__text {
      font-size: font-size('lg');
    }
  }

  &--lg {
    justify-content: center;

    .app-logo__text {
      font-size: font-size('xl');
    }
  }
}
</style>
