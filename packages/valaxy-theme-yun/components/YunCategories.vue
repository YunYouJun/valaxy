<script lang="ts" setup>
import type { Categories } from 'valaxy'

withDefaults(defineProps<{
  categories: Categories
  /**
   * 当前层级
   */
  level?: number
  displayCategory: (category: string) => void
}>(), {
  level: 0,
})
</script>

<template>
  <ul v-for="category, key in Object.fromEntries(categories)" :key="key" class="category-list" m="l-4">
    <YunCategory :name="key.toString()" :category="category" :level="level + 1" :display-category="displayCategory" />
  </ul>
</template>

<style lang="scss">
.post-list-item {
  a {
    color: var(--yun-c-text);

    &:hover {
      color: var(--yun-c-primary);
    }
  }
}

.category-list-item {
  .folder-action {
    &:hover {
      color: var(--yun-c-primary);
    }
  }
  .category-name {
    &:hover {
      color: var(--yun-c-primary);
    }
  }
}
</style>
