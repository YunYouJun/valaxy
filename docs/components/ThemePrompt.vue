<script setup lang="ts">
import type { ThemePromptOptions } from '../data/theme-prompt'
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { getThemePreset, themePresets } from '../data/theme-presets'
import { createThemeBrief, createThemePrompt, normalizeThemeName } from '../data/theme-prompt'
import ThemePromptOutput from './theme-prompt/ThemePromptOutput.vue'
import ThemePromptPresets from './theme-prompt/ThemePromptPresets.vue'
import DocsInput from './ui/DocsInput.vue'
import DocsSelect from './ui/DocsSelect.vue'

const { t, locale } = useI18n()
const name = shallowRef('')
const visualDirection = shallowRef('')
const features = shallowRef('')
const workspace = shallowRef<'starter' | 'existing'>('starter')
const designSystem = shallowRef<'custom' | 'ak-ui'>('custom')
const mode = shallowRef<'skill' | 'standalone'>('skill')
const promptLocale = computed(() => locale.value === 'zh-CN' ? 'zh' : 'en')
const nameError = computed(() => name.value.trim() && !normalizeThemeName(name.value) ? t('themePrompt.invalidName') : '')
const ready = computed(() => Boolean(normalizeThemeName(name.value) && visualDirection.value.trim() && features.value.trim()))
const options = computed<ThemePromptOptions>(() => ({ name: name.value, visualDirection: visualDirection.value, features: features.value, workspace: workspace.value, designSystem: designSystem.value }))
const currentPrompt = computed(() => (mode.value === 'skill' ? createThemeBrief : createThemePrompt)(promptLocale.value, options.value))
const workspaceOptions = computed(() => [
  { value: 'starter' as const, label: t('themePrompt.newWorkspace') },
  { value: 'existing' as const, label: t('themePrompt.existingWorkspace') },
])
const designOptions = computed(() => [
  { value: 'custom' as const, label: t('themePrompt.customDesign') },
  { value: 'ak-ui' as const, label: 'AK UI' },
])
const selectedPreset = computed(() => (Object.keys(themePresets) as (keyof typeof themePresets)[]).find((id) => {
  const preset = getThemePreset(id, promptLocale.value)
  return visualDirection.value === preset.visualDirection && features.value === preset.features && designSystem.value === preset.designSystem
}))

function applyPreset(id: keyof typeof themePresets) {
  const preset = getThemePreset(id, promptLocale.value)
  name.value = preset.name
  visualDirection.value = preset.visualDirection
  features.value = preset.features
  designSystem.value = preset.designSystem || 'custom'
}
</script>

<template>
  <section class="theme-prompt" :aria-label="t('themePrompt.title')">
    <header class="theme-prompt-header">
      <div>
        <span class="theme-prompt-eyebrow">VALAXY / THEME STUDIO</span>
        <h3>{{ t('themePrompt.title') }}</h3>
        <p>{{ t('themePrompt.subtitle') }}</p>
      </div>
      <span class="theme-prompt-orbit" aria-hidden="true"><span i-ri-quill-pen-line /></span>
    </header>
    <div class="theme-prompt-body">
      <ThemePromptPresets :locale="promptLocale" :selected="selectedPreset" @select="applyPreset" />
      <div class="theme-prompt-fields">
        <DocsInput v-model="name" class="theme-field-wide" :label="t('themePrompt.name')" prefix="valaxy-theme-" :placeholder="t('themePrompt.namePlaceholder')" :error="nameError" :hint="t('themePrompt.nameHint')" />
        <DocsSelect v-model="workspace" :label="t('themePrompt.workspace')" :options="workspaceOptions" />
        <DocsSelect v-model="designSystem" :label="t('themePrompt.designSystem')" :options="designOptions" />
        <DocsInput v-model="visualDirection" class="theme-field-wide" :label="t('themePrompt.visualDirection')" :placeholder="t('themePrompt.visualDirectionPlaceholder')" multiline :rows="2" />
        <DocsInput v-model="features" class="theme-field-wide" :label="t('themePrompt.features')" :placeholder="t('themePrompt.featuresPlaceholder')" multiline :rows="2" />
      </div>
    </div>
    <ThemePromptOutput v-model="mode" :prompt="currentPrompt" :ready="ready" />
  </section>
</template>

<style scoped>
.theme-prompt {
  margin: 28px 0;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 16px;
  overflow: hidden;
  background: var(--pr-c-bg);
  color: var(--pr-c-text-1);
  box-shadow: 0 8px 32px rgb(40 50 90 / 0.04);
  font-family: var(--pr-font-body, var(--va-font-sans));
}

.theme-prompt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 30px 28px 26px;
  border-bottom: 1px solid var(--pr-c-divider-light);
  background: radial-gradient(ellipse at 100% 0, var(--pr-c-brand-soft, color-mix(in srgb, var(--va-c-primary) 8%, transparent)), transparent 65%);
}

.theme-prompt-eyebrow {
  color: var(--pr-c-brand, var(--va-c-primary));
  font: 10px/1.5 var(--pr-font-mono, var(--va-font-mono));
  letter-spacing: 0.12em;
}

.theme-prompt-header h3 {
  margin: 12px 0 8px;
  padding: 0;
  border: 0;
  font-family: var(--pr-font-display, var(--va-font-sans));
  font-size: clamp(21px, 2.5vw, 27px);
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -0.035em;
}

.theme-prompt-header p {
  margin: 0;
  color: var(--pr-c-text-2);
  font-size: 13px;
  line-height: 1.8;
}

.theme-prompt-orbit {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  width: 60px;
  height: 60px;
  border: 1px solid var(--pr-c-orbit-line, color-mix(in srgb, var(--va-c-primary) 25%, transparent));
  border-radius: 50%;
  color: var(--pr-c-brand, var(--va-c-primary));
  background: var(--pr-c-brand-soft, color-mix(in srgb, var(--va-c-primary) 8%, transparent));
  font-size: 24px;
}

.theme-prompt-orbit::after {
  content: "";
  position: absolute;
  width: 78px;
  height: 32px;
  border: 1px solid var(--pr-c-orbit-line, color-mix(in srgb, var(--va-c-primary) 25%, transparent));
  border-radius: 50%;
  transform: rotate(-35deg);
}

.theme-prompt-body {
  padding: 24px 28px 28px;
}

.theme-prompt-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 16px;
  margin-top: 24px;
}

.theme-field-wide {
  grid-column: 1 / -1;
}

@media (width <= 639px) {
  .theme-prompt-header, .theme-prompt-body {
  padding: 22px 20px;
}

  .theme-prompt-orbit {
  display: none;
}

  .theme-prompt-fields {
  grid-template-columns: 1fr;
}
}
</style>
