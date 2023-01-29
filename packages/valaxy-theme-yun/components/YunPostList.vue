<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSiteStore } from 'valaxy'
import type { Post } from 'valaxy'

const props = withDefaults(defineProps<{
  type?: string
  posts?: Post[]
  curPage?: number
}>(), {
  curPage: 1,
})

const site = useSiteStore()

const pageSize = ref(7)

const posts = computed(() => props.posts || site.postList)
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
      <YunPostCard :post="route" />
    </Transition>
  </div>

  <ValaxyPagination :cur-page="curPage" :page-size="pageSize" :total="posts.length" />
</template>

<style>
.yun-card-actions {
  border-top: 1px solid rgba(122, 122, 122, 0.15);
  min-height: 2.5rem;
}

.post-categories {
  color: var(--va-c-text);
}
</style>
