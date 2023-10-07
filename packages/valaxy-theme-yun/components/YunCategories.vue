<script lang="ts" setup>
import type { Categories } from 'valaxy'
import { ref } from 'vue'

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

const collapsable = ref(props.collapsable)
</script>

<template>
  <ul v-for="category in categories" :key="category.name" class="category-list" m="l-4">
    <YunCategory
      :parent-key="category.name"
      :category="category"
      :level="level + 1"
      :collapsable="collapsable"
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
