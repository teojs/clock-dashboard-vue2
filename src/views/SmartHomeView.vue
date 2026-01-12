<script setup>
import { AirVent, AlertTriangle, Blinds, Droplets, Fan, Lightbulb, Loader2, Power, Settings, Thermometer, Tv, Zap } from 'lucide-vue'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref, watch } from 'vue'
import { haSocket } from '../api'
import SmartSettingsModal from '../components/SmartSettingsModal.vue'
import { useConfigStore } from '../stores/config'

const configStore = useConfigStore()
const { haConfig } = storeToRefs(configStore)

const isConnecting = ref(false)

const entitiesStates = ref({})
const loadingStates = ref({})
const showSettings = ref(false)

const connectErrorText = ref('')

// 计算要在顶部标题显示的温湿度信息（取第一个空调设备的数据）
const headerClimateInfo = computed(() => {
  const climateEntity = haConfig.value.entities.find(e => e.id.startsWith('climate.'))
  if (!climateEntity)
    return null

  const state = entitiesStates.value[climateEntity.id]
  if (!state || !state.attributes)
    return null

  const { current_temperature, current_humidity } = state.attributes
  if (current_temperature === undefined && current_humidity === undefined)
    return null

  return {
    temp: current_temperature,
    humi: current_humidity,
  }
})

function isEntityOn(entityId) {
  const state = entitiesStates.value[entityId]?.state
  if (entityId.startsWith('cover.')) {
    return state === 'open'
  }
  if (entityId.startsWith('climate.')) {
    return state && state !== 'off' && state !== 'unavailable'
  }
  return state === 'on'
}

function getIcon(domain, _isOn) {
  if (domain === 'light')
    return Lightbulb
  if (domain === 'switch')
    return Power
  if (domain === 'fan')
    return Fan
  if (domain === 'media_player')
    return Tv
  if (domain === 'cover')
    return Blinds
  if (domain === 'climate')
    return AirVent
  return Zap
}

async function initConnection() {
  if (!haConfig.value.url || !haConfig.value.token) return

  try {
    isConnecting.value = true
    await haSocket.connect(haConfig.value.url, haConfig.value.token)
    connectErrorText.value = ''
    haSocket.subscribeToEntities((entities) => {
      isConnecting.value = false
      entitiesStates.value = entities
    })
  }
  catch (e) {
    console.error('HA Connection Error:', e)
    isConnecting.value = false
    entitiesStates.value = {}
    connectErrorText.value = '连接失败，请检查网络和配置'
  }
}

async function toggleEntity(entityId) {
  if (!entitiesStates.value[entityId]) return

  if (isConnecting.value) return

  const domain = entityId.split('.')[0]
  const isOn = isEntityOn(entityId)

  let service = ''
  if (domain === 'cover') {
    service = isOn ? 'close_cover' : 'open_cover'
  }
  else if (domain === 'climate') {
    service = isOn ? 'turn_off' : 'turn_on'
  }
  else {
    service = isOn ? 'turn_off' : 'turn_on'
  }

  loadingStates.value[entityId] = true

  try {
    await haSocket.callService(domain, service, { entity_id: entityId })

    loadingStates.value[entityId] = false
  }
  catch (e) {
    alert('操作失败，请检查网络和配置')
    loadingStates.value[entityId] = false
  }
}

onUnmounted(() => {
  haSocket.disconnect()
})

watch([() => haConfig.value.url, () => haConfig.value.token], () => {
  initConnection()
}, { deep: true, immediate: true })
</script>

