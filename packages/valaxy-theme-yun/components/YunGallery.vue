<script lang="ts" setup>
import type { Photo } from 'valaxy'

defineProps<{
  photos: Photo[]
}>()
</script>

<template>
  <VAGallery :photos="photos" />
</template>
