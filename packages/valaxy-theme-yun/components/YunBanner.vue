<script lang="ts" setup>
/**
 * @file 生成首页标语动画
 * @author YunYouJun <me@yunyoujun.cn>
 * @description https://github.com/YunYouJun/hexo-theme-yun
 */

import type { CSSProperties } from 'vue'
import { sleep } from 'valaxy'
import { computed, onMounted, ref } from 'vue'
import { useThemeConfig } from '../composables'
import { useYunBanner } from '../composables/useYunBanner'
import { useYunAppStore } from '../stores'

const yun = useYunAppStore()
const themeConfig = useThemeConfig()

// height of top/bottom line

const { totalCharHeight, chars } = useYunBanner(themeConfig.value.banner)

const bannerStyles = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    '--total-char-height': `${totalCharHeight.value}rem`,
    '--banner-line-height': `calc(var(--banner-height, 100 * var(--vh)) / 2 - ${totalCharHeight.value / 2}rem)`,
    'justify-content': 'space-between',
  }
  if (yun.isStrato)
    styles.borderBottom = `1px solid var(--banner-line-color)`

  return styles
})

const lineStatus = ref<
  'enter' | 'active' | 'exit' | ''
>('enter')
const lineStatusClass = computed(() => {
  return lineStatus.value
})

const animationStatus = ref('banner')

onMounted(async () => {
  await sleep(500)
  lineStatus.value = 'active'
  if (yun.isNimbo) {
    await sleep(500)
    lineStatus.value = 'exit'

    animationStatus.value = 'prologue'
  }
})
</script>

<template>
  <div id="yun-banner" :style="bannerStyles">
    <div class="banner-line-container">
      <div
        class="banner-line vertical-line-top"
        :class="lineStatusClass"
      />
    </div>

    <template v-if="yun.isNimbo">
      <YunBannerCharContainer
        v-if="animationStatus === 'banner'"
        :title="themeConfig.banner.title"
        :chars="chars"
      />
      <YunPrologueSquare v-else class="z-1" />
    </template>
    <template v-if="yun.isStrato">
      <YunBannerCharContainer
        :title="themeConfig.banner.title"
        :chars="chars"
      />
    </template>

    <div class="banner-line-container bottom">
      <div
        class="banner-line vertical-line-bottom"
        :class="lineStatusClass"
      />
    </div>
    <YunGoDown />
  </div>
</template>

<style lang="scss">
@use "../styles/widgets/banner.scss" as *;
@use "../styles/modules/prologue.scss" as *;

:root {
  // banner
  --banner-line-color: black;
  --banner-char-color: black;
  --banner-char-bg-color: rgb(255 255 255 / 0.5);
  --banner-char-hover-color: white;
}

.dark {
  // banner
  --banner-line-color: white;
  --banner-char-color: white;
  --banner-char-bg-color: rgb(0 0 0 / 0.5);
  --banner-char-hover-color: black;
}
</style>
