<script setup lang="ts">
import type { ThemePromptLocale } from '../../data/theme-prompt'
import { useI18n } from 'vue-i18n'
import { themePresets } from '../../data/theme-presets'

defineProps<{ locale: ThemePromptLocale, selected?: keyof typeof themePresets }>()
const emit = defineEmits<{ select: [id: keyof typeof themePresets] }>()
const { t } = useI18n()
</script>

<template>
  <div class="theme-presets" role="group" :aria-label="t('themePrompt.presets')">
    <p class="theme-presets-label">
      {{ t('themePrompt.presets') }}
    </p>
    <div class="theme-presets-options">
      <button
        v-for="(preset, id) in themePresets" :key="id" type="button" class="theme-preset"
        :aria-pressed="selected === id" @click="emit('select', id)"
      >
        <span class="preset-art" :class="id" aria-hidden="true"><span /><span /><span /></span>
        <span class="preset-copy">
          <span class="preset-title">{{ preset[locale].label }}</span>
          <span class="preset-description">{{ t(`themePrompt.${id}Description`) }}</span>
        </span>
        <span class="preset-action" :class="selected === id ? 'i-ri-check-line' : 'i-ri-arrow-right-up-line'" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.theme-presets-label {
  margin: 0 0 10px;
  color: var(--pr-c-text-2);
  font-size: 12px;
}

.theme-presets-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.theme-preset {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 10px;
  color: var(--pr-c-text-1);
  background: var(--pr-c-bg);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 160ms, background-color 160ms;
}

.theme-preset:hover, .theme-preset[aria-pressed="true"] {
  border-color: var(--pr-c-brand, var(--va-c-primary));
  background: var(--pr-c-brand-soft, color-mix(in srgb, var(--va-c-primary) 8%, transparent));
}

.theme-preset:focus-visible {
  outline: 2px solid var(--pr-c-brand, var(--va-c-primary));
  outline-offset: 3px;
}

.preset-art {
  display: flex;
  flex: none;
  width: 38px;
  height: 44px;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  border: 1px solid rgb(100 110 130 / 0.18);
  border-radius: 4px;
  background: #f8f4ed;
  color: #706459;
}

.preset-art span {
  height: 2px;
  width: 100%;
  background: currentcolor;
  opacity: 0.4;
}

.preset-art span:first-child {
  height: 5px;
  width: 65%;
  opacity: 1;
}

.preset-art span:last-child {
  width: 80%;
}

.preset-art.arknights {
  background: #242a31;
  color: #e5e9ef;
  border-radius: 0;
}

.preset-art.arknights span:first-child {
  background: #f0cd48;
}

.preset-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.preset-title {
  font-size: 13px;
  font-weight: 600;
}

.preset-description {
  color: var(--pr-c-text-2);
  font-size: 11px;
  line-height: 1.6;
}

.preset-action {
  color: var(--pr-c-brand, var(--va-c-primary));
  flex: none;
  margin-left: auto;
}

@media (width <= 639px) {
  .theme-presets-options {
  grid-template-columns: 1fr;
}
}

@media (prefers-reduced-motion: reduce) {
  .theme-preset {
  transition: none;
}
}
</style>
