<script lang="ts" setup>
import { computed } from 'vue'
import { useCategory, usePageList, useSidebar } from 'valaxy'
import { useThemeConfig } from '../composables'

defineProps<{
  open: boolean
}>()

const pages = usePageList()
const themeConfig = useThemeConfig()

const categories = computed(() => {
  const cs = useCategory('', pages.value)
  cs.children.delete('Uncategorized')

  const sidebar = themeConfig.value.sidebar
  if (sidebar) {
    cs.children.forEach((_, key) => {
      if (!themeConfig.value.sidebar.includes(key))
        cs.children.delete(key)
    })
  }
  return cs
})

const { hasSidebar } = useSidebar()
</script>

<template>
  <aside
    v-if="hasSidebar"
    class="press-sidebar shadow-lg" :class="{ open }"
    @click.stop
  >
    <div text="left" m="2">
      <PressCategories :categories="categories.children" :collapsable="false" />
    </div>
  </aside>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins' as *;

.press-sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  padding: 1.5rem 1rem;
  padding-top: var(--pr-nav-height);
  z-index: var(--pr-z-index-sidebar);
  width: calc(100vw - 64px);
  max-width: 320px;
  background-color: var(--va-c-bg);
  opacity: 0;
  overflow-x: hidden;
  overflow-y: auto;
  transform: translateX(-100%);
  transition: opacity 0.5s, transform 0.25s ease;

  &.open {
    opacity: 1;
    transform: translateX(0);
    transition: opacity 0.25s,
                transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }
}

@include media('md') {
  .press-sidebar {
    z-index: 1;
    padding: 1.5rem 1rem;
    padding-top: var(--pr-nav-height);
    width: var(--va-sidebar-width);
    max-width: 100%;
    background-color: var(--va-c-bg-alt);
    opacity: 1;
    box-shadow: none;
    transform: translateX(0);
  }
}
</style>
