<script setup lang="ts">
// export layouts/base.vue as components
import { useThemeConfig } from 'valaxy/client'
import Base from '../layouts/base.vue'

const themeConfig = useThemeConfig()
</script>

<template>
  <ValaxyBg v-if="themeConfig.bg_image.enable" />

  <Base>
    <template #sidebar>
      <slot name="sidebar" />
    </template>
    <template #content>
      <slot name="content" />
    </template>
    <template #nav>
      <slot name="nav" />
    </template>
    <template #comment>
      <slot name="comment" />
    </template>
    <template #footer>
      <slot name="footer" />
    </template>
    <template #right-sidebar>
      <slot name="right-sidebar" />
    </template>
  </Base>
</template>
