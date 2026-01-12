<script setup>
import { ChevronDown, ChevronUp, Code, List, PlusCircle, Trash2, X } from 'lucide-vue'
import { ref, watch } from 'vue'
import { useConfigStore } from '../stores/config'

const props = defineProps(['show', 'entitiesStates'])

const emit = defineEmits(['close', 'saved'])

const configStore = useConfigStore()
const config = ref(JSON.parse(JSON.stringify(configStore.haConfig)))
const isJsonMode = ref(false)
const jsonInput = ref('')

// 弹窗打开时同步最新状态
watch(() => props.show, (isShowing) => {
  if (isShowing) {
    config.value = JSON.parse(JSON.stringify(configStore.haConfig))
  }
})

// 切换模式时同步数据
watch(isJsonMode, (newVal) => {
  if (newVal) {
    // 导出包括 URL、Token 和 实体列表的全量 JSON
    jsonInput.value = JSON.stringify({
      url: config.value.url,
      token: config.value.token,
      entities: config.value.entities,
    }, null, 2)
  }
  else {
    try {
      const parsed = JSON.parse(jsonInput.value)
      if (parsed && typeof parsed === 'object') {
        if (parsed.url !== undefined)
          config.value.url = parsed.url
        if (parsed.token !== undefined)
          config.value.token = parsed.token
        if (Array.isArray(parsed.entities))
          config.value.entities = parsed.entities
      }
    }
    catch (e) {
      alert('JSON 格式错误，请检查后再切换模式')
      setTimeout(() => {
        isJsonMode.value = true
      }, 0)
    }
  }
})

function addEntity() {
  config.value.entities.push({ id: '', name: '' })
}

function removeEntity(index) {
  config.value.entities.splice(index, 1)
}

function moveEntity(index, direction) {
  const newIndex = index + direction
  if (newIndex >= 0 && newIndex < config.value.entities.length) {
    const temp = config.value.entities[index]
    config.value.entities[index] = config.value.entities[newIndex]
    config.value.entities[newIndex] = temp
  }
}

function save() {
  if (isJsonMode.value) {
    try {
      const parsed = JSON.parse(jsonInput.value)
      if (parsed && typeof parsed === 'object') {
        config.value.url = parsed.url || ''
        config.value.token = parsed.token || ''
        config.value.entities = Array.isArray(parsed.entities) ? parsed.entities : []
      }
      else {
        throw new Error('Must be an object')
      }
    }
    catch (e) {
      alert('JSON 格式错误，保存失败')
      return
    }
  }
  configStore.haConfig = JSON.parse(JSON.stringify(config.value))
  emit('saved')
  emit('close')
}
</script>

<template>
  <div
    v-if="show"
    id="settings-modal"
    class="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center p-4 md:p-6 z-[1000]"
    @touchstart.stop
    @touchend.stop
    @mousedown.stop
    @mouseup.stop
  >
    <div class="absolute top-0 left-0 right-0 bottom-0 bg-black/80" @click="emit('close')" />
    <div class="bg-neutral-900 p-6 rounded-3xl border border-white/10 w-full max-w-xl text-white flex flex-col relative">
      <div class="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 class="text-2xl font-medium tracking-wide">
          Home Assistant 配置
        </h3>
        <div class="flex items-center gap-2">
          <button
            class="text-xs flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-all px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5"
            @click="isJsonMode = !isJsonMode"
          >
            <template v-if="!isJsonMode">
              <Code class="w-3.5 h-3.5" /> JSON 模式
            </template>
            <template v-else>
              <List class="w-3.5 h-3.5" /> 列表模式
            </template>
          </button>
          <button class="opacity-50 hover:opacity-100 p-2" @click="emit('close')">
            <X class="w-6 h-6" />
          </button>
        </div>
      </div>

      <div class="mb-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
        <p class="text-xs text-orange-200/60 leading-relaxed">
          <strong>💡 跨域提示：</strong> 如果接口无法加载，请确保在 Home Assistant 的 <code>configuration.yaml</code> 中配置了 <code>cors_allowed_origins</code>，包含当前看板的访问域名或 IP。
        </p>
      </div>

      <div class="space-y-6 flex-1">
        <div v-if="!isJsonMode" class="space-y-6 overflow-y-auto max-h-[55vh] border border-white/10 rounded-2xl p-3">
          <div>
            <label class="block text-sm opacity-50 mb-2 uppercase tracking-widest">HA 地址</label>
            <input
              v-model="config.url"
              type="text"
              placeholder="http://192.168.1.xxx:8123"
              class="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-white/30"
            >
          </div>
          <div>
            <label class="block text-sm opacity-50 mb-2 uppercase tracking-widest">长期访问令牌</label>
            <input
              v-model="config.token"
              type="password"
              placeholder="输入令牌"
              class="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-white/30"
            >
          </div>

          <div class="space-y-4">
            <label class="block text-sm opacity-50 uppercase tracking-widest">设备列表</label>
            <div class="space-y-3">
              <div v-for="(entity, index) in config.entities" :key="index" class="flex gap-2">
                <div class="flex flex-col gap-1">
                  <button class="p-1 opacity-30 hover:opacity-100 transition-opacity" @click="moveEntity(index, -1)">
                    <ChevronUp class="w-4 h-4" />
                  </button>
                  <button class="p-1 opacity-30 hover:opacity-100 transition-opacity" @click="moveEntity(index, 1)">
                    <ChevronDown class="w-4 h-4" />
                  </button>
                </div>
                <input
                  v-model="entity.id"
                  type="text"
                  class="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-white/30"
                  placeholder="实体 ID"
                >
                <input
                  v-model="entity.name"
                  type="text"
                  class="w-24 md:w-32 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-white/30"
                  :placeholder="props.entitiesStates?.[entity.id]?.attributes?.friendly_name || '备注名'"
                >
                <button class="p-2 text-red-400 hover:bg-red-400/10 rounded-lg" @click="removeEntity(index)">
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
              <button class="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-all mt-2 bg-white/5 px-4 py-2 rounded-xl w-full justify-center border border-dashed border-white/10 hover:border-white/20" @click="addEntity">
                <PlusCircle class="w-5 h-5" />
                添加设备
              </button>
            </div>
          </div>
        </div>

        <div v-else class="space-y-3 flex flex-col">
          <textarea
            v-model="jsonInput"
            rows="16"
            class="w-full flex-1 bg-white/5 border border-white/10 text-white font-mono text-sm rounded-xl px-4 py-3 outline-none focus:border-white/30"
            placeholder="{&quot;url&quot;: &quot;http://...&quot;, &quot;token&quot;: &quot;...&quot;, &quot;entities&quot;: [{&quot;id&quot;: &quot;light.living_room&quot;, &quot;name&quot;: &quot;客厅灯&quot;}]}"
          />
          <div class="flex justify-between items-center text-[10px] opacity-30 px-1">
            <span>格式: { "url": "...", "token": "...", "entities": [...] }</span>
          </div>
        </div>
      </div>

      <div class="pt-6 flex-shrink-0">
        <button class="w-full py-3 bg-white text-black font-bold rounded-2xl hover:bg-opacity-90 transition-all shadow-xl" @click="save">
          保存并应用
        </button>
      </div>
    </div>
  </div>
</template>
