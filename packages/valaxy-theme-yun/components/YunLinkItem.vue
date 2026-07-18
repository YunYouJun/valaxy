<script setup lang="ts">
import type { LinkType } from '../types'
import { onImgError } from '../utils'

const props = defineProps<{
  errorImg?: string
  link: LinkType
}>()

function onError(e: Event) {
  onImgError(e, props.errorImg)
}

function getLinkLabel(link: LinkType) {
  return [link.name, link.blog, link.desc].filter(Boolean).join(' · ')
}
</script>

<template>
  <li
    class="yun-link-item"
    :style="{
      '--primary-color': link.color,
    }"
  >
    <a
      class="yun-link-url"
      :href="link.url" :title="link.name"
      :aria-label="getLinkLabel(link)"
      rel="friend noopener noreferrer" target="_blank"
    >
      <div class="yun-link-left">
        <div class="yun-link-avatar">
          <img
            class="yun-link-avatar-img"
            alt=""
            decoding="async"
            loading="lazy"
            :src="link.avatar"
            @error="onError"
          >
        </div>
      </div>
      <div class="yun-link-info">
        <div class="yun-link-blog">{{ link.blog }}</div>
        <div class="yun-link-desc">{{ link.desc }}</div>
      </div>
    </a>
  </li>
</template>
