<script lang="ts" setup>
import { differenceInMilliseconds, formatDistanceToNow } from 'date-fns'
import { useFrontmatter } from 'valaxy'

import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const fm = useFrontmatter()
const { t, locale } = useI18n()

const updated = computed(() => fm.value.updated || fm.value.date || new Date())
const ago = ref('')

watch(locale, () => {
  const fromNow = formatDistanceToNow(updated.value, { addSuffix: true })
  ago.value = /^\d/.test(fromNow) ? ` ${fromNow}` : fromNow
}, { immediate: true })

/**
 * when the post is updated more than 180 days ago, show a warning
 * default 180 days, you can set `time_warning` in frontmatter to change it
 */
const time_warning = computed(() => {
  const diff = differenceInMilliseconds(new Date(), updated.value)
  /**
   * if `time_warning` is a number, compare the time difference
   * if `time_warning` is a boolean, show warning by flag
   */
  if (typeof fm.value.time_warning === 'number')
    return diff > fm.value.time_warning
  else
    return fm.value.time_warning
})
</script>

<template>
  <blockquote v-if="time_warning" class="yun-time-warning" op="80">
    {{ t('post.time_warning', { ago }) }}
  </blockquote>
</template>
