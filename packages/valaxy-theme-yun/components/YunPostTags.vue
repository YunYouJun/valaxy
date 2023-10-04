<script lang="ts" setup>
import type { Post } from 'valaxy'

defineProps<{
  tags: Post['tags']
}>()
</script>

<template>
  <router-link
    v-for="tag, i in tags" :key="i" :to="{ path: '/tags/', query: { tag } }" ml-1
    class="transition post-tag inline-flex-center text-xs border-$va-c-divider hover:(text-blue-500 border-blue-500)"
    px-2 h="7"
    rounded-full
    border
    bg="hover:(blue-500 opacity-10)"
  >
    <!-- <div m="r-1" i-ri-price-tag-3-line /> -->
    <span>{{ tag }}</span>
  </router-link>
</template>
