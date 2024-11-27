<script lang="ts" setup>
import { useCssVar } from '@vueuse/core'
import { useAppStore } from 'valaxy'
import { computed, watch } from 'vue'
import { useThemeConfig } from '../composables'

const appStore = useAppStore()
const themeConfig = useThemeConfig()

if (typeof themeConfig.value.bg_image.url !== 'undefined') {
  const bgImgOpacity = useCssVar('--yun-bg-img-opacity')
  if (themeConfig.value.bg_image.opacity)
    bgImgOpacity.value = themeConfig.value.bg_image.opacity.toString() || '1'

  const bgImgUrl = computed(() => {
    return appStore.isDark
      ? themeConfig.value.bg_image.dark
      : themeConfig.value.bg_image.url
  })

  const bgImgCssVar = useCssVar('--yun-bg-img')

  watch(() => bgImgUrl.value, () => {
    bgImgCssVar.value = `url('${bgImgUrl.value}')`
  }, { immediate: true })
}
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
