<script lang="ts" setup>
import { ref } from 'vue'
import { useAppStore } from 'valaxy'

defineProps<{
  showHamburger?: boolean
}>()

const app = useAppStore()
const showOverview = ref(false)
</script>

<template>
  <ValaxyOverlay class="md:hidden" :show="app.isSidebarOpen" @click="app.toggleSidebar()" />

  <ValaxyHamburger
    :active="app.isSidebarOpen"
    class="menu-btn sidebar-toggle yun-icon-btn leading-4 fixed left-0.8rem top-0.6rem"
    inline-flex cursor="pointer" z="$yun-z-menu-btn"
    :class="showHamburger ? '' : 'md:hidden'" @click="app.toggleSidebar()"
  />

  <aside
    class="va-card transition sidebar fixed inset-y-0 left-0 overflow-y-auto"
    :class="[app.isSidebarOpen && 'open', !showHamburger && 'md:translate-x-0']"
    text="center" bg="$yun-sidebar-bg-color contain no-repeat" z="$yun-z-sidebar"
  >
    <div v-if="$slots.default" class="sidebar-nav" m="t-6">
      <button
        m="x-4" class="sidebar-nav-item yun-icon-btn"
        :class="showOverview && 'active'" @click="showOverview = true"
      >
        <div i-ri-passport-line />
      </button>
      <button
        m="x-4" class="sidebar-nav-item yun-icon-btn"
        :class="!showOverview && 'active'" @click="showOverview = false"
      >
        <div i-ri-list-ordered />
      </button>
    </div>

    <div v-if="showOverview || !$slots.default" :class="$slots.default && '-mt-4'">
      <YunOverview />
    </div>

    <div v-else>
      <slot />
    </div>
  </aside>
</template>

<style lang="scss">
@use "sass:map";

.sidebar {
  width: calc(100vw - 64px);
  max-width: var(--va-sidebar-width);

  background-image: var(--yun-sidebar-bg-img);
  background-position: bottom 1rem center;

  transform: translateX(-100%);
  transition: box-shadow var(--va-transition-duration),
    background-color var(--va-transition-duration), opacity 0.25s,
    transform var(--va-transition-duration) cubic-bezier(0.19, 1, 0.22, 1) !important;

  &.open {
    transform: translateX(0);
  }
}

.sidebar-nav {
  .sidebar-nav-item {
    color: var(--va-c-primary);
    border: 1px solid var(--va-c-primary);

    &.active {
      border: 1px solid var(--va-c-primary);

      color: white;
      background-color: var(--va-c-primary);
    }
  }
}
</style>
