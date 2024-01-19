<script lang="ts" setup>
import type { CategoryList } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  categories: CategoryList
  item: string
}>()

const category = computed(() => {
  const c = props.categories.children.get(props.item)
  return c
})
</script>

<template>
  <PressCategory
    v-if="category"
    :category="category"
    :collapsable="false"
  />
</template>
