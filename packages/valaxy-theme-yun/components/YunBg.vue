<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useThemeConfig } from 'valaxy-theme-yun/composables'
import { useCssVar } from '@vueuse/core'
import { isDark } from 'valaxy'

const themeConfig = useThemeConfig()

const bgImgOpacity = useCssVar('--va-bg-img-opacity')
if (themeConfig.value.bg_image.opacity)
  bgImgOpacity.value = themeConfig.value.bg_image.opacity.toString() || '1'

const bgImgUrl = computed(() => {
  return isDark.value
    ? themeConfig.value.bg_image.dark
    : themeConfig.value.bg_image.url
})

const bgImgCssVar = useCssVar('--va-bg-img')

watch(() => bgImgUrl.value, () => {
  bgImgCssVar.value = `url('${bgImgUrl.value}')`
}, { immediate: true })
</script>

<template>
  <div class="va-bg" />
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins' as *;

.va-bg {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: -1;

  background-image: var(--va-bg-img);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  // avoid scroll flicker but not compatible with ios
  background-attachment: fixed;
  animation-name: bgFadeIn;
  animation-duration: 2s;
  opacity: var(--va-bg-img-opacity, 1);
}

// for ios
@include ios {
  .va-bg {
    background-attachment: scroll;
  }
}

@keyframes bgFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: var(--va-bg-img-opacity, 1);
  }
}
</style>
