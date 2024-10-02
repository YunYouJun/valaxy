<script setup lang="ts">
import type { PopmotionTransitionProps } from '@vueuse/motion'
import { useMotion } from '@vueuse/motion'
import { useAppStore } from 'valaxy'
import { computed, ref } from 'vue'

const tlRef = ref<HTMLElement>()
const trRef = ref<HTMLElement>()
const blRef = ref<HTMLElement>()
const brRef = ref<HTMLElement>()

const app = useAppStore()
const cornerSize = computed(() => {
  return app.isMobile ? 40 : 50
})
const cornerMargin = computed(() => {
  return app.isMobile ? 10 : 30
})
const cornerBorderSize = computed(() => {
  return app.isMobile ? 3 : 5
})

const cornerTransitionProps: PopmotionTransitionProps = {
  type: 'spring',
  duration: 600,
}

useMotion(tlRef, {
  initial: {
    x: -cornerMargin.value,
    y: -cornerMargin.value,
  },
  enter: {
    x: 0,
    y: 0,
    transition: cornerTransitionProps,
  },
})

useMotion(trRef, {
  initial: {
    x: cornerMargin.value,
    y: -cornerMargin.value,
  },
  enter: {
    x: 0,
    y: 0,
    transition: cornerTransitionProps,
  },
})

useMotion(blRef, {
  initial: {
    x: -cornerMargin.value,
    y: cornerMargin.value,
  },
  enter: {
    x: 0,
    y: 0,
    transition: cornerTransitionProps,
  },
})

useMotion(brRef, {
  initial: {
    x: cornerMargin.value,
    y: cornerMargin.value,
  },
  enter: {
    x: 0,
    y: 0,
    transition: cornerTransitionProps,
  },
})

const cssVarStyles = computed(() => {
  return {
    '--corner-size': `${cornerSize.value}px`,
    '--corner-margin': `${cornerMargin.value}px`,
    '--corner-border-size': `${cornerBorderSize.value}px`,
  }
})
</script>

<template>
  <div
    class="ae-frame" :style="cssVarStyles"
  >
    <div ref="tlRef" class="absolute" />
    <div ref="trRef" class="absolute" />
    <div ref="blRef" class="absolute" />
    <div ref="brRef" class="absolute" />
  </div>
</template>

<style lang="scss">
.ae-frame {
  div {
    width: var(--corner-size);
    height: var(--corner-size);

    &::before, &::after {
      content: '';
      display: block;
      position: absolute;
      background-color: var(--va-c-text);
    }

    &::before {
      width: 100%;
      height: var(--corner-border-size);
    }

    &::after {
      width: var(--corner-border-size);
      height: 100%;
    }

    &:nth-child(1) {
      top: var(--corner-margin);
      left: var(--corner-margin);
    }

    &:nth-child(2) {
      top: var(--corner-margin);
      right: var(--corner-margin);

      &::after {
        top: 0;
        right: 0;
      }
    }

    &:nth-child(3) {
      bottom: var(--corner-margin);
      left: var(--corner-margin);

      &::before {
        bottom: 0;
        left: 0;
      }
    }

    &:nth-child(4) {
      bottom: var(--corner-margin);
      right: var(--corner-margin);

      &::before, &::after {
        bottom: 0;
        right: 0;
      }
    }
  }
}
</style>
