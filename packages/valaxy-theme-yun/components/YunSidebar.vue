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
