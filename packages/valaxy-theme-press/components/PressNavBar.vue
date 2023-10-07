<script lang="ts" setup>
import { useSidebar, useSiteConfig } from 'valaxy'
import { useThemeConfig } from '../composables'

defineProps<{
  isScreenOpen?: boolean
}>()

defineEmits<{
  (e: 'toggleScreen'): void
}>()

const { hasSidebar } = useSidebar()

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
</script>

<template>
  <div class="pr-navbar flex justify-between items-center pl-4 pr-2" :class="{ 'has-sidebar': hasSidebar }">
    <router-link class="text-xl flex justify-center items-center" to="/" :aria-label="siteConfig.title">
      <img v-if="themeConfig.logo" class="logo" :src="themeConfig.logo" alt="LOGO">
      <span class="inline-flex">{{ siteConfig.title }}</span>
    </router-link>
    <div class="self-stretch flex justify-center items-center text-sm leading-5">
      <PressNavBarSearch p="x-2" />
      <PressNavBarMenu p="x-2" />
      <PressNavBarTranslations p="x-2" />
      <PressNavBarAppearance p="x-2" />
      <PressNavBarSocialLinks p="x-2" />

      <PressNavBarHamburger :active="isScreenOpen" @click="$emit('toggleScreen')" />
    </div>
  </div>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins/index.scss' as *;

:root {
  --pr-navbar-c-bg: rgba(255, 255, 255, 0.8);
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.dark {
  --pr-navbar-c-bg: rgba(24, 24, 24, 0.3);
}

.pr-navbar {
  position: relative;
  border-bottom: 1px solid var(--pr-c-divider-light);
  padding: 0 8px 0 24px;
  height: var(--pr-nav-height);
  transition: border-color 0.5s;
  background-color: var(--pr-navbar-c-bg);
}

@include screen('md') {
  .pr-navbar {
    padding: 0 32px;
  }
}

@include screen('md') {
  .pr-navbar.has-sidebar .content {
    margin-right: -32px;
    padding-right: 32px;
    backdrop-filter: saturate(50%) blur(8px);
  }

  @supports not (backdrop-filter: saturate(50%) blur(8px)) {
    .pr-navbar.has-sidebar .content {
      background: rgba(255, 255, 255, 0.95);
    }

    .dark .pr-navbar.has-sidebar .content {
      background: rgba(36, 36, 36, 0.95);
    }
  }
}

.container {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: calc(var(--pr-layout-max-width) - 64px);
}
</style>
