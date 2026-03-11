<script setup lang="ts">
import type { CollectionConfig } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  collection: CollectionConfig
  currentIndex: number
}>()

const items = computed(() => props.collection.items || [])
const prev = computed(() => props.currentIndex > 0 ? items.value[props.currentIndex - 1] : null)
const next = computed(() => props.currentIndex < items.value.length - 1 ? items.value[props.currentIndex + 1] : null)
const basePath = computed(() => `/collections/${props.collection.key}/`)
</script>

<template>
  <nav v-if="(prev?.key && collection.key) || (next?.key && collection.key)" class="collection-prev-next" flex="~ justify-between" p="4">
    <RouterLink
      v-if="prev?.key"
      :to="`${basePath}${prev.key}`"
      class="prev inline-flex items-center gap-1 op-70 hover:op-100 transition"
    >
      <div i-ri-arrow-left-line />
      <span>{{ prev.title || prev.key }}</span>
    </RouterLink>
    <span v-else />

    <RouterLink
      v-if="next?.key"
      :to="`${basePath}${next.key}`"
      class="next inline-flex items-center gap-1 op-70 hover:op-100 transition"
    >
      <span>{{ next.title || next.key }}</span>
      <div i-ri-arrow-right-line />
    </RouterLink>
  </nav>
</template>
