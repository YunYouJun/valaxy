<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { computed, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ prompt: string, ready: boolean }>()
const mode = defineModel<'skill' | 'standalone'>({ required: true })
const { t } = useI18n()
const { copy, copied: clipboardCopied } = useClipboard({ legacy: true })
const lastCopiedPrompt = shallowRef('')
const copied = computed(() => clipboardCopied.value && lastCopiedPrompt.value === props.prompt)
const copyFailed = shallowRef(false)
const copyLabel = computed(() => t(copied.value ? 'themePrompt.copied' : mode.value === 'skill' ? 'themePrompt.copyBrief' : 'themePrompt.copy'))

watch(() => props.prompt, () => {
  copyFailed.value = false
})

async function copyPrompt(prompt: string) {
  copyFailed.value = false
  try {
    await copy(prompt)
    lastCopiedPrompt.value = prompt
  }
  catch {
    copyFailed.value = true
  }
}
</script>

<template>
  <div class="theme-output">
    <TabsRoot v-model="mode">
      <div class="output-heading">
        <span class="output-caption">{{ t('themePrompt.output') }}</span>
        <TabsList class="output-tabs" :aria-label="t('themePrompt.outputMode')">
          <TabsTrigger value="skill" class="output-tab">
            {{ t('themePrompt.skillMode') }} <span class="recommended">{{ t('themePrompt.recommended') }}</span>
          </TabsTrigger>
          <TabsTrigger value="standalone" class="output-tab">
            {{ t('themePrompt.standaloneMode') }}
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent v-for="value in (['skill', 'standalone'] as const)" :key="value" :value="value" class="output-panel">
        <p class="output-description">
          {{ t(value === 'skill' ? 'themePrompt.skillHelp' : 'themePrompt.standaloneHelp') }}
          <a v-if="value === 'skill'" href="#theme-skill">{{ t('themePrompt.installSkill') }} <span aria-hidden="true">↗</span></a>
        </p>
        <pre v-if="ready" class="output-preview" tabindex="0" :aria-label="t('themePrompt.preview')">{{ prompt }}</pre>
        <div v-else class="output-empty">
          <span i-ri-quill-pen-line aria-hidden="true" />
          <span>{{ t('themePrompt.empty') }}</span>
        </div>
      </TabsContent>
    </TabsRoot>
    <div class="output-footer">
      <span class="output-status" role="status">{{ copyFailed ? t('themePrompt.copyFailed') : t(ready ? 'themePrompt.ready' : 'themePrompt.required') }}</span>
      <button type="button" class="output-copy" :disabled="!ready" :aria-label="copyLabel" @click="copyPrompt(prompt)">
        <span :class="copied ? 'i-ri-check-line' : 'i-ri-file-copy-line'" aria-hidden="true" />
        <span aria-live="polite">{{ copyLabel }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.theme-output {
  border-top: 1px solid var(--pr-c-divider-light);
  padding: 24px 28px;
  background: var(--pr-c-surface, var(--va-c-bg-soft));
}

.output-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
}

.output-caption {
  font-size: 13px;
  font-weight: 600;
  color: var(--pr-c-text-1);
}

.output-tabs {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 9px;
}

.output-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--pr-c-text-2);
  font: 12px/1.5 var(--pr-font-body, var(--va-font-sans));
  cursor: pointer;
}

.output-tab[data-state="active"] {
  background: var(--pr-c-bg);
  color: var(--pr-c-brand, var(--va-c-primary));
  box-shadow: 0 1px 4px rgb(20 28 60 / 0.08);
}

.recommended {
  font-size: 9px;
  font-weight: 600;
}

.output-description {
  margin: 16px 0;
  font-size: 12px;
  line-height: 1.8;
  color: var(--pr-c-text-2);
}

.output-description a {
  color: var(--pr-c-brand, var(--va-c-primary));
  margin-left: 4px;
  text-decoration: none;
  white-space: nowrap;
}

.output-description a:hover {
  text-decoration: underline;
}

.output-panel:focus-visible, .output-tab:focus-visible, .output-preview:focus-visible, .output-description a:focus-visible, .output-copy:focus-visible {
  outline: 2px solid var(--pr-c-brand, var(--va-c-primary));
  outline-offset: 3px;
}

.output-preview {
  max-height: 300px;
  overflow: auto;
  padding: 20px;
  margin: 0;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 8px;
  background: var(--pr-c-bg);
  color: var(--pr-c-text-1);
  font: 12px/1.85 var(--pr-font-mono, var(--va-font-mono));
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  scrollbar-width: thin;
}

.output-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 104px;
  border: 1px dashed var(--pr-c-divider-light);
  border-radius: 8px;
  padding: 20px;
  color: var(--pr-c-text-2);
  font-size: 13px;
}

.output-empty > :first-child {
  flex: none;
  color: var(--pr-c-brand, var(--va-c-primary));
  font-size: 20px;
}

.output-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
}

.output-status {
  max-width: 30em;
  color: var(--pr-c-text-2);
  font-size: 11px;
  line-height: 1.7;
}

.output-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  gap: 8px;
  min-height: 44px;
  padding: 10px 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: var(--pr-button-brand-bg, linear-gradient(120deg, #3964ec, #7547d9));
  color: white;
  font: 600 13px/1.5 var(--pr-font-body, var(--va-font-sans));
  cursor: pointer;
  box-shadow: 0 3px 8px rgb(98 68 201 / 0.15);
}

.output-copy:hover:enabled {
  filter: brightness(1.1);
}

.output-copy:disabled {
  background: var(--pr-c-divider-light);
  color: var(--pr-c-text-2);
  cursor: not-allowed;
  box-shadow: none;
}

@media (width <= 639px) {
  .theme-output {
  padding: 20px;
}

  .output-heading {
  align-items: start;
  flex-direction: column;
}

  .output-footer {
  align-items: stretch;
  flex-direction: column;
}

  .output-preview {
  padding: 14px;
}
}
</style>
