<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{
  delay: number
  duration: number
}>()

const active = ref(false)
onMounted(() => active.value = true)
</script>

<template>
  <div
    v-if="active"
    class="line-burst-effects"
    :style="{ '--burst-delay': `${props.delay}ms`, '--burst-duration': `${props.duration}ms` }"
    aria-hidden="true"
    @animationend="active = false"
  >
    <div v-for="i in 8" :key="i" class="burst-ray" :style="{ '--ray-angle': `${i * 45}deg` }">
      <span />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.line-burst-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .burst-ray {
    position: absolute;
    inset: 0;
    transform: rotate(var(--ray-angle));
  }

  span {
    position: absolute;
    top: -5px;
    left: calc(50% - 0.625px);
    width: 1.25px;
    height: 7px;
    border-radius: 1px;
    background: var(--yun-avatar-burst-color, var(--va-c-primary));
    animation: line-burst var(--burst-duration) ease-out var(--burst-delay) both;
  }
}

@keyframes line-burst {
  0% {
    opacity: 0;
    transform: translateY(0);
  }

  25% {
    opacity: 0.35;
  }

  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .line-burst-effects {
    display: none;
  }

  .line-burst-effects span {
    animation: none;
  }
}
</style>
