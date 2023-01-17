<script setup lang="ts">
import { computed, provide } from 'vue'
import { useWindowScroll } from '@vueuse/core'
import { useSidebar } from 'valaxy/client'
import { useNav } from '../composables/nav'

const { y } = useWindowScroll()

const { isScreenOpen, closeScreen, toggleScreen } = useNav()
const { hasSidebar } = useSidebar()

provide('close-screen', closeScreen)

const classes = computed(() => ({
  'no-sidebar': !hasSidebar.value,
  'fill-bg': y.value > 0,
}))
</script>

<template>
  <nav w="full" class="press-nav relative md:fixed md:z-99 font-bold" :class="classes">
    <PressNavBar :is-screen-open="isScreenOpen" @toggle-screen="toggleScreen" />

    <PressNavScreen :open="isScreenOpen" />
  </nav>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins' as *;

.press-nav {
  z-index: var(--pr-z-index-nav);
}

.pr-Nav.fill-bg {
  background-color: var(--pr-nav-bg-color);
}

@include media('md') {
  .press-nav {
    -webkit-backdrop-filter: saturate(50%) blur(8px);
    backdrop-filter: saturate(50%) blur(8px);
  }
}
</style>
