<script setup lang="ts">
import type { MenuItem } from 'valaxy'
import { onClickOutside } from '@vueuse/core'
import { onContentUpdated } from 'valaxy'
import { nextTick, ref } from 'vue'

import { useI18n } from 'vue-i18n'

const props = defineProps<{
  headers: MenuItem[]
  navHeight: number
}>()

const open = ref(false)
const vh = ref(0)
const dropdown = ref<HTMLDivElement>()
const items = ref<HTMLDivElement>()

function close() {
  open.value = false
}

onClickOutside(dropdown, close)
onContentUpdated(close)

function toggle() {
  open.value = !open.value
  vh.value = window.innerHeight + Math.min(window.scrollY - props.navHeight, 0)
}

function onItemClick() {
  // disable animation on hash navigation when page jumps
  if (items.value)
    items.value.style.transition = 'none'

  nextTick(close)
}

function scrollToTop() {
  close()
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}

const { t } = useI18n()
</script>

<template>
  <div
    ref="dropdown"
    class="VPLocalNavOutlineDropdown"
    :style="{ '--vp-vh': `${vh}px` }"
    @keydown.esc="close"
  >
    <button
      v-if="headers.length > 0"
      type="button"
      :class="{ open }"
      :aria-expanded="open"
      aria-controls="press-local-outline"
      @click="toggle"
    >
      {{ t('theme.outlineTitle') }}
      <span i-ri-arrow-right-s-line class="icon" aria-hidden="true" />
    </button>
    <button v-else type="button" @click="scrollToTop">
      {{ t('sidebar.return_top') }}
    </button>
    <Transition name="flyout">
      <div
        v-if="open"
        id="press-local-outline"
        ref="items"
        class="items"
      >
        <div class="header">
          <a class="top-link" href="#" @click="scrollToTop">
            {{ t('sidebar.return_top') }}
          </a>
        </div>
        <div class="py-2 bg-$vp-c-bg-soft">
          <PressOutlineItem :headers="headers" :on-click="onItemClick" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* stylelint-disable selector-class-pattern */
.VPLocalNavOutlineDropdown {
  padding: 12px 20px 11px;
}

.VPLocalNavOutlineDropdown button {
  display: block;
  font-size: 12px;
  font-weight: 500;
  line-height: 24px;
  color: var(--vp-c-text-2);
  transition: color var(--va-transition-duration-moderate);
  position: relative;
}

.VPLocalNavOutlineDropdown button:hover {
  color: var(--vp-c-text-1);
  transition: color var(--va-transition-duration);
}

.VPLocalNavOutlineDropdown button.open {
  color: var(--vp-c-text-1);
}

.icon {
  display: inline-block;
  vertical-align: middle;
  margin-left: 2px;
  width: 14px;
  height: 14px;
  fill: currentcolor;
}

:deep(.outline-link) {
  font-size: 14px;
  padding: 2px 0;
}

.open > .icon {
  transform: rotate(90deg);
}

.items {
  position: absolute;
  top: 64px;
  right: 16px;
  left: 16px;
  display: grid;
  gap: 1px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background-color: var(--vp-c-gutter);
  max-height: calc(var(--vp-vh, 100vh) - 86px);
  overflow: hidden auto;
  box-shadow: var(--vp-shadow-3);
}

.header {
  background-color: var(--vp-c-bg-soft);
}

.top-link {
  display: block;
  padding: 0 16px;
  line-height: 48px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

.flyout-enter-active {
  transition: all var(--va-transition-duration-fast) ease-out;
}

.flyout-leave-active {
  transition: all var(--va-transition-duration-fast) ease-in;
}

.flyout-enter-from,
.flyout-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
