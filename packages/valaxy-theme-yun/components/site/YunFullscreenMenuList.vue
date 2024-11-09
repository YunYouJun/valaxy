<script lang="ts" setup>
import { useAppStore } from 'valaxy'
import { useThemeConfig } from '../../composables'

const app = useAppStore()
const themeConfig = useThemeConfig()
</script>

<template>
  <div
    class="links flex-center lg:flex-col"
    flex="~" text="left"
    p="x-$rect-margin"
    :class="{
      'flex-wrap': app.isMobile,
    }"
  >
    <slot />
    <YunFullscreenMenuItem
      v-for="item, i in themeConfig.pages"
      :key="i" :page="item"
    />
  </div>
</template>
