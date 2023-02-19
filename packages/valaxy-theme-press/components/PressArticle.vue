<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useFrontmatter, useSiteStore } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { getLocaleTitle } from '../utils'

const frontmatter = useFrontmatter()

const route = useRoute()
const site = useSiteStore()

function findCurrentIndex() {
  return site.postList.findIndex(p => p.href === route.path)
}

const nextPost = computed(() => site.postList[findCurrentIndex() - 1])
const prevPost = computed(() => site.postList[findCurrentIndex() + 1])

const { locale } = useI18n()
const localeTitle = computed(() => getLocaleTitle(locale.value, frontmatter.value))
</script>

<template>
  <article class="xl:divide-y xl:divide-gray-200 max-w-7xl m-auto" p="x-6" w="full">
    <header class="pt-20 xl:pb-10 space-y-1 text-center">
      <PressDate :date="frontmatter.date" />
      <h1
        class="
          text-3xl
          leading-9
          font-extrabold
          tracking-tight
          sm:text-4xl sm:leading-10
          md:text-5xl md:leading-14
        "
      >
        {{ localeTitle }}
      </h1>
    </header>

    <div
      class="
        divide-y
        xl:divide-y-0
        divide-gray-200
        xl:grid xl:grid-cols-12 xl:gap-x-6
        pb-16
        xl:pb-20
      "
      style="grid-template-rows: auto 1fr"
    >
      <PressAuthor v-if="frontmatter.author" :frontmatter="frontmatter" />
      <div class="divide-y divide-gray-200 xl:pb-0 xl:col-span-8 xl:row-span-2">
        <router-view />
      </div>

      <footer
        class="
          text-sm
          font-medium
          leading-5
          divide-y divide-gray-200
          xl:col-start-1 xl:row-start-2 xl:col-span-2
        "
      >
        <div v-if="nextPost" class="py-8">
          <h2 class="text-xs tracking-wide uppercase text-gray-500">
            Next Article
          </h2>
          <div class="link">
            <router-link :to="nextPost.href">
              {{ nextPost.title }}
            </router-link>
          </div>
        </div>
        <div v-if="prevPost && prevPost.href" class="py-8">
          <h2 class="text-xs tracking-wide uppercase text-gray-500">
            Previous Article
          </h2>
          <div class="link">
            <router-link :to="prevPost.href">
              {{ prevPost.title }}
            </router-link>
          </div>
        </div>
        <div class="pt-8">
          <router-link class="link" to="/">
            ← Back to Home
          </router-link>
        </div>
      </footer>
    </div>
  </article>
</template>
