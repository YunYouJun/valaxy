<script setup lang="ts">
import type { CollectionConfig } from 'valaxy'

defineProps<{
  collection: CollectionConfig
}>()
</script>

<template>
  <RouterLink
    class="inline-flex rounded p-4 h-50 w-40 bg-gray-100 dark:bg-dark-300 shadow"
    :to="`/collections/${collection.id}`"
  >
    Book
  </RouterLink>
</template>
