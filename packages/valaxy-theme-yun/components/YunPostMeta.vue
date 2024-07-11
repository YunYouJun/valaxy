<script lang="ts" setup>
import type { Post } from 'valaxy'
import { formatDate, formatTimestamp, useSiteConfig } from 'valaxy'
import { useI18n } from 'vue-i18n'

defineProps<{
  // FrontMatter
  frontmatter: Post
}>()

const { t } = useI18n()

const siteConfig = useSiteConfig()
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

  <div
    v-if="frontmatter" class="post-meta"
    flex="~ col" justify="center" items="center" text="sm" py="1"
  >
    <div v-if="frontmatter.date" class="post-time flex items-center">
      <span class="posted-time inline-flex-center" :title="t('post.posted') + formatTimestamp(frontmatter.date)">
        <div class="inline-block" i-ri-calendar-line />
        <time m="l-1">{{ formatDate(frontmatter.date) }}</time>
      </span>

      <span
        v-if="frontmatter.updated && frontmatter.updated !== frontmatter.date"
        class="edited-time inline-flex-center" :title="t('post.edited') + formatTimestamp(frontmatter.updated)"
      >
        <span m="x-2">-</span>
        <div i-ri-calendar-2-line />
        <time m="l-1">{{ formatDate(frontmatter.updated) }}</time>
      </span>
    </div>

    <div
      v-if="siteConfig.statistics.enable"
      class="post-counter flex items-center" mt="2"
    >
      <span
        v-if="frontmatter.wordCount"
        class="word-count inline-flex-center" :title="t('statistics.word')"
      >
        <div class="inline-block" i-ri-file-word-line />
        <span m="l-1">{{ frontmatter.wordCount }}</span>
      </span>

      <span
        v-if="frontmatter.readingTime"
        class="reading-time inline-flex-center"
        :title="t('statistics.time')"
      >
        <span m="x-2">-</span>
        <div i-ri-timer-line />
        <time m="l-1">{{ frontmatter.readingTime }}m</time>
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
