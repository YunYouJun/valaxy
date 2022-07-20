<script lang="ts" setup>
import type { Categories } from 'valaxy'
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  categories: Categories
  /**
   * 当前层级
   */
  level?: number
  displayCategory?: (category: string) => void
  collapsable?: boolean
}>(), {
  level: 0,
  collapsable: true,
})

const collapsable = ref(props.collapsable)
</script>

<template>
  <ul v-for="category, key in Object.fromEntries(categories)" :key="key" class="category-list" m="l-4">
    <YunCategory :name="key.toString()" :category="category" :level="level + 1" :display-category="displayCategory" :collapsable="collapsable" />
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
