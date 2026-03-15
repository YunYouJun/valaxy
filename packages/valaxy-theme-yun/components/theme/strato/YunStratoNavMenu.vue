<script setup lang="ts">
import { useAppStore, useSiteConfig } from 'valaxy'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useYunAppStore } from '../../../stores'
// import { useThemeConfig } from '../composables'

// const app = useAppStore()
const yunApp = useYunAppStore()
const siteConfig = useSiteConfig()
// const themeConfig = useThemeConfig()

// Always render the menu to avoid SSG hydration mismatch.
const showMenu = ref(true)
const route = useRoute()
if (!import.meta.env.SSR) {
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

const isHomePage = computed(() => route.meta.layout === 'home')
</script>

<template>
  <div class="fixed left-0 top-0" z="$yun-z-left-sidebar-menu">
    <ValaxyHamburger
      v-if="isHomePage"
      :active="yunApp.leftSidebar.isOpen"
      class="menu-btn sidebar-toggle leading-4 size-12 fixed"
      inline-flex cursor="pointer"
      hover="bg-white/80 dark:bg-black/80"
      @click="yunApp.leftSidebar.toggle()"
    />
    <template v-else>
      <ValaxyHamburger
        :active="yunApp.leftSidebar.isOpen"
        class="menu-btn sidebar-toggle leading-4 size-12 fixed md:hidden"
        inline-flex cursor="pointer"
        hover="bg-white/80 dark:bg-black/80"
        @click="yunApp.leftSidebar.toggle()"
      />
      <YunNavMenuItem class="hidden md:inline-flex" icon="i-ri-home-4-line" to="/" />
    </template>
  </div>

  <Transition
    enter-active-class="animate-fade-in"
  >
    <div
      v-if="showMenu"
      class="yun-nav-menu z-$yun-z-nav-menu fixed w-full flex justify-between items-center top-0"
      :class="{
        play: playAnimation,
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
  </Transition>
</template>
