<script setup lang="ts">
import { useMotion } from '@vueuse/motion'
import { ref } from 'vue'
import { cubicBezier } from '../../client/constants'
import { useThemeConfig } from '../../composables'

const themeConfig = useThemeConfig()

const showContent = ref(false)
const avatarRef = ref<HTMLElement>()
const motionInstance = useMotion(avatarRef, {
  initial: {
    borderRadius: '0%',
    width: 'var(--total-char-height)',
    height: 'var(--total-char-height)',
    rotate: 135,
    y: '0%',
  },
  enter: {
    borderRadius: '50%',
    rotate: 0,
    y: '0%',
    width: '120px',
    height: '120px',
    boxShadow: 'none',
    transition: {
      type: 'keyframes',
      ease: cubicBezier.easeIn,
      duration: 800,
      onComplete: () => {
        motionInstance.variant.value = 'leave'
        showContent.value = true
      },
    },
  },
  leave: {
    // y: '-50%',
    boxShadow: '0 5px 100px rgba(0, 0, 0, 0.15)',
    transition: {
      type: 'keyframes',
      ease: cubicBezier.easeInOut,
      duration: 500,
    },
  },
})

const introRef = ref<HTMLElement>()
useMotion(introRef, {
  initial: {
    y: '0%',
  },
  enter: {
    y: 'calc(-50%)',
    transition: {
      delay: 800,
      type: 'keyframes',
      ease: cubicBezier.easeInOut,
      duration: 400,
    },
  },
})
</script>

<template>
  <div
    flex="~ col"
    class="yun-square-container items-center justify-center text-center"
    :class="{
      'size-$total-char-height': !showContent,
    }"
  >
    <slot />

    <div
      ref="introRef"
      flex="~ col center"
      class="info relative"
    >
      <div
        ref="avatarRef" flex="~ col" class="absolute yun-square bg-$va-c-text square-rotate w-full"
      >
        <LineBurstEffects
          class="absolute top-0 left-0 right-0 bottom-0 size-full scale-200"
          :duration="800"
        />
        <YunAuthorAvatar />
      </div>

      <div
        v-if="showContent"
        v-motion
        :initial="{
          opacity: 0,
          y: '0',
        }"
        :enter="{
          opacity: 1,
          y: 'calc(50% + 60px)',
          transition: {
            type: 'keyframes',
            ease: cubicBezier.easeInOut,
            duration: 400,
          },
        }"
      >
        <YunAuthorName class="mt-3" />
        <YunAuthorIntro />

        <YunDivider />

        <div flex="~ col" class="gap-2 items-center justify-center">
          <YunSiteTitle />
          <YunSiteSubtitle />
          <YunSiteDescription />
        </div>

        <YunDivider />

        <div
          class="mt-4 flex-center w-50 md:w-100 m-auto gap-2"
          flex="~ wrap"
          p="x-$rect-margin"
        >
          <YunSiteLinkItem
            :page="{
              name: '博客文章',
              icon: 'i-ri-article-line',
              url: '/posts/',
            }"
          />
          <slot />
          <YunSiteLinkItem
            v-for="item, i in themeConfig.pages"
            :key="i" :page="item"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;
</style>
