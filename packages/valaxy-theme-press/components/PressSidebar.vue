<script lang="ts" setup>
import type { CategoryList, Post } from 'valaxy'
import { removeItemFromCategory, usePageList, useSidebar } from 'valaxy'
import { computed } from 'vue'
import { useLocaleConfig } from '../composables'

defineProps<{
  open: boolean
}>()

const pages = usePageList()
const { localeConfig, currentLocaleKey, hasLocales, currentLocale } = useLocaleConfig()

/**
 * Filter pages by current locale prefix so categories are locale-scoped.
 */
const localePages = computed(() => {
  if (!hasLocales.value)
    return pages.value

  if (currentLocaleKey.value === 'root') {
    const locales = localeConfig.value.locales
    const prefixes = locales
      ? Object.keys(locales)
          .filter(k => k !== 'root')
          .map(k => locales[k].link || `/${k}/`)
      : []
    return pages.value.filter(p => p.path && !prefixes.some(prefix => p.path!.startsWith(prefix)))
  }

  const prefix = currentLocale.value.link
  return pages.value.filter(p => p.path?.startsWith(prefix))
})

const sidebar = computed(() => localeConfig.value.sidebar)

/**
 * Build categories from locale-filtered pages.
 * Fully reactive: recomputes when route/locale changes.
 */
const categories = computed(() => {
  const posts = localePages.value

  // Build category tree inline (mirrors useCategories logic)
  const categoryList: CategoryList = {
    name: 'All',
    total: posts.length,
    children: new Map([
      ['Uncategorized', { name: 'Uncategorized', total: 0, children: new Map() }],
    ]),
  }

  const uncategorized = categoryList.children.get('Uncategorized')! as CategoryList

  posts.forEach((post: Post) => {
    if (post.categories) {
      if (Array.isArray(post.categories)) {
        const len = post.categories.length
        let curCategoryList: CategoryList = categoryList
        let parentCategory: CategoryList = curCategoryList

        post.categories.forEach((categoryName, i) => {
          curCategoryList.total += 1
          curCategoryList = curCategoryList.children.get(categoryName) as CategoryList

          if (!curCategoryList) {
            curCategoryList = { name: categoryName, total: 0, children: new Map() }
            parentCategory.children.set(categoryName, curCategoryList)
          }

          if (i === len - 1) {
            curCategoryList.children.set(post.path!, post)
            curCategoryList.total += 1
          }

          parentCategory = curCategoryList
        })
      }
      else {
        const categoryName = post.categories as string
        const curCategory = categoryList.children.get(categoryName) as CategoryList | undefined
        if (curCategory) {
          curCategory.total += 1
          curCategory.children.set(post.path!, post)
        }
        else {
          categoryList.children.set(categoryName, {
            name: categoryName,
            total: 1,
            children: new Map([[post.path!, post]]),
          })
        }
      }
    }
    else {
      uncategorized.total += 1
      uncategorized.children.set(post.path!, post)
    }
  })

  if (uncategorized.total === 0)
    categoryList.children.delete('Uncategorized')

  // Remove categories not listed in sidebar config
  removeItemFromCategory(categoryList, 'Uncategorized')
  const sidebarVal = localeConfig.value.sidebar
  if (Array.isArray(sidebarVal)) {
    const sidebarNames = sidebarVal.filter((item): item is string => typeof item === 'string')
    categoryList.children.forEach((_val, key) => {
      if (!sidebarNames.includes(key))
        removeItemFromCategory(categoryList, key)
    })
  }

  return categoryList
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
