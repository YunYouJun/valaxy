<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import type { Category, Post } from 'valaxy'
import { isCategoryList, useInvisibleElement } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const props = withDefaults(defineProps<{
  parentKey: string
  // to eliminate the warning
  category: Category
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
  <li class="category-list-item inline-flex items-center cursor-pointer">
    <span class="folder-action inline-flex" @click="collapse = !collapse">
      <div v-if="collapse" i-ri-folder-add-line />
      <div v-else style="color:var(--va-c-primary)" i-ri-folder-reduce-line />
    </span>
    <span class="category-name" m="l-1" @click="jumpToDisplayCategory(parentKey)">
      {{ category.name === 'Uncategorized' ? t('category.uncategorized') : category.name }} [{{ category.total }}]
    </span>
  </li>

  <template v-if="!collapse">
    <ul>
      <li v-for="categoryItem, i in category.children" :key="i" class="post-list-item" m="l-4">
        <template v-if="isCategoryList(categoryItem)">
          <YunCategory
            :parent-key="parentKey ? `${parentKey}/${categoryItem.name}` : categoryItem.name"
            :category="categoryItem"
            :collapsable="!categoryList.includes(categoryItem.name)"
          />
        </template>

        <template v-else>
          <RouterLink v-if="categoryItem.title" :to="categoryItem.path || ''" class="inline-flex items-center">
            <div i-ri-file-text-line />
            <span m="l-1" font="serif black">{{ getTitle(categoryItem) }}</span>
          </RouterLink>
        </template>
      </li>
    </ul>
  </template>
</template>
