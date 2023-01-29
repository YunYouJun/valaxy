<script lang="ts" setup>
import type { PageData, Post } from '../../types'

defineProps<{
  frontmatter: Post
  data?: PageData
}>()
</script>

<template>
  <main>
    <slot name="main-content">
      <ValaxyMd :frontmatter="frontmatter">
        <slot name="main-content-md" />
        <slot />
      </ValaxyMd>
    </slot>
  </main>
</template>
