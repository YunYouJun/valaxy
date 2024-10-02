<script setup lang="ts">
import { useValaxyDark } from 'valaxy'
import { computed } from 'vue'
// background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
const { isDark } = useValaxyDark()
const gradientStyles = computed(() => {
  if (isDark.value) {
    return {
      '--gradient-from': '0 0 0',
      '--gradient-to': '0 0 0',
    }
  }
  return {
    '--gradient-from': '161 196 253',
    '--gradient-to': '194 233 251',
  }
})
</script>

<template>
  <div class="yun-page-header-gradient" :style="gradientStyles" />
</template>

<style lang="scss">
.yun-page-header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 500px;
  z-index: 999;
  pointer-events: none;
  background: linear-gradient(to right,rgb(var(--gradient-from) / 0.2) 0,rgb(var(--gradient-to) / .2) 100%);
  mask-image: linear-gradient(#000,#fff0 70%);
  animation: fade-in 2s;
}
</style>
