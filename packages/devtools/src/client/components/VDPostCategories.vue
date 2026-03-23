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
    class="post-category transition text-xs hover:(text-green-600 dark:text-green-400)"
    px-2 py-1
    rounded-full
    inline-flex justify-center items-center
    bg="green-50 dark:green-900/20 hover:green-100 dark:hover:green-900/40"
    text="green-600 dark:green-400"
  >
    <div m="x-1" inline-flex i-ri-folder-2-line />
    <span>
      {{ Array.isArray(categories) ? categories.join(' > ') : categories }}
    </span>
  </RouterLink>
</template>
