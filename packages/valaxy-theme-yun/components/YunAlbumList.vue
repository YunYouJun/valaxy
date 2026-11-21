<script lang="ts" setup>
import type { Album } from 'valaxy'

defineProps<{
  albums: Album[]
}>()
</script>

<template>
  <div class="yun-album-list">
    <YunAlbum
      v-for="album in albums"
      :key="album.url"
      :album="album"
    />
  </div>
</template>

<style lang="scss">
.yun-album-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 14.5rem), 1fr));
  gap: 1.25rem;
  width: 100%;
  margin: 1rem 0 1.5rem;
}
</style>
