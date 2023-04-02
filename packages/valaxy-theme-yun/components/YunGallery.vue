<script lang="ts" setup>
import Lightgallery from 'lightgallery/vue'
import 'lightgallery/scss/lightgallery.scss'

import type { Photo } from 'valaxy'

defineProps<{
  photos: Photo[]
}>()
</script>

<template>
  <Lightgallery class="yun-photo-list">
    <YunPhoto v-for="photo in photos" :key="photo.src" :photo="photo" />
  </Lightgallery>
</template>
