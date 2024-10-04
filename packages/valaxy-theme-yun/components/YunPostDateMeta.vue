<script lang="ts" setup>
import type { Post } from 'valaxy'
import { formatDate } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { formatTimestamp } from '../utils'

defineProps<{
  // FrontMatter
  frontmatter: Post
}>()

const { t } = useI18n()
</script>

<template>
  <div v-if="frontmatter.date" class="post-time flex items-center gap-4">
    <span class="posted-time inline-flex-center gap-1" :title="t('post.posted') + formatTimestamp(frontmatter.date)">
      <div class="inline-block" i-ri-calendar-line />
      <time class="op-80">{{ formatDate(frontmatter.date) }}</time>
    </span>

    <span
      v-if="frontmatter.updated && frontmatter.updated !== frontmatter.date"
      class="edited-time inline-flex-center gap-1" :title="t('post.edited') + formatTimestamp(frontmatter.updated)"
    >
      <div i-ri-calendar-2-line />
      <time class="op-80">{{ formatDate(frontmatter.updated) }}</time>
    </span>
  </div>
</template>
