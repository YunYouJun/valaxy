<script lang="ts" setup>
/**
 * @file 生成首页标语动画
 * @author YunYouJun <me@yunyoujun.cn>
 * @description https://github.com/YunYouJun/hexo-theme-yun
 */

import type { CSSProperties } from 'vue'
import { computed } from 'vue'
import { random } from 'valaxy'
import { useThemeConfig } from '../composables'

const themeConfig = useThemeConfig()

const chars = computed(() => {
  const arr = []
  for (let i = 0; i < themeConfig.value.banner.title.length; i++) {
    const rn = random(1.5, 3.5)
    arr.push(rn)
  }
  return arr
})
// height of top/bottom line
const lineH = computed(() => chars.value.reduce((a, b) => a + b, 0) / 2)

const bannerStyles = computed<CSSProperties>(() => {
  return {
    '--banner-line-height': `calc(var(--banner-height, 100vh) / 2 - ${lineH.value}rem)`,
  }
})
</script>

<template>
  <div id="banner" :style="bannerStyles">
    <div class="banner-line-container">
      <div class="banner-line vertical-line-top" />
    </div>
    <div class="banner-char-container">
      <div v-for="c, i in themeConfig.banner.title" :key="i" class="char-box">
        <span
          :class="[i % 2 !== 0 ? 'char-right' : 'char-left']" :style="{
            '--banner-char-size': `${chars[i]}rem`,
          } as CSSProperties"
        >
          <span class="char">
            {{ c }}
          </span>
        </span>
      </div>
    </div>
    <div class="banner-line-container bottom">
      <div class="banner-line vertical-line-bottom" />
    </div>
    <YunCloud v-if="themeConfig.banner.cloud?.enable" />
    <YunGoDown />
  </div>
</template>

<style lang="scss">
:root {
  // banner
  --banner-line-color: black;
  --banner-char-color: black;
  --banner-char-bg-color: rgba(255, 255, 255, 0.5);
  --banner-char-hover-color: white;
}

.dark {
  // banner
  --banner-line-color: white;
  --banner-char-color: white;
  --banner-char-bg-color: rgba(0, 0, 0, 0.5);
  --banner-char-hover-color: black;
}
</style>
