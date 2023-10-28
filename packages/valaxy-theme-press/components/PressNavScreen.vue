<script setup lang="ts">
import { ref } from 'vue'
import { useBodyScrollLock } from 'valaxy'

defineProps<{
  open: boolean
}>()

const screen = ref<HTMLElement>()
const { lockBodyScroll, unlockBodyScroll } = useBodyScrollLock(screen)
</script>

<template>
  <Transition
    name="fade"
    @enter="lockBodyScroll"
    @after-leave="unlockBodyScroll"
  >
    <div v-if="open" ref="screen" class="pr-NavScreen">
      <div class="container" flex="~ col">
        <slot name="nav-screen-content-before" />
        <PressNavScreenMenu class="menu" />
        <PressNavScreenTranslations class="translations" />
        <PressNavScreenAppearance class="appearance" />
        <PressNavScreenSocialLinks class="social-links" />

        <slot name="nav-screen-content-after" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* stylelint-disable selector-class-pattern */
.pr-NavScreen {
  position: fixed;
  inset: calc(var(--pr-nav-height) + var(--pr-layout-top-height, 0px) + 1px) 0 0 0;

  /* rtl:ignore */

  /* rtl:ignore */
  padding: 0 32px;
  width: 100%;
  background-color: var(--pr-nav-screen-bg-color);
  overflow-y: auto;
  transition: background-color 0.5s;
  pointer-events: auto;
}

.pr-NavScreen.fade-enter-active,
.pr-NavScreen.fade-leave-active {
  transition: opacity 0.25s;
}

.pr-NavScreen.fade-enter-active .container,
.pr-NavScreen.fade-leave-active .container {
  transition: transform 0.25s ease;
}

.pr-NavScreen.fade-enter-from,
.pr-NavScreen.fade-leave-to {
  opacity: 0;
}

.pr-NavScreen.fade-enter-from .container,
.pr-NavScreen.fade-leave-to .container {
  transform: translateY(-8px);
}

@media (width >= 768px) {
  .pr-NavScreen {
    display: none;
  }
}

.container {
  margin: 0 auto;
  padding: 24px 0 96px;
  max-width: 288px;
}

.menu + .translations,
.menu + .appearance,
.translations + .appearance {
  margin-top: 24px;
}

.menu + .social-links {
  margin-top: 16px;
}

.appearance + .social-links {
  margin-top: 16px;
}
</style>
