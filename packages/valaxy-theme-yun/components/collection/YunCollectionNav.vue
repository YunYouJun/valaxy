<script setup lang="ts">
import type { CollectionConfig } from 'valaxy'

defineProps<{
  collection: CollectionConfig
  currentIndex: number
}>()
</script>

<template>
  <div
    v-if="collection?.items"
    class="collection-nav"
    flex="~ items-center gap-2" p="x-4 y-2" text="sm" op="70"
  >
    <div i-ri-book-2-line />
    <RouterLink :to="`/collections/${collection.key}/`" class="hover:op-100 transition">
      {{ collection.title }}
    </RouterLink>
    <span v-if="currentIndex >= 0" op="50">
      ({{ currentIndex + 1 }} / {{ collection.items.length }})
    </span>
  </div>
</template>
