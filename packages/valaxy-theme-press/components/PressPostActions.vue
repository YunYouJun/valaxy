<script lang="ts" setup>
import { useCopyMarkdown } from 'valaxy'
import { useI18n } from 'vue-i18n'

const { copy, copied, loading, available, mdUrl } = useCopyMarkdown()
const { t } = useI18n()
</script>

<template>
  <div v-if="available" class="press-post-actions">
    <button
      class="press-post-action-btn"
      :aria-label="t('post.copy_markdown', 'Copy Markdown')"
      :disabled="loading"
      @click="copy"
    >
      <div v-if="copied" i-ri-check-line class="text-green-500" />
      <div v-else i-ri-file-copy-line />
    </button>

    <a
      class="press-post-action-btn"
      :href="mdUrl"
      target="_blank"
      :aria-label="t('post.view_as_markdown', 'View as Markdown')"
    >
      <div i-ri-file-text-line />
    </a>
  </div>
</template>

<style>
.press-post-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.press-post-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--va-c-text-3);
  padding: 6px;
  border-radius: 4px;
  transition: color 0.2s, background 0.2s;
  font-size: 16px;
  text-decoration: none;
}

.press-post-action-btn:hover {
  color: var(--va-c-primary);
  background: var(--va-c-bg-soft);
}

.press-post-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
