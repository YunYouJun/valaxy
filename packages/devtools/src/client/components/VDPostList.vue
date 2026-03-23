<script lang="ts" setup>
import { useScroll } from '@vueuse/core'
import dayjs from 'dayjs'

import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { postList, settings } from '../stores/app'
import VDBottomGradient from './VDBottomGradient.vue'

const props = withDefaults(defineProps<{
  searchQuery?: string
  draftFilter?: 'all' | 'draft' | 'published'
}>(), {
  searchQuery: '',
  draftFilter: 'all',
})

const { t } = useI18n()
const postListElRef = ref()
const { arrivedState } = useScroll(postListElRef)

function toTimestamp(value: unknown) {
  const time = dayjs(value as string | number | Date | null | undefined).valueOf()
  return Number.isNaN(time) ? 0 : time
}

const sortedAndFilteredPosts = computed(() => {
  let posts = [...postList.value.posts]
  const direction = settings.value.sortDirection === 'asc' ? 1 : -1

  // Draft filter
  if (props.draftFilter === 'draft')
    posts = posts.filter(p => p.frontmatter.draft)
  else if (props.draftFilter === 'published')
    posts = posts.filter(p => !p.frontmatter.draft)

  // Search filter
  if (props.searchQuery.trim()) {
    const q = props.searchQuery.toLowerCase()
    posts = posts.filter(p =>
      String(p.frontmatter.title || '').toLowerCase().includes(q)
      || p.routePath.toLowerCase().includes(q)
      || (p.frontmatter.tags && Array.isArray(p.frontmatter.tags)
        && p.frontmatter.tags.some((tag: string) => tag.toLowerCase().includes(q))),
    )
  }

  // Sort
  const order = settings.value.sortOrder
  if (order === 'title') {
    return posts.sort((a, b) => {
      const titleA = String(a.frontmatter.title || '')
      const titleB = String(b.frontmatter.title || '')
      return titleA.localeCompare(titleB) * direction
    })
  }

  if (order === 'date') {
    return posts.sort((a, b) => {
      return (toTimestamp(b.frontmatter.date) - toTimestamp(a.frontmatter.date)) * direction
    })
  }

  // default: 'updated'
  return posts.sort((a, b) => {
    return (toTimestamp(b.frontmatter.updated || b.frontmatter.date) - toTimestamp(a.frontmatter.updated || a.frontmatter.date)) * direction
  })
})
</script>

<template>
  <ul ref="postListElRef" class="h-full relative overflow-auto">
    <VDPostListItem
      v-for="post in sortedAndFilteredPosts" :key="post.routePath"
      :post="post"
    />

    <!-- Empty search result -->
    <li v-if="sortedAndFilteredPosts.length === 0 && postList.posts.length > 0" class="flex flex-col items-center justify-center py-8 op-40 text-sm">
      <div class="i-ri:search-line text-2xl mb-2" />
      <span>{{ t('posts.no_results') }}</span>
    </li>

    <Transition>
      <VDBottomGradient v-if="!arrivedState.bottom" class="fixed" />
    </Transition>
  </ul>
</template>
