<script setup lang="ts">
import type { PostCollectionInfo } from 'valaxy'

defineProps<{
  collections: PostCollectionInfo[]
}>()
</script>

<template>
  <RouterLink
    v-for="{ collection, itemIndex } in collections"
    :key="collection.key"
    :to="`/collections/${collection.key}/`"
    :title="`${collection.title || collection.name || collection.key} (${itemIndex + 1}/${collection.items?.length})`"
    class="transition post-collection-badge inline-flex-center text-xs border-$va-c-divider"
    px-2 h="7"
    border rounded-full
    hover="bg-purple-500 text-white"
  >
    <div m="x-1" inline-flex i-ri-book-2-line />
    <span>{{ collection.title || collection.name || collection.key }}</span>
  </RouterLink>
</template>
