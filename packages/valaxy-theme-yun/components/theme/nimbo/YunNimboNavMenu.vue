<script setup lang="ts">
import { useAppStore, useSiteConfig, useValaxyI18n } from 'valaxy'
import { computed, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../../../composables'
import { useYunAppStore } from '../../../stores'

type HomeNavIntroState = 'pending' | 'playing' | 'arriving' | 'settled'

const { $t } = useValaxyI18n()
const { t } = useI18n()

// const app = useAppStore()
const yunApp = useYunAppStore()
const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()

const route = useRoute()
const playAnimation = computed(() => yunApp.scrollY > 10)

const app = useAppStore()

const navMenuRef = useTemplateRef<HTMLElement>('navMenuRef')
const isHomeRoot = computed(() =>
  route.meta.layout === 'home' && !route.path.startsWith('/page'),
)
const isHomeBannerPage = computed(() =>
  isHomeRoot.value && Boolean(themeConfig.value.banner?.enable),
)

// Deterministic initial state identical across SSR and client hydration.
const introState = shallowRef<HomeNavIntroState>(isHomeBannerPage.value ? 'pending' : 'settled')

function syncIntroState() {
  if (typeof window === 'undefined' || introState.value === 'settled')
    return

  if (!isHomeBannerPage.value) {
    introState.value = 'settled'
    return
  }

  // Keep the drop-in animation running until onNavAnimationEnd clears it,
  // because YunBanner updates bannerAnimationDone and bannerIntroPlaying in the same tick.
  if (introState.value === 'arriving')
    return

  const scrolled = playAnimation.value || window.scrollY > 10
  if (scrolled) {
    introState.value = introState.value === 'playing' ? 'arriving' : 'settled'
    return
  }

  if (yunApp.bannerAnimationDone) {
    introState.value = introState.value === 'playing' ? 'arriving' : 'settled'
    return
  }

  if (yunApp.bannerIntroPlaying && introState.value === 'pending')
    introState.value = 'playing'
}

function onNavAnimationEnd(event: AnimationEvent) {
  if (event.target !== event.currentTarget)
    return
  if (
    (introState.value === 'arriving' && event.animationName === 'yun-nav-drop-in')
    || (introState.value === 'pending' && event.animationName === 'yun-nav-intro-fallback')
  ) {
    introState.value = 'settled'
  }
}

onMounted(() => {
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || (introState.value === 'pending' && navMenuRef.value && getComputedStyle(navMenuRef.value).visibility !== 'hidden')
  ) {
    introState.value = 'settled'
    return
  }
  syncIntroState()
})

// Sync flush keeps the navbar drop-in on the exact same DOM update frame as .is-intro-complete.
watch(
  () => [
    isHomeBannerPage.value,
    playAnimation.value,
    yunApp.bannerIntroPlaying,
    yunApp.bannerAnimationDone,
  ],
  syncIntroState,
  { flush: 'sync' },
)
</script>

<template>
  <div
    ref="navMenuRef"
    class="yun-nav-menu is-nimbo-nav z-$yun-z-nav-menu fixed bg-transparent"
    :class="{
      'is-home-nav': route.meta.layout === 'home',
      'is-home-intro-pending': introState === 'pending',
      'is-home-intro-playing': introState === 'playing',
      'is-home-intro-arrive': introState === 'arriving',
      'shadow play': playAnimation,
      'is-glass': themeConfig.navbar?.glass === 'always',
    }"
    @animationend="onNavAnimationEnd"
  >
    <!--  -->
    <div class="inline-flex justify-start items-center flex-1 gap-1">
      <ValaxyHamburger
        :active="yunApp.fullscreenMenu.isOpen"
        class="menu-btn sidebar-toggle yun-action-btn leading-4 lg:hidden!"
        z="$yun-z-menu-btn"
        @click="yunApp.fullscreenMenu.toggle()"
      />
      <YunNavMenuItem
        :class="{ 'hidden lg:inline-flex': isHomeRoot }"
        icon="i-ri-home-4-line"
        to="/"
        :label="t('menu.home')"
      />
      <div class="hidden lg:contents">
        <YunNavMenuItem
          v-for="item, i in themeConfig.nav"
          :key="i"
          :icon="item.icon"
          :to="item.link"
          :label="$t(item.text)"
        />
      </div>
    </div>

    <div class="flex flex-1 flex-center">
      <YunNavMenuTitle />
    </div>

    <div class="inline-flex justify-end items-center flex-1 gap-1">
      <!-- <template v-if="!app.isMobile && themeConfig.nav">
        <template v-for="item in themeConfig.nav" :key="item.text">
          <AppLink
            v-if="'link' in item"
            :to="item.link"
            class="menu-btn inline-flex-center p-2 transition text-$va-c-text"
            inline-flex cursor="pointer"
            hover="bg-white/80 dark:bg-black/80"
            z="$yun-z-menu-btn"
          >
            {{ item.text }}
          </AppLink>
          <template v-else-if="'items' in item" />
        </template>
      </template> -->

      <YunToggleLocale
        v-if="app.showToggleLocale"
        class="hidden sm:inline-flex"
      />
      <YunToggleDark transition />
      <YunSearchTrigger v-if="siteConfig.search.enable" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "valaxy/client/styles/mixins/index.scss" as *;

.yun-nav-menu {
  // safari not support
  // animation-timeline: scroll();
  // animation-range: 0 calc(30vh), exit;
  display: flex;

  // top: var(--rect-margin);
  // left: var(--rect-margin);
  // right: var(--rect-margin);

  top: 0;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: space-between;
  height: var(--yun-nav-height, 50px);
  transition: background-color var(--va-transition-duration-moderate) var(--yun-ease-in),
    backdrop-filter var(--va-transition-duration-moderate) var(--yun-ease-in),
    box-shadow var(--va-transition-duration-moderate) var(--yun-ease-in);
}
</style>
