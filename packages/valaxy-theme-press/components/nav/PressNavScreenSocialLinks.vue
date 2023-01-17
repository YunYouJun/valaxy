<script lang="ts" setup>
import { useThemeConfig } from '../../composables'
const themeConfig = useThemeConfig()
</script>

<template>
  <PressSocialLinks
    v-if="themeConfig.socialLinks"
    class="pr-nav-screen-social-links"
    :links="themeConfig.socialLinks"
  />
</template>
