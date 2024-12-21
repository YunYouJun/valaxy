<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const routeMenus = [
  {
    to: '/',
    opened: 'i-vscode-icons:folder-type-route-opened',
    closed: 'i-vscode-icons:folder-type-route',
  },
  // {
  //   to: '/categories',
  //   opened: 'i-vscode-icons:folder-type-route-opened',
  //   closed: 'i-vscode-icons:folder-type-route',
  // },
  // {
  //   to: '/tags',
  //   opened: 'i-vscode-icons:folder-type-route-opened',
  //   closed: 'i-vscode-icons:folder-type-route',
  // },
  {
    to: '/migration',
    opened: 'i-vscode-icons:folder-type-tools-opened',
    closed: 'i-vscode-icons:folder-type-tools',
  },
]
</script>

<template>
  <div
    class="w-full border-b shadow flex justify-end" dark="border-b-black"
    flex="~"
  >
    <RouterLink
      v-for="menu in routeMenus"
      :key="menu.to"
      class=" dark:bg-gray-900 inline-flex justify-center items-center w-8 h-8 hover:bg-gray-100 dark:hover:bg-gray-800"
      :class="{
        'bg-gray-200 dark:bg-gray-800': route.path === menu.to,
        'bg-white': route.path !== menu.to,
      }"
      :to="menu.to"
    >
      <div v-if="route.path === menu.to" :class="menu.opened" />
      <div v-else :class="menu.closed" />
    </RouterLink>

    <div flex="1" />

    <SelectRootDir />
    <ToggleDark />
    <MenuBarBtn
      tag="a"
      href="https://valaxy.site" target="_blank"
    >
      <div i-ri-book-line />
    </MenuBarBtn>
  </div>
</template>
