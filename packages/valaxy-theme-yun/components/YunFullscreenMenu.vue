<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from 'valaxy'
import { useYunAppStore } from '../stores'

const yunApp = useYunAppStore()
const fullscreenMenuRef = ref<HTMLElement>()

const app = useAppStore()
</script>

<template>
  <Transition :name="app.isMobile ? 'slide-down' : 'slide-left'">
    <div
      v-if="yunApp.fullscreenMenu.isOpen"
      ref="fullscreenMenuRef"
      p="t-20 md:t-26"
      class="yun-fullscreen-menu fixed left-0 right-0 bottom-0 top-0 bg-$va-c-bg-soft z-$yun-z-fullscreen-menu overflow-auto"
    >
      <!-- <div v-if="app.isMobile" class="flex-center gap-2">
        <YunToggleDark transition />
        <YunToggleLocale v-if="app.showToggleLocale" />
      </div> -->

      <div v-if="!yunApp.size.isLg" class="my-4">
        <YunSiteInfo class="text-center" />

        <YunGradientDivider class="my-2 op-20" />

        <YunPostsInfo />
      </div>
      <YunGradientDivider v-if="!yunApp.size.isLg" class="my-2 op-20" />

      <YunFullscreenMenuList />

      <YunGradientDivider v-if="!yunApp.size.isLg" class="my-2 op-20" />
      <div v-if="!yunApp.size.isLg" class="flex-center">
        <YunConfig />
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;

.slide-left-enter-active,
.slide-left-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  opacity: 1;
  transition: transform 0.4s map.get($cubic-bezier, 'ease-in-out'),
    opacity 0.2s map.get($cubic-bezier, 'ease-in-out');
  transform: translateY(0);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
</style>
