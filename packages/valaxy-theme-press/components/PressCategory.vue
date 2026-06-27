<script lang="ts" setup>
import type { Category, CategoryList } from 'valaxy'
import { isCategoryList, useValaxyI18n } from 'valaxy'
import { ref } from 'vue'
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
})

const collapsable = ref(props.collapsable)
const { t } = useI18n()
const { $tO } = useValaxyI18n()

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
  >
    <div
      p="t-2"
      w="full" border="t t-$pr-c-divider-light"
      class="press-sidebar-item category-list-item inline-flex items-center justify-between"
      text-14px
      tabindex="0"
    >
      <span class="category-name" font="bold" m="l-1" @click="displayCategory ? displayCategory(category.name) : null">
        {{ category.name === 'Uncategorized' ? t('category.uncategorized') : t(`category.${category.name}`) }}
        <!-- <sup font="normal">[{{ category.total }}]</sup> -->
      </span>
      <button
        tabindex="0" role="button" aria-label="toggle section"
        class="caret folder-action inline-flex cursor-pointer"
        text-base
        @click="collapsable = !collapsable"
      >
        <div v-if="collapsable" i-ri-folder-add-line />
        <div v-else i-ri-folder-reduce-line />
      </button>
    </div>

    <ul v-if="!collapsable" class="press-category-list">
      <template v-for="(categoryItem, i) in category.children.values()" :key="getCategoryItemKey(categoryItem, i)">
        <li v-if="!isCategoryList(categoryItem)" class="post-list-item">
          <RouterLink
            v-if="categoryItem.title" :to="categoryItem.path || ''"
            class="inline-flex items-center"
          >
            <span class="text ml-1" text="sm">{{ $tO(categoryItem.title) }}</span>
          </RouterLink>
        </li>

        <PressCategory v-else :category="categoryItem" :display-category="displayCategory" :collapsable="collapsable" />
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
