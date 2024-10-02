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
    class="transition post-category inline-flex-center text-xs border-$va-c-divider"
    px-2 h="7"
    border rounded-full
    hover="bg-blue-500 text-white"
  >
    <div m="x-1" inline-flex i-ri-folder-2-line />
    <span>
      {{ Array.isArray(categories) ? categories.join(' > ') : categories }}
    </span>
  </RouterLink>
</template>
