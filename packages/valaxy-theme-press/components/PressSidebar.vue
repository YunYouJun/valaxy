<script lang="ts" setup>
import type { CategoryList, Post } from 'valaxy'
import type { PressTheme } from '../types'
import { useMediaQuery } from '@vueuse/core'
import { FocusScope } from 'reka-ui'
import { removeItemFromCategory, usePageList, useSidebar } from 'valaxy'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useLocaleConfig } from '../composables'
import { getSidebar, getSidebarGroups, isSidebarItem } from '../utils/sidebar'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{ (e: 'close'): void }>()
const { t } = useI18n()
const isCompact = useMediaQuery('(max-width: 959px)', { ssrWidth: 1280 })
const closeButton = ref<HTMLButtonElement>()
watch(() => props.open, (open) => {
  if (open && isCompact.value)
    nextTick(() => closeButton.value?.focus({ preventScroll: true }))
})

function onSidebarClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('a'))
    emit('close')
}

const pages = usePageList()
const route = useRoute()
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

const sidebarItems = computed(() => getSidebar(sidebar.value, route.path))

const sidebarGroups = computed(() => {
  return getSidebarGroups(sidebarItems.value)
})

const renderGroups = computed(() => {
  return sidebarGroups.value.map((group, index) => {
    const groupItem = group.text || group.link
      ? { ...group, items: group.items.filter(isSidebarItem) }
      : undefined

    return {
      key: group.text || group.link || index,
      groupItem,
      items: groupItem ? [] : group.items,
    }
  })
})

// Explicit groups and generated categories share the same root visual depth.
const sidebarGroupDepth = 0

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
  if (sidebarItems.value.length) {
    const sidebarNames = sidebarItems.value.filter((item): item is string => typeof item === 'string')
    categoryList.children.forEach((_val, key) => {
      if (!sidebarNames.includes(key))
        removeItemFromCategory(categoryList, key)
    })
  }

  return categoryList
})

const { hasSidebar } = useSidebar()

const shouldShowSidebar = computed(() => {
  return hasSidebar.value && sidebarGroups.value.length > 0
})

function getSidebarItemKey(item: PressTheme.SidebarEntry, index: number): string | number {
  if (typeof item === 'string')
    return item
  return item.text || item.link || index
}

function getSidebarRootItemClasses(groupIndex: number, itemIndex = 0, isSection = true) {
  return [
    'press-sidebar-root-item',
    { 'is-separated': isSection && (groupIndex > 0 || itemIndex > 0) },
  ]
}
</script>

<template>
  <FocusScope
    v-if="shouldShowSidebar"
    as-child
    :present="open && isCompact"
    :trapped="open && isCompact"
    :loop="open && isCompact"
    @mount-auto-focus.prevent
    @unmount-auto-focus.prevent
  >
    <aside
      class="press-sidebar" :class="{ open }"
      :role="isCompact ? 'dialog' : undefined"
      :aria-modal="isCompact && open ? true : undefined"
      :aria-label="t('nav.documentation')"
      :inert="isCompact && !open"
      @click="onSidebarClick"
    >
      <div class="sidebar-heading">
        <span>{{ t('nav.documentation') }}</span>
        <button ref="closeButton" type="button" class="sidebar-close" :aria-label="t('nav.close')" @click="$emit('close')">
          <span i-ri-close-line aria-hidden="true" />
        </button>
      </div>
      <nav
        id="pr-sidebar-nav"
        class="press-sidebar-nav"
        aria-label="Sidebar Navigation"
        text="left"
        m="2"
      >
        <ul v-for="(group, groupIndex) in renderGroups" :key="group.key" class="press-sidebar-list category-list">
          <PressSidebarItem
            v-if="group.groupItem"
            :class="getSidebarRootItemClasses(groupIndex)"
            :item="group.groupItem"
            :depth="sidebarGroupDepth"
          />
          <template v-else>
            <template v-for="(item, index) in group.items" :key="getSidebarItemKey(item, index)">
              <PressCategoryByName
                v-if="typeof item === 'string'"
                :class="getSidebarRootItemClasses(groupIndex, index)"
                :categories="categories"
                :item="item"
              />
              <PressSidebarItem
                v-else
                :class="getSidebarRootItemClasses(groupIndex, index, !!item.items?.length)"
                :item="item"
                :depth="0"
              />
            </template>
          </template>
        </ul>
      </nav>
    </aside>
  </FocusScope>
</template>

<style lang="scss">
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
  overflow: hidden auto;
  overscroll-behavior: contain;
  visibility: hidden;
  border-right: 1px solid var(--pr-c-divider-light);
  box-shadow: 12px 0 40px rgb(0 0 0 / 0.12);
  transform: translateX(-100%);
  transition: opacity var(--va-transition-duration-moderate), transform var(--va-transition-duration) ease;

  &.open {
    visibility: visible;
    opacity: 1;
    transform: translateX(0);
    transition: opacity var(--va-transition-duration),
                transform var(--va-transition-duration-moderate) cubic-bezier(0.19, 1, 0.22, 1);
  }
}

@media (width >= 960px) {
  .press-sidebar {
    z-index: 1;
    visibility: visible;
    width: var(--va-sidebar-width);
    max-width: 100%;
    background-color: var(--pr-c-surface);
    border-right: 1px solid var(--pr-c-divider-light);
    opacity: 1;
    box-shadow: none;
    transform: translateX(0);
  }
}

.sidebar-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px 12px 8px;
  border-bottom: 1px solid var(--pr-c-divider-light);
  color: var(--pr-c-text-2);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.sidebar-close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 8px;
  font-size: 18px;
  color: var(--pr-c-text-1);
}

.sidebar-close:hover { background: var(--pr-c-brand-soft); }

@media (width >= 960px) {
  .sidebar-heading { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .press-sidebar,
  .press-sidebar.open { transition: none; }
}

.press-sidebar-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.press-sidebar-root-item.is-separated {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--pr-c-divider-light);
}

.press-sidebar-item {
  padding-top: 0.5rem;
}

.press-sidebar-root-item > .category-list-item {
  border-top: 0;
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
    margin-right: 0;
    width: 32px;
    height: 32px;
    color: var(--pr-c-text-2);
    cursor: pointer;
    transition: color var(--va-transition-duration);
    flex-shrink: 0;
  }

  .caret-icon {
    width: 18px;
    height: 18px;
    transition: transform var(--va-transition-duration);

    &.open {
      transform: rotate(90deg);
    }
  }

  &:hover .caret {
    color: var(--pr-c-text-1);
  }

  &:hover .caret:hover {
    color: var(--pr-c-text-1);
  }
}
</style>
