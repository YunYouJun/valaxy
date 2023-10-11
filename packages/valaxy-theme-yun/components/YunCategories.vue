<script lang="ts" setup>
import type { Categories } from 'valaxy'
import { computed } from 'vue'

import { useRoute } from 'vue-router'

withDefaults(defineProps<{
  categories: Categories
  /**
   * 当前层级
   */
  level?: number
  collapsable?: boolean
}>(), {
  level: 0,
  collapsable: true,
})

const route = useRoute()
const categoryList = computed(() => {
  const c = route.query.category || ''
  return Array.isArray(c) ? [c] : c.split('/')
})
</script>

<template>
  <ul v-for="category in categories" :key="category.name" class="category-list" m="l-4">
    <YunCategory
      :parent-key="category.name"
      :category="category"
      :level="level + 1"
      :collapsable="!categoryList.includes(category.name)"
    />
  </ul>
</template>

<style lang="scss">
.post-list-item {
  a {
    color: var(--va-c-text-lighter);

    &:hover {
      color: var(--va-c-primary);
    }
  }
}

.category-list-item {
  .folder-action {
    &:hover {
      color: var(--va-c-primary);
    }
  }

  .category-name {
    &:hover {
      color: var(--va-c-primary);
    }
  }
}
</style>
