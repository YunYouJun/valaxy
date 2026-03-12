<script setup lang="ts">
import { useFrontmatter, usePostCollections } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const frontmatter = useFrontmatter()
const route = useRoute()

const isCollectionRoute = computed(() => route.path.startsWith('/collections/'))
const postCollections = usePostCollections(computed(() => route.path))
</script>

<template>
  <YunPostMeta :frontmatter="frontmatter" />

  <template v-if="!isCollectionRoute && postCollections.length">
    <YunCollectionNav
      v-for="{ collection, itemIndex } in postCollections"
      :key="collection.key"
      :collection="collection"
      :current-index="itemIndex"
    />
  </template>

  <YunPostCategoriesAndTags class="mt-2" :frontmatter="frontmatter" />
</template>
