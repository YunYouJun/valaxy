<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { createThemePrompt } from '../data/theme-prompt'

const { t, locale } = useI18n()

const name = shallowRef('')
const visualDirection = shallowRef('')
const features = shallowRef('')

const currentPrompt = computed(() => createThemePrompt(
  locale.value === 'zh-CN' ? 'zh' : 'en',
  {
    name: name.value,
    visualDirection: visualDirection.value,
    features: features.value,
  },
))
</script>

<template>
  <div class="theme-prompt" my-4>
    <div class="prompt-fields" grid="~ cols-1 md:cols-2 gap-3" mb-3>
      <label class="prompt-field">
        <span class="prompt-label">{{ t('themePrompt.name') }}</span>
        <span class="theme-name-input" flex="~ items-center">
          <span aria-hidden="true">valaxy-theme-</span>
          <input
            v-model="name"
            class="prompt-input"
            min-w-0 flex-1
            type="text"
            autocomplete="off"
            :placeholder="t('themePrompt.namePlaceholder')"
          >
        </span>
      </label>

      <label class="prompt-field">
        <span class="prompt-label">{{ t('themePrompt.visualDirection') }}</span>
        <input
          v-model="visualDirection"
          class="prompt-input"
          type="text"
          :placeholder="t('themePrompt.visualDirectionPlaceholder')"
        >
      </label>

      <label class="prompt-field" md:col-span-2>
        <span class="prompt-label">{{ t('themePrompt.features') }}</span>
        <textarea
          v-model="features"
          class="prompt-input prompt-textarea"
          rows="2"
          :placeholder="t('themePrompt.featuresPlaceholder')"
        />
      </label>
    </div>

    <PromptCopy
      :prompt="currentPrompt"
      :copy-label="t('themePrompt.copy')"
      :copied-label="t('themePrompt.copied')"
    />
  </div>
</template>

<style scoped>
.prompt-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.prompt-label {
  color: var(--va-c-text);
  font-size: 0.875rem;
  font-weight: 600;
}

.theme-name-input,
.prompt-input {
  border: 1px solid var(--va-c-divider);
  border-radius: 0.375rem;
  background: var(--va-c-bg);
  color: var(--va-c-text);
  font: inherit;
}

.theme-name-input {
  padding-left: 0.75rem;
  color: var(--va-c-text-light);
}

.theme-name-input .prompt-input {
  border: 0;
}

.prompt-input {
  padding: 0.625rem 0.75rem;
}

.prompt-input::placeholder {
  color: var(--va-c-text-light);
}

.prompt-input:focus-visible,
.theme-name-input:focus-within {
  outline: 2px solid var(--va-c-primary);
  outline-offset: 2px;
}

.theme-name-input .prompt-input:focus-visible {
  outline: 0;
}

.prompt-textarea {
  min-height: 4.5rem;
  resize: vertical;
}
</style>
