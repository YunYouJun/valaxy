<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useData, useFrontmatter } from 'valaxy'
import { useAppStore } from 'valaxy/client/stores/app'

const frontmatter = useFrontmatter()
const data = useData()
const { t } = useI18n()
const app = useAppStore()
</script>

<template>
  <button
    class="xl:hidden toc-btn shadow fixed yun-icon-btn z-350"
    opacity="75" right="2" bottom="19"
    @click="app.toggleRightSidebar()"
  >
    <div i-ri-file-list-line />
  </button>

  <ValaxyOverlay :show="app.isRightSidebarOpen" @click="app.toggleRightSidebar()" />

  <!--  -->
  <aside class="va-card aside" :class="app.isRightSidebarOpen && 'open'" m="l-4" text="center">
    <div class="aside-container" flex="~ col">
      <h2 v-if="frontmatter.toc !== false" m="t-6 b-2" font="serif black">
        {{ t('sidebar.toc') }}
      </h2>

      <YunToc v-if="frontmatter.toc !== false" :headers="data.headers || []" />

      <div class="flex-grow" />

      <div v-if="$slots.default" class="custom-container">
        <slot />
      </div>
    </div>
  </aside>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins' as *;

.aside {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;

  min-width: var(--va-sidebar-width);

  transform: translateX(100%);

  transition: box-shadow var(--va-transition-duration),
  background-color var(--va-transition-duration), opacity 0.25s,
  transform var(--va-transition-duration) cubic-bezier(0.19, 1, 0.22, 1);

  &.open {
    right: 0;
    display: block;
    z-index: 10;
    transform: translateX(0);
  }

  &-container {
    position: sticky;
    top: 0;
    height: 100vh;
  }
}

@include media('xl') {
  .aside {
    transform: translateX(0);
  }
}

.toc-btn {
  color: var(--va-c-primary);
  background-color: white;
}
</style>
