<script lang="ts" setup>
import { ref } from 'vue'
import { useYunAppStore } from '../stores'

defineProps<{
  showHamburger?: boolean
}>()

const yunStore = useYunAppStore()
const showOverview = ref(false)
</script>

<template>
  <ValaxyOverlay class="md:hidden" :show="yunStore.leftSidebar.isOpen" @click="yunStore.leftSidebar.toggle()" />

  <!-- <ValaxyHamburger
    :active="yunStore.leftSidebar.isOpen"
    class="menu-btn sidebar-toggle yun-icon-btn leading-4 fixed left-0.8rem top-0.6rem"
    inline-flex cursor="pointer" z="$yun-z-menu-btn"
    :class="showHamburger ? '' : 'md:hidden'"
    @click="yunStore.leftSidebar.toggle()"
  /> -->

  <aside
    class="va-card transition sidebar fixed inset-y-0 left-0 overflow-y-auto"
    :class="{
      'open': yunStore.leftSidebar.isOpen,
      'md:translate-x-0': !showHamburger,
    }"
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
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;

.sidebar {
  width: calc(100vw - 64px);
  max-width: var(--va-sidebar-width);
  background-image: var(--yun-sidebar-bg-img);
  background-position: bottom 1rem center;
  transform: translateX(-100%);
  transition: box-shadow var(--va-transition-duration),
    background-color var(--va-transition-duration), opacity var(--va-transition-duration),
    transform var(--va-transition-duration) map.get($cubic-bezier, 'ease-in-out') !important;

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
