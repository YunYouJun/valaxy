<script lang="ts" setup>
import { useCategory, usePageList } from 'valaxy'

const pages = usePageList()
const categories = useCategory('Docs', pages.value)
</script>

<template>
  <div class="press-sidebar open shadow-lg">
    <div text="left" m="2">
      <PressCategories :categories="categories.children" :collapsable="false" />
    </div>
  </div>
</template>

<style lang="scss">
.press-sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: var(--pr-z-index-sidebar);
  padding: 32px 32px 96px;
  width: calc(100vw - 64px);
  max-width: 320px;
  background-color: var(--va-c-bg);
  opacity: 0;
  box-shadow: var(--vp-c-shadow-3);
  overflow-x: hidden;
  overflow-y: auto;
  transform: translateX(-100%);
  transition: opacity 0.5s, transform 0.25s ease;

  &.open {
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
    transition: opacity 0.25s,
                transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }
}
</style>
