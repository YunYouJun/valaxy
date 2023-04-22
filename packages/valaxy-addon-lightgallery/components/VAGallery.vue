<script lang="ts" setup>
import type { Photo } from 'valaxy'

// @ts-expect-error esm not supported
import LightGallery from 'lightgallery/vue/LightGalleryVue.umd.min.js'

defineProps<{
  photos: Photo[]
}>()
</script>

<template>
  <LightGallery class="va-photo-list">
    <VAPhoto v-for="photo in photos" :key="photo.src" :photo="photo" />
  </LightGallery>
</template>

<style lang="css">
@import 'lightgallery/css/lightgallery.css';

.va-photo-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
