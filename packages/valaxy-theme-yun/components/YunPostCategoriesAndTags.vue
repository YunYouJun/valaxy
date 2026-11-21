<script lang="ts" setup>
import type { Post } from 'valaxy'
import { computed } from 'vue'
import { resolveCategoryPath } from '../utils'

const props = defineProps<{
  frontmatter: Post
}>()

const hasCategories = computed(() => Boolean(resolveCategoryPath(props.frontmatter.categories)))
const hasTags = computed(() => Boolean(props.frontmatter.tags?.length))
</script>

<template>
  <div v-if="hasCategories || hasTags" class="inline-flex" text="sm" py="1">
    <YunPostCategories v-if="hasCategories" :categories="frontmatter.categories" />
    <span v-if="hasCategories && hasTags" mx="2" />
    <YunPostTags v-if="hasTags" :tags="frontmatter.tags!" />
  </div>
</template>
