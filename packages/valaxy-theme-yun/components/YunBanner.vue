<script lang="ts" setup>
/**
 * @file 生成首页标语动画
 * @author YunYouJun <me@yunyoujun.cn>
 * @description https://github.com/YunYouJun/hexo-theme-yun
 */

import type { CSSProperties } from 'vue'
import { computed, onMounted, ref } from 'vue'
import { random, sleep } from 'valaxy'
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
const totalCharHeight = computed(() => chars.value.reduce((a, b) => a + b, 0))

const bannerStyles = computed<CSSProperties>(() => {
  return {
    '--total-char-height': `${totalCharHeight.value}rem`,
    '--banner-line-height': `calc(var(--banner-height, 100 * var(--vh)) / 2 - ${totalCharHeight.value / 2}rem)`,
    'justify-content': 'space-between',
  }
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
  await sleep(500)
  lineStatus.value = 'exit'

  animationStatus.value = 'prologue'
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
    <div v-if="animationStatus === 'banner'" class="banner-char-container">
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
    <PrologueSquare v-else class="z-1" />

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
