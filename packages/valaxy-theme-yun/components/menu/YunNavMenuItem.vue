<script setup lang="ts">
defineProps<{
  icon: string
  label?: string
  to?: string
}>()
</script>

<template>
  <AppLink
    class="yun-nav-menu-item inline-flex-center cursor-pointer z-$yun-z-nav-menu"
    :to="to"
    :aria-label="label"
    :title="label"
  >
    <div class="size-5" :class="icon" aria-hidden="true" />
  </AppLink>
</template>

<style scoped>
.yun-nav-menu-item {
  flex-shrink: 0;
  width: 2.35rem;
  height: 2.35rem;
  margin-inline: 0.125rem;
  border-radius: 0.625rem;
  color: var(--va-c-text-2);
  transition: background-color 180ms ease, color 180ms ease;

  &[aria-current='page'] {
    color: var(--va-c-link);
    background-color: color-mix(in srgb, var(--va-c-link) 10%, transparent);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: var(--va-c-link);
      background-color: color-mix(in srgb, var(--va-c-text) 7%, transparent);
    }
  }

  @media (pointer: coarse) {
    width: 2.75rem;
    height: 2.75rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
</style>
