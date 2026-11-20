<script lang="ts" setup>
import { goDown } from '../utils'
</script>

<template>
  <button
    type="button"
    class="go-down"
    aria-label="go-down"
    @click="goDown"
  />
</template>

<style lang="scss" scoped>
@use '../styles/mixins/glass';

.go-down {
  @include glass.surface;
  @include glass.edge;

  position: absolute;
  bottom: 1.25rem;
  z-index: var(--yun-z-go-down);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border-radius: 50%;
  color: var(--va-c-text-2);
  cursor: pointer;
  transition: background-color 180ms ease, border-color 180ms ease, box-shadow 220ms ease, color 180ms ease;

  &::after {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-right: 2px solid currentcolor;
    border-bottom: 2px solid currentcolor;
    transform: translateY(-2px) rotate(45deg);
  }

  &:focus-visible {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
    color: var(--va-c-link);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: color-mix(in srgb, var(--va-c-link) 36%, var(--yun-glass-border));
      background-color: var(--yun-glass-hover-fill);
      box-shadow: var(--yun-glass-hover-shadow);
      color: var(--va-c-link);
    }
  }

  @media (width <= 768px) {
    bottom: 0.5rem;
    width: 2.25rem;
    height: 2.25rem;
  }

  @media (pointer: coarse) {
    width: 2.75rem;
    height: 2.75rem;
  }

  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
    &, &:hover {
      @include glass.solid;
    }

    &::before {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
</style>
