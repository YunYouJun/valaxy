<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { PageData, Post } from 'valaxy'
import { useAppStore } from 'valaxy/client/stores/app'

defineProps<{ frontmatter: Post; data: PageData }>()
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

  <aside class="va-card aside" flex="~" :class="app.isRightSidebarOpen && 'open'" m="l-4" text="center">
    <div class="aside-container" flex="~ col grow">
      <h2 v-if="frontmatter.toc !== false" m="t-6 b-2" font="serif black">
        {{ t('sidebar.toc') }}
      </h2>

      <!-- <ValaxyToc v-if="frontmatter.toc !== false" /> -->
      <YunToc v-if="frontmatter.toc !== false" :headers="data.headers || []" />

      <div class="flex-grow" />

      <div v-if="$slots.default" class="custom-container">
        <slot />
      </div>
    </div>
  </aside>
</template>

<style lang="scss">
@use '~/styles/mixins' as *;

.aside {
  position: relative;

  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  // transform: translateX(100%);

  transition: box-shadow var(--va-transition-duration),
  background-color var(--va-transition-duration), opacity 0.25s,
  transform var(--va-transition-duration) cubic-bezier(0.19, 1, 0.22, 1);

  &.open {
    z-index: 10;
    // transform: translateX(0);
  }

  &-container {
    position: sticky;
    top: 0;
    width: var(--va-sidebar-width-mobile);
    height: 100vh;
  }
}

@include xl {
  .aside {
    transform: translateX(0) !important;
  }
}

.toc-btn {
  color: var(--va-c-primary);
  background-color: white;
}
</style>
