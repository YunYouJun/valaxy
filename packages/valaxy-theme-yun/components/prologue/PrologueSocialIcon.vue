<script setup lang="ts">
import { useMotion } from '@vueuse/motion'
import { useValaxyI18n } from 'valaxy/client'
import { computed, ref } from 'vue'

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
const { $t } = useValaxyI18n()
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

const socialName = computed(() => $t(props.social.name))
</script>

<template>
  <div
    v-tooltip="socialName"
    class="size-10 inline-flex-center"
  >
    <a
      ref="iconRef"
      class="prologue-social-icon inline-flex-center w-full h-full text-white bg-$c-brand hover:bg-white hover:text-$c-brand"
      rel="noopener"
      :href="social.link" :title="socialName"
      target="_blank"
      :style="`--c-brand:${social.color}`"
    >
      <div
        class="size-6"
        :class="social.icon"
      />
    </a>
  </div>
</template>
