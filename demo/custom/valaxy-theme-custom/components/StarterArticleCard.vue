<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useValaxyI18n } from 'valaxy'

defineProps<{
  post: Post
}>()
const { $tO } = useValaxyI18n()
</script>

<template>
  <article class="space-y-2 xl:grid xl:grid-cols-4 xl:space-y-0 xl:items-baseline">
    <StarterDate :date="post.date" />
    <div class="space-y-5 xl:col-span-3">
      <div class="space-y-6">
        <h2 class="text-2xl leading-8 font-bold tracking-tight">
          <RouterLink class="st-text" :to="post.path || ''">
            {{ $tO(post.title) }}
          </RouterLink>
        </h2>
        <div
          v-if="post.excerpt"
          class="prose dark:prose-invert max-w-none text-gray-500"
          v-html="post.excerpt"
        />
      </div>
      <div class="text-base leading-6 font-medium">
        <RouterLink class="link" aria-label="read more" :to="post.path || ''">
          Read more →
        </RouterLink>
      </div>
    </div>
  </article>
</template>
