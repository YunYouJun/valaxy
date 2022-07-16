<script lang="ts" setup>
import { useSidebar, useSite } from 'valaxy'
import { useThemeConfig } from '../../composables'
import PressSwitchAppearance from './PressSwitchAppearance.vue'

defineProps<{
  isScreenOpen?: boolean
}>()

defineEmits<{
  (e: 'toggle-screen'): void
}>()

const { hasSidebar } = useSidebar()

const config = useSite()
const themeConfig = useThemeConfig()
</script>

<template>
  <div class="press-navbar flex justify-between items-center px-6 py-4" :class="{ 'has-sidebar': hasSidebar }">
    <a class="text-xl" href="/" :aria-label="config.title">
      <span class="md:inline">{{ config.title }}</span>
    </a>
    <div class="flex justify-center items-centertext-sm leading-5">
      <template v-for="(item, i) in themeConfig.nav" :key="i">
        <a
          class="hover:text-gray-700"
          :href="item.link"
          target="_blank"
          rel="noopener"
        >{{ item.text }}</a>

        <span v-if="i !== themeConfig.nav.length - 1" class="mr-2 ml-2">·</span>
      </template>

      <PressToggleLocale m="x-2" />
      <PressSwitchAppearance m="l-2" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'valaxy/client/styles/mixins' as *;

.press-navbar {
  position: relative;
  border-bottom: 1px solid var(--pr-c-divider-light);
  padding: 0 8px 0 24px;
  height: var(--pr-nav-height);
  transition: border-color 0.5s, background-color 0.5s;
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
    background: rgba(255, 255, 255, 0.7);
  }

  .dark .press-navbar.has-sidebar .content {
    background: rgba(36, 36, 36, 0.7);
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

.content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-grow: 1;
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

.social-links {
  margin-right: -8px;
}
</style>
