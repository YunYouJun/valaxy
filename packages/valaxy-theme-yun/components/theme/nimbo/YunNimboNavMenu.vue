<script setup lang="ts">
import { useAppStore, useSiteConfig } from 'valaxy'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../../../composables'
import { useYunAppStore } from '../../../stores'

// const app = useAppStore()
const yunApp = useYunAppStore()
const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()

const showMenu = ref(false)
const route = useRoute()
onMounted(() => {
  if (route.meta.layout === 'home') {
    setTimeout(() => {
      showMenu.value = true
    }, 600)
  }
  else {
    showMenu.value = true
  }
})

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
        play: playAnimation,
      }"
    >
      <!--  -->
      <div class="inline-flex justify-start items-center flex-1">
        <ValaxyHamburger
          v-if="!yunApp.size.isLg"
          :active="yunApp.fullscreenMenu.isOpen"
          class="menu-btn sidebar-toggle leading-4 size-12"
          inline-flex cursor="pointer"
          hover="bg-white/80 dark:bg-black/80"
          z="$yun-z-menu-btn"
          @click="yunApp.fullscreenMenu.toggle()"
        />
        <YunNavMenuItem icon="i-ri-home-4-line" to="/" />
        <template v-if="yunApp.size.isLg">
          <YunNavMenuItem
            icon="i-ri-article-line" to="/posts/"
            title="博客文章"
          />

          <YunNavMenuItem
            v-for="item, i in themeConfig.pages"
            :key="i"
            :icon="item.icon"
            :to="item.url"
            :title="item.name"
          />
        </template>
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
          v-if="yunApp.size.isSm && app.showToggleLocale"
          class="rounded-none!"
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
  box-shadow: none;
  display: flex;
  // top: var(--rect-margin);
  // left: var(--rect-margin);
  // right: var(--rect-margin);

  top: 0;
  left: 0;
  right: 0;

  align-items: center;
  justify-content: space-between;
  height: 50px;
  transition: all 0.5s map.get($cubic-bezier, 'ease-in');

  &.play {
    top: 0;
    left: 0;
    right: 0;
    background-color: var(--va-c-bg);
    border-color: rgb(0 0 0 / 0.1);

    --un-shadow: var(--un-shadow-inset) 0 20px 25px -5px var(--un-shadow-color, rgb(0 0 0 / 0.1)), var(--un-shadow-inset) 0 8px 10px -6px var(--un-shadow-color, rgb(0 0 0 / 0.1));

    box-shadow: var(--un-ring-offset-shadow), var(--un-ring-shadow),
      var(--un-shadow);
  }

  .vt-hamburger-top, .vt-hamburger-middle, .vt-hamburger-bottom {
    background-color: var(--va-c-text);
  }
}
</style>
