<script lang="ts" setup>
import { useAppStore, useFrontmatter } from 'valaxy'
import PressOutline from './PressOutline.vue'

const frontmatter = useFrontmatter()
const app = useAppStore()
</script>

<template>
  <button
    class="toc-btn shadow-lg fixed press-icon-btn z-99 xl:hidden!"
    right="5" bottom="8"
    @click="app.toggleRightSidebar()"
  >
    <div i-ri-file-list-line />
  </button>

  <ValaxyOverlay :show="app.isRightSidebarOpen" @click="app.toggleRightSidebar()" />

  <aside
    class="press-aside lt-xl:fixed shadow xl:(shadow-none hover:shadow-none) hover:shadow-lg"
    flex="~ col grow"
    p="l-0 xl:l-8" text="center"
    z="$"
    :class="app.isRightSidebarOpen && 'open'"
    bg="$va-c-bg"
  >
    <div class="aside-curtain" />
    <div class="aside-container lt-xl:fixed" flex="~ col">
      <div class="aside-content overflow-auto" flex="~ col">
        <PressOutline v-if="frontmatter.toc !== false" />
        <div class="flex-grow" />
        <div v-if="$slots.default" class="custom-container">
          <slot />
        </div>
      </div>
    </div>
  </aside>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins/index.scss' as *;

.press-aside {
  top: 0;
  bottom: 0;
  right: 0;
  z-index: var(--pr-z-aside);
  width: var(--va-aside-width);

  transform: translateX(100%);

  transition: box-shadow var(--va-transition-duration), opacity 0.25s,
  transform var(--va-transition-duration) cubic-bezier(0.19, 1, 0.22, 1);

  &.open {
    position: fixed;
    right: 0;
    display: block;
    transform: translateX(0);
  }
}

.aside-container {
  position: sticky;
  top: 0;
  margin-top: calc(var(--pr-nav-height) * -1 - 20px);
  padding-top: calc(var(--pr-nav-height) + 20px);
  height: 100vh;
}

.aside-curtain {
  position: fixed;
  bottom: 0;
  z-index: 10;
  width: 220px;
  height: 32px;
  background: linear-gradient(transparent,var(--va-c-bg) 70%);
}

@include screen('xl') {
  .aside-container {
    top: 0;
  }

  .press-aside {
    transform: translateX(0);
  }
}

.toc-btn {
  color: var(--va-c-bg);
  background-color: var(--va-c-primary);
}
</style>
