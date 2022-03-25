<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from 'valaxy'
import { usePostList } from '~/composables'

const props = defineProps<{
  type?: string
  posts?: Post[]
}>()

const routes = usePostList({ type: props.type || '' })
const posts = computed(() => (props.posts || routes.value))
</script>

<template>
  <ul w="full" p="x-4 lt-sm:0">
    <template v-if="!posts.length">
      <div py2 op50>
        博主还什么都没写哦～
      </div>
    </template>

    <YunCard v-for="route in posts" :key="route.path" m="y-4 auto" class="max-w-900px">
      <AppLink
        class="post-title-link"
        :to="route.path || ''"
        m="t-3"
      >
        <div class="title text-2xl" font="serif black">
          {{ route.title }}
        </div>
      </AppLink>
      <YunPostMeta :frontmatter="route" />

      <div v-if="route.excerpt" class="markdown-body" text="left" w="full" p="x-6 y-2 lt-sm:4" v-html="route.excerpt" />

      <div w="full" class="yun-card-action flex justify-between" border="t" text="sm">
        <div class="post-category inline-flex justify-center items-center" m="l-2">
          <template v-if="route.category">
            <div m="x-1" i-ri-folder-2-line />
            {{ route.category }}
          </template>
        </div>
        <div class="post-tags inline-flex" m="r-2">
          <template v-if="route.tags">
            <div v-for="tag,i in route.tags" :key="i" m="x-1" class="post-tag inline-flex justify-center items-center">
              <div m="r-1" i-ri-price-tag-3-line />
              {{ tag }}
            </div>
          </template>
        </div>
      </div>
    </YunCard>
  </ul>
</template>

<style lang="scss">
.yun-card-action {
  border-top: 1px solid rgba(238, 238, 238, 0.1);
  min-height: 2.5rem;
}
</style>
