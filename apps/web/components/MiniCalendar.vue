<script setup lang="ts">
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

const headerLabel = computed(() =>
  `${currentYear.value}年 ${currentMonth.value + 1}月`,
)

interface CalendarDay {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days: CalendarDay[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  const todayDate = today.getDate()
  const isThisMonth = year === today.getFullYear() && month === today.getMonth()

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      isCurrentMonth: true,
      isToday: isThisMonth && d === todayDate,
    })
  }

  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, isCurrentMonth: false, isToday: false })
    }
  }

  return days
})

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  }
  else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  }
  else {
    currentMonth.value++
  }
}
</script>

<template>
  <div class="calendar">
    <div class="calendar__header">
      <span class="calendar__title">{{ headerLabel }}</span>
      <div class="calendar__nav">
        <button class="calendar__nav-btn" @click="prevMonth">
          <svg width="5" height="8" viewBox="0 0 5 8" fill="none">
            <path d="M4 1L1 4L4 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button class="calendar__nav-btn" @click="nextMonth">
          <svg width="5" height="8" viewBox="0 0 5 8" fill="none">
            <path d="M1 1L4 4L1 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>

    <div class="calendar__grid">
      <span
        v-for="wd in WEEKDAYS"
        :key="wd"
        class="calendar__weekday"
      >{{ wd }}</span>
      <span
        v-for="(cell, i) in calendarDays"
        :key="i"
        class="calendar__day"
        :class="{
          'calendar__day--other': !cell.isCurrentMonth,
          'calendar__day--today': cell.isToday,
        }"
      >{{ cell.day }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.calendar {
  margin: 0 auto;
  width: 227px;
  background: color('surface-muted');
  border: 1px solid color('border-light');
  border-radius: radius('md');
  padding: spacing(3);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 spacing(1);
    margin-bottom: spacing(2);
  }

  &__title {
    font-size: font-size('sm');
    font-weight: font-weight('bold');
    color: color('text-calendar');
  }

  &__nav {
    display: flex;
    gap: 4px;
  }

  &__nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: color('text-calendar');
    padding: 2px;

    &:hover {
      color: color('text');
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  &__weekday {
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: font-size('xs');
    font-weight: font-weight('bold');
    color: color('text-calendar');
  }

  &__day {
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: font-size('xs');
    color: color('text-calendar');
    border-radius: 2px;

    &--other {
      color: color('text-disabled');
    }

    &--today {
      background: color('primary');
      color: color('surface');
      font-weight: font-weight('bold');
    }
  }
}
</style>