<template>
  <div class="w-screen h-screen relative scale-1">
    <div class="glass-panel p-8 md:p-14 flex flex-col items-center text-white h-full justify-start overflow-y-auto w-full">
      <div class="flex items-center justify-between w-full mb-10">
        <div class="flex items-baseline gap-6">
          <h2 class="text-4xl font-bold tracking-widest text-nowrap">
            智能控制
          </h2>
          <div v-if="headerClimateInfo" class="flex items-center gap-6 opacity-60">
            <div v-if="headerClimateInfo.temp !== undefined" class="flex items-center gap-2">
              <Thermometer class="w-5 h-5 text-orange-400" />
              <span class="text-2xl font-medium tabular-nums">{{ headerClimateInfo.temp }}°</span>
            </div>
            <div v-if="headerClimateInfo.humi !== undefined" class="flex items-center gap-2">
              <Droplets class="w-5 h-5 text-blue-400" />
              <span class="text-2xl font-medium tabular-nums">{{ headerClimateInfo.humi }}%</span>
            </div>
          </div>
        </div>
        <div class="flex gap-4 items-center">
          <div v-if="connectErrorText" class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-red-400" />
            <span class="text-red-400 text-sm">{{ connectErrorText }}</span>
          </div>
          <button class="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all" @click="showSettings = true">
            <Settings class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div v-if="haConfig.url && haConfig.token" id="ha-entities" class="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
        <div
          v-for="entity in haConfig.entities"
          :key="entity.id"
          class="ha-card"
          :class="{ 'on': isEntityOn(entity.id), 'opacity-50 pointer-events-none': isConnecting || loadingStates[entity.id] }"
          @click="toggleEntity(entity.id)"
        >
          <div class="flex items-center justify-between w-full mb-4">
            <div
              class="w-12 h-12 flex items-center justify-center rounded-full transition-colors"
              :class="isEntityOn(entity.id) ? 'bg-white text-black' : 'bg-white/10 text-white'"
            >
              <Loader2 v-if="isConnecting || loadingStates[entity.id]" class="w-6 h-6 animate-spin" />
              <AlertTriangle v-else-if="!entitiesStates[entity.id]" class="w-6 h-6 text-orange-400" />
              <component :is="getIcon(entity.id.split('.')[0], isEntityOn(entity.id))" v-else class="w-6 h-6" />
            </div>

            <!-- 右侧温湿度 (针对空调/climate) -->
            <div v-if="entity.id.startsWith('climate.') && entitiesStates[entity.id]?.attributes" class="flex gap-4 text-sm font-medium opacity-80">
              <div v-if="entitiesStates[entity.id].attributes.current_temperature !== undefined" class="flex items-center gap-1.5">
                <Thermometer class="w-4 h-4 text-orange-400" />
                <span class="text-base">{{ entitiesStates[entity.id].attributes.current_temperature }}°</span>
              </div>
              <div v-if="entitiesStates[entity.id].attributes.current_humidity !== undefined" class="flex items-center gap-1.5">
                <Droplets class="w-4 h-4 text-blue-400" />
                <span class="text-base">{{ entitiesStates[entity.id].attributes.current_humidity }}%</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col overflow-hidden w-full">
            <span class="font-bold text-lg truncate w-full">
              {{ entity.name || (entitiesStates[entity.id] && entitiesStates[entity.id].attributes && entitiesStates[entity.id].attributes.friendly_name) || entity.id }}
            </span>
            <span class="text-sm opacity-50 uppercase tracking-widest">
              <template v-if="entity.id.startsWith('climate.') && isEntityOn(entity.id)">
                {{ entitiesStates[entity.id]?.attributes?.temperature ? `${entitiesStates[entity.id].attributes.temperature}°C` : '已开启' }}
              </template>
              <template v-else>
                {{ !entitiesStates[entity.id] ? '未找到实体' : isEntityOn(entity.id) ? '已开启' : '已关闭' }}
              </template>
            </span>
          </div>
        </div>
      </div>

      <div v-else class="col-span-full text-center py-20 opacity-50">
        <p>请点击右上角设置 Home Assistant 地址和令牌</p>
      </div>
    </div>

    <!-- Smart Home Settings Modal -->
    <SmartSettingsModal
      :show="showSettings"
      :entities-states="entitiesStates"
      @close="showSettings = false"
    />
  </div>
</template>

<style scoped>
.ha-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.ha-card.on {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.ha-card:active {
  transform: scale(0.95);
}

.glass-panel {
  max-width: 1200px;
}
</style>
