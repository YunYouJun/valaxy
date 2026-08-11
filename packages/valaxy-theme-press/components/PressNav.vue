<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { useSidebar } from 'valaxy'
import { computed, provide } from 'vue'
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

<style>
.press-nav {
  z-index: var(--pr-z-nav);
}
</style>
