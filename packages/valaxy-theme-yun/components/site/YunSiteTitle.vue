<script setup lang="ts">
import { useSiteConfig } from 'valaxy'
import { useRouter } from 'vue-router'
import { useThemeConfig } from '../../composables'

const router = useRouter()
const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()

// bg-gradient-to-r gradient-text from-#1e3c72 to-dark dark:(from-#66a6ff to-blue-500)
</script>

<template>
  <RouterLink
    v-if="router.hasRoute('/about/site')" to="/about/site"
    class="site-name text-lg leading-loose"
    :class="themeConfig.banner.siteNameClass"
  >
    {{ siteConfig.title }}
  </RouterLink>
  <span
    v-else
    class="site-name text-lg leading-loose"
    :class="themeConfig.banner.siteNameClass"
  >
    {{ siteConfig.title }}
  </span>
</template>

<style lang="scss">
.site-name {
  --title-padding: -15px;

  display: inline-flex;
  color: var(--va-c-text);
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    opacity: 0;
    border: 2px solid;
    transition: 0.3s;
    transition-timing-function: cubic-bezier(0.17, 0.67, 0.05, 1.29);
  }

  &::before {
    top: 0;
    left: var(--title-padding);
    border-width: 2px 0 0 2px;
    transform: translate3d(10px, 10px, 0);
  }

  &::after {
    right: var(--title-padding);
    bottom: 0;
    border-width: 0 2px 2px 0;
    transform: translate3d(-10px, -10px, 0);
  }

  &:hover::before,
  &:hover::after {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
</style>
