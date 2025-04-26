<script setup lang="ts">
import { useFrontmatter } from 'valaxy'

const frontmatter = useFrontmatter()
</script>

<template>
  <YunPostMeta :frontmatter="frontmatter" />

  <YunPostCategoriesAndTags class="mt-2" :frontmatter="frontmatter" />
</template>
