<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useWeatherStore } from '../stores/weather'

const weatherStore = useWeatherStore()
const {
  weatherData,
  showRainEffect,
  showThunderEffect,
  showSnowEffect,
} = storeToRefs(weatherStore)

// WMO codes:
// Rain: 51-55 (drizzle), 61-67 (rain), 80-82 (showers), 95-99 (thunderstorm)
// Snow: 71-77 (snowfall), 85-86 (snow showers)
// Thunder: 95, 96, 99

const weatherCode = computed(() => weatherData.value?.current?.weather_code ?? -1)

const isRaining = computed(() => {
  if (!showRainEffect.value) return false
  const code = weatherCode.value
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)
})

const isSnowing = computed(() => {
  if (!showSnowEffect.value) return false
  const code = weatherCode.value
  return (code >= 71 && code <= 77) || (code === 85 || code === 86)
})

const isThundering = computed(() => {
  if (!showThunderEffect.value) return false
  const code = weatherCode.value
  return code === 95 || code === 96 || code === 99
})

// Particle density based on code
const rainCount = computed(() => {
  const code = weatherCode.value
  if (code === 65 || code === 82 || code === 99) return 150 // Heavy
  if (code === 63 || code === 81 || code === 96) return 100 // Moderate
  if (code >= 51 && code <= 55) return 40 // Drizzle
  return 80 // Default rain
})

const snowCount = computed(() => {
  const code = weatherCode.value
  if (code === 75 || code === 86) return 100 // Heavy
  if (code === 73) return 60 // Moderate
  return 30 // Light/Default
})

const showFlash = ref(false)
const showBolt = ref(false)
// 存储当前雷电的坐标点
let currentBoltPoints = []

const canvasRef = ref(null)
let animationId = null
let flashTimer = null

// Rain state
let drops = []

// Snow state
let snowflakes = []

function initCanvas() {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Init Rain
  if (isRaining.value) {
    const count = rainCount.value
    const baseSpeed = count <= 40 ? 5 : count <= 100 ? 7 : 10
    drops = []
    for (let i = 0; i < count; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        l: 20 + Math.random() * 15,
        v: baseSpeed + Math.random() * baseSpeed,
      })
    }
  }

  // Init Snow
  if (isSnowing.value) {
    const count = snowCount.value
    snowflakes = []
    for (let i = 0; i < count; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 2 + Math.random() * 3,
        v: 1 + Math.random() * 2,
        w: 0.5 + Math.random() * 1,
        o: Math.random() * Math.PI * 2,
      })
    }
  }
}

function generateLightningPoints() {
  const width = 100 + Math.random() * 200
  const height = canvasRef.value ? canvasRef.value.height * 0.6 : 400
  const startX = Math.random() * (window.innerWidth - width)
  const startY = Math.random() * 50

  const mainPath = []
  let currX = startX + width / 2
  let currY = startY
  const segments = 5 + Math.floor(Math.random() * 5)
  const segmentHeight = height / segments

  mainPath.push({ x: currX, y: currY })

  const newBoltPoints = []

  for (let i = 1; i <= segments; i++) {
    currX += (Math.random() - 0.5) * 60
    currY += segmentHeight
    mainPath.push({ x: currX, y: currY })

    // Add a branch occasionally
    if (Math.random() > 0.7 && i < segments) {
      const branchPath = []
      branchPath.push({ x: currX, y: currY })
      const bX = currX + (Math.random() - 0.5) * 80
      const bY = currY + segmentHeight * 0.5
      branchPath.push({ x: bX, y: bY })
      newBoltPoints.push(branchPath)
    }
  }

  newBoltPoints.push(mainPath)
  currentBoltPoints = newBoltPoints
}

function drawLightning(ctx) {
  if (!showBolt.value || currentBoltPoints.length === 0) return

  ctx.save()

  // 模拟发光：核心外围
  ctx.shadowBlur = 15
  ctx.shadowColor = 'rgba(255, 255, 255, 1)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  currentBoltPoints.forEach((path) => {
    ctx.beginPath()
    ctx.moveTo(path[0].x, path[0].y)
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y)
    }
    ctx.stroke()
  })

  // 纯白色核心
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  currentBoltPoints.forEach((path) => {
    ctx.beginPath()
    ctx.moveTo(path[0].x, path[0].y)
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y)
    }
    ctx.stroke()
  })

  ctx.restore()
}

function render() {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 1. 绘制雷电 (先画雷电，这样雨滴可以在雷电上层，层次感更好)
  if (isThundering.value && showBolt.value) {
    drawLightning(ctx)
  }

  // 2. 绘制雨滴
  if (isRaining.value) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i]
      ctx.beginPath()
      ctx.moveTo(d.x, d.y)
      // 保持倾斜角度与速度比例一致 (水平偏移设为速度的 15%)
      const drift = d.v * 0.15
      ctx.lineTo(d.x + drift * 2, d.y + d.l)
      ctx.stroke()

      d.y += d.v
      d.x += drift

      if (d.y > canvas.height) {
        d.y = -d.l
        d.x = Math.random() * canvas.width
      }
    }
  }

  // 3. 绘制雪花
  if (isSnowing.value) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    for (let i = 0; i < snowflakes.length; i++) {
      const s = snowflakes[i]
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()

      s.y += s.v
      s.x += Math.sin(s.o + s.y / 50) * s.w

      if (s.y > canvas.height) {
        s.y = -s.r
        s.x = Math.random() * canvas.width
      }
    }
  }

  animationId = requestAnimationFrame(render)
}

watch([isRaining, rainCount, isSnowing, snowCount], () => {
  initCanvas()
})

function triggerFlash() {
  if (!isThundering.value) return

  // Generate bolt
  generateLightningPoints()
  showBolt.value = true
  showFlash.value = true

  // Multiple flickers for the flash and bolt
  setTimeout(() => {
    showFlash.value = false
    showBolt.value = false
  }, 50)
  setTimeout(() => {
    showFlash.value = true
    showBolt.value = true
  }, 100)
  setTimeout(() => {
    showFlash.value = false
    showBolt.value = false
  }, 150)
  setTimeout(() => {
    showFlash.value = true
    showBolt.value = true
  }, 200)
  setTimeout(() => {
    showFlash.value = false
    showBolt.value = false
  }, 400)

  // Random next flash
  const nextFlash = 3000 + Math.random() * 7000
  flashTimer = window.setTimeout(triggerFlash, nextFlash)
}

watch(isThundering, (newVal) => {
  if (newVal) {
    triggerFlash()
  }
  else if (flashTimer) {
    clearTimeout(flashTimer)
    flashTimer = null
    showFlash.value = false
  }
}, { immediate: true })

onMounted(() => {
  initCanvas()
  render()
  window.addEventListener('resize', initCanvas)
})

onUnmounted(() => {
  if (flashTimer) clearTimeout(flashTimer)
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', initCanvas)
})
</script>

<template>
  <div class="weather-effects-container pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <!-- Thunder Flash -->
    <div
      v-if="isThundering"
      class="flash-overlay absolute inset-0 bg-white opacity-0 transition-opacity duration-75"
      :class="{ 'opacity-10': showFlash }"
    />

    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full"
    />
  </div>
</template>

<style scoped>
.weather-effects-container {
  z-index: 50;
  will-change: transform;
}

.flash-overlay {
  z-index: 10;
  will-change: opacity;
}
</style>
