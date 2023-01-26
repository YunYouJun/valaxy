<script lang="ts" setup>
import type { Post } from 'valaxy'

defineProps<{
  frontmatter: Post
}>()
</script>

<template>
  <div class="inline-flex" text="sm" py="1">
    <YunPostCategories :categories="frontmatter.categories" />
    <span v-if="frontmatter.categories && frontmatter.tags" mx="2">-</span>
    <template v-if="frontmatter.tags">
      <YunPostTags :tags="frontmatter.tags" />
    </template>
  </div>
</template>
