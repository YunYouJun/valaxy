<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Post } from 'valaxy'
import { usePostList } from '~/composables'

const props = withDefaults(defineProps<{
  type?: string
  posts?: Post[]
  curPage?: number
}>(), {
  curPage: 1,
})

const pageSize = ref(7)

const routes = usePostList({ type: props.type || '' })
const posts = computed(() => props.posts || routes.value)
const displayedPosts = computed(() => posts.value.slice((props.curPage - 1) * pageSize.value, props.curPage * pageSize.value))
</script>

<template>
  <div w="full" p="x-4 lt-sm:0">
    <template v-if="!displayedPosts.length">
      <div py2 op50>
        博主还什么都没写哦～
      </div>
    </template>

    <Transition v-for="route, i in displayedPosts" :key="i" name="fade">
      <PostCard :post="route" />
    </Transition>
  </div>

  <ValaxyPagination :cur-page="curPage" :page-size="pageSize" :total="posts.length" />
</template>

<style lang="scss">
.yun-card-actions {
  border-top: 1px solid rgba(122, 122, 122, 0.15);
  min-height: 2.5rem;
}

.post-categories {
  color: var(--yun-c-text);
}

.post-tag {
  color: var(--yun-c-text);
}
</style>
