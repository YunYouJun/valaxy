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
    class="post-categories inline-flex justify-center items-center"
  >
    <div m="x-1" i-ri-folder-2-line />
    {{ Array.isArray(categories) ? categories.join(' > ') : categories }}
  </router-link>
</template>
