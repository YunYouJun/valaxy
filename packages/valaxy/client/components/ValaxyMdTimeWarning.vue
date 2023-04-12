<script lang="ts" setup>
import { computed } from 'vue'
import type { Post } from 'valaxy'

import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  frontmatter: Post
}>()

const { t } = useI18n()

/**
 * when the post is updated more than 30 days ago, show a warning
 * default 30 days, you can set `time_warning` in frontmatter to change it
 */
const time_warning = computed(() => {
  const diff = dayjs().valueOf() - dayjs(props.frontmatter.updated).valueOf()
  if (typeof props.frontmatter.time_warning === 'number')
    return diff > props.frontmatter.time_warning
  else
    return props.frontmatter.time_warning || diff > 30 * 24 * 60 * 60 * 1000
})
</script>

<template>
  <blockquote v-if="time_warning" op="80">
    {{ t('post.time_warning', { ago: dayjs(frontmatter.updated).fromNow() }) }}
  </blockquote>
</template>
