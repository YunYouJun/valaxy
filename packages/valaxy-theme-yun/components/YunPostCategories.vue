<script lang="ts" setup>
import type { Post } from 'valaxy'

defineProps<{
  categories: Post['categories']
}>()
</script>

<template>
  <router-link
    :to="{
      path: '/categories/',
      query: { category: Array.isArray(categories) ? categories[categories.length - 1] : categories },
    }"
    class="transition post-category inline-flex-center text-xs border-$va-c-divider hover:(text-blue-500 border-blue-500)"
    px-2 h="7"
    border rounded-full
    bg="hover:(blue-500 opacity-10)"
  >
    <div m="x-1" inline-flex i-ri-folder-2-line />
    <span>
      {{ Array.isArray(categories) ? categories.join(' > ') : categories }}
    </span>
  </router-link>
</template>
