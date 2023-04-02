<script lang="ts" setup>
import type { Album } from 'valaxy'
import { onImgError } from '../utils'

defineProps<{
  album: Album
}>()
</script>

<template>
  <a class="yun-album-list-item" :href="album.url">
    <figure :title="album.desc">
      <img
        loading="lazy"
        class="yun-album-list-cover"
        :src="album.cover"
        :alt="album.caption"
        :on-error="onImgError"
      >
      <figcaption>
        「{{ album.caption }}」
      </figcaption>
    </figure>
  </a>
</template>
