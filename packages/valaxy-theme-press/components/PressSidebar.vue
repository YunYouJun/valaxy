<script lang="ts" setup>
import { computed } from 'vue'
import { removeItemFromCategory, useCategories, usePageList, useSidebar } from 'valaxy'
import { useThemeConfig } from '../composables'

defineProps<{
  open: boolean
}>()

const pages = usePageList()
const themeConfig = useThemeConfig()

const sidebar = computed(() => themeConfig.value.sidebar)
const cs = useCategories('', pages.value)
const categories = computed(() => {
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
      <ul v-for="item in sidebar" :key="item" class="category-list">
        <template v-if="typeof item === 'string'">
          <PressCategoryByName
            :categories="categories"
            :item="item"
          />
        </template>
        <PressSidebarItem
          v-else
          p="t-2"
          border="t t-$pr-c-divider-light"
          :item="item"
          :depth="0"
        />
      </ul>
    </div>
  </aside>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins/index.scss' as *;

.press-sidebar {
  position: fixed;
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

.category-list {
  &:first-child {
    .category-list-item {
      border-top: 0;
    }
  }
}

.post-list-item {
  a {
    color: var(--va-c-text-light);
    transition: all 0.2s;

    &:hover {
      color: var(--va-c-primary);
    }

    &.active {
      color: var(--va-c-primary);
    }
  }
}

.press-sidebar-item {
  .caret {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: -7px;
    width: 32px;
    height: 32px;
    color: var(--vp-c-text-3);
    cursor: pointer;
    transition: color 0.25s;
    flex-shrink: 0;
  }

  &:hover .caret {
    color: var(--vp-c-text-2);
  }

  &:hover .caret:hover {
    color: var(--vp-c-text-1);
  }
}

.category-list+.category-list {
  margin-top: 1rem;
}
</style>
