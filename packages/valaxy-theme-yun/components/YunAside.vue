<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useFrontmatter } from 'valaxy'
import { computed, nextTick, ref, watch } from 'vue'
import { useYunAppStore } from '../stores'

const fm = useFrontmatter()
const { t } = useI18n()
const yun = useYunAppStore()

const show = ref(false)
const showToc = computed(() => {
  return fm.value.toc !== false
})

// aside float
const isAsideFloat = ref(false)

watch(() => [yun.rightSidebar.isOpen, yun.size.isXl], async () => {
  await nextTick()
  isAsideFloat.value = !yun.size.isXl
  show.value = (yun.rightSidebar.isOpen || !isAsideFloat.value) && fm.value.aside !== false
}, {
  immediate: true,
})
</script>

<template>
  <aside
    flex="~ col"
    class="va-card yun-aside sticky top-0 lg:top-68px min-h-sm"
    :class="{
      float: isAsideFloat,
      show,
      open: yun.rightSidebar.isOpen,
    }"
    text="center"
    overflow="auto"
  >
    <Transition name="fade" :delay="100">
      <div v-show="show" class="w-full" flex="~ col">
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
    </Transition>
  </aside>
</template>

<style lang="scss">
@use 'sass:map';
@use 'valaxy/client/styles/mixins/index.scss' as *;
@use 'valaxy-theme-yun/styles/vars.scss' as *;

.yun-aside {
  // need fixed width
  // width: var(--va-sidebar-width, 300px);
  width: 0;
  transform: translateX(100%);
  transition: all 0.2s map.get($cubic-bezier, 'ease-in-out');
  max-height: calc(100vh - 68px);

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

  &.open {
    width: 320px;
    right: 0;
    display: block;
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
  z-index: var(--yun-z-toc-btn);
}
</style>
