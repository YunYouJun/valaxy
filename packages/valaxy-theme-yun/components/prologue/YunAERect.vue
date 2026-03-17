<script setup lang="ts">
import type { MotionVariants, Tween } from '@vueuse/motion'
import { cubicBezier } from '../../client/constants'

const tweenTransition: Tween = {
  type: 'tween',
  duration: 600,
  ease: cubicBezier.easeIn,
}

const rectMotion: MotionVariants<never> = {
  initial: { backgroundColor: 'rgba(255, 255, 255, 0)' },
  enter: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transition: { type: 'keyframes', duration: 1000, ease: cubicBezier.easeIn },
  },
}

const topMotion: MotionVariants<never> = {
  initial: { x: '-100%' },
  enter: { x: '0%', transition: tweenTransition },
}

const leftMotion: MotionVariants<never> = {
  initial: { y: '-100%' },
  enter: { y: '0%', transition: tweenTransition },
}

const bottomMotion: MotionVariants<never> = {
  initial: { x: '100%' },
  enter: { x: '0%', transition: tweenTransition },
}

const rightMotion: MotionVariants<never> = {
  initial: { y: '100%' },
  enter: { y: '0%', transition: tweenTransition },
}
</script>

<template>
  <div v-motion="rectMotion" class="absolute ae-rect">
    <div v-motion="topMotion" />
    <div v-motion="leftMotion" />
    <div v-motion="bottomMotion" />
    <div v-motion="rightMotion" />
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
