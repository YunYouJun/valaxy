<script setup lang="ts">
import { useAppStore, useSiteConfig, useValaxyI18n } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../../../composables'
import { useYunAppStore } from '../../../stores'

const { $t } = useValaxyI18n()
const { t } = useI18n()

// const app = useAppStore()
const yunApp = useYunAppStore()
const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()

const route = useRoute()
const playAnimation = computed(() => yunApp.scrollY > 10)

const app = useAppStore()
</script>

<template>
  <div
    class="yun-nav-menu z-$yun-z-nav-menu fixed bg-transparent"
    :class="{
      'is-home-nav': route.meta.layout === 'home',
      'shadow play': playAnimation,
      'is-glass': themeConfig.navbar?.glass === 'always',
    }"
  >
    <!--  -->
    <div class="inline-flex justify-start items-center flex-1">
      <ValaxyHamburger
        :active="yunApp.fullscreenMenu.isOpen"
        class="menu-btn sidebar-toggle leading-4 size-12 lg:hidden!"
        inline-flex cursor="pointer"
        hover="bg-white/80 dark:bg-black/80"
        z="$yun-z-menu-btn"
        @click="yunApp.fullscreenMenu.toggle()"
      />
      <YunNavMenuItem icon="i-ri-home-4-line" to="/" :label="t('menu.home')" />
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

  .vt-hamburger-top, .vt-hamburger-middle, .vt-hamburger-bottom {
    background-color: var(--va-c-text);
  }
}
</style>
