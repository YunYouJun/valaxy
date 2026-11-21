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
    class="post-classify-nav-item gap-1 w-20 p-2"
    :to="to"
    :title="title"
    :aria-label="title"
  >
    <div flex="~ col" class="inline-flex-center gap-1">
      <!-- Use CSS to toggle icons based on router-link-active class to avoid SSR hydration mismatch -->
      <div class="text-2xl icon-default" :class="icon" aria-hidden="true" />
      <div v-if="activeIcon" class="text-2xl icon-active" :class="activeIcon" aria-hidden="true" />
      <span class="text-xs">
        {{ title }}
      </span>
    </div>
    <span class="count text-base">
      {{ total }}
    </span>
  </RouterLink>
</template>

<style lang="scss">
.post-classify-nav-item {
  border-radius: var(--yun-action-btn-radius, 0.625rem);
  color: var(--va-c-text-2);
  transition: background-color var(--va-transition-duration-fast, 180ms) ease, color var(--va-transition-duration-fast, 180ms) ease;

  .count {
    color: var(--va-c-text);
  }

  .icon-active {
    display: none;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: var(--va-c-text);
      background-color: var(--yun-action-btn-hover-bg);
    }
  }

  &:active {
    color: var(--va-c-text);
    background-color: var(--yun-action-btn-active-bg);
  }

  &:focus-visible {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 1px;
  }

  &.router-link-active {
    color: var(--va-c-link);
    background-color: color-mix(in srgb, var(--va-c-link) 10%, transparent);

    .count {
      color: var(--va-c-link);
    }

    .icon-default {
      display: none;
    }

    .icon-active {
      display: block;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
</style>
