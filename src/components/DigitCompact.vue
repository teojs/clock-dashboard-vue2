<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps(['value', 'trigger', 'showSeconds', 'enableTilt', 'delay'])

const displayValue = ref(props.value)
const nextValue = ref(props.value)
const isAnimating = ref(false)
const containerRotate = ref(`rotate(${(Math.random() * 12 - 6).toFixed(1)}deg)`)

watch(() => props.trigger, () => {
  containerRotate.value = `rotate(${(Math.random() * 12 - 6).toFixed(1)}deg)`
})

watch(() => props.value, (newVal, oldVal) => {
  if (newVal === oldVal)
    return

  containerRotate.value = `rotate(${(Math.random() * 12 - 6).toFixed(1)}deg)`
  nextValue.value = newVal
  isAnimating.value = true

  setTimeout(() => {
    isAnimating.value = false
    displayValue.value = newVal
  }, 800 + (props.delay || 0))
})

onMounted(() => {
  displayValue.value = props.value
  nextValue.value = props.value
})
</script>

<template>
  <div
    class="digit-container"
    :class="{ 'show-seconds': showSeconds }"
    :style="{ 'transform': enableTilt ? containerRotate : 'none', '--delay': `${delay || 0}ms` }"
  >
    <div class="digit-window" :class="{ animating: isAnimating }">
      <div class="digit-item">
        {{ displayValue }}
      </div>
      <div class="digit-item">
        {{ nextValue }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.digit-container {
  --digit-item-height: 100vh;
  position: relative;
  display: inline-block;
  height: var(--digit-item-height);
  vertical-align: middle;
  transition: transform 0.6s linear;
  mix-blend-mode: screen;
  z-index: 1;
  text-align: center;
}

.digit-window {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-transform: translateY(0);
  transform: translateY(0);
}

.digit-window.animating {
  -webkit-transform: translateY(calc(var(--digit-item-height) * -1));
  transform: translateY(calc(var(--digit-item-height) * -1));
  -webkit-transition-property: -webkit-transform;
  transition-property: transform;
  -webkit-transition-timing-function: cubic-bezier(0.18, 0.18, 0.43, 1.34);
  transition-timing-function: cubic-bezier(0.18, 0.18, 0.43, 1.34);
  -webkit-transition-duration: 0.8s;
  transition-duration: 0.8s;
  -webkit-transition-delay: var(--delay);
  transition-delay: var(--delay);
}

.digit-item {
  display: block;
  height: var(--digit-item-height);
  line-height: var(--digit-item-height);
  text-align: center;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
  -webkit-transform: translateY(4vh);
  transform: translateY(4vh);
}
</style>
