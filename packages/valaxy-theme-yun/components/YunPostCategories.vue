<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useValaxyI18n } from 'valaxy'
import { computed } from 'vue'
import { resolveCategoryPath } from '../utils'

const props = defineProps<{
  categories?: Post['categories']
}>()

const { $tCategory } = useValaxyI18n()
const categoryItems = computed(() => {
  if (Array.isArray(props.categories))
    return props.categories.filter(c => c?.trim())
  return props.categories?.trim() ? [props.categories] : []
})
const categoryPath = computed(() => resolveCategoryPath(props.categories))
</script>

<template>
  <RouterLink
    v-if="categoryPath"
    :to="{
      path: '/categories',
      query: { category: categoryPath },
    }"
    class="yun-post-badge post-category inline-flex-center text-xs"
    px-2 h="7"
    border rounded-full
  >
    <div m="x-1" inline-flex i-ri-folder-2-line />
    <span>
      {{ categoryItems.map($tCategory).join(' / ') }}
    </span>
  </RouterLink>
</template>
