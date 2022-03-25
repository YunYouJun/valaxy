<script lang="ts" setup>
import type { Post } from 'valaxy'
import { isDev, useConfig } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  frontmatter: Post
  excerpt?: string
}>()

const config = useConfig()
const route = useRoute()

const url = computed(() => {
  const origin = config.value.url || window?.location.origin
  return origin + route.path
})

// eslint-disable-next-line no-console
if (isDev) console.log(props.frontmatter)
</script>

<template>
  <h1 class="post-title" p="2" m="t-4" text="2xl center" font="serif black">
    {{ frontmatter.title }}
  </h1>
  <main text="left" m="auto" p="t-0 b-2">
    <slot name="header">
      <YunPostMeta :frontmatter="frontmatter" />
    </slot>
    <article class="markdown-body" min="h-8">
      <slot />
    </article>
    <YunSponsor v-if="frontmatter.sponsor || config.sponsor.enable" />
    <ValaxyCopyright v-if="frontmatter.copyright || config.license.enabled" :url="url" m="y-4" />
  </main>
</template>
