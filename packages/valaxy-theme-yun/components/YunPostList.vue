<script setup lang="ts">
import { computed } from 'vue'
import { useSiteConfig, useSiteStore } from 'valaxy'
import type { Post } from 'valaxy/types'

const props = withDefaults(defineProps<{
  type?: string
  posts?: Post[]
  curPage?: number
}>(), {
  curPage: 1,
})

const site = useSiteStore()
const siteConfig = useSiteConfig()
const pageSize = computed(() => siteConfig.value.pageSize)

const posts = computed(() => (
  props.posts || site.postList).filter(post => import.meta.env.DEV ? true : !post.hide),
)

const displayedPosts = computed(() =>
  posts.value.slice(
    (props.curPage - 1) * pageSize.value,
    props.curPage * pageSize.value,
  ),
)
</script>

<template>
  <div class="yun-post-list" w="full" p="x-4 lt-sm:0">
    <template v-if="!displayedPosts.length">
      <div py2 op50 text-center>
        博主还什么都没写哦～
      </div>
    </template>

    <TransitionGroup name="fade">
      <YunPostCard v-for="route, i in displayedPosts" :key="i" :post="route" />
    </TransitionGroup>
  </div>

  <YunPagination :total="posts.length" :page-size="pageSize" />
</template>
