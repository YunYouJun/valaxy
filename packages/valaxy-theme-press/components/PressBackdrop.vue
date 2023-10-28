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
  inset: 0;
  z-index: var(--pr-z-backdrop);
  background: rgba(0, 0, 0, .6);
  transition: opacity 0.5s;

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .fade-leave-active {
    transition-duration: .25s;
  }
}

@media (width >= 1280px) {
  .press-backdrop {
    display: none;
  }
}
</style>
