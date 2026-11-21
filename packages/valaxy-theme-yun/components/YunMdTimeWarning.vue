<script lang="ts" setup>
import { dayjs, useFrontmatter } from 'valaxy'

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const fm = useFrontmatter()
const { t, locale } = useI18n()

const updated = computed(() => {
  return dayjs(fm.value.updated || fm.value.date).locale(locale.value)
})

const ago = computed(() => updated.value.fromNow())

/**
 * when the post is updated more than 180 days ago, show a warning
 * default 180 days, you can set `time_warning` in frontmatter to change it
 */
const time_warning = computed(() => {
  const diff = dayjs().valueOf() - updated.value.valueOf()
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
  <div v-if="time_warning" class="yun-time-warning" role="note">
    <span class="yun-time-warning-icon i-ri-time-line" aria-hidden="true" />
    <span>{{ t('post.time_warning', { ago }) }}</span>
  </div>
</template>

<style lang="scss">
.yun-time-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  margin: 1rem 0 1.25rem;
  padding: 0.75rem 1rem;
  border: 1px solid color-mix(in srgb, var(--va-c-yellow-1) 28%, var(--yun-surface-line));
  border-radius: var(--va-card-border-radius, 0.5rem);
  background-color: var(--va-c-yellow-soft);
  color: var(--va-c-text-1);
  font-size: 0.875rem;
  line-height: 1.6;
}

.yun-time-warning-icon {
  flex-shrink: 0;
  margin-top: 0.15rem;
  font-size: 1.1rem;
  color: var(--va-c-yellow-1);
}
</style>
