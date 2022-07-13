<script lang="ts" setup>
defineProps<{
  show: boolean
}>()
</script>

<template>
  <transition name="fade">
    <div v-if="show" class="press-backdrop" />
  </transition>
</template>

<style scoped lang="scss">
.press-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: var(--pr-z-index-backdrop);
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

@media (min-width: 1280px) {
  .press-backdrop {
    display: none;
  }
}
</style>
