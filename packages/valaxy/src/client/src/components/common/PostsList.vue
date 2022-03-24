<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Post } from 'valaxy'

const props = defineProps<{
  type?: string
  posts?: Post[]
}>()

const router = useRouter()
const routes: Post[] = router.getRoutes()
  .filter(i => i.path.startsWith('/posts') && i.meta.frontmatter && i.meta.frontmatter.date)
  .sort((a, b) => +new Date(b.meta.frontmatter.date || '') - +new Date(a.meta.frontmatter.date || ''))
  .filter(i => !i.path.endsWith('.html'))
  .filter(i => !props.type || i.meta.frontmatter.type === props.type)
  .map((i) => {
    return Object.assign({ path: i.path, excerpt: i.meta.excerpt }, i.meta.frontmatter)
  })

const posts = computed(() => (props.posts || routes))
</script>

<template>
  <ul>
    <template v-if="!posts.length">
      <div py2 op50>
        博主还什么都没写哦～
      </div>
    </template>

    <YunCard v-for="route in posts" :key="route.path" m="y-4" class="max-w-900px">
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
      <div v-if="route.excerpt" class="markdown-body" m="y-4">
        {{ route.excerpt }}
      </div>
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
