<script setup lang="ts">
import type { PopmotionTransitionProps } from '@vueuse/motion'
import { useMotion } from '@vueuse/motion'
import { ref } from 'vue'
import { cubicBezier } from '../../client/constants'

const rectRef = ref<HTMLElement>()

const tRef = ref<HTMLElement>()
const lRef = ref<HTMLElement>()
const bRef = ref<HTMLElement>()
const rRef = ref<HTMLElement>()

const transitionOptions: PopmotionTransitionProps = {
  type: 'tween',
  duration: 600,
  ease: cubicBezier.easeIn,
}

useMotion(rectRef, {
  initial: {
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  enter: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transition: {
      type: 'keyframes',
      duration: 1000,
      ease: cubicBezier.easeIn,
    },
  },
})

useMotion(tRef, {
  initial: {
    x: '-100%',
  },
  enter: {
    x: '0%',
    transition: transitionOptions,
  },
})

useMotion(lRef, {
  initial: {
    y: '-100%',
  },
  enter: {
    y: '0%',
    transition: transitionOptions,
  },
})

useMotion(bRef, {
  initial: {
    x: '100%',
  },
  enter: {
    x: '0%',
    transition: transitionOptions,
  },
})

useMotion(rRef, {
  initial: {
    y: '100%',
  },
  enter: {
    y: '0%',
    transition: transitionOptions,
  },
})
</script>

<template>
  <div ref="rectRef" class="absolute ae-rect">
    <div ref="tRef" />
    <div ref="lRef" />
    <div ref="bRef" />
    <div ref="rRef" />
  </div>
</template>

<style lang="scss">
.ae-rect {
  top: var(--rect-margin);
  left: var(--rect-margin);
  width: calc(100% - var(--rect-margin) * 2);
  height: calc(100% - var(--rect-margin) * 2);
  overflow: hidden;

  div {
    position: absolute;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: var(--va-c-text);
    }

    &:nth-child(1),
    &:nth-child(3) {
      left: 0;
      width: 100%;
      height: 1px;
    }

    &:nth-child(2),
    &:nth-child(4) {
      top: 0;
      width: 1px;
      height: 100%;
    }

    &:nth-child(3) {
      bottom: 0;
    }

    &:nth-child(4) {
      right: 0;
    }
  }
}
</style>
