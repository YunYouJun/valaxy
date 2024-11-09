<script lang="ts" setup>
import { useThemeConfig } from '../composables'

const themeConfig = useThemeConfig()
</script>

<template>
  <div class="links flex-center">
    <AppLink
      v-for="item, i in themeConfig.pages" :key="i"
      class="link-item yun-icon-btn" inline-flex
      :to="item.url" :title="item.name"
      :style="`color:${item.color}`"
    >
      <div :class="item.icon" class="icon size-6" />
    </AppLink>
  </div>
</template>
