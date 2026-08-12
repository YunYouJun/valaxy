<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  prompt: string
  copyLabel: string
  copiedLabel: string
}>()

const { copy, copied } = useClipboard()

function handleCopy() {
  copy(props.prompt)
}
</script>

<template>
  <div class="prompt-box" relative>
    <pre
      class="prompt-content"
      p-4 rounded-lg text-sm leading-relaxed
      overflow-x-auto
      border="~ solid $va-c-divider"
      bg="$va-c-bg-soft"
    >{{ prompt }}</pre>

    <button
      type="button"
      class="copy-btn"
      absolute top-2 right-2
      px-3 py-1.5 rounded-md text-xs cursor-pointer
      flex="~ items-center gap-1"
      border="~ solid $va-c-divider"
      bg="$va-c-bg"
      transition="colors duration-200"
      hover="border-$va-c-primary color-$va-c-primary"
      :aria-label="copied ? copiedLabel : copyLabel"
      @click="handleCopy"
    >
      <span v-if="copied" aria-hidden="true" i-ri-check-line />
      <span v-else aria-hidden="true" i-ri-file-copy-line />
      <span aria-live="polite" aria-atomic="true">
        {{ copied ? copiedLabel : copyLabel }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.prompt-content {
  color: var(--va-c-text);
  overflow-wrap: anywhere;
  padding-top: 3.25rem;
  white-space: pre-wrap;
  margin: 0;
}

.copy-btn {
  color: var(--va-c-text);
}

.copy-btn:hover {
  border-color: var(--va-c-primary);
  color: var(--va-c-text);
}

.copy-btn:focus-visible {
  outline: 2px solid var(--va-c-primary);
  outline-offset: 2px;
}
</style>
