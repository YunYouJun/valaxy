<script setup lang="ts">
import { useRoute } from 'vue-router'
// import { activeRoute } from '../router'

/**
 * not use valaxy route
 */
const routeMenus: {
  to: string
  icon?: string
  opened?: string
  closed?: string
}[] = [
  {
    to: '/',
    icon: 'i-ri-archive-line',
  },
  {
    to: '/categories',
    icon: 'i-ri:folder-2-line',
  },
  {
    to: '/tags',
    icon: 'i-ri:price-tag-3-line',
  },
  {
    to: '/migration',
    opened: 'i-vscode-icons:folder-type-tools-opened',
    closed: 'i-vscode-icons:folder-type-tools',
  },

  {
    to: '/about',
    icon: 'i-ri:information-line',
  },
]

const route = useRoute()
</script>

<template>
  <div
    class="w-full border-b shadow flex justify-end" dark="border-b-black"
    flex="~"
  >
    <RouterLink
      v-for="menu in routeMenus"
      :key="menu.to"
      class=" dark:bg-gray-900 inline-flex justify-center items-center w-8 h-8 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
      :class="{
        'bg-gray-200 dark:bg-gray-800': route.path === menu.to,
        'bg-white': route.path !== menu.to,
      }"
      :to="menu.to"
    >
      <div v-if="menu.icon" :class="menu.icon" />
      <div v-else-if="route.path === menu.to" :class="menu.opened" />
      <div v-else :class="menu.closed" />
    </RouterLink>

    <div flex="1" />

    <VDToggleLocale />
    <ToggleDark />
    <MenuBarBtn
      tag="a"
      href="https://valaxy.site" target="_blank"
    >
      <div i-ri-book-line />
    </MenuBarBtn>
  </div>
</template>
