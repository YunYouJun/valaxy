<script setup lang="ts">
import type { MenuItem } from 'valaxy'
import { onClickOutside } from '@vueuse/core'
import { onContentUpdated, useOutline } from 'valaxy'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePressAppStore } from '../stores'

defineProps<{
  headers: MenuItem[]
  navHeight?: number
}>()

const press = usePressAppStore()
const open = computed(() => press.activePanel === 'outline')
const dropdown = ref<HTMLElement>()
const items = ref<HTMLElement>()
const { handleClick } = useOutline()
const { t } = useI18n()

function close() {
  if (open.value)
    press.closePanel()
}

onClickOutside(dropdown, close)
onContentUpdated(close)
watch(open, (value) => {
  if (value)
    nextTick(() => items.value?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true }))
})

function onItemClick(event: MouseEvent) {
  handleClick(event)
  close()
}

function scrollToTop() {
  close()
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}
</script>

<template>
  <div ref="dropdown" class="press-local-outline">
    <button
      v-if="headers.length"
      type="button"
      class="outline-trigger"
      :aria-expanded="open"
      aria-controls="press-local-outline"
      @click="press.togglePanel('outline')"
    >
      {{ t('theme.outlineTitle') }}
      <span i-ri-arrow-right-s-line class="icon" aria-hidden="true" />
    </button>
    <button v-else type="button" class="outline-trigger" @click="scrollToTop">
      {{ t('sidebar.return_top') }}
    </button>
    <Transition name="flyout">
      <nav
        v-if="open && headers.length"
        id="press-local-outline"
        ref="items"
        class="items"
        :aria-label="t('theme.outlineAriaLabel')"
      >
        <PressOutlineItem :headers="headers" :on-click="onItemClick" root />
      </nav>
    </Transition>
  </div>
</template>

<style scoped>
.press-local-outline {
  margin-left: auto;
}

.outline-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 48px;
  padding: 12px 24px;
  font-size: 13px;
  font-weight: 500;
  color: var(--pr-c-text-2);
}

.outline-trigger:hover,
.outline-trigger[aria-expanded='true'] {
  color: var(--pr-c-brand);
}

.icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

[aria-expanded='true'] > .icon {
  transform: rotate(90deg);
}

.items {
  position: absolute;
  top: calc(100% + 8px);
  right: 16px;
  width: min(360px, calc(100vw - 32px));
  max-height: min(60dvh, 520px);
  padding: 16px 20px;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 12px;
  background-color: var(--pr-c-bg);
  box-shadow: 0 12px 40px rgb(0 0 0 / 0.12);
}

:deep(.outline-link) {
  padding-block: 4px;
  font-size: 14px;
}

.flyout-enter-active,
.flyout-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.flyout-enter-from,
.flyout-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .icon,
  .flyout-enter-active,
  .flyout-leave-active { transition: none; }
}
</style>
