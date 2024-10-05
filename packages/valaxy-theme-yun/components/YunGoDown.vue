<script lang="ts" setup>
import { goDown } from '../utils'
</script>

<template>
  <button
    class="go-down w-20 bottom-0 text-sm md:(bottom-2 text-40px)" aria-label="go-down"
    @click="goDown"
  >
    <div i-ri-arrow-down-s-fill inline-flex />
  </button>
</template>

<style lang="scss">
.go-down {
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  z-index: var(--yun-z-go-down);
  animation: float 2s ease-in-out infinite;
  color: var(--va-c-text);
  transition: color var(--va-transition-duration);

  &:hover {
    color: rgba(var(--va-c-primary-rgb), 0.6);
  }
}

@keyframes float {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  50% {
    opacity: 0.8;
    transform: translateY(-0.3em);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
