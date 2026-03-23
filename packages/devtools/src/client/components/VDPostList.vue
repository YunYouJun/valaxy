<script lang="ts" setup>
import { useScroll } from '@vueuse/core'
import dayjs from 'dayjs'

import { computed, ref } from 'vue'

import { postList, settings } from '../stores/app'
import VDBottomGradient from './VDBottomGradient.vue'

const postListElRef = ref()
const { arrivedState } = useScroll(postListElRef)

function toTimestamp(value: unknown) {
  const time = dayjs(value as string | number | Date | null | undefined).valueOf()
  return Number.isNaN(time) ? 0 : time
}

const sortedPosts = computed(() => {
  const posts = [...postList.value.posts]
  const order = settings.value.sortOrder

  if (order === 'title') {
    return posts.sort((a, b) => {
      const titleA = String(a.frontmatter.title || '')
      const titleB = String(b.frontmatter.title || '')
      return titleA.localeCompare(titleB)
    })
  }

  if (order === 'date') {
    return posts.sort((a, b) => {
      return toTimestamp(b.frontmatter.date) - toTimestamp(a.frontmatter.date)
    })
  }

  // default: 'updated'
  return posts.sort((a, b) => {
    return toTimestamp(b.frontmatter.updated || b.frontmatter.date) - toTimestamp(a.frontmatter.updated || a.frontmatter.date)
  })
})
</script>

<template>
  <ul ref="postListElRef" class="h-full relative overflow-auto">
    <VDPostListItem
      v-for="post in sortedPosts" :key="post.routePath"
      :post="post"
    />

    <Transition>
      <VDBottomGradient v-if="!arrivedState.bottom" class="fixed" />
    </Transition>
  </ul>
</template>
