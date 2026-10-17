<script setup lang="ts">
const props = withDefaults(defineProps<{
  /**
   * Whether the line draw animation is active.
   * When `true`, the line draws to full width via CSS transition.
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
.line {
  position: absolute;
  height: 1px;
  width: 0%;
  left: 0;
  background-color: var(--yun-prologue-divider-color, var(--va-c-text));
  transition: width 1s var(--yun-ease-in);

  &.enter {
    width: 100%;
  }
}
</style>
