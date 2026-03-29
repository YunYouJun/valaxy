<script setup lang="ts">
import { useAppStore, useSiteConfig, useValaxyI18n } from 'valaxy'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../../../composables'
import { useYunAppStore } from '../../../stores'

const { $t } = useValaxyI18n()

// const app = useAppStore()
const yunApp = useYunAppStore()
const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()

// Always render the menu to avoid SSG hydration mismatch.
// On home page, the fade-in animation is applied after mount.
const showMenu = ref(true)
const route = useRoute()
if (!import.meta.env.SSR) {
  // During client-side navigation to home, re-trigger the fade-in
  onMounted(() => {
    if (route.meta.layout === 'home') {
      showMenu.value = false
      setTimeout(() => {
        showMenu.value = true
      }, 600)
    }
  })
}

const playAnimation = ref(false)
watch(() => yunApp.scrollY, () => {
  if (yunApp.scrollY > 10)
    playAnimation.value = true
  else
    playAnimation.value = false
})

const app = useAppStore()
</script>

<template>
  <Transition
    enter-active-class="animate-fade-in"
  >
    <div
      v-if="showMenu"
      class="yun-nav-menu z-$yun-z-nav-menu fixed bg-transparent"
      :class="{
        'shadow play': playAnimation,
      }"
    >
      <!--  -->
      <div class="inline-flex justify-start items-center flex-1">
        <ValaxyHamburger
          :active="yunApp.fullscreenMenu.isOpen"
          class="menu-btn sidebar-toggle leading-4 size-12 lg:hidden"
          inline-flex cursor="pointer"
          hover="bg-white/80 dark:bg-black/80"
          z="$yun-z-menu-btn"
          @click="yunApp.fullscreenMenu.toggle()"
        />
        <YunNavMenuItem icon="i-ri-home-4-line" to="/" />
        <div class="hidden lg:contents">
          <YunNavMenuItem
            v-for="item, i in themeConfig.nav"
            :key="i"
            :icon="item.icon"
            :to="item.link"
            :title="$t(item.text)"
          />
        </div>
      </div>

      <div class="flex flex-1 flex-center">
        <YunNavMenuTitle />
      </div>

      <div class="inline-flex-center justify-end items-center flex-1">
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
          class="rounded-none! hidden sm:inline-flex"
        />
        <YunToggleDark class="rounded-none!" transition />
        <YunSearchTrigger v-if="siteConfig.search.enable" />
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;
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
  transition: background-color var(--va-transition-duration-moderate) map.get($cubic-bezier, 'ease-in'),
    backdrop-filter var(--va-transition-duration-moderate) map.get($cubic-bezier, 'ease-in'),
    box-shadow var(--va-transition-duration-moderate) map.get($cubic-bezier, 'ease-in');

  &.play {
    background-color: var(--yun-nav-bg-color);
    backdrop-filter: blur(var(--yun-nav-blur));
    -webkit-backdrop-filter: blur(var(--yun-nav-blur));
  }

  .vt-hamburger-top, .vt-hamburger-middle, .vt-hamburger-bottom {
    background-color: var(--va-c-text);
  }
}
</style>
