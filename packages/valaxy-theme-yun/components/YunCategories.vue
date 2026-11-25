<script lang="ts" setup>
import type { Categories } from 'valaxy'
import { computed, onMounted, ref } from 'vue'

import { useRoute } from 'vue-router'

const props = withDefaults(defineProps<{
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

const hydrated = ref(false)
onMounted(() => {
  hydrated.value = true
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
        :collapsable="hydrated ? !categoryList.includes(category.name) : props.collapsable"
      />
    </ul>
  </div>
</template>
