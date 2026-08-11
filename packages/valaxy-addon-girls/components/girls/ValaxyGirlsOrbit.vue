<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { GirlsLayoutProps } from '../../types'
import { computed } from 'vue'
import { getGirlKey, getOrbitPoint } from '../../client'
import ValaxyGirlsOrbitArt from './art/ValaxyGirlsOrbitArt.vue'
import ValaxyGirlDetail from './ValaxyGirlDetail.vue'
import ValaxyGirlOrb from './ValaxyGirlOrb.vue'
import ValaxyGirlsOverflow from './ValaxyGirlsOverflow.vue'

interface OrbitItemStyle extends CSSProperties {
  '--valaxy-girl-orbit-delay': string
  '--valaxy-girl-orbit-scale': number
}

const props = defineProps<GirlsLayoutProps>()

const emit = defineEmits<{
  select: [index: number]
}>()

const ORBIT_STAGE_LIMIT = 24

const selectedGirl = computed(() => props.girls[props.selectedIndex] || props.girls[0])
const orbitStageCount = computed(() => Math.min(props.girls.length, ORBIT_STAGE_LIMIT))
const orbitItems = computed(() => props.girls.slice(0, ORBIT_STAGE_LIMIT).map((girl, index) => {
  const point = getOrbitPoint(index, orbitStageCount.value)
  return {
    girl,
    index,
    key: getGirlKey(girl, index),
    style: {
      '--valaxy-girl-orbit-delay': `${point.delay}s`,
      '--valaxy-girl-orbit-scale': point.scale,
      'left': `${point.x}%`,
      'top': `${point.y}%`,
    } satisfies OrbitItemStyle,
  }
}))
const orbitOverflow = computed(() => props.girls.slice(ORBIT_STAGE_LIMIT))
const orbitClasses = computed(() => ({
  'valaxy-girls-orbit': true,
  'valaxy-girls-orbit-small': props.girls.length <= 4,
  'valaxy-girls-orbit-motion-off': props.motion === 'off',
}))
</script>

<template>
  <div :class="orbitClasses">
    <div class="valaxy-girls-orbit-stage">
      <ValaxyGirlsOrbitArt class="valaxy-girls-orbit-art" />

      <ol class="valaxy-girls-orbit-list">
        <li
          v-for="item in orbitItems"
          :key="item.key"
          class="valaxy-girls-orbit-item"
          :style="item.style"
        >
          <ValaxyGirlOrb
            :girl="item.girl"
            :index="item.index"
            :selected="item.index === selectedIndex"
            :size="3.35"
            @select="emit('select', item.index)"
          />
        </li>
      </ol>

      <ValaxyGirlDetail
        v-if="selectedGirl"
        class="valaxy-girls-orbit-detail"
        :girl="selectedGirl"
        :reason-mode="reasonMode"
      />
    </div>

    <ValaxyGirlsOverflow
      :auto-load="autoLoad"
      :batch-size="batchSize"
      :girls="orbitOverflow"
      :render-mode="renderMode"
      :selected-index="selectedIndex"
      :start-index="ORBIT_STAGE_LIMIT"
      @select="emit('select', $event)"
    />
  </div>
</template>

<style scoped>
.valaxy-girls-orbit {
  overflow: hidden;
  border-radius: 0.85rem;
}

.valaxy-girls-orbit-stage {
  position: relative;
  min-height: 20rem;
  isolation: isolate;
}

.valaxy-girls-orbit-small .valaxy-girls-orbit-stage {
  min-height: 15rem;
}

.valaxy-girls-orbit-art {
  position: absolute;
  z-index: -1;
  inset: 7% 2%;
  width: 96%;
  height: 86%;
  margin: 0;
  opacity: 0.67;
  pointer-events: none;
}

.valaxy-girls-orbit-list {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
}

.valaxy-girls-orbit-item {
  position: absolute;
  z-index: 2;
  list-style: none;
  transform: translate(-50%, -50%) scale(var(--valaxy-girl-orbit-scale));
  animation: valaxy-girls-orbit-drift 5.5s ease-in-out infinite alternate;
  animation-delay: var(--valaxy-girl-orbit-delay);
}

.valaxy-girls-orbit-detail {
  position: absolute;
  z-index: 7;
  top: 50%;
  left: 50%;
  width: min(13rem, 34%);
  transform: translate(-50%, -50%);
}

.valaxy-girls-orbit-motion-off .valaxy-girls-orbit-item {
  animation: none;
}

@keyframes valaxy-girls-orbit-drift {
  from {
    transform: translate(-50%, calc(-50% - 0.12rem)) scale(var(--valaxy-girl-orbit-scale));
  }

  to {
    transform: translate(-50%, calc(-50% + 0.12rem)) scale(var(--valaxy-girl-orbit-scale));
  }
}

@media (width <= 40rem) {
  .valaxy-girls-orbit-stage {
    min-height: 20rem;
  }

  .valaxy-girls-orbit-small .valaxy-girls-orbit-stage {
    min-height: 14rem;
  }

  .valaxy-girls-orbit-detail {
    inset: auto 0.5rem 0.45rem;
    width: auto;
    transform: none;
  }

  .valaxy-girls-orbit-list {
    bottom: 4.4rem;
  }

  .valaxy-girls-orbit-art {
    inset: 0 -12% 4.4rem;
    width: 124%;
    height: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .valaxy-girls-orbit-item {
    animation: none;
  }
}
</style>
