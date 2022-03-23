<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useConfig } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps<{
  frontmatter: Post
}>()

const config = useConfig()
const route = useRoute()

const url = computed(() => {
  const origin = config.value.url || window?.location.origin
  return origin + route.path
})
</script>

<template>
  <h1 class="post-title" p="2" m="t-4" text="2xl center" font="serif">
    {{ frontmatter.title }}
  </h1>
  <main class="markdown-body" text="left" m="auto" p="t-0 b-2" w="900px">
    <slot name="header">
      <YunPostMeta :frontmatter="frontmatter" />
    </slot>
    <article w="full">
      <slot />
    </article>
    <ValaxyCopyright v-if="config.license.enabled" :url="url" m="y-4" />
  </main>
</template>
