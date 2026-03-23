<script setup lang="ts">
import type { ExcerptType } from 'valaxy'

const excerptType = defineModel<ExcerptType>('excerptType', {
  default: 'ai',
})

const options: { icon: string, label: string, value: ExcerptType }[] = [
  { icon: 'i-ri-robot-line', label: 'ai', value: 'ai' },
  { icon: 'i-vscode-icons:file-type-html', label: 'html', value: 'html' },
  { icon: 'i-vscode-icons:file-type-markdown', label: 'md', value: 'md' },
  { icon: 'i-vscode-icons:file-type-text', label: 'text', value: 'text' },
]
</script>

<template>
  <div class="inline-flex gap-1 items-center justify-center">
    <VDToggleGroup v-model="excerptType" :options="options" />
  </div>
</template>
