<script setup lang="ts">
import { onMounted, ref } from 'vue'

const slideIn = ref(false)
onMounted(() => {
  slideIn.value = true
})
</script>

<template>
  <div
    class="line" :class="{
      enter: slideIn,
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
  transition-delay: 1.2s;

  &.enter {
    width: 100%;
  }
}
</style>
