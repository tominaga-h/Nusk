<script setup lang="ts">
import { SlidersHorizontal, ArrowUpFromLine, Calendar, CircleCheck } from 'lucide-vue-next'

defineProps<{
  count: number
}>()

const { statusFilter } = useTaskStore()

/** ステータスフィルターを指定値に切り替える */
function setStatusFilter(value: 'all' | 'incomplete' | 'done') {
  statusFilter.value = value
}
</script>

<template>
  <div class="filter-bar">
    <div class="filter-bar__label">
      <SlidersHorizontal :size="14" :stroke-width="1.5" />
      <span>フィルター</span>
    </div>
    <span class="filter-bar__count">{{ count }} item{{ count > 1 ? 's' : '' }}</span>
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
      <!-- ステータスフィルター用チップボタン -->
      <button
        class="filter-bar__chip filter-bar__chip--all"
        :class="{ 'filter-bar__chip--active': statusFilter === 'all' }"
        @click="setStatusFilter('all')"
      >
        全て
      </button>
      <button
        class="filter-bar__chip filter-bar__chip--incomplete"
        :class="{ 'filter-bar__chip--active': statusFilter === 'incomplete' }"
        @click="setStatusFilter('incomplete')"
      >
        未完了
      </button>
      <button
        class="filter-bar__chip filter-bar__chip--done"
        :class="{ 'filter-bar__chip--active': statusFilter === 'done' }"
        @click="setStatusFilter('done')"
      >
        完了
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

  &__count {
    padding: 5px 9px;
    border: 1px solid color('border');
    border-radius: radius('sm');
    font-size: font-size('base');
    color: color('text-secondary');
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

  &__chip {
    width: 80px;
    padding: 4px 10px;
    border: 1px solid color('border');
    border-radius: radius('pill');
    background: transparent;
    font-family: $font-family-base;
    font-size: font-size('base-sm');
    color: color('text-gray');
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background: color('bg');
      border-color: color('text-disabled');
    }

    &--active {
      &.filter-bar__chip--all {
      background: color('surface');
      border: 0px;
      }
      &.filter-bar__chip--incomplete {
        background: color('danger-light');
        color: color('danger');
        border: 0px;
      }
      &.filter-bar__chip--done {
        background: color('status-green-bg');
        color: color('status-green');
        border: 0px;
      }
    }
  }
}
</style>
