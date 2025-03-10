<script lang="ts" setup>
withDefaults(defineProps<{
  show?: boolean
}>(), {
  show: false,
})
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="va-overlay" />
  </Transition>
</template>

<style lang="scss">
@use "sass:map";
@use "valaxy/client/styles/mixins/index.scss" as *;

.va-overlay {
  background-color: rgb(0 0 0 / 0.3);
  position: fixed;
  inset: 0;
  z-index: calc(var(--va-z-overlay) - 1);
  transition: opacity 0.4s;

  &.fade-enter-from,
  &.fade-leave-to {
    opacity: 0;
  }
}

@include mobile {
  .va-overlay {
    display: block;
  }
}
</style>
