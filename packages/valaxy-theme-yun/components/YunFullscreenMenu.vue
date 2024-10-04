<script setup lang="ts">
import { ref } from 'vue'
import { useYunAppStore } from '../stores'

const yunApp = useYunAppStore()
const fullscreenMenuRef = ref<HTMLElement>()
</script>

<template>
  <Transition name="slide-down">
    <div
      v-if="yunApp.fullscreenMenu.isOpen"
      ref="fullscreenMenuRef"
      p="t-20 md:t-26"
      class="yun-fullscreen-menu fixed left-0 right-0 bottom-0 top-0 bg-$va-c-bg-soft z-$yun-z-fullscreen-menu"
    >
      <YunSiteLinks>
        <YunSiteLinkItem
          :page="{
            name: '站点主页',
            icon: 'i-ri-home-2-line',
            url: '/',
          }"
        />
      </YunSiteLinks>

      <div class="flex-center gap-2">
        <YunToggleDark />
        <YunToggleLocale />
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;

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
</style>
