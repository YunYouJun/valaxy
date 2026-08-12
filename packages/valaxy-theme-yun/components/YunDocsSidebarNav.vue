<script setup lang="ts">
import type { YunTheme } from '../types'

defineProps<{
  items: YunTheme.SidebarItem[]
}>()

const emit = defineEmits<{
  navigate: []
}>()

function getItemKey(item: YunTheme.SidebarItem, index: number) {
  return item.link || item.text || index
}
</script>

<template>
  <ul class="yun-docs-sidebar-nav">
    <YunDocsSidebarItem
      v-for="(item, index) in items"
      :key="getItemKey(item, index)"
      :item="item"
      @navigate="emit('navigate')"
    />
  </ul>
</template>

<style scoped>
.yun-docs-sidebar-nav {
  padding: 0;
  margin: 0;
}
</style>
