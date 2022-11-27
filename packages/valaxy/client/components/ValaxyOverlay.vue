<script lang="ts" setup>
withDefaults(defineProps<{
  show: boolean
}>(), {
  show: false,
})
</script>

<template>
  <transition name="fade">
    <div v-if="show" class="va-overlay" />
  </transition>
</template>

<style lang="scss">
@use "sass:map";

@use "valaxy/client/styles/vars" as *;
@use "valaxy/client/styles/mixins" as *;

.va-overlay {
  background-color: rgba(0, 0, 0, 0.3);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
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
