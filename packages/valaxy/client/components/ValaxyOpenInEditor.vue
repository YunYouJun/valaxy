<script lang="ts" setup>
import { useData } from '../composables'

const { page } = useData()

const isDev = import.meta.env.DEV

/**
 * Open the current page source file in editor (dev mode only)
 * Uses Vite's built-in `/__open-in-editor` endpoint
 */
function openInEditor() {
  const filePath = page.value?.filePath
  if (filePath) {
    fetch(`${window.location.origin}/__open-in-editor?file=${encodeURIComponent(filePath)}`)
      .catch((err) => {
        console.error('[valaxy] Failed to open in editor:', err)
      })
  }
}
</script>

<template>
  <button
    v-if="isDev"
    class="valaxy-open-in-editor"
    title="Open in Editor"
    @click="openInEditor"
  >
    <slot>
      <div i-ri-code-s-slash-line />
    </slot>
  </button>
</template>

<style>
.valaxy-open-in-editor {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.2s;
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

.valaxy-open-in-editor:hover {
  opacity: 1;
}
</style>
