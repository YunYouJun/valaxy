<script lang="ts" setup>
import type { Post } from 'valaxy'

defineProps<{
  frontmatter: Post
}>()
</script>

<template>
  <div v-if="frontmatter.draft || frontmatter.hide || frontmatter.top" class="post-status-icons">
    <div v-if="frontmatter.draft" text="$va-c-gray" title="draft">
      <div i-ri-draft-line />
    </div>
    <div v-if="frontmatter.hide" text="$va-c-danger" :title="`hide:${frontmatter.hide}`">
      <div v-if="frontmatter.hide === 'index'" i-ri-eye-close-line />
      <div v-else i-ri-eye-off-line />
    </div>
    <div v-if="frontmatter.top" text="$va-c-warning">
      <div i-ri-pushpin-line />
    </div>
  </div>
</template>

<style>
.post-status-icons {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}
</style>
