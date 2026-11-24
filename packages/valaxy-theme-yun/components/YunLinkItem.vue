<script setup lang="ts">
import type { LinkType } from '../types'
import { sanitizeUrl, withBase } from 'valaxy'
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
    :style="link.color ? { '--primary-color': link.color } : undefined"
  >
    <a
      class="yun-link-url"
      :href="sanitizeUrl(link.url)" :title="link.name"
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
            :src="withBase(link.avatar)"
            @error="onError"
          >
        </div>
      </div>
      <div class="yun-link-info">
        <div class="yun-link-header">
          <div class="yun-link-blog">{{ link.blog }}</div>
          <span class="yun-link-arrow i-ri-arrow-right-up-line" aria-hidden="true" />
        </div>
        <div class="yun-link-desc">{{ link.desc }}</div>
      </div>
    </a>
  </li>
</template>
