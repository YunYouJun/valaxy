<script lang="ts" setup>
import { useSidebar } from 'valaxy/client'

const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } = useSidebar()
</script>

<template>
  <div class="layout antialiased">
    <PressNav />
    <PressLocalNav :open="isSidebarOpen" @open-menu="openSidebar()" />
    <slot name="sidebar">
      <PressSidebar :open="isSidebarOpen" />
    </slot>
    <PressBackdrop :show="isSidebarOpen" @click="closeSidebar" />

    <slot>
      <router-view v-slot="{ Component }">
        <component :is="Component">
          <template #main-header>
            <slot name="main-header" />
          </template>

          <template #main-header-after>
            <slot name="main-header-after" />
          </template>
          <template #main>
            <slot name="main" />
          </template>
          <template #main-content>
            <slot name="main-content" />
          </template>
          <template #main-content-after>
            <slot name="main-content-after" />
          </template>
          <template #main-nav-before>
            <slot name="main-nav-before" />
          </template>
          <template #main-nav-after>
            <slot name="main-nav-after" />
          </template>
          <template #aside>
            <slot name="aside" />
          </template>
          <template #aside-custom>
            <slot name="aside-custom" />
          </template>
          <template #footer>
            <slot name="footer" />
          </template>
        </component>
      </router-view>
    </slot>
  </div>
</template>

