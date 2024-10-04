<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useFrontmatter } from 'valaxy'
import { onMounted, ref } from 'vue'
import { useYunAppStore } from '../stores'

const frontmatter = useFrontmatter()
const { t } = useI18n()
const yun = useYunAppStore()

const show = ref(false)
onMounted(() => {
  setTimeout(() => {
    show.value = true
  }, 0)
})
</script>

<template>
  <button
    class="xl:hidden toc-btn shadow fixed yun-icon-btn z-350"
    opacity="75" right="2" bottom="19"
    @click="yun.rightSidebar.toggle()"
  >
    <div i-ri-file-list-line />
  </button>

  <ValaxyOverlay :show="yun.rightSidebar.isOpen" @click="yun.rightSidebar.toggle()" />

  <!--  -->
  <aside
    v-if="yun.rightSidebar.isOpen || yun.size.isXl"
    flex="~ col"
    class="va-card yun-aside sticky top-68px min-h-sm w-80"
    :class="{
      show,
      open: yun.rightSidebar.isOpen,
    }"
    text="center"
    overflow="auto"
  >
    <Transition name="fade">
      <div v-show="show" class="w-full" flex="~ col">
        <h2 v-if="frontmatter.toc !== false" m="t-6 b-2" font="serif black">
          {{ t('sidebar.toc') }}
        </h2>

        <YunOutline v-if="frontmatter.toc !== false" />

        <div class="flex-grow" />

        <div v-if="$slots.default" class="custom-container">
          <slot />
        </div>
      </div>
    </Transition>
  </aside>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins/index.scss' as *;

.yun-aside {
  // need fixed width
  // width: var(--va-sidebar-width, 300px);
  width: 0;
  transform: translateX(100%);
  transition:
  width var(--va-transition-duration),
  box-shadow var(--va-transition-duration),
  background-color var(--va-transition-duration), opacity 0.25s,
  transform var(--va-transition-duration) cubic-bezier(0.19, 1, 0.22, 1);
  max-height: calc(100vh - 68px);

  &.show {
    width: 320px;
  }

  &.open {
    width: 320px;
    right: 0;
    display: block;
    z-index: 10;
    transform: translateX(0);
  }
}

@include screen('xl') {
  .yun-aside {
    transform: translateX(0);
  }
}

.toc-btn {
  color: var(--va-c-primary);
  background-color: white;
  z-index: var(--yun-z-toc-btn);
}
</style>
