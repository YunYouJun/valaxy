<script lang="ts" setup>
import type { Post } from 'valaxy'

defineProps<{
  categories: Post['categories']
}>()
</script>

<template>
  <RouterLink
    :to="{
      path: '/categories',
      query: { category: Array.isArray(categories) ? categories.join('/') : categories },
    }"
    class="post-category transition text-xs hover:(text-blue-500 border-blue-500)"
    px-2 py-1
    border rounded-full
    inline-flex justify-center items-center
    bg="hover:(blue-500 opacity-10)"
  >
    <div m="x-1" inline-flex i-ri-folder-2-line />
    <span>
      {{ Array.isArray(categories) ? categories.join(' > ') : categories }}
    </span>
  </RouterLink>
</template>
