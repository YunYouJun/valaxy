<script lang="ts" setup>
import type { Post } from 'valaxy'
defineProps<{
  frontmatter: Post
  excerpt?: string
}>()
</script>

<template>
  <article v-if="$slots.default" class="markdown-body">
    <slot />
  </article>
</template>
