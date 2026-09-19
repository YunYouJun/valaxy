<script lang="ts" setup>
defineProps<{
  show: boolean
}>()
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="press-backdrop" />
  </Transition>
</template>

<style scoped lang="scss">
.press-backdrop {
  position: fixed;
  inset: var(--pr-nav-height) 0 0;
  z-index: var(--pr-z-backdrop);
  background: rgb(16 20 36 / 0.4);
  transition: opacity var(--va-transition-duration-moderate);

  &.fade-enter-from,
  &.fade-leave-to {
    opacity: 0;
  }

  &.fade-leave-active {
    transition-duration: var(--va-transition-duration);
  }
}

@media (width >= 960px) {
  .press-backdrop {
    display: none;
  }
}
</style>
