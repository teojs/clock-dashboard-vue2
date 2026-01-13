<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import NewYearEgg from './components/NewYearEgg.vue'
import WeatherEffects from './components/WeatherEffects.vue'

import { useWeatherStore } from './stores/weather'
import CalendarView from './views/CalendarView.vue'
import ClockWeatherView from './views/ClockWeatherView.vue'
import SmartHomeView from './views/SmartHomeView.vue'

const currentPage = ref(1)
const calendarRef = ref(null)

const weatherStore = useWeatherStore()
const { weatherData, showRainEffect, showThunderEffect, showSnowEffect } = storeToRefs(weatherStore)

const isSwiping = ref(false)

// 判断是否需要渲染天气特效组件
const shouldShowWeatherEffects = computed(() => {
  if (!weatherData.value) return false

  const code = weatherData.value.current?.weather_code ?? -1

  if (showRainEffect.value) {
    const isRaining = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)
    if (isRaining) return true
  }

  if (showSnowEffect.value) {
    const isSnowing = (code >= 71 && code <= 77) || (code === 85 || code === 86)
    if (isSnowing) return true
  }

  if (showThunderEffect.value) {
    const isThundering = code === 95 || code === 96 || code === 99
    if (isThundering) return true
  }

  return false
})

let startX = 0

function goToPage(page) {
  currentPage.value = page

  // 切换到日历看板 (page 2) 时更新当前日期
  if (page === 2 && calendarRef.value) {
    calendarRef.value.refreshToday()
  }
}

function handleTouchStart(e) {
  startX = e.touches[0].clientX
}

function handleTouchEnd(e) {
  const endX = e.changedTouches[0].clientX
  const diff = startX - endX
  if (Math.abs(diff) > 50) {
    isSwiping.value = true
    setTimeout(() => {
      isSwiping.value = false
    }, 50)

    if (diff > 0 && currentPage.value < 2)
      goToPage(currentPage.value + 1)
    else if (diff < 0 && currentPage.value > 0)
      goToPage(currentPage.value - 1)
  }
}

function handleMouseDown(e) {
  startX = e.clientX
}

function handleMouseUp(e) {
  const diff = startX - e.clientX
  if (Math.abs(diff) > 50) {
    isSwiping.value = true
    setTimeout(() => {
      isSwiping.value = false
    }, 50)

    if (diff > 0 && currentPage.value < 2)
      goToPage(currentPage.value + 1)
    else if (diff < 0 && currentPage.value > 0)
      goToPage(currentPage.value - 1)
  }
}

function handleGlobalClick(e) {
  if (isSwiping.value) {
    e.stopImmediatePropagation()
    e.preventDefault()
  }
}

// 简易版的 useIdle
let idleTimer
function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    goToPage(1)
  }, 30 * 1000)
}

// 简易版的 useMagicKeys
function handleKeyDown(e) {
  if (e.key === 'ArrowLeft' && currentPage.value > 0) {
    goToPage(currentPage.value - 1)
  }
  if (e.key === 'ArrowRight' && currentPage.value < 2) {
    goToPage(currentPage.value + 1)
  }
}

onMounted(() => {
  window.addEventListener('mousemove', resetIdleTimer)
  window.addEventListener('mousedown', resetIdleTimer)
  window.addEventListener('touchstart', resetIdleTimer)
  window.addEventListener('keydown', resetIdleTimer)
  window.addEventListener('keydown', handleKeyDown)
  resetIdleTimer()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', resetIdleTimer)
  window.removeEventListener('mousedown', resetIdleTimer)
  window.removeEventListener('touchstart', resetIdleTimer)
  window.removeEventListener('keydown', resetIdleTimer)
  window.removeEventListener('keydown', handleKeyDown)
  if (idleTimer) clearTimeout(idleTimer)
})
</script>

<template>
  <div
    class="viewport-container overflow-hidden relative w-screen h-screen bg-black"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @click.capture="handleGlobalClick"
  >
    <!-- Background Decoration -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl" />
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl" />

    <div
      class="main-slider flex h-full transition-transform duration-700 cubic-bezier"
      :style="{ transform: `translateX(-${currentPage * 100}vw)`, width: '300vw' }"
    >
      <div class="slide-page w-screen h-screen flex items-center justify-center flex-shrink-0">
        <SmartHomeView v-if="currentPage === 0" />
      </div>
      <div class="slide-page w-screen h-screen flex items-center justify-center flex-shrink-0">
        <ClockWeatherView />
      </div>
      <div class="slide-page w-screen h-screen flex items-center justify-center flex-shrink-0">
        <CalendarView v-if="currentPage === 2" ref="calendarRef" />
      </div>
    </div>

    <NewYearEgg />

    <WeatherEffects v-if="shouldShowWeatherEffects" />
  </div>
</template>

<style scoped>
.cubic-bezier {
  transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}
</style>
