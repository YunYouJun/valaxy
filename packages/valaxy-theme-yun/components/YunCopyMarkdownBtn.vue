<script lang="ts" setup>
import { useCopyMarkdown } from 'valaxy'
import { useI18n } from 'vue-i18n'

const { copy, copied, loading } = useCopyMarkdown()
const { t } = useI18n()
</script>

<template>
  <button
    class="copy-markdown-btn inline-flex-center"
    :title="copied ? t('post.copied_markdown', 'Copied!') : t('post.copy_markdown', 'Copy Markdown')"
    :disabled="loading"
    @click="copy"
  >
    <div v-if="copied" i-ri-check-line text="green-500" />
    <div v-else-if="loading" i-ri-loader-4-line class="animate-spin" />
    <div v-else i-ri-file-copy-line />
  </button>
</template>

<style>
.copy-markdown-btn {
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--va-c-text-2);
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s, opacity 0.2s;
  opacity: 0.6;
  font-size: 1rem;
}

.copy-markdown-btn:hover {
  color: var(--va-c-primary);
  opacity: 1;
}

.copy-markdown-btn:disabled {
  cursor: wait;
}
</style>
