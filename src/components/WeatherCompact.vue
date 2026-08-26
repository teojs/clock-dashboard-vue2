<script setup>
import { Droplets, Thermometer } from 'lucide-vue'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useWeatherStore } from '../stores/weather'
import WeatherSettingsModal from './WeatherSettingsModal.vue'

const weatherStore = useWeatherStore()
const { weatherData, loading, locationText, weatherInfo, refreshInterval } = storeToRefs(weatherStore)

const showSettings = ref(false)
let weatherTimer

function setupTimer() {
  if (weatherTimer)
    clearInterval(weatherTimer)
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
      class="weather-compact"
      :class="{ 'is-loading': loading }"
      @click.stop.prevent="showSettings = true"
    >
      <div class="weather-status">
        <div class="weather-icon">
          <img :src="weatherInfo.icon" :alt="weatherInfo.text" class="w-full h-full object-contain" draggable="false">
        </div>
        <div>
          <div class="weather-text">
            {{ weatherInfo.text }}
          </div>
          <div class="location-text">
            {{ locationText }}
            · 降雨
            <span class="rain-val">
              {{ weatherData ? weatherData.hourly.precipitation_probability[weatherData.current_hour_index] : '--' }}%
            </span>
          </div>
        </div>
      </div>

      <div class="weather-metrics">
        <div class="metric-item">
          <div class="metric-value">
            {{ weatherData ? Math.round(weatherData.current.temperature_2m) : '--' }}
          </div>
          <div class="metric-unit">
            <div class="unit-label">
              °C
            </div>
            <Thermometer class="metric-icon text-blue-500/60" />
          </div>
        </div>
        <div class="metric-item metric-humidity">
          <div class="metric-value">
            {{ weatherData ? weatherData.current.relative_humidity_2m : '--' }}
          </div>
          <div class="metric-unit">
            <div class="unit-label">
              %
            </div>
            <Droplets class="metric-icon text-blue-500/60" />
          </div>
        </div>
      </div>
    </div>

    <WeatherSettingsModal :show="showSettings" @close="showSettings = false" />
  </div>
</template>

<style scoped>
.weather-compact {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  width: 100%;
  cursor: pointer;
  opacity: 1;
  -webkit-transition:
    opacity 0.7s ease,
    -webkit-transform 0.2s ease;
  transition:
    opacity 0.7s ease,
    transform 0.2s ease;
}

.weather-compact.is-loading {
  opacity: 0.3;
}

.weather-compact:active {
  -webkit-transform: scale(0.98);
  transform: scale(0.98);
}

.weather-status {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  white-space: nowrap;
  margin-bottom: 3vh;
}

.weather-icon {
  width: 15vh;
  height: 15vh;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
  margin-right: 1vh;
}

.weather-text {
  font-size: 6vh;
  line-height: 1;
}

.location-text {
  font-size: 3vh;
  line-height: 1;
  margin-top: 1vh;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.rain-val {
  font-size: 4vh;
  line-height: 1;
  color: #60a5fa;
  font-variant-numeric: tabular-nums;
}

.weather-metrics {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: baseline;
  -webkit-align-items: baseline;
  align-items: baseline;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
}

.metric-item {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
}

.metric-humidity {
  margin-left: 4vw;
}

.metric-value {
  font-size: 10vh;
  line-height: 1;
  font-weight: 200;
}

.metric-unit {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  margin-left: 1vh;
}

.unit-label {
  font-size: 3.5vh;
  line-height: 1;
  font-weight: 300;
  opacity: 0.7;
}

.metric-icon {
  width: 4vh;
  height: 4vh;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
  margin-top: 0.5vh;
}
</style>
