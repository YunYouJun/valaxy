<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { GirlsLayoutProps } from '../../types'
import { computed } from 'vue'
import { getBubblePoints, getGirlKey } from '../../client'
import ValaxyGirlDetail from './ValaxyGirlDetail.vue'
import ValaxyGirlOrb from './ValaxyGirlOrb.vue'

interface BubbleItemStyle extends CSSProperties {
  '--valaxy-girl-bubble-delay': string
  '--valaxy-girl-bubble-layer': number
  '--valaxy-girl-bubble-size': string
}

const props = defineProps<GirlsLayoutProps>()

const emit = defineEmits<{
  select: [index: number]
}>()

const selectedGirl = computed(() => props.girls[props.selectedIndex] || props.girls[0])
const bubbleItems = computed(() => {
  const points = getBubblePoints(props.girls.length)
  return props.girls.map((girl, index) => {
    const point = points[index]
    return {
      girl,
      index,
      key: getGirlKey(girl, index),
      style: {
        '--valaxy-girl-bubble-delay': `${point.delay}ms`,
        '--valaxy-girl-bubble-layer': props.girls.length - index,
        '--valaxy-girl-bubble-size': `${point.diameter}%`,
        'left': `${point.x}%`,
        'top': `${point.y}%`,
      } satisfies BubbleItemStyle,
    }
  })
})
const bubbleClasses = computed(() => ({
  'valaxy-girls-bubbles': true,
  'valaxy-girls-bubbles-motion-off': props.motion === 'off',
}))
</script>

<template>
  <div :class="bubbleClasses">
    <div class="valaxy-girls-bubbles-stage">
      <ol class="valaxy-girls-bubbles-list">
        <li
          v-for="item in bubbleItems"
          :key="item.key"
          class="valaxy-girls-bubbles-item"
          :style="item.style"
        >
          <ValaxyGirlOrb
            :girl="item.girl"
            :index="item.index"
            packed
            :selected="item.index === selectedIndex"
            size="100%"
            @select="emit('select', item.index)"
          />
        </li>
      </ol>
    </div>

    <ValaxyGirlDetail
      v-if="selectedGirl"
      class="valaxy-girls-bubbles-detail"
      :girl="selectedGirl"
      :reason-mode="reasonMode"
    />
  </div>
</template>

<style scoped>
.valaxy-girls-bubbles {
  border-radius: 0.85rem;
}

.valaxy-girls-bubbles-stage {
  position: relative;
  width: min(100%, 43rem);
  margin: 0 auto;
  aspect-ratio: 1;
  isolation: isolate;
}

.valaxy-girls-bubbles-stage::before {
  position: absolute;
  z-index: -1;
  inset: 3%;
  background:
    radial-gradient(circle at 48% 45%, color-mix(in srgb, var(--valaxy-girls-sky) 13%, transparent), transparent 48%),
    color-mix(in srgb, var(--valaxy-girls-soft) 46%, transparent);
  border: 1px solid color-mix(in srgb, var(--valaxy-girls-sky) 15%, transparent);
  border-radius: 50%;
  box-shadow: inset 0 0 4rem color-mix(in srgb, var(--valaxy-girls-sky) 8%, transparent);
  content: '';
}

.valaxy-girls-bubbles-list {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
}

.valaxy-girls-bubbles-item {
  position: absolute;
  z-index: var(--valaxy-girl-bubble-layer);
  width: var(--valaxy-girl-bubble-size);
  list-style: none;
  transform: translate(-50%, -50%);
  animation: valaxy-girls-bubble-settle 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--valaxy-girl-bubble-delay);
  aspect-ratio: 1;
}

.valaxy-girls-bubbles-item:hover,
.valaxy-girls-bubbles-item:focus-within {
  z-index: 10000;
}

.valaxy-girls-bubbles-detail {
  width: min(30rem, calc(100% - 1rem));
  margin: -0.75rem auto 0.5rem;
}

.valaxy-girls-bubbles-motion-off .valaxy-girls-bubbles-item {
  animation: none;
}

@keyframes valaxy-girls-bubble-settle {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.82);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@media (width <= 40rem) {
  .valaxy-girls-bubbles-stage {
    width: calc(100% - 0.25rem);
  }

  .valaxy-girls-bubbles-detail {
    width: calc(100% - 1rem);
    margin-top: -0.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .valaxy-girls-bubbles-item {
    animation: none;
  }
}
</style>
