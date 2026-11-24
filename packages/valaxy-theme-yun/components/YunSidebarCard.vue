<script setup lang="ts">
import { useSiteConfig } from 'valaxy'
import { useThemeConfig } from '../composables'

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
</script>

<template>
  <YunCard class="p-4 min-h-sm" flex="~ col gap-1">
    <YunSiteInfo class="text-center" />
    <YunGradientDivider class="my-3" />
    <YunPostsInfo />
    <template v-if="siteConfig.social?.length">
      <YunGradientDivider class="my-3" />
      <YunSocialLinks />
    </template>
    <template v-if="themeConfig.pages?.length">
      <YunGradientDivider class="my-3" />
      <YunSidebarLinks />
    </template>
  </YunCard>
</template>
