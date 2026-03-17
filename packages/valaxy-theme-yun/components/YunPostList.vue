<script setup lang="ts">
import type { Post } from 'valaxy/types'
import { usePostListWithCollections, useSiteConfig } from 'valaxy'
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  type?: string
  posts?: Post[]
}>(), {})

const paginationRef = ref()
const curPage = computed(() => paginationRef.value?.curPage || 1)

const siteConfig = useSiteConfig()
const pageSize = computed(() => siteConfig.value.pageSize)
const postListWithCollections = usePostListWithCollections({
  type: props.type,
})

const posts = computed(() => (
  props.posts || postListWithCollections.value).filter(post => import.meta.env.DEV ? true : !post.hide),
)

const displayedPosts = computed(() =>
  posts.value.slice(
    (curPage.value - 1) * pageSize.value,
    curPage.value * pageSize.value,
  ),
)
</script>

<template>
  <div w="full">
    <div flex="~ col" class="yun-post-list gap-4 items-center" w="full" p="x-4 lt-sm:0">
      <template v-if="!displayedPosts.length">
        <div py2 op50 text-center>
          博主还什么都没写哦～
        </div>
      </template>

      <template v-for="route in displayedPosts" :key="route.path">
        <YunCollectionCard
          v-if="route._collection"
          :post="route"
          :collection="route._collection"
        />
        <YunPostCard v-else :post="route" />
      </template>
    </div>

    <YunPagination
      ref="paginationRef"
      :total="posts.length" :page-size="pageSize"
    />
  </div>
</template>
