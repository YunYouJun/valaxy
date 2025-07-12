<script setup lang="ts">
import type { Post } from 'valaxy'
import { isCategoryList, tObject } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

defineProps<{
  i?: number
  categoryItem: any
  parentKey?: string
}>()

/**
 * i18n
 */
const { locale } = useI18n()
function getTitle(post: Post | any) {
  return tObject(post.title || '', locale.value)
}
const route = useRoute()
const categoryList = computed(() => {
  const c = (route.query.category as string) || ''
  return Array.isArray(c) ? [c] : c.split('/')
})
</script>

<template>
  <template v-if="isCategoryList(categoryItem)">
    <YunCategory
      :parent-key="parentKey ? `${parentKey}/${categoryItem.name}` : categoryItem.name"
      :category="categoryItem"
      :collapsable="!categoryList.includes(categoryItem.name)"
    />
  </template>

  <template v-else>
    <RouterLink
      v-if="categoryItem.title"
      :to="categoryItem.path || ''"
      class="inline-flex items-center gap-2 px-3 py-2 w-full rounded"
      hover="bg-black/5"
    >
      <div i-ri-file-text-line />
      <span font="serif black">{{ getTitle(categoryItem) }}</span>
    </RouterLink>
  </template>
</template>
