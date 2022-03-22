<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Post } from 'valaxy'
import { formatDate } from '~/composables'

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
  .map(i => Object.assign({ path: i.path }, i.meta.frontmatter))

const posts = computed(() => (props.posts || routes))
</script>

<template>
  <ul>
    <template v-if="!posts.length">
      <div py2 op50>
        博主还什么都没写哦～
      </div>
    </template>

    <YunCard v-for="route in posts" :key="route.path" m="y-4">
      <AppLink
        class="item block font-normal mb-6 mt-2 no-underline"
        :to="route.path"
      >
        <li class="no-underline">
          <div class="title text-lg">
            {{ route.title }}
          </div>
          <div v-if="route.date" class="time opacity-50 text-sm -mt-1">
            {{ formatDate(route.date) }}
            <span v-if="route.duration" class="opacity-50">· {{ route.duration }}</span>
          </div>
        </li>
      </AppLink>
    </YunCard>
  </ul>
</template>
