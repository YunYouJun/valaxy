<script lang="ts" setup>
import type { Category, CategoryList } from 'valaxy'
import { isCategoryList, useValaxyI18n } from 'valaxy'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

type CategoryChild = CategoryList['children'] extends Map<string, infer T> ? T : never

const props = withDefaults(defineProps<{
  // to eliminate the warning
  category: Category
  level?: number
  displayCategory?: (category: string) => void

  /**
   * collapse children
   */
  collapsable?: boolean
}>(), {
  collapsable: true,
  level: 0,
})

const collapsed = ref(props.collapsable)
const hasChildren = computed(() => props.category.children.size > 0)
const { t } = useI18n()
const { $tO } = useValaxyI18n()

function toggle() {
  collapsed.value = !collapsed.value
}

function getCategoryItemKey(categoryItem: CategoryChild, index: number): string | number {
  return isCategoryList(categoryItem)
    ? categoryItem.name
    : categoryItem.path || index
}
</script>

<template>
  <li
    v-if="category.total"
    class="press-category-item"
    :class="[`level-${props.level}`, { collapsed }]"
  >
    <div
      p="t-2"
      w="full" border="t t-$pr-c-divider-light"
      class="press-sidebar-item category-list-item inline-flex items-center justify-between"
      text-14px
    >
      <span class="category-name" font="bold" m="l-1" @click="displayCategory ? displayCategory(category.name) : null">
        {{ category.name === 'Uncategorized' ? t('category.uncategorized') : t(`category.${category.name}`) }}
        <!-- <sup font="normal">[{{ category.total }}]</sup> -->
      </span>
      <button
        v-if="hasChildren"
        type="button"
        aria-label="toggle section"
        :aria-expanded="!collapsed"
        class="caret"
        @click.stop="toggle"
      >
        <span class="caret-icon" :class="{ open: !collapsed }" i-ri-arrow-right-s-line aria-hidden="true" />
      </button>
    </div>

    <ul v-if="hasChildren && !collapsed" class="items press-category-list press-sidebar-category-list">
      <template v-for="(categoryItem, i) in category.children.values()" :key="getCategoryItemKey(categoryItem, i)">
        <li v-if="!isCategoryList(categoryItem)" class="post-list-item">
          <RouterLink
            v-if="categoryItem.title" :to="categoryItem.path || ''"
            class="inline-flex items-center"
          >
            <span class="text ml-1" text="sm">{{ $tO(categoryItem.title) }}</span>
          </RouterLink>
        </li>

        <PressCategory
          v-else
          :category="categoryItem"
          :display-category="displayCategory"
          :collapsable="collapsed"
          :level="props.level + 1"
        />
      </template>
    </ul>
  </li>
</template>

<style lang="scss">
.press-category-item,
.press-category-list,
.post-list-item {
  list-style: none;
  margin: 0;
  padding: 0;
}

.press-category-item.level-1 > .press-category-list,
.press-category-item.level-2 > .press-category-list,
.press-category-item.level-3 > .press-category-list,
.press-category-item.level-4 > .press-category-list,
.press-category-item.level-5 > .press-category-list {
  border-left: 1px solid var(--vp-c-divider);
  padding-left: 16px;
}

.post-list-item {
  // align with vitepress
  a {
    // color: var(--va-c-text-light);
    color: var(--vp-c-text-2);
    transition: all var(--va-transition-duration-fast);

    &:hover {
      // color: var(--va-c-primary);
      color: var(--vp-c-brand-1);
    }

    &.router-link-exact-active {
      // color: var(--va-c-primary);
      color: var(--vp-c-brand-1);
    }
  }
}
</style>
