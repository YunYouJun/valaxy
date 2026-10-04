<script setup lang="ts">
import { PopoverArrow, PopoverClose, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { onBeforeUnmount, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const open = shallowRef(false)
// Hover previews must neither steal focus nor return it when dismissed.
const interactive = shallowRef(false)
const contentFocused = shallowRef(false)
let closeTimer: ReturnType<typeof setTimeout> | undefined

function cancelClose() {
  clearTimeout(closeTimer)
}

function preview(event: PointerEvent) {
  if (event.pointerType === 'touch')
    return
  cancelClose()
  if (!open.value) {
    interactive.value = false
    open.value = true
  }
}

function scheduleClose() {
  cancelClose()
  closeTimer = setTimeout(() => {
    if (!interactive.value && !contentFocused.value)
      open.value = false
  }, 200)
}

function updateOpen(value: boolean) {
  cancelClose()
  if (value)
    interactive.value = true
  open.value = value
}

function followFootnote() {
  cancelClose()
  interactive.value = false
  open.value = false
}

function autoFocus(event: Event) {
  if (!interactive.value)
    event.preventDefault()
}

onBeforeUnmount(cancelClose)
</script>

<template>
  <PopoverRoot :open="open" :modal="false" @update:open="updateOpen">
    <span class="va-footnote">
      <span @pointerenter="preview" @pointerleave="scheduleClose" @click="followFootnote">
        <slot />
      </span>
      <PopoverTrigger
        class="va-footnote-preview"
        :aria-label="t('post.footnote_preview')"
        @pointerenter="cancelClose"
        @pointerleave="scheduleClose"
      >
        <span aria-hidden="true">⋯</span>
      </PopoverTrigger>
      <PopoverPortal to="#valaxy-teleports">
        <PopoverContent
          class="va-footnote-popover markdown-body"
          side="top"
          :side-offset="8"
          :collision-padding="12"
          @open-auto-focus="autoFocus"
          @close-auto-focus="autoFocus"
          @pointerenter="cancelClose"
          @pointerleave="scheduleClose"
          @focusin="contentFocused = true"
          @focusout="contentFocused = false"
        >
          <PopoverClose class="va-footnote-close" :aria-label="t('post.footnote_close')">
            <span aria-hidden="true">×</span>
          </PopoverClose>
          <slot name="popper" />
          <PopoverArrow class="va-footnote-arrow" />
        </PopoverContent>
      </PopoverPortal>
    </span>
  </PopoverRoot>
</template>

<style>
.va-footnote {
  display: inline-block;
}

.va-footnote-preview {
  vertical-align: super;
  padding: 0 0.2em;
  color: var(--va-c-primary);
  font-size: 0.75em;
  line-height: 1;
  cursor: pointer;
}

.va-footnote-popover {
  box-sizing: border-box;
  z-index: 100;
  width: max-content;
  max-width: min(24rem, var(--reka-popover-content-available-width));
  max-height: var(--reka-popover-content-available-height);
  overflow: auto;
  padding: 0.75rem 1rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 0.5rem;
  background: var(--va-c-bg);
  color: var(--va-c-text);
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.15);
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.va-footnote-popover > p:last-of-type {
  margin-bottom: 0;
}

.va-footnote-close {
  float: right;
  margin-inline-start: 0.5rem;
  padding: 0 0.25rem;
  cursor: pointer;
}

.va-footnote-preview:focus-visible,
.va-footnote-close:focus-visible {
  outline: 2px solid var(--va-c-primary);
  outline-offset: 2px;
}

.va-footnote-arrow {
  fill: var(--va-c-bg);
}
</style>
