<script lang="ts" setup>
import type { MenuItem } from 'valaxy'
import { onKeyStroke, useEventListener, useMediaQuery, useThrottleFn } from '@vueuse/core'
import { onContentUpdated, useFrontmatter, useOutline } from 'valaxy'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePressAppStore } from '../stores/app'
import PressOutline from './PressOutline.vue'

const frontmatter = useFrontmatter()
const press = usePressAppStore()
const { headers } = useOutline()
const { t } = useI18n()
const isOverlayAside = useMediaQuery('(max-width: 1279px)')

const aside = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const currentSection = ref(1)
const readingProgress = ref(0)

function flattenHeaders(items: MenuItem[]): MenuItem[] {
  return items.flatMap(item => [
    item,
    ...flattenHeaders(item.children || []),
  ])
}

const flatHeaders = computed(() => flattenHeaders(headers.value))
const totalSections = computed(() => flatHeaders.value.length)
const readingPercent = computed(() => Math.round(readingProgress.value * 100))
const readingProgressDasharray = computed(() => `${readingProgress.value} ${1 - readingProgress.value}`)
const triggerLabel = computed(() => t('theme.outlineTriggerLabel', {
  current: currentSection.value,
  total: totalSections.value,
  progress: readingPercent.value,
}))

function getHeaderElement(link: string) {
  const hash = link.slice(link.indexOf('#') + 1)

  try {
    return document.getElementById(decodeURIComponent(hash))
  }
  catch {
    return document.getElementById(hash)
  }
}

function updateReadingState() {
  if (!totalSections.value)
    return

  const pageOffset = 134
  let activeSection = 1

  for (const [index, header] of flatHeaders.value.entries()) {
    const element = getHeaderElement(header.link)

    if (element && element.getBoundingClientRect().top <= pageOffset)
      activeSection = index + 1
  }

  const scrollContainer = document.scrollingElement || document.documentElement
  const scrollableHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight
  const scrollTop = scrollContainer.scrollTop
  const isAtEnd = scrollableHeight - scrollTop <= 1

  currentSection.value = activeSection

  if (scrollableHeight <= 0 || isAtEnd) {
    readingProgress.value = 1
    return
  }

  readingProgress.value = Math.min(1, Math.max(0, scrollTop / scrollableHeight))
}

const updateReadingStateThrottled = useThrottleFn(updateReadingState, 80, true)

function closeAside(restoreFocus = false) {
  if (!press.rightSidebar.isOpen)
    return

  press.rightSidebar.toggle(false)

  if (restoreFocus)
    nextTick(() => trigger.value?.focus())
}

function toggleAside() {
  const shouldOpen = !press.rightSidebar.isOpen
  press.rightSidebar.toggle(shouldOpen)

  if (shouldOpen) {
    nextTick(() => {
      const links = aside.value?.querySelectorAll<HTMLElement>('.outline-link')
      links?.item(currentSection.value - 1)?.focus()
    })
  }
}

function onAsideClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('.outline-link'))
    closeAside()
}

onKeyStroke('Escape', () => closeAside(true))
useEventListener('scroll', updateReadingStateThrottled, { passive: true })
useEventListener('resize', updateReadingStateThrottled)
onMounted(() => nextTick(updateReadingState))
onContentUpdated(() => {
  closeAside()
  nextTick(updateReadingState)
})
</script>

<template>
  <button
    v-if="frontmatter.toc !== false && headers.length"
    ref="trigger"
    type="button"
    class="toc-btn lt-md:hidden! xl:hidden!"
    :class="{ active: press.rightSidebar.isOpen }"
    :aria-label="triggerLabel"
    :aria-expanded="press.rightSidebar.isOpen"
    aria-controls="press-page-outline"
    @click="toggleAside"
  >
    <svg
      class="toc-progress"
      viewBox="0 0 100 48"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect
        class="toc-progress-track"
        x="1"
        y="1"
        width="98"
        height="46"
        rx="23"
        pathLength="100"
      />
      <rect
        v-show="readingProgress > 0 && readingProgress < 1"
        class="toc-progress-value"
        x="1"
        y="1"
        width="98"
        height="46"
        rx="23"
        pathLength="1"
        :stroke-dasharray="readingProgressDasharray"
      />
    </svg>
    <span
      v-show="readingProgress >= 1"
      class="toc-progress-complete"
      aria-hidden="true"
    />
    <span i-ri-list-unordered aria-hidden="true" />
    <span class="toc-label">{{ t('theme.outlineButtonLabel') }}</span>
  </button>

  <ValaxyOverlay :show="press.rightSidebar.isOpen" @click="closeAside(true)" />

  <aside
    id="press-page-outline"
    ref="aside"
    class="press-aside lt-xl:fixed"
    flex="~ col grow"
    p="l-0 xl:l-8" text="center"
    z="$"
    :aria-label="t('theme.outlineTitle')"
    :aria-hidden="isOverlayAside && !press.rightSidebar.isOpen ? 'true' : undefined"
    :aria-modal="isOverlayAside && press.rightSidebar.isOpen ? 'true' : undefined"
    :class="press.rightSidebar.isOpen && 'open'"
    :inert="isOverlayAside && !press.rightSidebar.isOpen"
    :role="isOverlayAside ? 'dialog' : undefined"
    @click="onAsideClick"
  >
    <div class="aside-curtain" />
    <div class="aside-container lt-xl:fixed" flex="~ col">
      <div class="aside-content overflow-auto" flex="~ col">
        <PressOutline
          v-if="frontmatter.toc !== false"
          :closable="isOverlayAside"
          @close="closeAside(true)"
        />
        <div class="flex-grow" />
        <div v-if="$slots.default" class="custom-container">
          <slot />
        </div>
      </div>
    </div>
  </aside>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins/index.scss' as *;

