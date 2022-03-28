<script lang="ts" setup>
import type { Post } from 'valaxy'
defineProps<{
  frontmatter: Post
  excerpt?: string
}>()
</script>

<template>
  <article v-if="$slots.default" class="markdown-body">
    <slot />

    <template v-if="frontmatter.end">
      <slot name="end">
        <div m="y-4" class="flex justify-center items-center">
          <hr class="inline-flex" w="full" m="!y-2">
          <span p="x-4" font="serif">Q.E.D.</span>
          <hr class="inline-flex" w="full" m="!y-2">
        </div>
      </slot>
    </template>
  </article>
</template>
