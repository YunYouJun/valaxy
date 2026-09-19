<script lang="ts" setup>
import FeedbackEmptyState from '@antfu/design/components/Feedback/FeedbackEmptyState.vue'
import { shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { clientPageData } from '../stores/app'

const { t } = useI18n()
const tab = shallowRef<'frontmatter' | 'content'>('frontmatter')
</script>

<template>
  <div p="2">
    <template v-if="clientPageData?.frontmatter">
      <nav class="flex gap-2 p-2" :aria-label="t('content.editor')">
        <VDButton :variant="tab === 'frontmatter' ? 'default' : 'ghost'" @click="tab = 'frontmatter'">
          Frontmatter
        </VDButton>
        <VDButton :variant="tab === 'content' ? 'default' : 'ghost'" @click="tab = 'content'">
          {{ t('content.title') }}
        </VDButton>
      </nav>
      <VDPageFrontmatter v-if="tab === 'frontmatter'" :key="clientPageData.filePath" :file-path="clientPageData.filePath" :frontmatter="clientPageData.frontmatter" />
      <VDPostContent v-else :key="`content:${clientPageData.filePath}`" :file-path="clientPageData.filePath" />
    </template>
    <FeedbackEmptyState v-else :title="t('posts.empty_hint')" icon="i-ph:article" class="h-full justify-center">
      <template #hint>
        {{ t('posts.empty_hint_sub') }}
      </template>
    </FeedbackEmptyState>
  </div>
</template>
