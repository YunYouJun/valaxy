<script lang="ts" setup>
import type { Album } from 'valaxy'

defineProps<{
  albums: Album[]
}>()
</script>

<template>
  <div class="yun-album-list mb-4">
    <YunAlbum
      v-for="album in albums" :key="album.url"
      :album="album"
    />
  </div>
</template>

<style lang="scss">
.yun {
  &-album-list {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  &-album-list-item {
    display: inline-flex;

    figure {
      position: relative;
      width: 15rem;

      &::before {
        content: '';
        position: absolute;
        top: 1%;
        left: 0.5%;
        width: 100%;
        height: 96%;
        border: 0.25rem solid white;
        background-color: #666;
        box-shadow: 0 5px 10px rgba(#000, 0.3);
        transform: rotate(-3deg);
      }

      img {
        vertical-align: bottom;
        display: inline-flex;
        border: 0.25rem solid white;
        box-shadow: 0 8px 10px rgba(#000, 0.3);
        padding: 0;
        transform: rotate(2deg);
        width: 100%;
        height: 10rem;
        object-fit: cover;
        background-color: #eee;
      }
    }
  }
}
</style>
