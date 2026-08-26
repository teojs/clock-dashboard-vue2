<script setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import ClockSettingsModal from '../components/ClockSettingsModal.vue'
import DigitCompact from '../components/DigitCompact.vue'
import WeatherCompact from '../components/WeatherCompact.vue'
import { useTime } from '../hooks/useTime'
import { useConfigStore } from '../stores/config'

const configStore = useConfigStore()
const { clockConfig } = storeToRefs(configStore)

const { h1, h2, m1, m2, lunar, now } = useTime({
  is24Hour: computed(() => clockConfig.value.is24Hour),
})

const showClockSettings = ref(false)

const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

const weekdayLabel = computed(() => weekdayNames[now.value.getDay()])
const monthLabel = computed(() => monthNames[now.value.getMonth()])

const baseDelay = computed(() => {
  return clockConfig.value.showSeconds ? 0 : -2
})

const Math = window.Math
</script>

<template>
  <div class="compact-clock-weather-view relative h-full w-full text-white overflow-hidden">
    <div class="compact-layout">
      <!-- 左侧：紧凑时钟 -->
      <div class="clock-column">
        <div
          class="clock-display tabular-nums cursor-pointer"
          :style="{
            color: clockConfig.color,
            opacity: clockConfig.opacity,
          }"
          @click="showClockSettings = true"
        >
          <DigitCompact
            v-if="clockConfig.is24Hour || h1 !== 0"
            :value="h1"
            :show-seconds="clockConfig.showSeconds"
            :enable-tilt="false"
            :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
            :delay="(5 - baseDelay) * 100"
            class="opacity-95"
          />
          <DigitCompact
            :value="h2"
            :show-seconds="clockConfig.showSeconds"
            :enable-tilt="false"
            :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
            :delay="(4 - baseDelay) * 100"
            class="opacity-95"
            :class="{
              brightness: clockConfig.is24Hour || (!clockConfig.is24Hour && h1 !== 0),
            }"
          />

          <div class="clock-separator">
            :
          </div>

          <DigitCompact
            :value="m1"
            :show-seconds="clockConfig.showSeconds"
            :enable-tilt="false"
            :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
            :delay="(3 - baseDelay) * 100"
            class="opacity-95"
          />
          <DigitCompact
            :value="m2"
            :show-seconds="clockConfig.showSeconds"
            :enable-tilt="false"
            :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
            :delay="(2 - baseDelay) * 100"
            class="opacity-95 brightness"
          />
        </div>
      </div>

      <!-- 右侧：日期 / 农历 / 天气 -->
      <div class="info-column">
        <div class="date-block">
          <div class="date-day">
            {{ now.getDate() }}
          </div>
          <div class="date-labels">
            <span class="month-label">
              {{ monthLabel }}
            </span>
            <span class="weekday-label">
              {{ weekdayLabel }}
            </span>
          </div>
          <div class="lunar-label">
            {{ lunar.year }}({{ lunar.yearShengxiao }})年{{ lunar.month }}月{{ lunar.date }}
          </div>
          <div v-if="lunar.festival" class="festival-label">
            {{ lunar.festival }}
          </div>
        </div>
        <WeatherCompact />
      </div>
    </div>

    <ClockSettingsModal :show="showClockSettings" @close="showClockSettings = false" />
  </div>
</template>

<style scoped>
.compact-clock-weather-view {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    sans-serif;
}

/* iOS 9 不支持 CSS Grid，用 flex 实现 3:2 左右布局 */
.compact-layout {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  height: 100%;
  width: 100%;
}

.clock-column {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-flex: 3;
  -webkit-flex: 3 1 0%;
  flex: 3 1 0%;
  height: 100%;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  padding-left: 2vw;
  min-width: 0;
}

.info-column {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-flex: 2;
  -webkit-flex: 2 1 0%;
  flex: 2 1 0%;
  height: 100%;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  min-width: 0;
  padding: 2vh 1vw;
}

.date-block {
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
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  margin-bottom: 4vh;
}

.date-day {
  font-size: 26vh;
  line-height: 1;
}

.date-labels {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  margin-top: 3vh;
}

.month-label,
.weekday-label {
  font-size: 8vh;
  line-height: 1;
}

.weekday-label {
  margin-left: 1vw;
}

.lunar-label,
.festival-label {
  font-size: 4vh;
  line-height: 1;
  letter-spacing: 0.1em;
  margin-top: 3vh;
}

.clock-display {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -webkit-flex-direction: row;
  flex-direction: row;
  -webkit-flex-wrap: nowrap;
  flex-wrap: nowrap;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  font-family: 'ClockDigits', 'SFCompactRounded', 'Huninn', sans-serif;
  font-weight: 500;
  font-style: normal;
  -webkit-transition: all 0.5s ease;
  transition: all 0.5s ease;
}

.clock-display,
.clock-separator {
  font-size: 58vw;
}

@media (min-aspect-ratio: 100 / 58) {
  .clock-display,
  .clock-separator {
    font-size: 100vh;
  }
}

.clock-separator {
  height: 100vh;
  line-height: 100vh;
  opacity: 0.98;
  text-align: center;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  -webkit-filter: brightness(1.8);
  filter: brightness(1.8);
  -webkit-transform: translateY(-6vh);
  transform: translateY(-6vh);
}

.brightness {
  -webkit-filter: brightness(1.25);
  filter: brightness(1.25);
}
</style>
