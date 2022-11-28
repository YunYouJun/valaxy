<script lang="ts" setup>
import { useConfig, useSidebar } from 'valaxy'
import { useThemeConfig } from '../../composables'
import PressSwitchAppearance from './PressSwitchAppearance.vue'
import PressNavItemLink from './PressNavItemLink.vue'
import PressNavItemGroup from './PressNavItemGroup.vue'

defineProps<{
  isScreenOpen?: boolean
}>()

defineEmits<{
  (e: 'toggle-screen'): void
}>()

const { hasSidebar } = useSidebar()

const config = useConfig()
const themeConfig = useThemeConfig()
</script>

<template>
  <div class="press-navbar flex justify-between items-center px-6 py-4" :class="{ 'has-sidebar': hasSidebar }">
    <router-link class="text-xl" to="/" :aria-label="config.title">
      <span class="md:inline">{{ config.title }}</span>
    </router-link>
    <div class="self-stretch flex justify-center items-center text-sm leading-5">
      <template v-for="item in themeConfig.nav" :key="item.text">
        <PressNavItemLink v-if="'link' in item" class="px-2" :item="item" />
        <PressNavItemGroup v-else class="px-2" :item="item" />
      </template>
      <PressToggleLocale p="x-2" />
      <PressSwitchAppearance m="l-2" />
    </div>
  </div>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins' as *;

:root {
  --pr-navbar-c-bg: rgba(255, 255, 255, 0.8);
}

.dark {
  --pr-navbar-c-bg: rgba(36, 36, 36, 0.8);
}

.press-navbar {
  position: relative;
  border-bottom: 1px solid var(--pr-c-divider-light);
  padding: 0 8px 0 24px;
  height: var(--pr-nav-height);
  transition: border-color 0.5s;
  background-color: var(--pr-navbar-c-bg);
}

@include media('md') {
  .press-navbar {
    padding: 0 32px;
  }
}

@include media('md') {
  .press-navbar.has-sidebar .content {
    margin-right: -32px;
    padding-right: 32px;
    -webkit-backdrop-filter: saturate(50%) blur(8px);
    backdrop-filter: saturate(50%) blur(8px);
  }

  @supports not (backdrop-filter: saturate(50%) blur(8px)) {
    .press-navbar.has-sidebar .content {
      background: rgba(255, 255, 255, 0.95);
    }

    .dark .press-navbar.has-sidebar .content {
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

.menu + .translations::before,
.menu + .appearance::before,
.menu + .social-links::before,
.translations + .appearance::before,
.appearance + .social-links::before {
  margin-right: 8px;
  margin-left: 8px;
  width: 1px;
  height: 24px;
  background-color: var(--pr-c-divider-light);
  content: "";
}

.menu + .appearance::before,
.translations + .appearance::before {
  margin-right: 16px;
}

.appearance + .social-links::before {
  margin-left: 16px;
}
</style>
