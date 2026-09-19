<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { FocusScope } from 'reka-ui'
import { useSidebar } from 'valaxy'
import { computed, inject, provide, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNav } from '../composables/nav'

const { y } = useWindowScroll()

const { isScreenOpen, closeScreen, toggleScreen } = useNav()
const { hasSidebar } = useSidebar()
const { t } = useI18n()
const navigation = ref<HTMLElement>()
const closeNavigation = inject<() => void>('close-navigation', closeScreen)

function toggleNavigation() {
  if (isScreenOpen.value)
    closeNavigation()
  else
    toggleScreen()
}

function focusCloseButton(event: Event) {
  event.preventDefault()
  navigation.value?.querySelector<HTMLElement>('[aria-controls="pr-NavScreen"]')?.focus({ preventScroll: true })
}

function onEscape(event: KeyboardEvent) {
  if (!isScreenOpen.value || event.defaultPrevented)
    return
  event.preventDefault()
  event.stopPropagation()
  closeNavigation()
}

provide('close-screen', closeScreen)

const classes = computed(() => ({
  'no-sidebar': !hasSidebar.value,
  'fill-bg': y.value > 0,
  'is-screen-open': isScreenOpen.value,
}))
</script>

<template>
  <FocusScope
    as-child
    :present="isScreenOpen"
    :trapped="isScreenOpen"
    :loop="isScreenOpen"
    @mount-auto-focus="focusCloseButton"
    @unmount-auto-focus.prevent
  >
    <nav
      ref="navigation"
      w="full" class="press-nav font-bold" :class="classes"
      :role="isScreenOpen ? 'dialog' : undefined"
      :aria-modal="isScreenOpen ? true : undefined"
      :aria-label="isScreenOpen ? t('nav.site') : undefined"
      @keydown.esc="onEscape"
    >
      <PressNavBar :is-screen-open="isScreenOpen" @toggle-screen="toggleNavigation" />

      <PressNavScreen :open="isScreenOpen" />
    </nav>
  </FocusScope>
</template>

<style>
.press-nav {
  position: sticky;
  top: 0;
  z-index: var(--pr-z-nav);
}

.press-nav.is-screen-open .pr-navbar {
  background-color: var(--pr-c-bg);
}
</style>
