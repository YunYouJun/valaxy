<script lang="ts" setup>
import { useBlogConfig } from 'valaxy'

const config = useBlogConfig()
</script>

<template>
  <slot name="bg">
    <YunBg v-if="config.themeConfig.bg_image.enable" />
  </slot>

  <ValaxySidebar>
    <slot name="sidebar">
      <YunSidebar v-if="$slots['sidebar-child']">
        <slot name="sidebar-child" />
      </YunSidebar>
      <YunSidebar v-else />
    </slot>
  </ValaxySidebar>

  <router-view v-slot="{ Component }">
    <component :is="Component">
      <template #main-header>
        <slot name="main-header" />
      </template>

      <template #main-header-after>
        <slot name="main-header-after" />
      </template>
      <template #main>
        <slot name="main" />
      </template>
      <template #main-content>
        <slot name="main-content" />
      </template>
      <template #main-content-after>
        <slot name="main-content-after" />
      </template>
      <template #main-nav-before>
        <slot name="main-nav-before" />
      </template>
      <template #main-nav-after>
        <slot name="main-nav-after" />
      </template>
      <template #aside-custom>
        <slot name="aside-custom" />
      </template>
      <template #footer>
        <slot name="footer" />
      </template>
    </component>
  </router-view>

  <YunSearch v-if="config.search.enable" />
  <YunBackToTop />
</template>

