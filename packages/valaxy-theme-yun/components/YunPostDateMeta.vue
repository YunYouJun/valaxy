<script lang="ts" setup>
import type { Post } from 'valaxy'
import { toZonedDayjs } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  // FrontMatter
  frontmatter: Post
}>()

const { t } = useI18n()

function formatPostDate(date: NonNullable<Post['date']>) {
  const zonedDate = toZonedDayjs(date)
  return {
    label: zonedDate.format('YYYY-MM-DD'),
    timestamp: zonedDate.format('YYYY-MM-DD HH:mm:ss'),
  }
}

const posted = computed(() => {
  const { date } = props.frontmatter
  return date ? formatPostDate(date) : undefined
})
const edited = computed(() => {
  const { date, updated } = props.frontmatter
  return updated && updated !== date ? formatPostDate(updated) : undefined
})
</script>

<template>
  <div v-if="posted" class="post-time flex items-center gap-4">
    <span class="posted-time inline-flex-center gap-1" :title="t('post.posted') + posted.timestamp">
      <div class="inline-block" i-ri-calendar-line />
      <time class="op-80">{{ posted.label }}</time>
    </span>

    <span
      v-if="edited"
      class="edited-time inline-flex-center gap-1" :title="t('post.edited') + edited.timestamp"
    >
      <div i-ri-calendar-2-line />
      <time class="op-80">{{ edited.label }}</time>
    </span>
  </div>
</template>
