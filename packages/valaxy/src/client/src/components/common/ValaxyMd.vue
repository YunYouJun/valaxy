<script lang="ts" setup>
import type { Post } from 'valaxy'
defineProps<{
  frontmatter: Post
  excerpt?: string
}>()
</script>

<template>
  <article class="markdown-body" min="h-8">
    <slot />
  </article>
</template>
