<script setup lang="ts">
import { useAppStore, useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../../../composables'
import { useYunAppStore } from '../../../stores'

// const app = useAppStore()
const yunApp = useYunAppStore()
const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
const { t } = useI18n()

const route = useRoute()
const playAnimation = computed(() => yunApp.scrollY > 10)

const app = useAppStore()

const isHomePage = computed(() => route.meta.layout === 'home')
</script>

<template>
  <div class="fixed left-0 top-0 h-$yun-nav-height flex items-center" z="$yun-z-left-sidebar-menu">
    <ValaxyHamburger
      v-if="isHomePage"
      :active="yunApp.leftSidebar.isOpen"
      class="menu-btn sidebar-toggle leading-4 size-12"
      inline-flex cursor="pointer"
      hover="bg-white/80 dark:bg-black/80"
      @click="yunApp.leftSidebar.toggle()"
    />
    <template v-else>
      <ValaxyHamburger
        :active="yunApp.leftSidebar.isOpen"
        class="menu-btn sidebar-toggle leading-4 size-12 md:hidden!"
        inline-flex cursor="pointer"
        hover="bg-white/80 dark:bg-black/80"
        @click="yunApp.leftSidebar.toggle()"
      />
      <YunNavMenuItem class="hidden md:inline-flex" icon="i-ri-home-4-line" to="/" :label="t('menu.home')" />
    </template>
  </div>

  <div
    class="yun-nav-menu z-$yun-z-nav-menu fixed w-full flex justify-between items-center top-0"
    :class="{
      'is-home-nav': isHomePage,
      'play': playAnimation,
      'is-glass': themeConfig.navbar?.glass === 'always',
    }"
  >
    <!--  -->
    <div class="inline-flex justify-start items-center flex-1" />

    <div class="flex flex-1 flex-center">
      <YunNavMenuTitle />
    </div>

    <div class="inline-flex flex-1 justify-end items-center">
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
// glass background and its transition live on ::before in styles/common/nav.scss
.yun-nav-menu {
  height: var(--yun-nav-height, 50px);
}
</style>
