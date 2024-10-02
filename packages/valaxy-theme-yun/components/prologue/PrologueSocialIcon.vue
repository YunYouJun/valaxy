<script setup lang="ts">
import { useMotion } from '@vueuse/motion'
import { ref } from 'vue'

const props = defineProps<{
  social: {
    name: string
    link: string
    icon: string
    color: string
  }
  // animation
  delay: number
}>()

const iconRef = ref<HTMLElement>()
useMotion(iconRef, {
  initial: {
    scale: 0.8,
    x: 0,
    y: 20,
    opacity: 0,
  },
  enter: {
    scale: 1,
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      duration: 20000,
      damping: 8,
      delay: props.delay,
    },
  },
})
</script>

<template>
  <a
    ref="iconRef"
    class="prologue-social-icon size-10 inline-flex items-center justify-center text-white"
    rel="noopener"
    :href="social.link" :title="social.name"
    target="_blank"
    :style="`--c-brand:${social.color}`"
  >
    <div
      class="size-6"
      :class="social.icon"
    />
  </a>
</template>

<style lang="scss">
.prologue-social-icon {
  background-color: var(--c-brand);

  &:hover {
    background-color: white;
    color: var(--c-brand);
  }
}
</style>
