<script lang="ts" setup>
import type { CategoryList, Post } from 'valaxy'
import { useInvisibleElement, useValaxyI18n } from 'valaxy'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useYunSpringAnimation } from '../composables/animation'

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
const { $t } = useValaxyI18n()

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

const categoryRef = ref<HTMLElement>()
if (props.level === 1) {
  useYunSpringAnimation(categoryRef, {
    i: props.i || 0,
    y: 20,
    duration: 200,
  })
}
</script>

<template>
  <li
    ref="categoryRef"
    class="category-list-item inline-flex items-center cursor-pointer w-full gap-2 px-3 py-2 rounded"
    hover="bg-black/5"
  >
    <span
      class="folder-action inline-flex"
      hover="text-$va-c-primary-lighter"
      @click="collapse = !collapse"
    >
      <div v-if="collapse" i-ri-folder-add-line />
      <div v-else class="text-$va-c-primary dark:text-$va-c-primary-lighter" i-ri-folder-reduce-line />
    </span>
    <span
      class="category-name inline-flex items-center gap-2 w-full"
      @click="jumpToDisplayCategory(parentKey)"
    >
      <span>
        {{ category.name === 'Uncategorized' ? t('category.uncategorized') : $t(category.name) }}
      </span>
      <span class="rounded-full px-1.5 bg-black/5 shadow-sm op-60" text="xs">
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
        class="post-list-item text-$va-c-text" m="l-4"
        hover="text-$va-c-primary-lighter"
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
