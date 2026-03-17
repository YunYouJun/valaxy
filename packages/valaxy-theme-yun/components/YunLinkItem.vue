<script setup lang="ts">
import type { LinkType } from '../types'
import { yunSpringVariants } from '../composables/animation'
import { onImgError } from '../utils'

const props = defineProps<{
  i: number
  errorImg?: string
  link: LinkType
}>()

function onError(e: Event) {
  onImgError(e, props.errorImg)
}

const motionVariants = yunSpringVariants({ i: props.i })
</script>

<template>
  <li
    v-motion="motionVariants"
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
            class="size-full object-center object-cover m-0! max-w-unset!"
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
