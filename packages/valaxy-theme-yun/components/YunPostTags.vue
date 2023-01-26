<script lang="ts" setup>
import type { Post } from 'valaxy'

defineProps<{
  tags: Post['tags']
}>()
</script>

<template>
  <router-link v-for="tag, i in tags" :key="i" :to="{ path: '/tags/', query: { tag } }" m="x-1" class="post-tag inline-flex justify-center items-center">
    <div m="r-1" i-ri-price-tag-3-line />
    {{ tag }}
  </router-link>
</template>
