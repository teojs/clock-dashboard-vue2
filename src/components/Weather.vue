<script setup>
import { Droplets, Leaf, PersonStanding, Sun } from 'lucide-vue'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useWeatherStore } from '../stores/weather'
import { getAqiInfo } from '../utils/weather'
import WeatherSettingsModal from './WeatherSettingsModal.vue'

const weatherStore = useWeatherStore()
const { weatherData, loading, locationText, weatherInfo, refreshInterval, airQualityData } = storeToRefs(weatherStore)

const showSettings = ref(false)
let weatherTimer

const aqiInfo = computed(() => getAqiInfo(airQualityData.value?.current?.us_aqi))

function setupTimer() {
  if (weatherTimer) clearInterval(weatherTimer)
  weatherTimer = window.setInterval(weatherStore.updateWeather, refreshInterval.value * 60 * 1000)
}

watch(refreshInterval, () => {
  setupTimer()
})

onMounted(() => {
  weatherStore.updateWeather()
  setupTimer()
})

onUnmounted(() => {
  clearInterval(weatherTimer)
})

const Math = window.Math
</script>

<template>
  <div class="w-full">
    <div
      id="weather-container"
      class="weather-clickable px-4 sm:px-12 grid grid-cols-1 md:grid-cols-3 gap-3 w-full transition-opacity duration-700"
      :class="{ 'opacity-30': loading, 'opacity-100': !loading }"
      @click="showSettings = true"
    >
      <!-- 状态与定位 -->
      <div class="flex items-center justify-center md:justify-start gap-0">
        <div id="weather-icon" class="w-28 sm:h-28 flex-shrink-0">
          <img :src="weatherInfo.icon" :alt="weatherInfo.text" class="w-full h-full object-contain" draggable="false">
        </div>
        <div>
          <p id="weather-text" class="text-4xl font-semibold tracking-wide">
            {{ weatherInfo.text }}
          </p>
          <p id="location-text" class="text-lg text-white/80 uppercase tracking-widest mt-2 whitespace-nowrap">
            {{ locationText }} ·
            降雨 <span class="text-blue-400 text-xl tabular-nums">{{ weatherData ? weatherData.hourly.precipitation_probability[weatherData.current_hour_index] : '--' }}%</span>
          </p>
        </div>
      </div>

      <!-- 温度显示 -->
      <div class="flex items-center justify-center px-4 gap-6">
        <div class="flex items-end">
          <div id="temp-val" class="text-8xl font-extralight mr-1">
            {{ weatherData ? Math.round(weatherData.current.temperature_2m) : '--' }}
          </div>
          <div class="text-3xl font-light opacity-70 mb-12">
            °C
          </div>
        </div>
        <div class="flex flex-col items-end justify-between gap-2 text-3xl font-medium">
          <span id="temp-max" class="text-red-200">
            {{ weatherData ? Math.round(Math.max(...weatherData.hourly.temperature_2m)) : '--' }}°
          </span>
          <span id="temp-min" class="text-blue-200">
            {{ weatherData ? Math.round(Math.min(...weatherData.hourly.temperature_2m)) : '--' }}°
          </span>
        </div>
      </div>

      <!-- 环境数据 -->
      <div class="flex flex-col justify-center items-center md:items-end sm:col-span-2 md:col-span-1 gap-3 text-white text-3xl tabular-nums">
        <div class="w-full md:w-auto grid grid-cols-4 md:grid-cols-2 gap-y-3 gap-x-4">
          <!-- 湿度 -->
          <div class="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-1">
            <span id="humidity-val">
              {{ weatherData ? weatherData.current.relative_humidity_2m : '--' }}%
            </span>
            <Droplets class="w-8 h-8 text-blue-500/60 flex-shrink-0" />
          </div>

          <!-- 空气质量 -->
          <div class="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-1">
            <div class="flex items-start gap-2">
              <span id="aqi-val">
                {{ airQualityData?.current?.us_aqi || '--' }}
              </span>
              <span id="aqi-label" class="text-sm opacity-60 ml-[-6px] whitespace-nowrap" :class="aqiInfo.color">
                {{ aqiInfo?.label || '-' }}
              </span>
            </div>
            <Leaf class="w-8 h-8 text-green-300/60 flex-shrink-0" />
          </div>

          <!-- 体感温度 -->
          <div class="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-1">
            <span id="apparent-temp-val">
              {{ weatherData ? Math.round(weatherData.current.apparent_temperature) : '--' }}°C
            </span>
            <PersonStanding class="w-8 h-8 text-orange-500/60 flex-shrink-0" />
          </div>

          <!-- 紫外线 -->
          <div class="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-1">
            <span id="uv-val">
              {{ weatherData ? Math.round(weatherData.hourly.uv_index[weatherData.current_hour_index]) : '--' }}
            </span>
            <Sun class="w-8 h-8 text-purple-500/60 flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>

    <!-- 天气设置弹窗 -->
    <WeatherSettingsModal
      :show="showSettings"
      @close="showSettings = false"
    />
  </div>
</template>

<style scoped>
.weather-clickable {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.5s ease;
}
.weather-clickable:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.03);
}
</style>
