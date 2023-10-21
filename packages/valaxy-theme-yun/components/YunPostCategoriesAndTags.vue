<script lang="ts" setup>
import type { Post } from 'valaxy'

defineProps<{
  frontmatter: Post
}>()
</script>

<template>
  <div class="inline-flex" text="sm" py="1">
    <YunPostCategories v-if="frontmatter.categories" :categories="frontmatter.categories" />
    <span v-if="frontmatter.categories && frontmatter.tags" mx="2" />
    <YunPostTags v-if="frontmatter.tags" :tags="frontmatter.tags" />
  </div>
</template>
