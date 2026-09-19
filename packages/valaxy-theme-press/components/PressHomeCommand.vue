<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  /** Quick-start command displayed and copied verbatim. */
  command: string
}>()

const { t } = useI18n()
const { copy, copied, isSupported } = useClipboard({ source: () => props.command, legacy: true })
const failed = shallowRef(false)

async function copyCommand() {
  failed.value = false
  try {
    await copy()
  }
  catch {
    failed.value = true
  }
}
</script>

<template>
  <div class="press-home-command">
    <span class="command-prompt" aria-hidden="true">$</span>
    <code class="command-text">{{ command }}</code>
    <button
      v-if="isSupported"
      type="button"
      class="command-copy"
      :aria-label="t('home.copyCommand')"
      @click="copyCommand"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path v-if="copied" d="m5 12 4 4L19 6" />
        <template v-else>
          <rect x="8" y="8" width="12" height="13" rx="2" />
          <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
        </template>
      </svg>
    </button>
    <span class="command-status" role="status">{{ failed ? t('home.copyFailed') : copied ? t('home.copied') : '' }}</span>
  </div>
</template>

<style scoped>
.press-home-command {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 380px;
  margin-top: 36px;
  padding: 12px 14px;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 8px;
  background: var(--pr-c-surface);
  font-size: 13px;
}

.command-prompt,
.command-text {
  font-family: var(--pr-font-mono);
}

.command-prompt {
  color: var(--pr-c-text-2);
}

.command-text {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--pr-c-brand);
}

.command-copy {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  margin-left: auto;
  border-radius: 4px;
  color: var(--pr-c-text-2);
  cursor: pointer;
}

.command-copy:hover {
  color: var(--pr-c-brand);
  background: var(--pr-c-brand-soft);
}

.command-status {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  color: var(--pr-c-text-2);
  font-size: 12px;
}
</style>
