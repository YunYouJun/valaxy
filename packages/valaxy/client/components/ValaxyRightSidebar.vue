<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { Post } from 'valaxy/types'
import { useAppStore } from '~/stores/app'
defineProps<{ frontmatter: Post }>()
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

  <aside class="right-sidebar fixed va-card" :class="app.isRightSidebarOpen && 'open'" m="l-4" text="center">
    <h2 v-if="frontmatter.toc !== false" m="t-6 b-2" font="serif black">
      {{ t('sidebar.toc') }}
    </h2>

    <div class="right-sidebar-container">
      <ValaxyToc v-if="frontmatter.toc !== false" />

      <div v-if="$slots.custom" class="custom-container">
        <slot name="custom" />
      </div>
    </div>
  </aside>
</template>

<style lang="scss">
@use '~/styles/mixins' as *;

@include xl {
  .right-sidebar {
    transform: translateX(0) !important;
  }
}

.right-sidebar {
  width: var(--va-sidebar-width-mobile);

  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;

  transform: translateX(100%);

  transition: box-shadow var(--va-transition-duration),
  background-color var(--va-transition-duration), opacity 0.25s,
  transform var(--va-transition-duration) cubic-bezier(0.19, 1, 0.22, 1);

  &.open {
    z-index: 10;
    transform: translateX(0);
  }
}
.right-sidebar-container {
  top: 1rem;
}

.toc-btn {
  color: var(--va-c-primary);
  background-color: white;
}
</style>
