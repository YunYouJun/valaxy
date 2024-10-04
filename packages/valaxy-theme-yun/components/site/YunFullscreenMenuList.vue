<script lang="ts" setup>
import { useThemeConfig } from '../../composables'

const themeConfig = useThemeConfig()
</script>

<template>
  <div
    class="links flex-center"
    flex="~ col" text="left"
    p="x-$rect-margin"
  >
    <slot />
    <YunFullscreenMenuItem
      v-for="item, i in themeConfig.pages"
      :key="i" :page="item"
    />
  </div>
</template>
