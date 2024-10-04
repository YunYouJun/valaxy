<script setup lang="ts">
defineProps<{
  item: {
    url: string
    icon: string
    color: string
  }
}>()
</script>

<template>
  <a
    class="yun-project-link-item inline-flex items-center justify-center flex-1 p-2 h-full text-white"
    :href="item.url" target="_blank"
    :style="{
      '--c-brand': item.color,
    }"
  >
    <div :class="item.icon" />
  </a>
</template>

<style lang="scss">
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;

.yun-project-link-item {
  position: relative;
  background-color: rgb(0 0 0 / 0.05);
  transition: background-color 0.3s;

  &::before {
    content: '';
    position: absolute;
    background-color: var(--c-brand);
    transition: all 0.3s map.get($cubic-bezier, 'ease-in');
    bottom: 0;
    left: 0;
    right: 0;
    height: 0;
  }

  &::after {
    content: '';
    position: absolute;
    background-color: var(--c-brand);
    transition: all 0.3s map.get($cubic-bezier, 'ease-in');
    inset: 0;
    opacity: 0.1;
    z-index: -1;
  }

  &:hover {
    &::before {
      height: 40px;
      opacity: 0.8;
    }
  }
}
</style>
