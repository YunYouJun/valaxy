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
  <ul w="full" p="x-4 lt-sm:0">
    <template v-if="!displayedPosts.length">
      <div py2 op50>
        博主还什么都没写哦～
      </div>
    </template>

    <YunCard v-for="route in displayedPosts" :key="route.path" m="y-4 auto" class="max-w-900px">
      <AppLink
        class="post-title-link"
        :to="route.path || ''"
        m="t-3"
      >
        <div class="title text-2xl" font="serif black">
          {{ route.title }}
        </div>
      </AppLink>

      <YunPostMeta m="b-4" :frontmatter="route" />

      <div v-if="route.excerpt" class="markdown-body" text="left" w="full" p="x-6 y-2 lt-sm:4" v-html="route.excerpt" />

      <div v-if="route.categories || route.tags" w="full" class="yun-card-actions flex justify-between" border="t" text="sm">
        <router-link
          v-if="route.categories"
          :to="{
            path: '/categories/',
            query: {category: Array.isArray(route.categories) ? route.categories[route.categories.length - 1] : route.categories}
          }"
          class="post-categories inline-flex justify-center items-center" m="l-2"
        >
          <div m="x-1" i-ri-folder-2-line />
          {{ Array.isArray(route.categories) ? route.categories.join(' > ') : route.categories }}
        </router-link>

        <div class="post-tags inline-flex" m="r-2">
          <template v-if="route.tags">
            <router-link v-for="tag,i in route.tags" :key="i" :to="{path: '/tags/', query: {tag: tag}}" m="x-1" class="post-tag inline-flex justify-center items-center">
              <div m="r-1" i-ri-price-tag-3-line />
              {{ tag }}
            </router-link>
          </template>
        </div>
      </div>
    </YunCard>
  </ul>

  <ValaxyPagination :cur-page="curPage" :page-size="pageSize" :total="posts.length" />
</template>

<style lang="scss">
.yun-card-actions {
  border-top: 1px solid rgba(238, 238, 238, 0.1);
  min-height: 2.5rem;
}

.post-categories {
  color: var(--yun-c-text);
}

.post-tag {
  color: var(--yun-c-text);
}
</style>
