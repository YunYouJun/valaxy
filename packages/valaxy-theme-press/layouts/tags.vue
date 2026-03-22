<script lang="ts" setup>
import { useFrontmatter, useSiteStore, useTags, useValaxyI18n } from 'valaxy'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const frontmatter = useFrontmatter()
const site = useSiteStore()
const { $tO, $tTag } = useValaxyI18n()

const tags = useTags()

const curTag = computed(() => route.query.tag as string || '')

const filteredPosts = computed(() => {
  return site.postList.filter((post) => {
    if (post.tags) {
      if (typeof post.tags === 'string')
        return post.tags === curTag.value
      else
        return post.tags.includes(curTag.value)
    }
    return false
  })
})

const title = computed(() => $tO(frontmatter.value.title) || 'Tags')

const tagArr = computed(() => [...tags.value].sort())

function getTagSize(count: number) {
  const counts = Array.from(tags.value, ([_, v]) => v.count)
  const max = Math.max(...counts)
  const min = Math.min(...counts)
  const range = max - min || 1
  const percent = (count - min) / range
  return `${percent * 20 + 14}px`
}

function selectTag(tag: string) {
  router.push({ query: { tag } })
}
</script>

<template>
  <Layout>
    <template #main-content>
      <div class="max-w-6xl mx-auto w-full pb-12 px-4 sm:px-6 lg:px-8">
        <div class="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 class="text-3xl leading-9 font-extrabold text-gray-900 dark:text-gray-100 tracking-tight sm:text-4xl sm:leading-10 md:text-5xl md:leading-13">
            {{ title }}
          </h1>
        </div>

        <!-- Tag Cloud -->
        <div class="flex flex-wrap items-end gap-3 pb-8">
          <button
            v-for="([key, tag]) in tagArr"
            :key="key"
            class="inline-flex items-baseline gap-1 rounded-full px-3 py-1 transition-colors border-none cursor-pointer"
            :class="curTag === key
              ? 'bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-primary/10 hover:text-primary'"
            :style="{ fontSize: getTagSize(tag.count) }"
            @click="selectTag(key.toString())"
          >
            <span>#{{ $tTag(key.toString()) }}</span>
            <span class="text-xs op-70">({{ tag.count }})</span>
          </button>
        </div>

        <!-- Filtered Posts -->
        <div v-if="curTag">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <span class="i-ri-hashtag" />
            {{ $tTag(curTag) }}
            <span class="text-sm font-normal text-gray-500">({{ filteredPosts.length }})</span>
          </h2>
          <PressPostList :posts="filteredPosts" />
        </div>
      </div>
    </template>
  </Layout>
</template>
