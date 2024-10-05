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
  <div flex="~ col">
    <ul
      v-for="(category, i) in categories.values()"
      :key="category.name"
      class="category-list"
    >
      <YunCategory
        :i="i"
        :parent-key="category.name"
        :category="category"
        :level="level + 1"
        :collapsable="!categoryList.includes(category.name)"
      />
    </ul>
  </div>
</template>
