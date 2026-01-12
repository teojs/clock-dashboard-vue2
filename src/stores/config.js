import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfigStore = defineStore('config', () => {
  const clockConfig = ref({
    color: '#ffffff',
    fontWeight: 700,
    enableTilt: true,
    showSeconds: false,
    opacity: 0.9,
    is24Hour: true,
  })

  const calendarConfig = ref({
    weekStartDay: 0, // 0: Sunday, 1: Monday
  })

  const haConfig = ref({
    url: '',
    token: '',
    entities: [],
  })

  return {
    clockConfig,
    calendarConfig,
    haConfig,
  }
}, {
  persist: true,
})
