<script lang="ts" setup>
withDefaults(defineProps<{
  show?: boolean
}>(), {
  show: false,
})
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="yun-overlay z-$yun-z-overlay" />
  </Transition>
</template>

<style lang="scss">
@use "sass:map";
@use "valaxy/client/styles/mixins/index.scss" as *;

.yun-overlay {
  background-color: rgb(0 0 0 / 0.5);
  position: fixed;
  inset: 0;
  transition: opacity var(--va-transition-duration-moderate);
}

@include mobile {
  .yun-overlay {
    display: block;
  }
}
</style>
