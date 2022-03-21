<script lang="ts" setup>
withDefaults(defineProps<{
  show: boolean
}>(), {
  show: false,
})
</script>

<template>
  <transition name="fade">
    <div v-if="show" class="val-overlay backdrop-filter backdrop-blur" />
  </transition>
</template>

<style lang="scss">
@use "sass:map";

@use "~/styles/vars" as *;
@use "~/styles/mixins" as *;

.val-overlay {
  background-color: rgba(0, 0, 0, 0.3);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: map.get($z-index, 'sidebar') - 1;
  transition: opacity 0.4s;

  display: none;

  &.fade-enter-from,
  &.fade-leave-to {
    opacity: 0;
  }
}

@include mobile {
  .val-overlay {
    display: block;
  }
}
</style>
