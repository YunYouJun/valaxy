<script setup lang="ts">
import type { CollectionConfig } from 'valaxy'

defineProps<{
  collection: CollectionConfig
}>()
</script>

<template>
  <RouterLink
    :to="`/collections/${collection.key}/`"
    :title="collection.title"
    class="flex flex-col gap-2 hover:border-b-0!"
  >
    <div class="inline-flex rounded h-40 w-30 bg-gray-100 dark:bg-dark-300 shadow hover:shadow-md transition overflow-hidden">
      <img
        :src="collection.cover"
        :alt="collection.title"
        class="flex size-full object-cover max-w-none"
      >
    </div>
    <div class="text-sm font-bold text-center op-80 hover:op-100">
      {{ collection.title }}
    </div>
  </RouterLink>
</template>
