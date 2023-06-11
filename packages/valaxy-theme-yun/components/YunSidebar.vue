<script lang="ts" setup>
import { ref } from 'vue'

const showOverview = ref(false)
</script>

<template>
  <div v-if="$slots.default" class="sidebar-nav" m="t-6">
    <button m="x-4" class="sidebar-nav-item yun-icon-btn" :class="showOverview && 'active'" @click="showOverview = true">
      <div i-ri-passport-line />
    </button>
    <button m="x-4" class="sidebar-nav-item yun-icon-btn" :class="!showOverview && 'active'" @click="showOverview = false">
      <div i-ri-list-ordered />
    </button>
  </div>

  <div v-if="showOverview || !$slots.default" :class="$slots.default && '-mt-4'">
    <YunOverview />
  </div>

  <div v-else>
    <slot />
  </div>
</template>

<style lang="scss">
@use "sass:map";

.sidebar {
  position: fixed;
  overflow-y: auto;
  top: 0;
  bottom: 0;
  left: 0;

  width: calc(100vw - 64px);
  max-width: var(--va-sidebar-width);

  background-image: var(--yun-sidebar-bg-img);
  background-color: var(--yun-sidebar-bg-color);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom 1rem center;
  text-align: center;
  z-index: var(--yun-z-sidebar);

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
