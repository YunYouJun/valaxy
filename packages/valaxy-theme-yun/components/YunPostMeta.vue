<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useSiteConfig } from 'valaxy'
import { useI18n } from 'vue-i18n'

defineProps<{
  // FrontMatter
  frontmatter: Post
}>()

const { t } = useI18n()

const siteConfig = useSiteConfig()
</script>

<template>
  <YunPostStatusIcons :frontmatter="frontmatter" />

  <div
    v-if="frontmatter"
    class="post-meta gap-4"
    flex="~ center"
    text="sm"
    :class="{
      'post-meta-col': frontmatter.updated,
    }"
  >
    <YunPostDateMeta :frontmatter="frontmatter" />
    <slot />

    <div class="inline-flex-center gap-4">
      <div
        v-if="siteConfig.statistics.enable"
        class="inline-flex-center post-counter gap-4"
      >
        <span
          v-if="frontmatter.wordCount"
          class="word-count inline-flex-center gap-1" :title="t('statistics.word')"
        >
          <div class="inline-block" i-ri-file-word-line />
          <span class="op-80">{{ frontmatter.wordCount }}</span>
        </span>

        <span
          v-if="frontmatter.readingTime"
          class="reading-time inline-flex-center gap-1"
          :title="t('statistics.time')"
        >
          <div i-ri-timer-line />
          <time class="op-80">{{ frontmatter.readingTime }}m</time>
        </span>
      </div>

      <YunWalineMeta />

      <ValaxyOpenInEditor />
    </div>
  </div>
</template>

<style>
/* Use CSS media query for mobile layout instead of JS isMobile to avoid hydration mismatch */
@media (width <= 768px) {
  .post-meta {
    flex-direction: column;
    gap: 0.5rem !important;
  }
}

.post-meta-col {
  flex-direction: column;
  gap: 0.5rem !important;
}
</style>
