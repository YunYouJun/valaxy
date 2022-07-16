<script lang="ts" setup>
// import { useI18n } from 'vue-i18n'
import { useData, useFrontmatter } from 'valaxy'
import { useAppStore } from 'valaxy/client/stores/app'

const frontmatter = useFrontmatter()
const data = useData()
// const { t } = useI18n()
const app = useAppStore()
</script>

<template>
  <button
    class="xl:hidden toc-btn shadow fixed press-icon-btn z-350"
    opacity="75" right="2" bottom="19"
    @click="app.toggleRightSidebar()"
  >
    <div i-ri-file-list-line />
  </button>

  <ValaxyOverlay :show="app.isRightSidebarOpen" @click="app.toggleRightSidebar()" />

  <aside
    class="press-aside lt-xl:fixed press-card xl:(shadow-none hover:shadow-none) shadow hover:shadow-lg"
    p="l-0 xl:l-4" text="center"
    z="10"
    :class="app.isRightSidebarOpen && 'open'"
  >
    <div class="aside-container lt-xl:pt-0" flex="~ col">
      <PressToc v-if="frontmatter.toc !== false" :headers="data.headers || []" />
      <div class="flex-grow" />
      <div v-if="$slots.default" class="custom-container">
        <slot />
      </div>
    </div>
  </aside>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins' as *;

.press-card{
  box-shadow: none;
  background-color: var(--va-c-bg);
}

.press-aside {
  position: relative;
  min-width: 272px;
  transform: translateX(100%);
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 10;

  transition: box-shadow var(--va-transition-duration), opacity 0.25s,
  transform var(--va-transition-duration) cubic-bezier(0.19, 1, 0.22, 1);

  &.open {
    display: block;
    transform: translateX(0);
  }
}

.aside-container {
  position: sticky;
  top: 0;
  margin-top: calc(var(--pr-nav-height) * -1 - 32px);
  padding-top: calc(var(--pr-nav-height) + 32px);
  height: 100vh;
}

@include media('xl') {
  .press-aside {
    transform: translateX(0);
  }
}

.toc-btn {
  color: var(--va-c-primary);
  background-color: var(--va-c-bg);
}
</style>
