<script setup lang="ts">
import type { MermaidAddonOptions, MermaidOptions } from '../shared'
import { decode } from 'js-base64'
import { useAddonConfig, useAppStore, useLocale, useValaxyConfig } from 'valaxy'
import setupMermaid from 'virtual:valaxy-addon-mermaid/setup'
import { computed, useAttrs } from 'vue'
import MermaidViewer from '../client/MermaidViewer.vue'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  code: string
  scale?: number
  theme?: string
}>()
const attrs = useAttrs()
const app = useAppStore()
const valaxy = useValaxyConfig()
const { lang } = useLocale()
const addon = useAddonConfig<MermaidAddonOptions>('valaxy-addon-mermaid')
const options = computed(() => addon.value?.options || {})
function config(): MermaidOptions {
  const { class: _class, style: _style, ...diagramOptions } = attrs
  return {
    ...setupMermaid(),
    ...options.value.config,
    ...diagramOptions,
    ...(props.theme ? { theme: props.theme as MermaidOptions['theme'] } : {}),
  }
}
const source = computed(() => decode(props.code || ''))
</script>

<template>
  <MermaidViewer
    :source="source"
    :locale="lang"
    :dark="app.isDark"
    :config="config()"
    :class="[attrs.class, { 'diagram-theme-yun': valaxy.theme === 'yun' }]"
    :style="attrs.style"
    :scale="scale"
    :viewer="options.viewer"
    :appearance="options.appearance"
  />
</template>
