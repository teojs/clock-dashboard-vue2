<script setup>
import { RotateCcw, Save, X } from 'lucide-vue'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useConfigStore } from '../stores/config'

const props = defineProps(['show'])

const emit = defineEmits(['close'])

const configStore = useConfigStore()
const { calendarConfig } = storeToRefs(configStore)

const draft = ref({ ...calendarConfig.value })

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    draft.value = { ...calendarConfig.value }
  }
})

function handleRestoreDefault() {
  draft.value = {
    weekStartDay: 0,
  }
}

function handleSaveAndClose() {
  emit('close')
  // 延迟更新配置，让弹窗先关闭，避免重绘日历导致的卡顿
  setTimeout(() => {
    calendarConfig.value = { ...draft.value }
  }, 0)
}
</script>

<template>
  <div
    v-if="show"
    class="absolute inset-0 z-[100] flex items-center justify-center p-4"
    @touchstart.stop
    @touchend.stop
    @mousedown.stop
    @mouseup.stop
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/80" @click="$emit('close')" />

    <!-- Modal Content -->
    <div class="relative max-w-lg w-full bg-neutral-900 border border-white/10 rounded-3xl p-6 pb-3 text-white">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-medium tracking-wide">
          日历设置
        </h2>
        <button class="p-2 hover:bg-white/10 rounded-full transition-colors" @click="$emit('close')">
          <X class="w-6 h-6" />
        </button>
      </div>

      <div>
        <div class="space-y-6 overflow-y-auto max-h-[60vh] border border-white/10 rounded-2xl p-4">
          <!-- Week Start Day -->
          <section>
            <h3 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
              每周开始于
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <button
                class="flex items-center justify-center p-2 rounded-xl cursor-pointer transition-all duration-300 text-center border"
                :class="draft.weekStartDay === 0 ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'"
                @click="draft.weekStartDay = 0"
              >
                星期日
              </button>
              <button
                class="flex items-center justify-center p-2 rounded-xl cursor-pointer transition-all duration-300 text-center border"
                :class="draft.weekStartDay === 1 ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'"
                @click="draft.weekStartDay = 1"
              >
                星期一
              </button>
            </div>
          </section>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 pt-4">
          <button
            class="flex items-center justify-center gap-2 p-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-medium"
            @click="handleRestoreDefault"
          >
            <RotateCcw class="w-5 h-5" />
            还原
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl font-bold transition-all bg-white text-black hover:bg-opacity-90"
            @click="handleSaveAndClose"
          >
            <Save class="w-5 h-5" />
            保存并关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
