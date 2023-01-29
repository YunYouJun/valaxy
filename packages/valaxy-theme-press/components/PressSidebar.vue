<script lang="ts" setup>
import { computed } from 'vue'
import { removeItemFromCategory, useCategory, usePageList, useSidebar } from 'valaxy'
import { useThemeConfig } from '../composables'

defineProps<{
  open: boolean
}>()

const pages = usePageList()
const themeConfig = useThemeConfig()

const categories = computed(() => {
  const cs = useCategory('', pages.value)
  const cList = cs.value
  removeItemFromCategory(cList, 'Uncategorized')

  const sidebar = themeConfig.value.sidebar
  if (sidebar) {
    cList.children.forEach((item) => {
      if (!themeConfig.value.sidebar.includes(item.name))
        removeItemFromCategory(cList, item.name)
    })
  }
  return cList
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
  padding: 1rem;
  top: var(--pr-nav-height);
  z-index: var(--pr-z-sidebar);
  width: calc(100vw - 64px);
  max-width: 320px;
  background-color: var(--va-c-bg);
  opacity: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overflow-y: overlay;
  transform: translateX(-100%);
  transition: opacity 0.5s, transform 0.25s ease;

  &.open {
    opacity: 1;
    transform: translateX(0);
    transition: opacity 0.25s,
                transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }
}

@include screen('md') {
  .press-sidebar {
    z-index: 1;
    width: var(--va-sidebar-width);
    max-width: 100%;
    background-color: var(--va-c-bg-alt);
    opacity: 1;
    box-shadow: none;
    transform: translateX(0);
  }
}

@include mobile {
  .press-sidebar {
    top: 0;
  }
}
</style>
