<script lang="ts" setup>
import type { Post } from 'valaxy'
import { formatDate } from 'valaxy'
import { useI18n } from 'vue-i18n'

defineProps<{
  // FrontMatter
  frontmatter: Post
}>()

const { t } = useI18n()
</script>

<template>
  <div v-if="frontmatter.draft" class="post-draft-icon" title="draft">
    <div i-ri-draft-line />
  </div>
  <div v-if="frontmatter.hide" class="post-top-icon" color="$va-c-danger" :title="`hide:${frontmatter.hide}`">
    <div v-if="frontmatter.hide === 'index'" i-ri-eye-close-line />
    <div v-else i-ri-eye-off-line />
  </div>
  <div v-if="frontmatter.top" class="post-top-icon" color="$va-c-warning">
    <div i-ri-pushpin-line />
  </div>

  <div v-if="frontmatter" class="post-meta justify-center" flex="~" text="sm" py="1">
    <div v-if="frontmatter.date" class="post-time flex items-center">
      <span class="inline-flex-center" :title="t('post.posted')">
        <div class="inline-block" i-ri-calendar-line />
        <time m="l-1">{{ formatDate(frontmatter.date) }}</time>
      </span>

      <span
        v-if="frontmatter.updated && frontmatter.updated !== frontmatter.date"
        class="inline-flex-center" :title="t('post.edited')"
      >
        <span m="x-2">-</span>
        <div i-ri-calendar-2-line />
        <time m="l-1">{{ formatDate(frontmatter.updated) }}</time>
      </span>
    </div>
  </div>

  <slot />
</template>

<style>
.post-draft-icon {
  position: absolute;
  top: 1rem;
  left: 1rem;
  color: var(--va-c-gray);
  font-size: 1.2rem;
}

.post-top-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.2rem;
}
</style>
