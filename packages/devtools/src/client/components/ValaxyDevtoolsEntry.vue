<script setup lang="ts">
import { useDraggable } from '@vueuse/core'
import { ref } from 'vue'
import { useAppStore } from '../stores/app'

const entryRef = ref()
const { style } = useDraggable(entryRef, {
  initialValue: {
    x: 12,
    y: window.innerHeight - 60,
  },
})

const app = useAppStore()
</script>

<template>
  <div ref="entryRef" :style="style" class="fixed z-9999999999 valaxy-devtools-entry">
    <button
      class="bg-white size-10 rounded-full shadow hover:shadow-lg transition p-1 z-1 cursor-pointer"
      @click="app.isDevtoolsVisible = !app.isDevtoolsVisible"
    >
      <ValaxySvgLogo />
    </button>
  </div>

  <template v-if="app.isDevtoolsVisible">
    <ValaxyOverlay
      class="z-9999999998! op-50"
      :show="app.isDevtoolsVisible"
      @click="app.isDevtoolsVisible = !app.isDevtoolsVisible"
    />
    <div
      v-if="app.isDevtoolsVisible"
      class="valaxy-devtools-container fixed left-0 right-0 bottom-1 z-9999999999 shadow-xl rounded overflow-hidden m-auto"
      bg-white dark:bg-dark-800
    >
      <ValaxyDevtools />
    </div>
  </template>
</template>

<style lang="scss" scoped>
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;

.valaxy-devtools-entry {
  position: fixed;
}

.valaxy-devtools-container {
  animation-timing-function: map.get($cubic-bezier, "ease-in");
  width: min(80vw, -48px + 100vw);
  height: min(60vh, -48px + 100vh);
  transform: translate(0, 0);
}
</style>
