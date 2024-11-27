<script setup lang="ts">
import type { Post } from 'valaxy'
import { useSiteStore } from 'valaxy'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type?: string
  posts?: Post[]
  curPage?: number
}>(), {
  curPage: 1,
})

const site = useSiteStore()
const posts = computed(() => props.posts || site.postList)
</script>

<template>
  <ul class="divide-y divide-gray-200">
    <TransitionGroup name="fade">
      <li v-for="post, i in posts" :key="i" class="py-12">
        <PressArticleCard :post="post" />
      </li>
    </TransitionGroup>
  </ul>
</template>
