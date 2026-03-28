<script lang="ts" setup>
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useYunAppStore } from '../stores'

const fm = useFrontmatter()
const { t } = useI18n()
const yun = useYunAppStore()

const showToc = computed(() => {
  return fm.value.toc !== false
})

const asideEnabled = computed(() => fm.value.aside !== false)
</script>

<template>
  <aside
    v-if="asideEnabled"
    flex="~ col"
    class="va-card yun-aside min-h-sm rounded-2"
    :class="{ open: yun.rightSidebar.isOpen }"
    text="center"
    overflow="auto"
  >
    <div class="w-full" flex="~ col" pb-2>
      <template v-if="showToc">
        <h2
          m="t-6 b-2"
          font="serif black"
        >
          {{ t('sidebar.toc') }}
        </h2>
        <YunOutline />
      </template>

      <div class="flex-grow" />

      <div v-if="$slots.default" class="custom-container">
        <slot />
      </div>
    </div>
  </aside>
</template>

<style lang="scss">
@use 'sass:map';
@use 'valaxy/client/styles/mixins/index.scss' as *;
@use 'valaxy-theme-yun/styles/vars.scss' as *;

.yun-aside {
  // Below xl: fixed overlay panel, hidden by default
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: var(--yun-z-aside);
  width: 0;
  transform: translateX(100%);
  transition: all var(--va-transition-duration-fast) map.get($cubic-bezier, 'ease-in-out');
  max-height: calc(100vh - var(--yun-margin-top));

  // float panel
  &.float {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: var(--yun-z-aside);
    max-height: 100vh;
  }

  &.show {
    width: 320px;
  }

  // Mobile/tablet: toggle open via JS
  &.open {
    width: 320px;
    transform: translateX(0);
  }
}

// Desktop (xl+): aside is in normal flow, always visible
@include screen('xl') {
  .yun-aside {
    position: sticky;
    top: var(--yun-margin-top);
    z-index: auto;
    width: 320px;
    max-height: calc(100vh - var(--yun-margin-top));
    transform: translateX(0);

    // On xl, sidebar toggle should not affect layout
    &.open {
      width: 320px;
    }
  }
}

.toc-btn {
  color: var(--va-c-primary);
  z-index: var(--yun-z-toc-btn);
}
</style>
