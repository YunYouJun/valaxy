<template>
  <div v-if="frontmatter" class="post-meta justify-center" flex="~">
    <div v-if="frontmatter.date" class="post-time flex items-center">
      <div class="inline-block" i-ri-calendar-line />
      <span m="1">{{ t('post.posted') }}</span>
      <time>{{ formatDate(frontmatter.date) }}</time>

      <template v-if="frontmatter.updated && frontmatter.updated !== frontmatter.date">
        <span m="x-2">-</span>
        <div i-ri-calendar-2-line />
        <span m="1">{{ t('post.edited') }}</span>
        <time>{{ formatDate(frontmatter.updated) }}</time>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { formatDate } from '~/composables'

const { t } = useI18n()

defineProps<{
  frontmatter: Post
}>()
</script>

<style lang="scss">
</style>
