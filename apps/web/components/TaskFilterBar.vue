<script setup lang="ts">
import { SlidersHorizontal, ArrowUpFromLine, Calendar, CircleCheck } from 'lucide-vue-next'

withDefaults(defineProps<{
  count: number
  /** trueの場合「期限」ボタンを非表示（日付ビュー時はグルーピングで代替するため） */
  hideDueFilter?: boolean
}>(), {
  hideDueFilter: false,
})

const { statusFilter, switchStatusFilter } = useTaskStore()
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
      <button v-if="!hideDueFilter" class="filter-bar__btn">
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
        @click="switchStatusFilter('all')"
      >
        全て
      </button>
      <button
        class="filter-bar__chip filter-bar__chip--incomplete"
        :class="{ 'filter-bar__chip--active': statusFilter === 'incomplete' }"
        @click="switchStatusFilter('incomplete')"
      >
        未完了
      </button>
      <button
        class="filter-bar__chip filter-bar__chip--done"
        :class="{ 'filter-bar__chip--active': statusFilter === 'done' }"
        @click="switchStatusFilter('done')"
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
      border: 0px;
      font-weight: bold;

      &.filter-bar__chip--all {
        background: color('surface');
      }
      &.filter-bar__chip--incomplete {
        background: color('blue');
        color: color('surface');
      }
      &.filter-bar__chip--done {
        background: color('status-green');
        color: color('surface');
      }
    }
  }
}
</style>
