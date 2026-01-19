<script setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import ClockSettingsModal from '../components/ClockSettingsModal.vue'
import Digit from '../components/Digit.vue'
import Weather from '../components/Weather.vue'
import { useTime } from '../hooks/useTime'
import { useConfigStore } from '../stores/config'

const configStore = useConfigStore()
const { clockConfig } = storeToRefs(configStore)

const { h1, h2, m1, m2, s1, s2, lunar, now } = useTime({
  is24Hour: computed(() => clockConfig.value.is24Hour),
})

const showClockSettings = ref(false)
const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const weekdayLabel = computed(() => {
  const date = now.value
  return weekdayNames[date.getDay()]
})

const baseDelay = computed(() => {
  return clockConfig.value.showSeconds ? 0 : -2
})

const Math = window.Math
</script>

<template>
  <div class="glass-panel h-screen flex flex-col items-center justify-center text-white w-full overflow-y-auto overflow-x-hidden">
    <!-- 日期与农历 -->
    <div class="flex flex-col sm:flex-row items-center md:items-start w-full justify-center">
      <div class="flex items-center">
        <div class="date-day-big">
          {{ now.getDate() }}
        </div>
        <div class="flex flex-col mr-16">
          <span class="weekday-label">
            {{ weekdayLabel }}
          </span>
          <span class="year-label">
            {{ now.getFullYear() }}年{{ now.getMonth() + 1 }}月
          </span>
        </div>
        <div class="flex flex-col">
          <div class="lunar-date-label">
            {{ lunar.date }}
            <span v-if="lunar.festival">
              ·{{ lunar.festival }}
            </span>
          </div>
          <span class="lunar-year-label">{{ lunar.year }}({{ lunar.yearShengxiao }})年{{ lunar.month }}月</span>
        </div>
      </div>
    </div>

    <!-- 时钟显示 -->
    <div
      class="clock-display tabular-nums cursor-pointer transition-all duration-500"
      :class="{ 'with-seconds': clockConfig.showSeconds }"
      :style="{ color: clockConfig.color, fontWeight: clockConfig.fontWeight, opacity: clockConfig.opacity }"
      @click="showClockSettings = true"
    >
      <Digit
        v-if="clockConfig.is24Hour || h1 !== 0"
        :value="h1" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(5 - baseDelay) * 100"
        class="opacity-95"
      />
      <Digit
        :value="h2" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(4 - baseDelay) * 100"
        class="opacity-95"
        :class="[{
          brightness: clockConfig.is24Hour || (!clockConfig.is24Hour && h1 !== 0),
        }]"
      />

      <div class="clock-separator">
        :
      </div>

      <Digit
        :value="m1" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(3 - baseDelay) * 100"
        class="opacity-95"
      />
      <Digit
        :value="m2" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(2 - baseDelay) * 100"
        class="opacity-95 brightness"
      />

      <template v-if="clockConfig.showSeconds">
        <div
          class="clock-separator second-separator"
          :style="{ opacity: clockConfig.opacity * 0.7 }"
        >
          :
        </div>
        <Digit
          class="second-digit opacity-60" :value="s1" :show-seconds="clockConfig.showSeconds"
          :trigger="now.getTime()"
          :delay="100"
          :enable-tilt="clockConfig.enableTilt"
        />
        <Digit
          class="second-digit brightness opacity-60" :value="s2" :show-seconds="clockConfig.showSeconds"
          :trigger="now.getTime()"
          :delay="0"
          :enable-tilt="clockConfig.enableTilt"
        />
      </template>
    </div>

    <!-- 天气展示 -->
    <Weather />

    <!-- 时钟设置弹窗 -->
    <ClockSettingsModal :show="showClockSettings" @close="showClockSettings = false" />
  </div>
</template>

<style scoped>
.glass-panel {
  max-width: 150vh;
  margin: 0 auto;
}

.date-day-big {
  font-size: 16vh;
  line-height: 1.1;
  font-weight: 800;
  background: linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-right: 1rem;
}

.weekday-label {
  font-size: 6vh;
  letter-spacing: 0.2em;
  line-height: 1.1;
  opacity: 0.9;
}

.year-label {
  font-size: 4.6vh;
  letter-spacing: 0.2em;
  line-height: 1.1;
  opacity: 0.8;
  margin-top: 0.5vh;
}

.lunar-date-label {
  font-size: 6vh;
  letter-spacing: 0.2em;
  line-height: 1.1;
  opacity: 0.9;
}

.lunar-year-label {
  font-size: 4.6vh;
  letter-spacing: 0.2em;
  line-height: 1.1;
  opacity: 0.8;
  margin-top: 0.5vh;
}

.clock-display {
  display: flex;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center;
  justify-content: center;
  font-family: 'SFCompactRounded', 'Huninn', sans-serif;
  font-size: 54vh;
  margin-top: 6vh;
  margin-bottom: 6vh;
}

.clock-display.with-seconds {
  font-size: 38vh;
  margin-top: 10vh;
  margin-bottom: 10vh;
}

.clock-separator {
  font-size: 95%;
  opacity: 0.98;
  text-align: center;
  margin: 0 -0.08em;
  display: flex;
  justify-content: center;
  line-height: 0.8em;
  position: relative;
  top: -0.05em;
  z-index: 10;
  filter: brightness(1.8);
}

.brightness {
  filter: brightness(1.25);
}
</style>
