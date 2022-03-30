<script lang="ts" setup>
import { ref } from 'vue'
import type { Category, ParentCategory, PostCategory } from 'valaxy'
import { useI18n } from 'vue-i18n'

defineProps<{
  name: string
  // to eliminate the warning
  category: Category
  level?: number
  displayCategory: (category: string) => void
}>()

const showChild = ref(false)
const { t } = useI18n()
</script>

<template>
  <li v-if="category.total" class="category-list-item inline-flex items-center cursor-pointer">
    <span class="folder-action inline-flex" @click="showChild = !showChild">
      <div v-if="!showChild" i-ri-folder-add-line />
      <div v-else style="color:var(--yun-c-primary)" i-ri-folder-reduce-line /></span>
    <span class="category-name" m="l-1" @click="displayCategory(name)">
      {{ name === 'Uncategorized' ? t('category.uncategorized') : name }} [{{ category.total }}]
    </span>
  </li>

  <template v-if="showChild">
    <ul v-if="(category as PostCategory).posts">
      <li v-for="post, i in (category as PostCategory).posts" :key="i" class="post-list-item" m="l-4">
        <router-link v-if="post.title" :to="post.path" class="inline-flex items-center">
          <div i-ri-file-text-line />
          <span m="l-1" font="serif black">{{ post.title }}</span>
        </router-link>
      </li>
    </ul>
    <YunCategories v-else :categories="(category as ParentCategory).children" :display-category="displayCategory" />
  </template>
</template>
