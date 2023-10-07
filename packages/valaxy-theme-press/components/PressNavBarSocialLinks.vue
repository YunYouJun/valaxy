<script lang="ts" setup>
import { useThemeConfig } from '../composables'

const themeConfig = useThemeConfig()
</script>

<template>
  <PressSocialLinks
    v-if="themeConfig.socialLinks"
    class="pr-nav-bar-social-links"
    :links="themeConfig.socialLinks"
  />
</template>

<style scoped>
.pr-nav-bar-social-links {
  display: none;
}

@media (width >= 1280px) {
  .pr-nav-bar-social-links {
    display: flex;
    align-items: center;
  }
}
</style>
