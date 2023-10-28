<script lang="ts" setup>
import { computed } from 'vue'
import { useFrontmatter } from 'valaxy'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { useI18n } from 'vue-i18n'

const fm = useFrontmatter()

dayjs.extend(relativeTime)

const { t } = useI18n()

/**
 * when the post is updated more than 180 days ago, show a warning
 * default 180 days, you can set `time_warning` in frontmatter to change it
 */
const time_warning = computed(() => {
  const diff = dayjs().valueOf() - dayjs(fm.value.updated || fm.value.date).valueOf()
  if (typeof fm.value.time_warning === 'number')
    return diff > fm.value.time_warning
  else
    return fm.value.time_warning
})
</script>

<template>
  <blockquote v-if="time_warning" class="yun-time-warning" op="80">
    {{ t('post.time_warning', { ago: dayjs(fm.updated).fromNow() }) }}
  </blockquote>
</template>
