<script lang="ts" setup>
import { computed } from 'vue'
import type { Post } from 'valaxy'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { useI18n } from 'vue-i18n'

const props = defineProps<{
  frontmatter: Post
}>()

dayjs.extend(relativeTime)

const { t } = useI18n()

/**
 * when the post is updated more than 180 days ago, show a warning
 * default 180 days, you can set `time_warning` in frontmatter to change it
 */
const time_warning = computed(() => {
  const diff = dayjs().valueOf() - dayjs(props.frontmatter.updated || props.frontmatter.date).valueOf()
  if (typeof props.frontmatter.time_warning === 'number')
    return diff > props.frontmatter.time_warning
  else
    return props.frontmatter.time_warning
})
</script>

<template>
  {{ frontmatter }}
  <blockquote v-if="time_warning" op="80">
    {{ t('post.time_warning', { ago: dayjs(frontmatter.updated).fromNow() }) }}
  </blockquote>
</template>
