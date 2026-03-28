<script lang="ts" setup>
defineProps<{
  activeIcon?: string
  icon: string
  title: string
  /**
   * Total number
   */
  total: number
  to: string
}>()
</script>

<template>
  <RouterLink
    flex="~ col center"
    class="post-classify-nav-item gap-1 w-20 p-2 rounded transition op-80"
    :to="to"
    :title="title"
    hover="bg-$va-c-bg-soft op-100"
  >
    <div flex="~ col" class="text-$va-c-text inline-flex-center gap-1">
      <!-- Use CSS to toggle icons based on router-link-active class to avoid SSR hydration mismatch -->
      <div class="text-2xl icon-default" :class="icon" />
      <div v-if="activeIcon" class="text-2xl icon-active" :class="activeIcon" />
      <span class="text-xs">
        {{ title }}
      </span>
    </div>
    <span
      class="count text-base text-black/80 dark:text-white/80"
    >
      {{ total }}
    </span>
  </RouterLink>
</template>

<style lang="scss">
.post-classify-nav-item {
  .icon-active {
    display: none;
  }

  &.router-link-active {
    background-color: rgb(var(--va-c-primary-rgb), 0.08);

    .icon-default {
      display: none;
    }

    .icon-active {
      display: block;
    }
  }
}
</style>
