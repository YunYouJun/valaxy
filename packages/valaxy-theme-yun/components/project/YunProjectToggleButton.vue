<script setup lang="ts">
defineProps<{
  active?: boolean
}>()
</script>

<template>
  <button
    type="button"
    class="yun-project-toggle"
    :class="{ 'is-active': active }"
    :aria-pressed="active"
  >
    <slot />
  </button>
</template>

<style scoped>
.yun-project-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.25rem;
  padding: 0 0.9rem;
  border: 1px solid var(--yun-surface-line);
  border-radius: 999px;
  background-color: var(--va-c-bg-light);
  color: var(--va-c-text-2);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 180ms ease, border-color 180ms ease, background-color 180ms ease;

  @media (pointer: coarse) {
    min-height: 2.5rem;
    padding-inline: 1rem;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: var(--va-c-text);
      border-color: color-mix(in srgb, var(--va-c-link) 30%, var(--yun-surface-line));
      background-color: color-mix(in srgb, var(--va-c-text) 4%, var(--va-c-bg-light));
    }
  }

  &.is-active {
    color: var(--va-c-link);
    border-color: color-mix(in srgb, var(--va-c-link) 42%, transparent);
    background-color: color-mix(in srgb, var(--va-c-link) 11%, var(--va-c-bg-light));
    font-weight: 600;
  }

  &:focus-visible {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
</style>
