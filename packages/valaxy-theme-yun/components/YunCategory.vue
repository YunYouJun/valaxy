<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import type { CategoryList, Post } from 'valaxy'
import { isCategoryList, useInvisibleElement } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const props = withDefaults(defineProps<{
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
const route = useRoute()
const categoryList = computed(() => {
  const c = (route.query.category as string) || ''
  return Array.isArray(c) ? [c] : c.split('/')
})

const collapse = ref(props.collapsable)
const { t } = useI18n()

/**
 * i18n
 */
const { locale } = useI18n()
function getTitle(post: Post | any) {
  const lang = locale.value === 'zh-CN' ? 'zh' : locale.value
  return post[`title_${lang}`] ? post[`title_${lang}`] : post.title
}

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
</script>

<template>
  <li
    class="category-list-item inline-flex items-center cursor-pointer w-full gap-2 transition px-3 py-2 rounded"
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
        {{ category.name === 'Uncategorized' ? t('category.uncategorized') : category.name }}
      </span>
      <span class="rounded-full px-1.5 bg-black/5 shadow-sm" text="xs black/55">
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
        v-for="categoryItem, i in category.children.values()" :key="i"
        class="post-list-item text-$va-c-text" m="l-4"
        hover="text-$va-c-primary-lighter"
      >
        <template v-if="isCategoryList(categoryItem)">
          <YunCategory
            :parent-key="parentKey ? `${parentKey}/${categoryItem.name}` : categoryItem.name"
            :category="categoryItem"
            :collapsable="!categoryList.includes(categoryItem.name)"
          />
        </template>

        <template v-else>
          <RouterLink
            v-if="categoryItem.title" :to="categoryItem.path || ''"
            class="inline-flex items-center gap-2 px-3 py-2 w-full rounded transition"
            hover="bg-black/5"
          >
            <div i-ri-file-text-line />
            <span font="serif black">{{ getTitle(categoryItem) }}</span>
          </RouterLink>
        </template>
      </li>
    </ul>
  </Transition>
</template>
