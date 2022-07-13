<script lang="ts" setup>
import { useCategory, usePageList, useSidebar } from 'valaxy'

defineProps<{
  open: boolean
}>()

const pages = usePageList()
const categories = useCategory('', pages.value)

const { hasSidebar } = useSidebar()
</script>

<template>
  <aside
    v-if="hasSidebar"
    class="press-sidebar shadow-lg" :class="{ open }"
    @click.stop
  >
    <div text="left" m="2">
      <PressCategories :categories="categories.children" :collapsable="false" />
    </div>
  </aside>
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

@media (min-width: 960px) {
  .press-sidebar {
    z-index: 1;
    padding-top: var(--vp-nav-height-desktop);
    padding: 1rem 0;
    width: var(--pr-sidebar-width);
    max-width: 100%;
    background-color: var(--va-c-bg-alt);
    opacity: 1;
    visibility: visible;
    box-shadow: none;
    transform: translateX(0);
  }
}
</style>
