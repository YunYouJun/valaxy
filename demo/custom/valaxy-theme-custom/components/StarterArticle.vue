<script setup lang="ts">
import { useFrontmatter, usePostList, useValaxyI18n } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const frontmatter = useFrontmatter()

const route = useRoute()
const posts = usePostList()

const { $tO } = useValaxyI18n()

function findCurrentIndex() {
  return posts.value.findIndex(p => p.path === route.path)
}

const nextPost = computed(() => posts.value[findCurrentIndex() - 1])
const prevPost = computed(() => posts.value[findCurrentIndex() + 1])
</script>

<template>
  <article class="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
    <header class="pt-6 xl:pb-10 space-y-1 text-center">
      <StarterDate :date="frontmatter.date" />
      <h1
        class="
          st-text
          text-3xl
          leading-9
          font-extrabold
          tracking-tight
          sm:text-4xl sm:leading-10
          md:text-5xl md:leading-14
        "
      >
        {{ $tO(frontmatter.title) }}
      </h1>
    </header>

    <div
      class="
        divide-y
        xl:divide-y-0
        divide-gray-200 dark:divide-gray-700
        xl:grid xl:grid-cols-4 xl:gap-x-10
        pb-16
        xl:pb-20
      "
      style="grid-template-rows: auto 1fr"
    >
      <StarterAuthor v-if="frontmatter.author" :frontmatter="frontmatter" />
      <div class="divide-y divide-gray-200 dark:divide-gray-700 xl:pb-0 xl:col-span-3 xl:row-span-2">
        <slot />
      </div>

      <footer
        class="
          text-sm
          font-medium
          leading-5
          divide-y divide-gray-200 dark:divide-gray-700
          xl:col-start-1 xl:row-start-2
        "
      >
        <div v-if="nextPost && nextPost.path" class="py-8">
          <h2 class="text-xs tracking-wide uppercase text-gray-500">
            Next Article
          </h2>
          <div class="link">
            <RouterLink :to="nextPost.path">
              {{ $tO(nextPost.title) }}
            </RouterLink>
          </div>
        </div>
        <div v-if="prevPost && prevPost.path" class="py-8">
          <h2 class="text-xs tracking-wide uppercase text-gray-500">
            Previous Article
          </h2>
          <div class="link">
            <RouterLink :to="prevPost.path">
              {{ $tO(prevPost.title) }}
            </RouterLink>
          </div>
        </div>
        <div class="pt-8">
          <RouterLink class="link" to="/">
            ← Back to the blog
          </RouterLink>
        </div>
      </footer>
    </div>
  </article>
</template>
