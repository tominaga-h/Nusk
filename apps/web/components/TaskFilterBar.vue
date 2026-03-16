<script setup lang="ts">
</script>

<template>
  <div class="filter-bar">
    <div class="filter-bar__label">
      <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
        <path d="M1 1H13M3 4.5H11M5.5 8H8.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span>フィルター</span>
    </div>
    <div class="filter-bar__divider" />
    <div class="filter-bar__buttons">
      <button class="filter-bar__btn">
        <svg width="3" height="14" viewBox="0 0 3 14" fill="none">
          <path d="M1.5 1V9M0 12H3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
        優先度
      </button>
      <button class="filter-bar__btn">
        <svg width="14" height="15" viewBox="0 0 14 15" fill="none">
          <path d="M4.5 1.5V3.5M9.5 1.5V3.5M1 6H13M2 3H12C12.5523 3 13 3.44772 13 4V13C13 13.5523 12.5523 14 12 14H2C1.44772 14 1 13.5523 1 13V4C1 3.44772 1.44772 3 2 3Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        期限
      </button>
      <button class="filter-bar__btn">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" stroke-width="1.2" />
          <path d="M5 7.5L6.8 9.3L10 5.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        ステータス
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: spacing(3);
  padding: spacing(1) spacing(2);

  &__label {
    @include section-label;
    display: flex;
    align-items: center;
    gap: 6px;
    padding-right: spacing(3);
    border-right: 1px solid color('text-disabled');
  }

  &__divider {
    display: none;
  }

  &__buttons {
    display: flex;
    align-items: center;
    gap: spacing(1);
  }

  &__btn {
    display: flex;
    align-items: center;
    gap: spacing(1);
    padding: 5px 9px;
    border: 1px solid transparent;
    border-radius: radius('sm');
    background: transparent;
    font-family: $font-family-base;
    font-size: font-size('base-sm');
    color: color('text-gray');
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background: color('bg');
      border-color: color('border');
    }
  }
}
</style>
