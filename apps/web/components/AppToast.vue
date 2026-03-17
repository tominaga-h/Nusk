<script setup lang="ts">
/**
 * グローバル Toast 通知コンポーネント
 *
 * useToast() の状態を監視し、画面右下に通知メッセージを表示する。
 * Transition によるフェードイン/アウトアニメーション付き。
 */
const { message, visible } = useToast()
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="toast">
      <span class="toast__message">{{ message }}</span>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.toast {
  position: fixed;
  right: spacing(8);
  bottom: spacing(8);
  z-index: 20;
  display: flex;
  align-items: center;
  padding: spacing(3) spacing(5);
  border: 1px solid color('border');
  border-radius: radius('md');
  background: color('surface');
  box-shadow: shadow('elevated');

  &__message {
    font-size: font-size('base');
    color: color('text');
  }
}

/* フェードイン / フェードアウト */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
