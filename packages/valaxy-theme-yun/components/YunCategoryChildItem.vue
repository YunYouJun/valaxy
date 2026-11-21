<script setup lang="ts">
import { isCategoryList, useValaxyI18n } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps<{
  i?: number
  categoryItem: any
  parentKey?: string
}>()

/**
 * i18n
 */
const { $tO } = useValaxyI18n()

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
      class="yun-category-child-link inline-flex items-center gap-2 px-3 py-2 w-full"
    >
      <span i-ri-file-text-line aria-hidden="true" />
      <span class="st-text">{{ $tO(categoryItem.title) }}</span>
    </RouterLink>
  </template>
</template>

<style lang="scss">
.yun-category-child-link {
  border-radius: 0.5rem;
  color: var(--va-c-text);
  text-decoration: none;
  transition: background-color 180ms ease, color 180ms ease;

  &:hover {
    background-color: var(--yun-action-btn-hover-bg);
    color: var(--va-c-link);
  }

  &:focus-visible {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
</style>
