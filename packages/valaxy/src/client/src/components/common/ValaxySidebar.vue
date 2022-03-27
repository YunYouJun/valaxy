<template>
  <ValaxyOverlay :show="app.isSidebarOpen" @click="app.toggleSidebar()" />

  <ValaxyHamburger :active="app.isSidebarOpen" class="menu-btn sidebar-toggle yun-icon-btn" :class="isHome ? '' : 'md:hidden'" @click="app.toggleSidebar()" />

  <aside class="val-card" :class="['sidebar', app.isSidebarOpen && 'open', !isHome && 'md:translate-x-0']">
    <YunSidebar />

    <YunConfig />
  </aside>
</template>

<script lang="ts" setup>
import { useLayout } from '~/composables'
import { useAppStore } from '~/stores/app'

const app = useAppStore()
const isHome = useLayout('home')
</script>

<style lang="scss">
@use "sass:map";

@use "~/styles/vars" as *;

.menu-btn {
  display: inline-flex;
  position: fixed;
  left: 0.8rem;
  top: 0.6rem;
  line-height: 1;
  z-index: map.get($z-index, 'menu-btn');
  cursor: pointer;
}
</style>
