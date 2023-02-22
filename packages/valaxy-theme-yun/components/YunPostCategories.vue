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
    class="post-category inline-flex-center"
  >
    <div m="x-1" inline-flex i-ri-folder-2-line />
    <span>
      {{ Array.isArray(categories) ? categories.join(' > ') : categories }}
    </span>
  </router-link>
</template>
