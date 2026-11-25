<script lang="ts" setup>
import { useAppStore } from 'valaxy'
import { nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import defaultLightBgUrl from '../assets/images/light/bg-img.jpg'
import { useThemeConfig } from '../composables'

const DEFAULT_DARK_BG_RE = /^radial-gradient\((?:circle\s+)?at\s+50%\s+0%,\s*rgb\(27,\s*33,\s*49\),\s*rgb\(17,\s*19,\s*26\)\s*72%\)$/i

const appStore = useAppStore()
const themeConfig = useThemeConfig()
const bgRef = useTemplateRef<HTMLElement>('bgRef')
let stopBgWatch: (() => void) | undefined
let disposed = false

function isDefaultLightBg(computedBg: string): boolean {
  const match = computedBg.match(/^url\(["']?(.+?)["']?\)$/i)
  if (!match)
    return false
  try {
    return new URL(match[1], window.location.href).href === new URL(defaultLightBgUrl, window.location.href).href
  }
  catch {
    return match[1] === defaultLightBgUrl
  }
}

function hasCustomComputedBg(): boolean {
  const el = bgRef.value
  if (!el)
    return false
  const computedBg = getComputedStyle(el).backgroundImage.trim()
  if (!computedBg || computedBg === 'none')
    return false
  return appStore.isDark
    ? !DEFAULT_DARK_BG_RE.test(computedBg)
    : !isDefaultLightBg(computedBg)
}

/**
 * Set background image CSS variables only on client side (onMounted)
 * to avoid hydration mismatch caused by isDark / useCssVar during SSR.
 */
onMounted(() => {
  const bgConfig = themeConfig.value.bg_image
  const root = document.documentElement

  if (bgConfig?.opacity != null)
    root.style.setProperty('--yun-bg-img-opacity', bgConfig.opacity.toString())

  function updateBgImg() {
    if (disposed)
      return
    const url = appStore.isDark ? bgConfig?.dark : bgConfig?.url
    if (url) {
      root.style.setProperty('--yun-bg-img', `url('${url}')`)
      root.dataset.yunCustomBg = 'true'
    }
    else {
      root.style.removeProperty('--yun-bg-img')
      if (hasCustomComputedBg())
        root.dataset.yunCustomBg = 'true'
      else
        delete root.dataset.yunCustomBg
    }
  }

  updateBgImg()
  stopBgWatch = watch(() => appStore.isDark, async () => {
    await nextTick()
    updateBgImg()
  })
})

onBeforeUnmount(() => {
  disposed = true
  stopBgWatch?.()
  stopBgWatch = undefined
  if (typeof document !== 'undefined')
    delete document.documentElement.dataset.yunCustomBg
})
</script>

<template>
  <div ref="bgRef" class="yun-bg" />
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
