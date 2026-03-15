<script lang="ts" setup>
import { useAppStore } from 'valaxy'
import { onMounted, watch } from 'vue'
import { useThemeConfig } from '../composables'

const appStore = useAppStore()
const themeConfig = useThemeConfig()

/**
 * Set background image CSS variables only on client side (onMounted)
 * to avoid hydration mismatch caused by isDark / useCssVar during SSR.
 */
onMounted(() => {
  const bgConfig = themeConfig.value.bg_image
  if (typeof bgConfig?.url === 'undefined')
    return

  const root = document.documentElement

  if (bgConfig?.opacity != null)
    root.style.setProperty('--yun-bg-img-opacity', bgConfig.opacity.toString())

  function updateBgImg() {
    const url = appStore.isDark ? bgConfig?.dark : bgConfig?.url
    if (url)
      root.style.setProperty('--yun-bg-img', `url('${url}')`)
  }

  updateBgImg()
  watch(() => appStore.isDark, updateBgImg)
})
</script>

<template>
  <div class="yun-bg" />
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins/index.scss' as *;

.yun-bg {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: -1;
  top: 0;
  left: 0;
  background-image: var(--yun-bg-img);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  // avoid scroll flicker but not compatible with ios
  background-attachment: fixed;
  animation-name: bg-fade-in;
  animation-duration: 2s;
  opacity: var(--yun-bg-img-opacity, 1);
}

// for ios
@include ios {
  .yun-bg {
    background-attachment: scroll;
  }
}

@keyframes bg-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: var(--yun-bg-img-opacity, 1);
  }
}
</style>
