<script setup>
import { ChevronLeft, ChevronRight, Settings } from 'lucide-vue'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import AlmanacModal from '../components/AlmanacModal.vue'
import CalendarSettingsModal from '../components/CalendarSettingsModal.vue'
import { useConfigStore } from '../stores/config'
import { getAlmanacDetails, getLunarDate } from '../utils/lunar'

const configStore = useConfigStore()
const { calendarConfig } = storeToRefs(configStore)

const currentMonthDate = ref(new Date())
const today = ref(new Date())
const showSettings = ref(false)

const selectedDay = ref(null)

const year = computed(() => currentMonthDate.value.getFullYear())
const month = computed(() => currentMonthDate.value.getMonth())

const isCurrentMonth = computed(() => {
  return year.value === today.value.getFullYear() && month.value === today.value.getMonth()
})

const calendarDays = computed(() => {
  const y = year.value
  const m = month.value
  const weekStartDay = calendarConfig.value.weekStartDay // 0: Sunday, 1: Monday

  // 获取本月第一天是周几 (0-6)
  const firstDayOfMonth = new Date(y, m, 1).getDay()

  // 计算需要补齐的上个月天数
  // 如果周一平衡，且第一天是周日(0)，则需要补 6 天
  // 如果周日平衡，且第一天是周日(0)，则需要补 0 天
  let paddingDays = firstDayOfMonth - weekStartDay
  if (paddingDays < 0) paddingDays += 7

  const daysInMonth = new Date(y, m + 1, 0).getDate()

  const days = []

  // Prev month
  for (let i = paddingDays - 1; i >= 0; i--) {
    const d = new Date(y, m, 0 - i) // 这样写比较稳妥，new Date(y, m, 0) 是上月最后一天
    days.push({ date: d, isOtherMonth: true, lunar: getLunarDate(d) })
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(y, m, i)
    days.push({
      date: d,
      isOtherMonth: false,
      isToday: d.toDateString() === today.value.toDateString(),
      lunar: getLunarDate(d),
    })
  }

  // Next month
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(y, m + 1, i)
    days.push({ date: d, isOtherMonth: true, lunar: getLunarDate(d) })
  }

  return days
})

const weekHeaders = computed(() => {
  const headers = ['日', '一', '二', '三', '四', '五', '六']
  if (calendarConfig.value.weekStartDay === 1) {
    return ['一', '二', '三', '四', '五', '六', '日']
  }
  return headers
})

function changeMonth(delta) {
  const d = new Date(currentMonthDate.value)
  d.setMonth(d.getMonth() + delta)
  currentMonthDate.value = d
}

function handleDayClick(day) {
  selectedDay.value = {
    ...day,
    lunar: {
      ...day.lunar,
      ...getAlmanacDetails(day.date),
    },
  }
}

function goToToday() {
  today.value = new Date()
  currentMonthDate.value = new Date()
}

function refreshToday() {
  today.value = new Date()
  // 如果当前正在看“今天”所在的月份，则确保视图也是最新的
  if (isCurrentMonth.value) {
    currentMonthDate.value = new Date()
  }
}

defineExpose({ refreshToday })
</script>

<template>
  <div class="w-screen h-screen relative scale-1">
    <div class="full-screen-calendar text-white">
      <div class="flex items-center justify-between w-full mb-8 px-4">
        <div class="text-left">
          <h2 class="text-4xl md:text-5xl font-bold tracking-widest">
            {{ year }}年{{ month + 1 }}月
          </h2>
        </div>
        <div class="flex items-center gap-3">
          <button class="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all duration-300" @click="changeMonth(-1)">
            <ChevronLeft class="w-6 h-6 " />
          </button>
          <button
            class="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all duration-300 text-md font-medium"
            @click="goToToday"
          >
            今天
          </button>
          <button class="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all duration-300" @click="changeMonth(1)">
            <ChevronRight class="w-6 h-6 " />
          </button>
          <button
            class="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all duration-300 ml-2"
            @click="showSettings = true"
          >
            <Settings class="w-6 h-6" />
          </button>
        </div>
      </div>

      <div class="flex-1 flex flex-col w-full">
        <div class="grid grid-cols-7 mb-2">
          <div v-for="d in weekHeaders" :key="d" class="calendar-header-day text-xl font-bold">
            {{ d }}
          </div>
        </div>
        <div class="calendar-grid">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="calendar-day cursor-pointer hover:bg-white/10 active:scale-95 transition-all duration-200"
            :class="{ 'other-month': day.isOtherMonth, 'today': day.isToday }"
            @click="handleDayClick(day)"
          >
            <div class="day-number-wrapper flex flex-col items-center justify-center">
              <span class="text-2xl md:text-3xl font-bold">{{ day.date.getDate() }}</span>
              <div class="lunar-text text-sm font-normal mt-1 text-center">
                <span
                  :class="day.lunar.isFestival ? 'text-blue-300 opacity-100' : 'opacity-60'"
                >
                  {{ day.lunar.date }}
                </span>
                <template v-if="day.lunar.holiday">
                  <span class="opacity-60"> · </span>
                  <span :class="day.lunar.holiday === '休' ? 'text-red-400' : 'text-orange-300'">
                    {{ day.lunar.holiday }}
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AlmanacModal
      v-if="selectedDay"
      :show="!!selectedDay"
      :date="selectedDay.date"
      :lunar="selectedDay.lunar"
      @close="selectedDay = null"
    />

    <CalendarSettingsModal
      :show="showSettings"
      @close="showSettings = false"
    />
  </div>
</template>

<style scoped>
.full-screen-calendar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  box-sizing: border-box;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 4px; /* iOS 12.1+ Fallback */
  gap: 4px;
  flex: 1;
  overflow: hidden;
}

.calendar-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  position: relative;
  min-height: 0;
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0);
  border-radius: 12px;
}

.calendar-day.today {
  border: 1px solid rgba(255, 255, 255, 0.5);
  background-color: rgba(255, 255, 255, 0.09);
}

.calendar-day.other-month {
  opacity: 0.2;
}

.calendar-header-day {
  text-align: center;
  padding: 10px 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .calendar-day.today .day-number-wrapper {
    width: 60px;
    height: 60px;
  }
}
</style>
