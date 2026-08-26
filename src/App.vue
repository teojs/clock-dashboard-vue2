<script setup>
import { storeToRefs } from 'pinia'
import { useConfigStore } from './stores/config'
import ClockWeatherView from './views/ClockWeatherView.vue'
import ClockWeatherViewCompact from './views/ClockWeatherViewCompact.vue'

const configStore = useConfigStore()
const { clockConfig } = storeToRefs(configStore)
</script>

<template>
  <ClockWeatherViewCompact v-if="clockConfig.compactMode" />
  <ClockWeatherView v-else />
</template>

<style scoped>
</style>
