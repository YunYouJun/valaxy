<script lang="ts" setup>
import type { Category, CategoryList } from 'valaxy'
import { isCategoryList, useValaxyI18n } from 'valaxy'
import { computed, ref, useId } from 'vue'
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
const categoryLabel = computed(() => props.category.name === 'Uncategorized'
  ? t('category.uncategorized')
  : t(`category.${props.category.name}`))
const isGroupToggle = computed(() => hasChildren.value && !props.displayCategory)
const headingTag = computed(() => props.level < 5 ? `h${props.level + 2}` : 'p')
const textId = useId()

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
    <component
      :is="isGroupToggle ? headingTag : 'div'"
      class="press-sidebar-item category-list-item"
    >
      <button
        v-if="isGroupToggle"
        type="button"
        class="press-sidebar-group-toggle"
        :aria-expanded="!collapsed"
        @click="toggle"
      >
        <span class="press-sidebar-group-label">{{ categoryLabel }}</span>
        <span class="caret" aria-hidden="true">
          <span class="caret-icon" :class="{ open: !collapsed }" i-ri-arrow-right-s-line />
        </span>
      </button>
      <button
        v-else-if="displayCategory"
        :id="textId"
        type="button"
        class="category-name"
        @click="displayCategory(category.name)"
      >
        {{ categoryLabel }}
      </button>
      <span v-else :id="textId" class="category-name">{{ categoryLabel }}</span>
      <button
        v-if="hasChildren && !isGroupToggle"
        type="button"
        :aria-labelledby="textId"
        :aria-expanded="!collapsed"
        class="caret"
        @click.stop="toggle"
      >
        <span class="caret-icon" :class="{ open: !collapsed }" i-ri-arrow-right-s-line aria-hidden="true" />
      </button>
    </component>

    <ul v-if="hasChildren && !collapsed" class="items press-category-list press-sidebar-category-list">
      <template v-for="(categoryItem, i) in category.children.values()" :key="getCategoryItemKey(categoryItem, i)">
        <li v-if="!isCategoryList(categoryItem)" class="post-list-item">
          <RouterLink
            v-if="categoryItem.title" :to="categoryItem.path || ''"
            class="press-sidebar-link"
            exact-active-class="is-active"
          >
            <span class="text">{{ $tO(categoryItem.title) }}</span>
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

<style scoped>
.press-category-item,
.press-category-list,
.post-list-item {
  list-style: none;
  margin: 0;
  padding: 0;
}

.category-name {
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  color: var(--pr-c-text-1);
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  text-align: left;
  overflow-wrap: anywhere;
}

.press-category-list {
  margin-top: 4px;
}

.press-category-item:not(.level-0) > .press-category-list {
  margin-left: 8px;
  padding-left: 12px;
  border-left: 1px solid var(--pr-sidebar-divider);
}
</style>
