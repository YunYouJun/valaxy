<script lang="ts" setup>
import type { Post } from 'valaxy'

defineProps<{
  tags: Post['tags']
}>()
</script>

<template>
  <div
    class="post-tags inline-flex" items="center" gap="1"
    flex="wrap 1" justify="end"
  >
    <RouterLink
      v-for="tag, i in tags" :key="i" :to="{ path: '/tags/', query: { tag } }"
      class="transition post-tag inline-flex-center text-xs border-$va-c-divider hover:(text-blue-500 border-blue-500)"
      px-2 h="7"
      rounded-full
      border
      bg="hover:(blue-500 opacity-10)"
    >
      <!-- <div m="r-1" i-ri-price-tag-3-line /> -->
      <span>{{ tag }}</span>
    </RouterLink>
  </div>
</template>
