<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'
import { useYunAppStore } from '../stores'

const yun = useYunAppStore()

const route = useRoute()
const themeConfig = useThemeConfig()

const isPage = computed(() => route.path.startsWith('/page'))

const showNotice = computed(() => {
  const notice = themeConfig.value?.notice
  return notice?.enable && (isPage.value ? !notice.hideInPages : true)
})
</script>

<template>
  <YunLayoutWrapper :no-margin="!isPage">
    <div class="w-full flex flex-col items-center pb-4">
      <template v-if="themeConfig.banner?.enable">
        <template v-if="!isPage">
          <div class="w-full">
            <YunPrologue :class="{ 'yun-home-prologue': yun.isNimbo }" :grid="yun.isNimbo ? themeConfig.banner.grid : { enable: false }">
              <ClientOnly>
                <YunBanner />
                <template #fallback>
                  <div id="yun-banner-placeholder" class="w-full h-[var(--banner-container-height,100vh)]" />
                </template>
              </ClientOnly>
              <div
                v-if="yun.isNimbo"
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
@media (width > 768px) {
  .yun-home-prologue-content {
    visibility: hidden;
    opacity: 0;
    scale: 0.6;
    transition: opacity 800ms var(--yun-ease-in-out), scale 300ms var(--yun-ease-in-out);
  }

  .yun-home-prologue-content.is-intro-complete {
    visibility: visible;
    opacity: 1;
    scale: 1;
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

  /* Keep the original animation in the gutter outside the content padding. */
  .yun-home-prologue :deep(#yun-banner .banner-line-container),
  .yun-home-prologue :deep(#yun-banner .banner-char-container) {
    align-self: flex-start;
    width: 20px;
    overflow: hidden;
    opacity: 0.55;
  }

  .yun-home-prologue :deep(#yun-banner .banner-char-container) {
    --banner-empty-border-size: 0px;
  }

  .yun-home-prologue :deep(#yun-banner .char) {
    font-size: 0.75rem;
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
