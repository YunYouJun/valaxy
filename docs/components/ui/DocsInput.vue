<script setup lang="ts">
import { useTextareaAutosize } from '@vueuse/core'
import { Label } from 'reka-ui'
import { useId, useTemplateRef } from 'vue'

defineProps<{
  label: string
  placeholder?: string
  prefix?: string
  multiline?: boolean
  hint?: string
  error?: string
  rows?: number
}>()
const model = defineModel<string>({ required: true })
const id = useId()
const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
useTextareaAutosize({ element: textarea, input: model })
</script>

<template>
  <div class="docs-input">
    <Label :for="id" class="docs-input-label">{{ label }}</Label>
    <div class="docs-input-control" :class="{ 'is-invalid': !!error }">
      <span v-if="prefix" class="docs-input-prefix" aria-hidden="true">{{ prefix }}</span>
      <textarea
        v-if="multiline"
        :id="id"
        ref="textarea"
        v-model="model" :rows="rows || 3" :placeholder="placeholder"
        :aria-invalid="error ? true : undefined" :aria-describedby="error || hint ? `${id}-hint` : undefined"
      />
      <input
        v-else
        :id="id" v-model="model" type="text" :placeholder="placeholder" autocomplete="off" spellcheck="false"
        :aria-invalid="error ? true : undefined" :aria-describedby="error || hint ? `${id}-hint` : undefined"
      >
    </div>
    <span v-if="error || hint" :id="`${id}-hint`" class="docs-input-hint" :class="{ 'is-error': !!error }">{{ error || hint }}</span>
  </div>
</template>

<style scoped>
.docs-input {
  display: grid;
  align-content: start;
  gap: 8px;
  min-width: 0;
}

.docs-input-label {
  color: var(--pr-c-text-1);
  font-size: 13px;
  font-weight: 600;
}

.docs-input-control {
  display: flex;
  align-items: baseline;
  min-width: 0;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 8px;
  background: var(--pr-c-bg);
  transition: border-color 160ms, box-shadow 160ms;
}

.docs-input-control:hover {
  border-color: color-mix(in srgb, var(--pr-c-brand, var(--va-c-primary)) 45%, var(--pr-c-divider-light));
}

.docs-input-control:focus-within {
  border-color: var(--pr-c-brand, var(--va-c-primary));
  box-shadow: 0 0 0 3px var(--pr-c-brand-soft, color-mix(in srgb, var(--va-c-primary) 8%, transparent));
}

.docs-input-control.is-invalid {
  border-color: var(--va-c-danger, #bd3333);
}

.docs-input-prefix {
  padding-left: 13px;
  color: var(--pr-c-text-2);
  font: 12px var(--pr-font-mono, var(--va-font-mono));
  white-space: nowrap;
}

.docs-input input, .docs-input textarea {
  width: 100%;
  min-width: 0;
  min-height: 46px;
  border: 0;
  border-radius: inherit;
  padding: 11px 13px;
  background: transparent;
  color: var(--pr-c-text-1);
  font: 14px/1.75 var(--pr-font-body, var(--va-font-sans));
  outline: none;
}

.docs-input textarea {
  resize: vertical;
}

.docs-input input::placeholder, .docs-input textarea::placeholder {
  color: var(--pr-c-text-2);
  opacity: 0.75;
}

.docs-input-hint {
  color: var(--pr-c-text-2);
  font-size: 12px;
  line-height: 1.6;
}

.docs-input-hint.is-error {
  color: var(--va-c-danger, #bd3333);
}

@media (prefers-reduced-motion: reduce) {
  .docs-input-control { transition: none; }
}
</style>
