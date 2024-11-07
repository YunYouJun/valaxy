<script setup lang="ts">
import { useMotion } from '@vueuse/motion'
import { ref } from 'vue'
import { onImgError } from '../utils'
import type { LinkType } from '../types'

const props = defineProps<{
  i: number
  errorImg?: string
  link: LinkType
}>()

function onError(e: Event) {
  onImgError(e, props.errorImg)
}

const itemRef = ref()
useMotion(itemRef, {
  initial: {
    opacity: 0,
    translateY: 40,
  },
  enter: {
    opacity: 1,
    translateY: 0,
    transition: {
      type: 'spring',
      duration: 400,
      damping: 8,
      delay: props.i * 50,
    },
  },
})
</script>

<template>
  <li
    ref="itemRef"
    class="yun-link-item inline-flex"
    :style="{
      '--primary-color': link.color,
    }"
  >
    <a
      class="yun-link-url" p="x-4 y-2"
      :href="link.url" :title="link.name"
      alt="portrait" rel="friend" target="_blank"
    >
      <div class="yun-link-left">
        <div class="yun-link-avatar size-16 overflow-hidden flex-center">
          <img
            class="size-16 object-center object-cover m-0!"
            width="64" height="64"
            loading="lazy"
            :src="link.avatar" :alt="link.name"
            @error="onError"
          >
        </div>
      </div>
      <div class="yun-link-info" m="l-2">
        <div class="yun-link-blog" font="serif black">{{ link.blog }}</div>
        <div class="yun-link-desc">{{ link.desc }}</div>
      </div>
    </a>
  </li>
</template>
