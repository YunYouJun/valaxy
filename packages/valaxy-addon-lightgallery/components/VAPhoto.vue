<script lang="ts" setup>
import type { Photo } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  photo: Photo
}>()

const subHtml = computed(() => {
  return `<h4>${props.photo.caption}</h4><p>${props.photo.desc}</p>`
})
</script>

<template>
  <figure class="va-photo-list-item" :data-src="photo.src" :data-sub-html="subHtml">
    <img class="va-photo-list-cover" :src="photo.src" loading="lazy" :alt="photo.caption">
    <figcaption>
      {{ photo.caption }}
    </figcaption>
  </figure>
</template>

<style lang="scss">
.va-photo-list-item {
  display: inline-flex;
  position: relative;
  width: 15rem;
  margin: 1.5rem;
  cursor: pointer;

  img {
    box-sizing: border-box;
    vertical-align: bottom;
    display: inline-flex;
    border: 0.25rem solid white;
    box-shadow: 0 8px 10px rgba(#000, 0.1);
    width: 100%;
    height: 10rem;
    object-fit: cover;
    background-color: #eee;
  }

  figcaption {
    position: absolute;
    bottom: -1.8rem;
    display: block;
    text-align: center;
    width: 100%;
    font-size: 0.9rem;
  }
}
</style>
