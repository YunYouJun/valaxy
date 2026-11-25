<script lang="ts" setup>
import type YunDrawerHeader from './ui/YunDrawerHeader.vue'
import { useResizeObserver, useScroll } from '@vueuse/core'
import { useFrontmatter } from 'valaxy'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useYunAppStore } from '../stores'

defineProps<{
  mobileTitle?: string
}>()

const fm = useFrontmatter()
const { t } = useI18n()
const yun = useYunAppStore()

const showToc = computed(() => {
  return fm.value.toc !== false
})

const asideEnabled = computed(() => fm.value.aside !== false)
const asideRef = useTemplateRef<HTMLElement>('asideRef')
const contentRef = useTemplateRef<HTMLElement>('contentRef')
const drawerHeader = useTemplateRef<InstanceType<typeof YunDrawerHeader>>('drawerHeader')
const { arrivedState, measure } = useScroll(asideRef, { offset: { top: 2, bottom: 2 } })
useResizeObserver(asideRef, measure)
useResizeObserver(contentRef, measure)
let keepHeadingFocus = false

function closeAside(focusHeading = false) {
  if (!yun.rightSidebar.isOpen)
    return
  keepHeadingFocus = focusHeading
  yun.rightSidebar.toggle()
}

watch(() => yun.rightSidebar.isOpen, (open) => {
  if (open) {
    nextTick(() => drawerHeader.value?.focusClose())
  }
  else if (keepHeadingFocus) {
    keepHeadingFocus = false
  }
  else {
    nextTick(() => document.querySelector<HTMLElement>('[aria-controls="yun-page-outline"][aria-expanded="false"]')?.focus({ preventScroll: true }))
  }
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && yun.rightSidebar.isOpen) {
    event.preventDefault()
    closeAside()
  }
}
</script>

<template>
  <aside
    v-if="asideEnabled"
    id="yun-page-outline"
    ref="asideRef"
    flex="~ col"
    class="yun-aside"
    :class="{ open: yun.rightSidebar.isOpen }"
    :style="{
      '--yun-aside-fade-top': arrivedState.top ? '0px' : '24px',
      '--yun-aside-fade-bottom': arrivedState.bottom ? '0px' : '24px',
    }"
    text="center"
    overflow="auto"
    @keydown="onKeydown"
  >
    <YunDrawerHeader
      ref="drawerHeader"
      class="yun-aside-mobile-header"
      :title="mobileTitle || t('sidebar.toc')"
      :close-label="t('theme.closeOutline')"
      close-class="yun-aside-close"
      @close="closeAside()"
    />
    <div class="yun-aside-progress" aria-hidden="true">
      <span class="yun-aside-progress-bar" />
    </div>
    <div ref="contentRef" class="yun-aside-content w-full" flex="~ col" pb-2>
      <YunOutline v-if="showToc" @select="closeAside(true)" />

      <div class="flex-grow" />

      <div v-if="$slots.default" class="custom-container">
        <slot />
      </div>
    </div>
  </aside>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins/index.scss' as *;

.yun-aside {
  // Below xl: fixed overlay panel, hidden by default
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: var(--yun-z-aside);
  width: min(360px, calc(100vw - 24px));
  height: 100dvh;
  max-height: 100dvh;
  background-color: var(--va-c-bg-light);
  visibility: hidden;
  transform: translateX(100%);
  transition: transform var(--va-transition-duration-fast) var(--yun-ease-in-out), visibility 0s linear var(--va-transition-duration-fast);
  border-radius: var(--yun-drawer-radius, 1rem) 0 0 var(--yun-drawer-radius, 1rem);
  box-shadow: -12px 0 40px rgb(0 0 0 / 0.12);

  html.dark & {
    border-left: 1px solid var(--yun-surface-line);
  }

  // float panel
  &.float {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: var(--yun-z-aside);
    max-height: 100vh;
  }

  &.show {
    visibility: visible;
    transform: translateX(0);
  }

  // Mobile/tablet: toggle open via JS
  &.open {
    visibility: visible;
    transform: translateX(0);
    transition: transform var(--va-transition-duration-fast) var(--yun-ease-in-out), visibility 0s;
  }
}

.yun-aside-content {
  padding-top: 0.75rem;
}

@media (width < 1280px) {
  .yun-aside .outline-title {
    display: none;
  }
}

.yun-aside-progress {
  display: none;
  position: sticky;
  top: 0;
  z-index: 3;
  flex: none;
  width: 100%;
  height: 2px;
  margin-bottom: -2px;
  overflow: hidden;
  border-radius: 999px;
  pointer-events: none;
}

.yun-aside-progress-bar {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--va-c-link) 62%, transparent),
    color-mix(in srgb, var(--va-c-primary) 72%, transparent)
  );
  transform: scaleX(0);
  transform-origin: left center;
}

@keyframes yun-aside-progress {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

@keyframes yun-aside-enter {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@supports (animation-timeline: scroll(root)) {
  .yun-aside-progress-bar {
    animation: yun-aside-progress linear both;
    animation-timeline: scroll(root);
  }
}

// Desktop (xl+): borderless transparent rail in normal flow, always visible
@include screen('xl') {
  .yun-aside {
    position: sticky;
    top: var(--yun-margin-top);
    z-index: auto;
    width: 100%;
    height: auto;
    min-height: 0;
    max-height: calc(100vh - var(--yun-margin-top) - 1rem);
    visibility: visible;
    transform: none;
    background-color: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    text-align: left;
    animation: yun-aside-enter var(--va-transition-duration-fast, 160ms) var(--yun-ease-in, ease-out);
    mask-image: linear-gradient(
      to bottom,
      #000 0 2px,
      transparent 2px,
      #000 calc(2px + var(--yun-aside-fade-top, 0px)),
      #000 calc(100% - var(--yun-aside-fade-bottom, 0px)),
      transparent 100%
    );

    html.dark & {
      border: 0;
    }

    html[data-yun-custom-bg='true'] & {
      padding: 0.75rem 0.25rem;
      border: 1px solid var(--yun-surface-line);
      border-radius: var(--va-card-border-radius, 0.5rem);
      background-color: color-mix(in srgb, var(--va-c-bg-light) 78%, transparent);
      /* stylelint-disable-next-line property-no-vendor-prefix */
      -webkit-backdrop-filter: blur(12px);
      backdrop-filter: blur(12px);
    }

    html.yun-route-transition & {
      animation: none;
    }

    // On xl, sidebar toggle should not affect layout
    &.open {
      width: 100%;
    }
  }

  .yun-aside-content {
    padding-top: 0.5rem;
  }

  .yun-aside-progress {
    display: block;
  }

  .yun-aside .yun-aside-mobile-header {
    display: none;
  }
}

.toc-btn {
  color: var(--va-c-primary);
  z-index: var(--yun-z-toc-btn);
}

@media (prefers-reduced-motion: reduce) {
  .yun-aside {
    animation: none;
    transition: none;
  }

  .yun-aside-progress-bar {
    animation: none;
    transform: scaleX(0);
  }
}
</style>
