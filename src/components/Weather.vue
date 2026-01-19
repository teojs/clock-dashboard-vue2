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
      class="weather-clickable px-10 flex w-full transition-opacity duration-700"
      :class="{ 'opacity-30': loading, 'opacity-100': !loading }"
      @click="showSettings = true"
    >
      <!-- 状态与定位 -->
      <div class="w-1/3 flex items-center justify-center md:justify-start">
        <div id="weather-icon" class="flex-shrink-0">
          <img :src="weatherInfo.icon" :alt="weatherInfo.text" class="w-full h-full object-contain" draggable="false">
        </div>
        <div>
          <div id="weather-text">
            {{ weatherInfo.text }}
          </div>
          <div id="location-text" class="text-white/80 uppercase tracking-widest whitespace-nowrap">
            {{ locationText }}
            · 降雨 <span class="precipitation-probability-val text-blue-400 tabular-nums">{{ weatherData ? weatherData.hourly.precipitation_probability[weatherData.current_hour_index] : '--' }}%</span>
          </div>
        </div>
      </div>

      <!-- 温度显示 -->
      <div class="w-1/3 flex items-center justify-center px-4">
        <div class="flex items-end mr-6">
          <div id="temp-val" class="font-extralight mr-1">
            {{ weatherData ? Math.round(weatherData.current.temperature_2m) : '--' }}
          </div>
          <div class="temp-unit font-light opacity-70">
            °C
          </div>
        </div>
        <div class="flex flex-col items-end justify-between font-medium">
          <span id="temp-max" class="text-red-200">
            {{ weatherData ? Math.round(Math.max(...weatherData.hourly.temperature_2m)) : '--' }}°
          </span>
          <span id="temp-min" class="text-blue-200">
            {{ weatherData ? Math.round(Math.min(...weatherData.hourly.temperature_2m)) : '--' }}°
          </span>
        </div>
      </div>

      <!-- 环境数据 -->
      <div class="environment-data w-1/3 flex justify-end items-center text-white tabular-nums">
        <div class="flex flex-col mr-4">
          <!-- 湿度 -->
          <div id="humidity-val" class="flex flex-row items-center justify-end">
            <span>
              {{ weatherData ? weatherData.current.relative_humidity_2m : '--' }}%
            </span>
            <Droplets class="environment-data-icon text-blue-500/60 flex-shrink-0 ml-1" />
          </div>

          <!-- 体感温度 -->
          <div id="apparent-temp-val" class="flex flex-row items-center justify-end">
            <span>
              {{ weatherData ? Math.round(weatherData.current.apparent_temperature) : '--' }}°C
            </span>
            <PersonStanding class="environment-data-icon text-orange-500/60 flex-shrink-0 ml-1" />
          </div>
        </div>

        <div class="flex flex-col">
          <!-- 空气质量 -->
          <div id="aqi-val" class="flex flex-row items-center justify-end">
            <div class="flex items-start">
              <span>
                {{ airQualityData?.current?.us_aqi || '--' }}
              </span>
              <span id="aqi-label" class="opacity-60 whitespace-nowrap" :class="aqiInfo.color">
                {{ aqiInfo?.label || '-' }}
              </span>
            </div>
            <Leaf class="environment-data-icon text-green-300/60 flex-shrink-0 ml-1" />
          </div>

          <!-- 紫外线 -->
          <div id="uv-val" class="flex flex-row items-center justify-end">
            <span>
              {{ weatherData ? Math.round(weatherData.hourly.uv_index[weatherData.current_hour_index]) : '--' }}
            </span>
            <Sun class="environment-data-icon text-purple-500/60 flex-shrink-0 ml-1" />
          </div>
        </div>
      </div>
    </div>

    <!-- 天气设置弹窗 -->
    <WeatherSettingsModal :show="showSettings" @close="showSettings = false" />
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

#weather-icon {
  width: 14.4vh;
  height: 14.4vh;
}

#weather-text {
  font-size: 4.7vh;
  line-height: 1.1;
  letter-spacing: 0.025em;
  font-weight: 600;
}

#location-text {
  font-size: 2.3vh;
  margin-top: 1vh;
}

.precipitation-probability-val {
  font-size: 2.8vh;
}

#temp-val {
  font-size: 12.5vh;
  line-height: 1.1;
}

.temp-unit {
  font-size: 3.6vh;
  margin-bottom: 7vh;
}

#temp-max,
#temp-min {
  font-size: 4vh;
  line-height: 1.1;
}
#temp-max {
  margin-bottom: 1.5vh;
}

.environment-data {
  font-size: 4vh;
  line-height: 1.1;
}

.environment-data-icon {
  width: 4.2vh;
  height: 4.2vh;
}

#humidity-val,
#aqi-val {
  margin-bottom: 1.5vh;
}

#aqi-label {
  font-size: 2vh;
  line-height: 1.1;
}
</style>
