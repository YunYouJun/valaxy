<script lang="ts" setup>
/**
 * @file 生成首页标语动画
 * @author YunYouJun <me@yunyoujun.cn>
 * @description https://github.com/YunYouJun/hexo-theme-yun
 */

import type { CSSProperties } from 'vue'
import { sleep } from 'valaxy'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'
import { useThemeConfig } from '../composables'
import { useYunBanner } from '../composables/useYunBanner'
import { useYunAppStore } from '../stores'

const props = defineProps<{
  shouldPlayIntro?: () => boolean
}>()

const yun = useYunAppStore()
const themeConfig = useThemeConfig()
const banner = useTemplateRef<HTMLElement>('banner')

// height of top/bottom line

const { totalCharHeight, chars, bannerTitle } = useYunBanner(themeConfig.value.banner || { enable: true, title: '' })

const bannerStyles = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    '--total-char-height': `${totalCharHeight.value}rem`,
    '--banner-line-height': `calc(var(--banner-height, 100 * var(--vh)) / 2 - ${totalCharHeight.value / 2}rem)`,
    'justify-content': 'space-between',
  }
  if (yun.isStrato)
    styles.borderBottom = `1px solid var(--yun-banner-divider-color, var(--banner-line-color))`

  return styles
})

const lineStatus = shallowRef<
  'enter' | 'active' | 'exit' | ''
>('')

const showIntroTitle = shallowRef(false)
let disposed = false

onMounted(async () => {
  yun.bannerAnimationDone = false

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (yun.isNimbo && (reducedMotion || props.shouldPlayIntro?.() === false)) {
    yun.bannerAnimationDone = true
    return
  }

  lineStatus.value = reducedMotion ? 'active' : 'enter'
  showIntroTitle.value = yun.isNimbo
  if (!reducedMotion)
    await sleep(500)
  if (disposed)
    return
  lineStatus.value = 'active'
  if (!yun.isNimbo)
    return

  await sleep(themeConfig.value.banner?.duration || 500)
  if (disposed)
    return

  lineStatus.value = 'exit'
  await nextTick()

  // The title fades while the lines retract. The profile waits for all three.
  const art = Array.from(banner.value?.querySelectorAll('.banner-line.exit, .yun-banner-intro-title.is-intro-exiting') ?? [])
  const exits = art.flatMap(part => part.getAnimations())
  await Promise.allSettled(exits.map(animation => animation.finished))
  if (disposed)
    return

  showIntroTitle.value = false
  lineStatus.value = ''
  yun.bannerAnimationDone = true
})

onBeforeUnmount(() => {
  disposed = true
  yun.bannerAnimationDone = false
})
</script>

<template>
  <div id="yun-banner" ref="banner" border="b-1px b-solid" :class="{ 'is-intro-playing': yun.isNimbo && lineStatus !== '' }" :style="bannerStyles">
    <div class="banner-line-container">
      <div
        class="banner-line vertical-line-top"
        :class="lineStatus"
      />
    </div>

    <template v-if="yun.isNimbo">
      <YunBannerCharContainer
        v-if="showIntroTitle"
        class="yun-banner-intro-title"
        :class="{ 'is-intro-exiting': lineStatus === 'exit' }"
        :title="bannerTitle"
        :chars="chars"
        aria-hidden="true"
      />
    </template>
    <template v-if="yun.isStrato">
      <YunBannerCharContainer
        :title="bannerTitle"
        :chars="chars"
      />
    </template>

    <div class="banner-line-container bottom">
      <div
        class="banner-line vertical-line-bottom"
        :class="lineStatus"
      />
    </div>
    <YunGoDown />
  </div>
</template>

<style lang="scss">
@use "../styles/widgets/banner.scss" as *;
@use "../styles/modules/prologue.scss" as *;

// --banner-* color tokens live in styles/css-vars.scss
#yun-banner {
  border-bottom-color: var(--yun-banner-divider-color, var(--banner-line-color));
}

.yun-banner-intro-title.is-intro-exiting {
  pointer-events: none;
  animation: yun-banner-title-exit 150ms ease-out both;
}

@keyframes yun-banner-title-exit {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
