<script lang="ts" setup>
import { ref } from 'vue'
import type { Category, Post } from 'valaxy'
import { isParentCategory } from 'valaxy'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  name: string
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

const getTitle = (post: Post | any) => {
  const lang = locale.value === 'zh-CN' ? 'zh' : locale.value
  return post[`title_${lang}`] ? post[`title_${lang}`] : post.title
}
</script>

<template>
  <li v-if="category.total" class="category-list-item inline-flex items-center cursor-pointer">
    <span class="folder-action inline-flex" @click="collapsable = !collapsable">
      <div v-if="collapsable" i-ri-folder-add-line />
      <div v-else style="color:var(--va-c-primary)" i-ri-folder-reduce-line /></span>
    <span class="category-name" m="l-1" @click="displayCategory ? displayCategory(name) : null">
      {{ name === 'Uncategorized' ? t('category.uncategorized') : name }} [{{ category.total }}]
    </span>
  </li>

  <template v-if="!collapsable">
    <ul v-if="!isParentCategory(category)">
      <li v-for="post, i in category.posts" :key="i" class="post-list-item" m="l-4">
        <router-link v-if="post.title" :to="post.path || ''" class="inline-flex items-center">
          <div i-ri-file-text-line />
          <span m="l-1" font="serif black">{{ getTitle(post) }}</span>
        </router-link>
      </li>
    </ul>
    <PressCategories v-else :categories="category.children" :display-category="displayCategory" :collapsable="collapsable" />
  </template>
</template>
