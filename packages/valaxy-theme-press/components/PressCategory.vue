<script lang="ts" setup>
import type { Category, Post } from 'valaxy'
import { isCategoryList, tObject } from 'valaxy'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

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
const { t, locale } = useI18n()

function getTitle(post: Post | any) {
  const lang = locale.value
  return tObject(post.title || '', lang)
}
</script>

<template>
  <li
    v-if="category.total"
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
  </li>

  <ul v-if="!collapsable">
    <li v-for="categoryItem, i in category.children.values()" :key="i" class="post-list-item">
      <template v-if="!isCategoryList(categoryItem)">
        <RouterLink
          v-if="categoryItem.title" :to="categoryItem.path || ''"
          class="inline-flex items-center"
        >
          <span class="text ml-1" text="sm">{{ getTitle(categoryItem) }}</span>
        </RouterLink>
      </template>

      <PressCategory v-else :category="categoryItem" :display-category="displayCategory" :collapsable="collapsable" />
    </li>
  </ul>
</template>

<style lang="scss">
.post-list-item {
  // align with vitepress
  a {
    // color: var(--va-c-text-light);
    color: var(--vp-c-text-2);
    transition: all 0.2s;

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
