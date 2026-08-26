<script setup>
import { RotateCcw, Save, X } from 'lucide-vue'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useConfigStore } from '../stores/config'

const props = defineProps(['show'])

const emit = defineEmits(['close'])

const configStore = useConfigStore()
const { clockConfig } = storeToRefs(configStore)

const draft = ref({
  compactMode: false,
  ...clockConfig.value,
})

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    draft.value = {
      compactMode: false,
      ...clockConfig.value,
    }
  }
})

const presetColors = [
  '#ffffff',
  '#659FE8',
  '#EF7993',
  '#F2A666',
  '#8CDB92',
  '#68CDD7',
]

function handleRestoreDefault() {
  draft.value = {
    color: '#ffffff',
    fontWeight: 700,
    enableTilt: true,
    showSeconds: false,
    opacity: 0.9,
    is24Hour: true,
    clockOnlyMode: false,
    compactMode: false,
  }
}

function toggleClockOnlyMode() {
  draft.value.clockOnlyMode = !draft.value.clockOnlyMode
  if (draft.value.clockOnlyMode)
    draft.value.compactMode = false
}

function toggleCompactMode() {
  draft.value.compactMode = !draft.value.compactMode
  if (draft.value.compactMode)
    draft.value.clockOnlyMode = false
}

function handleSaveAndClose() {
  clockConfig.value = { ...draft.value }
  emit('close')
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
    @touchstart.stop
    @touchend.stop
    @mousedown.stop
    @mouseup.stop
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/80" @click="$emit('close')" />

    <!-- Modal Content -->
    <div class="relative max-w-lg bg-neutral-900 border border-white/10 rounded-3xl p-6 pb-3 text-white">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-medium tracking-wide">
          时钟设置
        </h2>
        <button class="p-2 hover:bg-white/10 rounded-full transition-colors" @click="$emit('close')">
          <X class="w-6 h-6" />
        </button>
      </div>

      <div>
        <div class="space-y-8 overflow-y-auto max-h-[60vh] border border-white/10 rounded-2xl p-4">
          <!-- Color Picker -->
          <section>
            <h3 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
              时钟颜色
            </h3>
            <div class="flex flex-wrap mb-4">
              <div v-for="color in presetColors" :key="color" class="mr-2 mb-2">
                <button
                  class="w-10 h-10 rounded-full border-4 transition-all"
                  :style="{ backgroundColor: color, borderColor: draft.color === color ? 'white' : 'transparent' }"
                  @click="draft.color = color"
                />
              </div>
              <div
                class="w-10 h-10 rounded-full border-2 transition-all overflow-hidden"
                :style="{
                  background: 'linear-gradient(90deg, #07aeea 0.000%, #2bf598 100.000%)',
                  borderColor: presetColors.includes(draft.color) ? 'transparent' : 'white',
                }"
              >
                <input v-model="draft.color" type="color" class="w-full h-full opacity-0">
              </div>
            </div>
          </section>

          <!-- Font Weight -->
          <section>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-white/50 uppercase tracking-widest text-sm font-medium">
                字重
              </h3>
              <span class="text-sm font-mono bg-white/10 px-2 py-0.5 rounded">{{ draft.fontWeight }}</span>
            </div>
            <input
              v-model.number="draft.fontWeight"
              type="range"
              min="100"
              max="900"
              step="100"
              class="w-full accent-white"
            >
            <div class="flex justify-between mt-2 text-[10px] text-white/30 uppercase tracking-tighter">
              <span>100</span>
              <span>200</span>
              <span>300</span>
              <span>400</span>
              <span>500</span>
              <span>600</span>
              <span>700</span>
              <span>800</span>
              <span>900</span>
            </div>
          </section>

          <!-- Opacity -->
          <section>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-white/50 uppercase tracking-widest text-sm font-medium">
                透明度
              </h3>
              <span class="text-sm font-mono bg-white/10 px-2 py-0.5 rounded">{{ draft.opacity }}</span>
            </div>
            <input
              v-model.number="draft.opacity"
              type="range"
              min="0.1"
              max="1"
              step="0.01"
              class="w-full accent-white"
            >
            <div class="flex justify-between mt-2 text-[10px] text-white/30 uppercase tracking-tighter">
              <span>0.1</span>
              <span>0.5</span>
              <span>1.0</span>
            </div>
          </section>

          <!-- Toggles -->
          <section class="space-y-4">
            <div
              class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
              @click="draft.showSeconds = !draft.showSeconds"
            >
              <span class="font-medium">显示秒钟</span>
              <div
                class="w-12 h-6 rounded-full transition-colors relative"
                :class="draft.showSeconds ? 'bg-white' : 'bg-white/10'"
              >
                <div
                  class="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform"
                  :class="draft.showSeconds ? 'translate-x-6 bg-black' : 'bg-white/50'"
                />
              </div>
            </div>

            <div
              class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
              @click="draft.is24Hour = !draft.is24Hour"
            >
              <span class="font-medium">24 小时制</span>
              <div
                class="w-12 h-6 rounded-full transition-colors relative"
                :class="draft.is24Hour ? 'bg-white' : 'bg-white/10'"
              >
                <div
                  class="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform"
                  :class="draft.is24Hour ? 'translate-x-6 bg-black' : 'bg-white/50'"
                />
              </div>
            </div>

            <div
              class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
              @click="draft.enableTilt = !draft.enableTilt"
            >
              <span class="font-medium">随机倾斜</span>
              <div
                class="w-12 h-6 rounded-full transition-colors relative"
                :class="draft.enableTilt ? 'bg-white' : 'bg-white/10'"
              >
                <div
                  class="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform"
                  :class="draft.enableTilt ? 'translate-x-6 bg-black' : 'bg-white/50'"
                />
              </div>
            </div>

            <div
              class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
              @click="toggleClockOnlyMode"
            >
              <span class="font-medium">仅显示时钟</span>
              <div
                class="w-12 h-6 rounded-full transition-colors relative"
                :class="draft.clockOnlyMode ? 'bg-white' : 'bg-white/10'"
              >
                <div
                  class="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform"
                  :class="draft.clockOnlyMode ? 'translate-x-6 bg-black' : 'bg-white/50'"
                />
              </div>
            </div>

            <div
              class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
              @click="toggleCompactMode"
            >
              <span class="font-medium">紧凑模式</span>
              <div
                class="w-12 h-6 rounded-full transition-colors relative"
                :class="draft.compactMode ? 'bg-white' : 'bg-white/10'"
              >
                <div
                  class="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform"
                  :class="draft.compactMode ? 'translate-x-6 bg-black' : 'bg-white/50'"
                />
              </div>
            </div>
          </section>
        </div>

        <!-- Action Buttons -->
        <div class="flex pt-4">
          <button
            class="rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-medium mr-2"
            @click="handleRestoreDefault"
          >
            <span class="flex items-center justify-center p-3 px-6">
              <RotateCcw class="w-5 h-5 mr-2" />
              还原默认
            </span>
          </button>
          <button
            class="flex-1 rounded-2xl font-bold transition-all bg-white text-black hover:bg-opacity-90"
            @click="handleSaveAndClose"
          >
            <span class="flex items-center justify-center p-3 ">
              <Save class="w-5 h-5 mr-2" />
              保存并关闭
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='range'] {
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  height: 6px;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
</style>
