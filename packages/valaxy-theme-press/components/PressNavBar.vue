<script lang="ts" setup>
import { NavigationMenuRoot } from 'reka-ui'
import { useSidebar, useSiteConfig, withBase } from 'valaxy'
import { computed } from 'vue'
import { useLocaleConfig } from '../composables'

defineProps<{
  isScreenOpen?: boolean
}>()

defineEmits<{
  (e: 'toggleScreen'): void
}>()

const { hasSidebar } = useSidebar()

const siteConfig = useSiteConfig()
const { localeConfig, currentLocale, hasLocales } = useLocaleConfig()
const homeLink = computed(() => hasLocales.value ? currentLocale.value.link : '/')
</script>

<template>
  <div class="pr-navbar flex justify-between items-center pl-4 pr-2" :class="{ 'has-sidebar': hasSidebar }">
    <RouterLink
      class="pr-navbar-brand text-xl flex justify-center items-center"
      :to="homeLink" :aria-label="siteConfig.title"
    >
      <img v-if="localeConfig.logo" class="logo" :src="withBase(localeConfig.logo)" alt="LOGO">
      <span class="pr-navbar-title inline-flex">{{ siteConfig.title }}</span>
    </RouterLink>
    <!-- Share one active item and pointer-leave timer across all desktop menus. -->
    <NavigationMenuRoot
      as="div"
      class="pr-navbar-actions self-stretch flex justify-center items-center text-sm leading-5"
      :delay-duration="0"
    >
      <PressNavBarSearch p="x-2" />
      <PressNavBarMenu p="x-2" />
      <PressNavBarTranslations p="x-2" />
      <PressNavBarAppearance p="x-1" />
      <PressNavBarSocialLinks p="x-2" />

      <PressNavBarHamburger :active="isScreenOpen" @click="$emit('toggleScreen')" />
    </NavigationMenuRoot>
  </div>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins/index.scss' as *;

:root {
  --pr-navbar-c-bg: var(--pr-c-bg);
}

.pr-navbar .logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
  transform: translateY(var(--pr-logo-offset-y, -2px));
  margin-right: 8px;
}

@media (width <= 360px) {
  .pr-navbar .pr-navbar-title {
    font-size: 18px;
  }
}

.pr-navbar {
  position: relative;
  border-bottom: 1px solid var(--pr-c-divider-light);
  padding: 0 8px 0 24px;
  height: var(--pr-nav-height);
  transition: border-color var(--va-transition-duration-moderate);
  background-color: var(--pr-navbar-c-bg);
  z-index: var(--pr-z-nav);
}

.pr-navbar-brand,
.pr-navbar-actions > * {
  flex-shrink: 0;
}

.pr-navbar-brand {
  white-space: nowrap;
  font-family: var(--pr-font-display);
  font-weight: 650;
  letter-spacing: -0.035em;
  color: var(--pr-c-text-1);
}

.pr-navbar-title {
  line-height: 1;
}

.pr-navbar-actions {
  min-width: 0;
}

@include screen('md') {
  .pr-navbar {
    padding: 0 max(32px, calc((100vw - var(--pr-home-max-width)) / 2 + 24px));
  }
}

// Keep the solid surface unless both the tint and backdrop blur are supported.
@supports (background-color: color-mix(in srgb, white 96%, transparent)) and ((backdrop-filter: blur(12px)) or (-webkit-backdrop-filter: blur(12px))) {
  :root {
    --pr-navbar-c-bg: color-mix(in srgb, var(--pr-c-bg) 96%, transparent);
  }

  .pr-navbar {
    /* stylelint-disable-next-line property-no-vendor-prefix -- Support older WebKit webviews. */
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .pr-navbar {
    background-color: var(--pr-c-bg);
    /* stylelint-disable-next-line property-no-vendor-prefix -- Also disable the WebKit fallback. */
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

.container {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: calc(var(--pr-layout-max-width) - 64px);
}
</style>
