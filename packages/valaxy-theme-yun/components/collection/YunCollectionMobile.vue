<script setup lang="ts">
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { nextTick, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useYunCollection } from '../../composables/collection'

const isOpen = defineModel<boolean>('open', { default: false })

const { collection } = useYunCollection()
const { t } = useI18n()
const route = useRoute()
const isDesktop = useMediaQuery('(min-width: 1024px)', { ssrWidth: 1280 })
const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')

watch(isOpen, (open) => {
  if (open)
    nextTick(() => closeButton.value?.focus({ preventScroll: true }))
})

watch(() => route.fullPath, () => isOpen.value = false)
watch(isDesktop, (desktop) => {
  if (desktop)
    isOpen.value = false
})

useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value && !(event.target instanceof Element && event.target.closest('.yun-select-content')))
    close(true)
})

function close(restoreFocus = false) {
  isOpen.value = false
  if (restoreFocus)
    nextTick(() => document.querySelector<HTMLElement>('[aria-controls="yun-collection-menu"][aria-expanded="false"]')?.focus({ preventScroll: true }))
}

function onNavClick(event: MouseEvent) {
  if (event.target instanceof Element && event.target.closest('a'))
    close()
}
</script>

<template>
  <template v-if="collection">
    <YunOverlay :show="isOpen" @click="close(true)" />

    <aside
      v-if="isOpen"
      id="yun-collection-menu"
      class="yun-collection-mobile"
      :aria-label="t('theme.collectionContents')"
    >
      <div class="yun-collection-mobile-header">
        <span>{{ t('theme.collectionContents') }}</span>
        <button
          ref="closeButton"
          type="button"
          class="yun-icon-btn"
          :aria-label="t('theme.closeMenu')"
          @click="close(true)"
        >
          <span i-ri-close-line aria-hidden="true" />
        </button>
      </div>
      <div class="yun-collection-mobile-content" @click="onNavClick">
        <YunCollectionSidebar />
      </div>
    </aside>
  </template>
</template>

<style scoped>
.yun-collection-mobile {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: var(--yun-z-aside);
  display: flex;
  flex-direction: column;
  width: min(20rem, calc(100vw - 2.5rem));
  border-radius: 0 0.5rem 0.5rem 0;
  background: var(--va-c-bg);
  box-shadow: 12px 0 40px rgb(0 0 0 / 0.12);
}

.yun-collection-mobile-header {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 0 12px 0 20px;
  border-bottom: 1px solid var(--yun-surface-line);
  font-size: 16px;
  font-weight: 600;
}

.yun-collection-mobile-content {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.yun-collection-mobile-content :deep(.yun-collection-sidebar) {
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

@media (width >= 1024px) {
  .yun-collection-mobile {
    display: none;
  }
}
</style>
