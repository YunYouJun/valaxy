<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { clientPageData } from '../stores/app'

const { t } = useI18n()
</script>

<template>
  <div p="2">
    <VDPageFrontmatter v-if="clientPageData?.frontmatter" :frontmatter="clientPageData?.frontmatter" />
    <div v-else class="flex items-center justify-center h-full op-40 text-sm">
      <div class="flex flex-col items-center gap-3">
        <div class="i-ri:file-text-line text-5xl" />
        <span class="font-medium">{{ t('posts.empty_hint') }}</span>
        <span class="text-xs op-60">{{ t('posts.empty_hint_sub') }}</span>
      </div>
    </div>
  </div>
</template>
