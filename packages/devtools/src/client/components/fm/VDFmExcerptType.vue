<script setup lang="ts">
import type { ExcerptType } from 'valaxy'

defineProps<{
  excerptType: ExcerptType
}>()
</script>

<template>
  <div class="inline-flex gap-1 items-center justify-center">
    <div v-if="excerptType === 'ai'" class="i-ri-robot-line" />
    <div v-if="excerptType === 'html'" class="i-vscode-icons:file-type-html" />
    <div v-if="excerptType === 'md'" class="i-vscode-icons:file-type-markdown" />
    <div v-if="excerptType === 'txt'" class="i-vscode-icons:file-type-text" />
    <div>
      {{ excerptType }}
    </div>
  </div>
</template>
