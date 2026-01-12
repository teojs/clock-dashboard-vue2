<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useTime } from '../hooks/useTime'
import { getLunarDate } from '../utils/lunar'

const { now } = useTime()

// --- Mock Time Logic (Optional, for preview) ---
const isPreviewMode = ref(false) // 修改为 true 可立即预览效果
const mockOffset = ref(0)
// 公历跨年测试：2025-12-31 23:59:25
// const testStartTime = new Date(2025, 11, 31, 23, 59, 25).getTime()
// 农历跨年测试（2026 除夕）：2026-01-16 23:59:25 (注意 JS 月份从 0 开始，1 代表 2 月)
const testStartTime = new Date(2026, 1, 16, 23, 59, 45).getTime()
// --- End Mock ---

const currentTime = computed(() => {
  if (isPreviewMode.value) {
    return new Date(testStartTime + mockOffset.value)
  }
  return now.value
})

const lunarInfo = computed(() => getLunarDate(currentTime.value))
const isLunarEve = computed(() => lunarInfo.value.festival === '除夕')
const isLunarDay = computed(() => lunarInfo.value.festival === '春节')

const isEggActive = computed(() => {
  const t = currentTime.value
  const monthNow = t.getMonth()
  const dateNow = t.getDate()
  const hNow = t.getHours()
  const mNow = t.getMinutes()
  const sNow = t.getSeconds()

  // 公历判断
  const isNYE = monthNow === 11 && dateNow === 31 && hNow === 23 && mNow === 59 && sNow >= 30
  const isNYD = monthNow === 0 && dateNow === 1 && hNow === 0 && mNow < 2

  // 农历判断
  const isLunarEveActive = isLunarEve.value && hNow === 23 && mNow === 59 && sNow >= 30
  const isLunarDayActive = isLunarDay.value && hNow === 0 && mNow < 2

  return isNYE || isNYD || isLunarEveActive || isLunarDayActive
})

// Internal Timer for Mock
let internalTimer
function startMockTimer() {
  if (isPreviewMode.value && !internalTimer) {
    internalTimer = window.setInterval(() => {
      mockOffset.value += 1000
    }, 1000)
  }
}

function stopMockTimer() {
  if (internalTimer) {
    clearInterval(internalTimer)
    internalTimer = undefined
  }
}

const s = computed(() => currentTime.value.getSeconds())

// Countdown check
const isCountdownPeriod = computed(() => {
  const t = currentTime.value
  const hNow = t.getHours()
  const mNow = t.getMinutes()
  const sNow = t.getSeconds()
  const isTimeMatch = hNow === 23 && mNow === 59 && sNow >= 50

  const isSolarNYE = t.getMonth() === 11 && t.getDate() === 31
  return (isSolarNYE || isLunarEve.value) && isTimeMatch
})

const countdownValue = computed(() => 60 - s.value)

// Celebration check
const isCelebrationPeriod = computed(() => {
  const t = currentTime.value
  const hNow = t.getHours()
  const mNow = t.getMinutes()
  const isTimeMatch = hNow === 0 && mNow < 1

  const isSolarNYD = t.getMonth() === 0 && t.getDate() === 1
  return (isSolarNYD || isLunarDay.value) && isTimeMatch
})

// --- Fireworks Logic ---
const canvasRef = ref(null)
let animationId = null

class Firework {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth
    this.y = canvasHeight
    this.targetY = Math.random() * (canvasHeight * 0.5)
    this.color = `hsl(${Math.random() * 360}, 100%, 50%)`
    this.velocity = 4 + Math.random() * 4
    this.particles = []
    this.exploded = false
  }

  update() {
    if (!this.exploded) {
      this.y -= this.velocity
      if (this.y <= this.targetY) {
        this.explode()
      }
    }
    else {
      this.particles.forEach((p, i) => {
        p.update()
        if (p.alpha <= 0) {
          this.particles.splice(i, 1)
        }
      })
    }
  }

  explode() {
    this.exploded = true
    for (let i = 0; i < 50; i++) {
      this.particles.push(new Particle(this.x, this.y, this.color))
    }
  }

  draw(ctx) {
    if (!this.exploded) {
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
    else {
      this.particles.forEach(p => p.draw(ctx))
    }
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x
    this.y = y
    this.color = color
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 3 + 1
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    this.alpha = 1
    this.gravity = 0.05
  }

  update() {
    this.vx *= 0.98
    this.vy *= 0.98
    this.vy += this.gravity
    this.x += this.vx
    this.y += this.vy
    this.alpha -= 0.015
  }

  draw(ctx) {
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

const fireworks = []

function initCanvas() {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function render() {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'source-over'

  if (isCelebrationPeriod.value && Math.random() < 0.05) {
    fireworks.push(new Firework(canvas.width, canvas.height))
  }

  fireworks.forEach((fw, i) => {
    fw.update()
    fw.draw(ctx)
    if (fw.exploded && fw.particles.length === 0) {
      fireworks.splice(i, 1)
    }
  })

  animationId = requestAnimationFrame(render)
}

watch(isEggActive, (active) => {
  if (active) {
    // 异步执行以确保 DOM 已渲染 (v-if 挂载)
    setTimeout(() => {
      initCanvas()
      if (!animationId) render()
    }, 50)
  }
  else {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }
}, { immediate: true })

onMounted(() => {
  if (isPreviewMode.value) startMockTimer()
  window.addEventListener('resize', initCanvas)
})

onUnmounted(() => {
  stopMockTimer()
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', initCanvas)
})
</script>

<template>
  <div v-if="isEggActive" class="new-year-egg-wrapper pointer-events-none fixed inset-0 z-[100]">
    <!-- Countdown Overlay -->
    <transition name="scale">
      <div v-if="isCountdownPeriod" class="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div class="countdown-number text-[60vh] font-black text-white italic">
          {{ countdownValue }}
        </div>
      </div>
    </transition>

    <!-- Fireworks Canvas -->
    <canvas ref="canvasRef" class="w-full h-full" />
  </div>
</template>

<style scoped>
.scale-enter-active,
.scale-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter {
  opacity: 0;
  transform: scale(0.3);
}
.scale-leave-to {
  opacity: 0;
  transform: scale(2);
}

.countdown-number {
  text-shadow: 0 0 50px rgba(255, 255, 255, 0.5);
  animation: countdown-pulse 1s infinite;
}

@keyframes countdown-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
