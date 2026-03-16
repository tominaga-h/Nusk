<script setup lang="ts">
import { SlidersHorizontal, ArrowUpFromLine, Calendar, CircleCheck } from 'lucide-vue-next'
</script>

<template>
  <div class="filter-bar">
    <div class="filter-bar__label">
      <SlidersHorizontal :size="14" :stroke-width="1.5" />
      <span>フィルター</span>
    </div>
    <div class="filter-bar__divider" />
    <div class="filter-bar__buttons">
      <button class="filter-bar__btn">
        <ArrowUpFromLine :size="14" :stroke-width="1.5" />
        優先度
      </button>
      <button class="filter-bar__btn">
        <Calendar :size="14" :stroke-width="1.5" />
        期限
      </button>
      <button class="filter-bar__btn">
        <CircleCheck :size="15" :stroke-width="1.5" />
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
