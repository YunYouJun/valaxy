<script lang="ts" setup>
import type { Album } from 'valaxy'
import { onImgError } from '../utils'

defineProps<{
  album: Album
}>()
</script>

<template>
  <AppLink class="yun-album-list-item" :to="album.url">
    <figure class="m-10" flex="~ col" :title="album.desc">
      <img
        loading="lazy"
        class="yun-album-list-cover"
        :src="album.cover"
        :alt="album.caption"
        :on-error="onImgError"
      >
      <figcaption class="yun-album-caption yun-title-effects text-$va-c-text inline-flex-center">
        {{ album.caption }}
      </figcaption>
    </figure>
  </AppLink>
</template>

<style lang="scss">
.yun-album-caption {
  position: absolute;
  bottom: -3rem;
  display: block;
  text-align: center;
  width: 100%;
}
</style>
