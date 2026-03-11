<script setup lang="ts">
import type { CollectionConfig } from 'valaxy'
import { resolveCollectionItemHref } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  collection: CollectionConfig
  currentIndex: number
}>()

const items = computed(() => props.collection.items || [])
const prev = computed(() => props.currentIndex > 0 ? items.value[props.currentIndex - 1] : null)
const next = computed(() => props.currentIndex < items.value.length - 1 ? items.value[props.currentIndex + 1] : null)

const prevResolved = computed(() => {
  if (!prev.value || !props.collection.key)
    return null
  return resolveCollectionItemHref(props.collection.key, prev.value)
})
const nextResolved = computed(() => {
  if (!next.value || !props.collection.key)
    return null
  return resolveCollectionItemHref(props.collection.key, next.value)
})
</script>

<template>
  <nav v-if="prevResolved?.href || nextResolved?.href" class="collection-prev-next" flex="~ justify-between" p="4">
    <template v-if="prev && prevResolved?.href">
      <a
        v-if="prevResolved.isExternal"
        :href="prevResolved.href"
        target="_blank"
        rel="noopener noreferrer"
        class="prev inline-flex items-center gap-1 op-70 hover:op-100 transition"
      >
        <div i-ri-arrow-left-line />
        <span>{{ prev.title || prev.key }}</span>
        <span class="i-ri-external-link-line text-xs op-50" />
      </a>
      <RouterLink
        v-else
        :to="prevResolved.href"
        class="prev inline-flex items-center gap-1 op-70 hover:op-100 transition"
      >
        <div i-ri-arrow-left-line />
        <span>{{ prev.title || prev.key }}</span>
      </RouterLink>
    </template>
    <span v-else />

    <template v-if="next && nextResolved?.href">
      <a
        v-if="nextResolved.isExternal"
        :href="nextResolved.href"
        target="_blank"
        rel="noopener noreferrer"
        class="next inline-flex items-center gap-1 op-70 hover:op-100 transition"
      >
        <span>{{ next.title || next.key }}</span>
        <span class="i-ri-external-link-line text-xs op-50" />
        <div i-ri-arrow-right-line />
      </a>
      <RouterLink
        v-else
        :to="nextResolved.href"
        class="next inline-flex items-center gap-1 op-70 hover:op-100 transition"
      >
        <span>{{ next.title || next.key }}</span>
        <div i-ri-arrow-right-line />
      </RouterLink>
    </template>
  </nav>
</template>
