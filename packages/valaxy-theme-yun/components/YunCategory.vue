<script lang="ts" setup>
import type { CategoryList, Post } from 'valaxy'
import { isCategoryList, useInvisibleElement, useValaxyI18n } from 'valaxy'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { yunSpringVariants } from '../composables/animation'

const props = withDefaults(defineProps<{
  i?: number
  parentKey: string
  // to eliminate the warning
  category: Post | CategoryList
  level?: number

  /**
   * collapse children
   */
  collapsable?: boolean
}>(), {
  collapsable: true,
})

const router = useRouter()

const collapse = ref(props.collapsable)
const { t } = useI18n()
const { $tCategory } = useValaxyI18n()

const categoryLabel = computed(() => {
  const name = isCategoryList(props.category) ? props.category.name : ''
  return name === 'Uncategorized' ? t('category.uncategorized') : $tCategory(name)
})

const postCollapseElRef = ref<HTMLElement>()
const { show } = useInvisibleElement(postCollapseElRef)
/**
 * scroll to post collapse by category
 * @param category
 */
function jumpToDisplayCategory(category: string) {
  collapse.value = false

  router.push({
    query: {
      category,
    },
  })

  show()
}

onMounted(() => {
  const postCollapseEl = document.querySelector('.post-collapse-container') as HTMLElement
  if (postCollapseEl)
    postCollapseElRef.value = postCollapseEl
})

const motionVariants = props.level === 1
  ? yunSpringVariants({ i: props.i || 0, y: 20, duration: 200 })
  : undefined
</script>

<template>
  <li
    v-motion="motionVariants"
    class="category-list-item inline-flex items-center cursor-pointer w-full gap-2 px-3 py-2"
  >
    <button
      type="button"
      class="folder-action"
      :class="{ 'is-expanded': !collapse }"
      :aria-expanded="!collapse"
      :aria-label="t('theme.toggleSection', { title: categoryLabel })"
      @click="collapse = !collapse"
    >
      <span v-if="collapse" i-ri-folder-add-line aria-hidden="true" />
      <span v-else i-ri-folder-reduce-line aria-hidden="true" />
    </button>
    <span
      class="category-name inline-flex items-center gap-2 w-full"
      @click="jumpToDisplayCategory(parentKey)"
    >
      <span>
        {{ categoryLabel }}
      </span>
      <span class="category-count">
        {{ category.total }}
      </span>
    </span>
  </li>

  <Transition
    enter-active-class="v-enter-active"
    enter-from-class="v-enter-from"
    leave-active-class="v-leave-active"
    leave-to-class="v-leave-to"
    :duration="{ enter: 200, leave: 0 }"
  >
    <ul v-if="!collapse">
      <li
        v-for="categoryItem, cI in category.children.values()"
        :key="cI"
        class="post-list-item"
        m="l-4"
      >
        <YunCategoryChildItem
          :i="cI"
          :category-item="categoryItem"
          :parent-key="parentKey"
        />
      </li>
    </ul>
  </Transition>
</template>

<style lang="scss">
.category-list-item {
  border-radius: 0.5rem;
  color: var(--va-c-text);
  transition: background-color 180ms ease;

  &:hover {
    background-color: var(--yun-action-btn-hover-bg);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.folder-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem;
  border: 0;
  border-radius: 0.25rem;
  color: var(--va-c-text-2);
  background: transparent;
  cursor: pointer;
  transition: color 180ms ease;

  &:hover,
  &.is-expanded {
    color: var(--va-c-link);
  }

  &:focus-visible {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.category-name {
  color: var(--va-c-text);
  transition: color 180ms ease;

  &:hover {
    color: var(--va-c-link);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.category-count {
  padding: 0.0625rem 0.45rem;
  border: 1px solid var(--yun-surface-line);
  border-radius: 9999px;
  background-color: var(--yun-action-btn-hover-bg);
  color: var(--va-c-text-2);
  font-size: 0.75rem;
  line-height: 1.4;
}

.post-list-item {
  color: var(--va-c-text);
}
</style>
