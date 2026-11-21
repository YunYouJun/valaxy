<script lang="ts" setup>
import type YunDrawerHeader from './ui/YunDrawerHeader.vue'
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
const drawerHeader = useTemplateRef<InstanceType<typeof YunDrawerHeader>>('drawerHeader')
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
    flex="~ col"
    class="va-card yun-aside min-h-sm"
    :class="{ open: yun.rightSidebar.isOpen }"
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
    <div class="w-full" flex="~ col" pb-2>
      <template v-if="showToc">
        <h2
          m="t-6 b-2"
          font="serif black"
        >
          {{ t('sidebar.toc') }}
        </h2>
        <YunOutline @select="closeAside(true)" />
      </template>

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
  visibility: hidden;
  transform: translateX(100%);
  transition: transform var(--va-transition-duration-fast) var(--yun-ease-in-out), visibility 0s linear var(--va-transition-duration-fast);
  border-radius: var(--yun-drawer-radius, 1rem) 0 0 var(--yun-drawer-radius, 1rem);
  box-shadow: -12px 0 40px rgb(0 0 0 / 0.12);

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

@media (width < 1280px) {
  .yun-aside > div > h2,
  .yun-aside .outline-title {
    display: none;
  }
}

// Desktop (xl+): aside is in normal flow, always visible
@include screen('xl') {
  .yun-aside {
    position: sticky;
    top: var(--yun-margin-top);
    z-index: auto;
    width: 320px;
    height: auto;
    max-height: calc(100vh - var(--yun-margin-top));
    visibility: visible;
    transform: translateX(0);
    border-radius: var(--va-card-border-radius, 0.5rem);
    box-shadow: none;

    html.dark & {
      border: 1px solid var(--yun-surface-line);
    }

    // On xl, sidebar toggle should not affect layout
    &.open {
      width: 320px;
    }
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
    transition: none;
  }
}
</style>
