<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAppStore, useSiteConfig } from 'valaxy'
import { useRoute } from 'vue-router'
import { useYunAppStore } from '../../../stores'
// import { useThemeConfig } from '../composables'

// const app = useAppStore()
const yunApp = useYunAppStore()
const siteConfig = useSiteConfig()
// const themeConfig = useThemeConfig()

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

const showHamburger = computed(() => {
  return app.isMobile ? true : route.meta.layout === 'home'
})
</script>

<template>
  <div class="fixed left-0 top-0" z="$yun-z-left-sidebar-menu">
    <ValaxyHamburger
      v-if="showHamburger"
      :active="yunApp.leftSidebar.isOpen"
      class="menu-btn sidebar-toggle leading-4 size-12 fixed"
      inline-flex cursor="pointer"
      hover="bg-white/80 dark:bg-black/80"
      @click="yunApp.leftSidebar.toggle()"
    />
    <YunNavMenuItem v-else icon="i-ri-home-4-line" to="/" />
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
          v-if="yunApp.size.isSm && app.showToggleLocale"
          class="rounded-none!"
        />
        <YunToggleDark class="rounded-none!" transition />
        <YunSearchTrigger v-if="siteConfig.search.enable" />
      </div>
    </div>
  </Transition>
</template>
