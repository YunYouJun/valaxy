<script lang="ts" setup>
import { useSiteConfig, useValaxyI18n } from 'valaxy'
import { computed, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'
import { useYunBanner } from '../composables/useYunBanner'
import { useYunAppStore } from '../stores'

const yun = useYunAppStore()

const route = useRoute()
const themeConfig = useThemeConfig()
const siteConfig = useSiteConfig()
const { $t } = useValaxyI18n()
const { bannerTitle } = useYunBanner(themeConfig.value.banner || { enable: true, title: '' })
const bannerTitleText = computed(() => {
  const raw = Array.isArray(bannerTitle.value) ? bannerTitle.value.join(' ') : bannerTitle.value
  return raw?.trim() || $t(siteConfig.value.title)
})
const prologueContent = useTemplateRef<HTMLElement>('prologueContent')

function shouldPlayIntro() {
  // If the CSS fallback has already shown the content, keep it on screen.
  const content = prologueContent.value
  return content !== null && getComputedStyle(content).visibility === 'hidden'
}

const isPage = computed(() => route.path.startsWith('/page'))

const showNotice = computed(() => {
  const notice = themeConfig.value?.notice
  return notice?.enable && (isPage.value ? !notice.hideInPages : true)
})
</script>

<template>
  <YunLayoutWrapper :no-margin="!isPage">
    <div class="yun-home-layout w-full flex flex-col items-center pb-4">
      <template v-if="themeConfig.banner?.enable">
        <template v-if="!isPage">
          <div class="w-full">
            <YunPrologue :class="{ 'yun-home-prologue': yun.isNimbo }" :grid="yun.isNimbo ? themeConfig.banner.grid : { enable: false }">
              <ClientOnly>
                <YunBanner :should-play-intro="shouldPlayIntro" />
                <template #fallback>
                  <div id="yun-banner-placeholder" class="w-full h-[var(--banner-container-height,100vh)]">
                    <h1 v-if="yun.isStrato" class="yun-sr-only">
                      {{ bannerTitleText }}
                    </h1>
                  </div>
                </template>
              </ClientOnly>
              <div
                v-if="yun.isNimbo"
                ref="prologueContent"
                class="yun-home-prologue-content absolute top-0 left-5 right-5 bottom-0 flex-center"
                :class="{ 'is-intro-complete': yun.bannerAnimationDone }"
              >
                <YunPrologueSquare class="z-1" :intro-complete="yun.bannerAnimationDone" />
              </div>
            </YunPrologue>
            <YunSay v-if="themeConfig.say?.enable" w="full" />
          </div>
        </template>
      </template>
      <div v-else class="h-$yun-nav-height" />

      <h1 v-if="isPage || !themeConfig.banner?.enable" class="yun-sr-only">
        {{ $t(siteConfig.title) }}
      </h1>

      <YunNotice
        v-if="showNotice"
        class="mb-4"
        :class="{
          'mt-4': !isPage,
        }"
        :content="themeConfig.notice?.content"
      />
      <div v-else-if="!isPage" class="mt-4" />

      <slot name="board" />

      <slot>
        <RouterView />
      </slot>
    </div>
  </YunLayoutWrapper>
</template>

<style scoped>
.yun-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}

@media (prefers-reduced-motion: no-preference) and (scripting: enabled) {
  .yun-home-prologue-content {
    transition: opacity 300ms ease-out, transform 300ms ease-out;
  }

  .yun-home-prologue-content:not(.is-intro-complete) {
    animation: yun-home-intro-fallback 1200ms step-end;
  }

  .yun-home-prologue :deep(#yun-banner.is-intro-playing) ~ .yun-home-prologue-content {
    animation: none;
    visibility: hidden;
    opacity: 0;
    transform: translateY(5px);
  }
}

@keyframes yun-home-intro-fallback {
  from {
    visibility: hidden;
    opacity: 0;
  }

  to {
    visibility: visible;
    opacity: 1;
  }
}

@media (width <= 768px) {
  .yun-home-prologue :deep(#yun-banner),
  .yun-home-prologue :deep(#yun-banner-placeholder) {
    position: absolute;
    inset: 0;
    height: 100%;
    pointer-events: none;
  }

  .yun-home-prologue :deep(#yun-banner .go-down) {
    pointer-events: auto;
  }

  .yun-home-prologue-content {
    position: relative;
    inset: auto;
    box-sizing: border-box;
    min-height: var(--banner-container-height, calc(100 * var(--vh, 1dvh)));
    padding: calc(var(--yun-nav-height) + 20px) 20px 36px;
  }
}
</style>
