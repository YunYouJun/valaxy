<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useAppStore, useSiteConfig } from 'valaxy'
import { useI18n } from 'vue-i18n'

// @TODO: add edit by vscode directly when dev

defineProps<{
  // FrontMatter
  frontmatter: Post
}>()

const app = useAppStore()
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
    v-if="frontmatter"
    class="post-meta gap-4"
    flex="~ center"
    text="sm"
    :class="{
      'flex-col gap-2!': app.isMobile || frontmatter.updated,
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
    </div>
  </div>
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
