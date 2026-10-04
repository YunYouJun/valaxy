<script setup lang="ts">
import type { Post } from 'valaxy'
import { filterAndSortPosts, usePageList, useSiteConfig, useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { useLocaleConfig } from '../composables/locale'

const props = withDefaults(defineProps<{
  type?: string
  posts?: Post[]
  curPage?: number
}>(), {
  curPage: 1,
})

const site = useSiteStore()
const pageList = usePageList()
const siteConfig = useSiteConfig()
const { currentLocale, i18nRouting } = useLocaleConfig()
const posts = computed(() => {
  const list = props.posts ?? (i18nRouting.value
    ? filterAndSortPosts(pageList.value, siteConfig.value, { pathPrefix: `${currentLocale.value.link}posts` })
    : site.postList)
  return list.filter(p => p.path && !p.path.endsWith('/'))
})
</script>

<template>
  <ul class="divide-y divide-gray-200">
    <TransitionGroup name="fade">
      <li v-for="post in posts" :key="post.path" class="py-8">
        <PressArticleCard :post="post" />
      </li>
    </TransitionGroup>
  </ul>
</template>
