<script lang="ts" setup>
import type { Post } from 'valaxy'
import { identityColor } from '../utils/colors'

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
    class="post-category vd-accent vd-tint transition text-xs hover:opacity-80"
    :style="identityColor(Array.isArray(categories) ? categories.flat().join('/') : categories || '')"
    px-2 py-1
    rounded-full
    inline-flex justify-center items-center
  >
    <div m="x-1" inline-flex i-ri-folder-2-line />
    <span>
      {{ Array.isArray(categories) ? categories.join(' > ') : categories }}
    </span>
  </RouterLink>
</template>