.press-aside {
  top: 0;
  bottom: 0;
  right: 0;
  z-index: var(--pr-z-aside);
  width: min(320px, calc(100vw - 24px));
  box-shadow: -12px 0 40px rgb(0 0 0 / 0.12);
  transform: translateX(100%);
  transition: box-shadow var(--va-transition-duration), opacity var(--va-transition-duration),
  transform var(--va-transition-duration) cubic-bezier(0.19, 1, 0.22, 1);

  &.open {
    position: fixed;
    right: 0;
    display: block;
    transform: translateX(0);
  }
}

.aside-container {
  position: sticky;
  top: 0;
  margin-top: calc(var(--pr-nav-height) * -1 - 20px);
  padding-top: calc(var(--pr-nav-height) + 20px);
  width: 100%;
  height: 100vh;
  background-color: var(--va-c-bg);
}

.aside-curtain {
  position: fixed;
  bottom: 0;
  z-index: 10;
  width: 100%;
  height: 32px;
  background: linear-gradient(transparent,var(--va-c-bg) 70%);
}

@include screen('xl') {
  .aside-container {
    top: 0;
  }

  .press-aside {
    width: var(--va-aside-width);
    box-shadow: none;
    transform: translateX(0);
  }
}

.toc-btn {
  position: fixed;
  right: max(20px, env(safe-area-inset-right));
  bottom: max(24px, calc(env(safe-area-inset-bottom) + 20px));
  z-index: calc(var(--pr-z-backdrop) - 1);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 0;
  border-radius: 999px;
  padding: 0 14px 0 13px;
  min-width: 48px;
  height: 48px;
  color: var(--pr-c-text-1);
  background-color: var(--va-c-bg-elevated);
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.08), 0 1px 3px rgb(0 0 0 / 0.06);
  transition:
    box-shadow var(--va-transition-duration),
    color var(--va-transition-duration),
    transform var(--va-transition-duration);

  &:focus-visible {
    outline: 2px solid var(--va-c-brand);
    outline-offset: 3px;
  }

  &:active {
    transform: scale(0.98);
  }

  > [class*='i-ri-'] {
    position: relative;
    z-index: 1;
    flex: none;
    width: 18px;
    height: 18px;
  }
}

.toc-label {
  position: relative;
  z-index: 1;
  letter-spacing: 0.01em;
  line-height: 1;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.toc-progress {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.toc-progress-track,
.toc-progress-value {
  fill: none;
  vector-effect: non-scaling-stroke;
}

.toc-progress-track {
  stroke: color-mix(in srgb, var(--pr-c-text-2) 24%, transparent);
  stroke-width: 1px;
  transition: stroke var(--va-transition-duration);
}

.toc-progress-value {
  stroke: var(--va-c-brand);
  stroke-width: 2px;
  stroke-linecap: round;
  transition: stroke-dasharray 120ms linear;
}

.toc-progress-complete {
  position: absolute;
  inset: 0;
  border: 2px solid var(--va-c-brand);
  border-radius: inherit;
  pointer-events: none;
}

@media (hover: hover) and (pointer: fine) {
  .toc-btn:hover {
    color: var(--va-c-brand);
    box-shadow: 0 6px 18px rgb(0 0 0 / 0.1), 0 1px 4px rgb(0 0 0 / 0.08);
    transform: translateY(-1px);
  }

  .toc-btn:hover .toc-progress-track {
    stroke: color-mix(in srgb, var(--va-c-brand) 40%, var(--pr-c-text-2));
  }
}

@media (prefers-reduced-motion: reduce) {
  .toc-btn,
  .toc-progress-value {
    transition: none;
  }
}
</style>
