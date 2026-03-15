<script setup lang="ts">
const props = withDefaults(defineProps<{
  /**
   * Whether the line draw animation is active.
   * When `true`, the line starts drawing (with CSS transition-delay).
   * @default true
   */
  active?: boolean
}>(), {
  active: true,
})
</script>

<template>
  <div
    class="line" :class="{
      enter: props.active,
    }"
  />
</template>

<style lang="scss" scoped>
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;

.line {
  position: absolute;
  height: 1px;
  width: 0%;
  left: 0;
  background-color: var(--va-c-text);
  transition: width 1s map.get($cubic-bezier, 'ease-in');

  &.enter {
    width: 100%;
  }
}
</style>
