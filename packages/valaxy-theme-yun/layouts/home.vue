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
              <Transition
                v-if="yun.isNimbo && yun.bannerAnimationDone"
                enter-from-class="scale-60"
                enter-to-class="scale-100"
                enter-active-class="transition-300 transition-cubic-bezier-ease-in-out"
                appear
              >
                <div class="yun-home-prologue-content absolute top-0 left-5 right-5 bottom-0 flex-center">
                  <Transition
                    enter-from-class="op-0"
                    enter-to-class="op-100"
                    enter-active-class="transition-800"
                    appear
                  >
                    <YunPrologueSquare class="z-1" />
                  </Transition>
                </div>
              </Transition>
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
@media (width <= 768px) {
  .yun-home-prologue {
    display: grid;
  }

  .yun-home-prologue :deep(#yun-banner),
  .yun-home-prologue :deep(#yun-banner-placeholder) {
    grid-area: 1 / 1;
    height: 100%;
  }

  .yun-home-prologue-content {
    grid-area: 1 / 1;
    position: relative;
    inset: auto;
    box-sizing: border-box;
    min-height: var(--banner-container-height, calc(100 * var(--vh)));
    padding: calc(var(--yun-nav-height) + 20px) 20px 36px;
  }
}
</style>
