<script lang="ts" setup>
import { computed } from 'vue'
import { useThemeConfig } from 'valaxy-theme-yun/composables'
import { useCssVar } from '@vueuse/core'
import { isDark } from 'valaxy'

const themeConfig = useThemeConfig()

const bgImgOpacity = useCssVar('--va-bg-img-opacity')
if (themeConfig.value.bg_image.opacity)
  bgImgOpacity.value = themeConfig.value.bg_image.opacity.toString() || '1'

const styles = computed(() => {
  return {
    backgroundImage: `url('${isDark.value
      ? themeConfig.value.bg_image.dark
      : themeConfig.value.bg_image.url
      }')`,
  }
})
</script>

<template>
  <div class="va-bg" :style="styles" />
</template>

<style lang="scss">
.va-bg {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-image: var(--va-bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  // avoid flicker
  background-attachment: fixed;
  animation-name: bgFadeIn;
  animation-duration: 2s;
  opacity: var(--va-bg-img-opacity, 1);
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
