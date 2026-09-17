<script lang="ts" setup>
import FeedbackEmptyState from '@antfu/design/components/Feedback/FeedbackEmptyState.vue'
import { useI18n } from 'vue-i18n'
import { clientPageData } from '../stores/app'

const { t } = useI18n()
</script>

<template>
  <div p="2">
    <VDPageFrontmatter v-if="clientPageData?.frontmatter" :key="clientPageData.filePath" :file-path="clientPageData.filePath" :frontmatter="clientPageData.frontmatter" />
    <FeedbackEmptyState v-else :title="t('posts.empty_hint')" icon="i-ph:article" class="h-full justify-center">
      <template #hint>
        {{ t('posts.empty_hint_sub') }}
      </template>
    </FeedbackEmptyState>
  </div>
</template>
