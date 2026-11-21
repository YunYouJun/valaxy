<script setup lang="ts">
defineProps<{
  icon: string
  label?: string
  to?: string
}>()
</script>

<template>
  <AppLink
    class="yun-nav-menu-item yun-action-btn z-$yun-z-nav-menu"
    :to="to"
    :aria-label="label"
    :title="label"
  >
    <div :class="icon" aria-hidden="true" />
  </AppLink>
</template>

<style scoped>
.yun-nav-menu-item {
  &[aria-current='page'] {
    color: var(--va-c-link);
    background-color: color-mix(in srgb, var(--va-c-link) 10%, transparent);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: var(--va-c-link);
    }
  }
}
</style>
