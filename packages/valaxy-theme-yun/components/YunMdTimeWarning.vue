<script lang="ts" setup>
import { dayjs, toTimestamp, useFrontmatter, useSiteConfig } from 'valaxy'

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const fm = useFrontmatter()
const siteConfig = useSiteConfig()
const { t, locale } = useI18n()

const updated = computed(() => {
  const raw = fm.value.updated || fm.value.date
  return dayjs(raw === undefined ? undefined : toTimestamp(raw, siteConfig.value.timezone)).locale(locale.value)
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
  gap: 0.5rem;
  margin: 1.25rem 0 1.5rem;
  padding: 0.625rem 0.9rem;
  border: 1px solid color-mix(in srgb, var(--va-c-yellow-1) 18%, var(--yun-surface-line));
  border-radius: var(--va-card-border-radius, 0.5rem);
  background-color: color-mix(in srgb, var(--va-c-yellow-soft) 65%, transparent);
  color: var(--va-c-text-2);
  font-size: 0.875rem;
  line-height: 1.6;
}

.yun-time-warning-icon {
  flex-shrink: 0;
  margin-top: 0.14rem;
  font-size: 0.9375rem;
  color: var(--va-c-yellow-1);
}

html.dark .yun-time-warning {
  border-color: color-mix(in srgb, var(--va-c-yellow-1) 20%, var(--yun-surface-line));
  background-color: color-mix(in srgb, var(--va-c-yellow-1) 8%, var(--va-c-bg-soft));
}
</style>
