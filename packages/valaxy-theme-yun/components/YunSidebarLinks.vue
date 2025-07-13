<script lang="ts" setup>
import { useValaxyI18n } from 'valaxy'
import { useThemeConfig } from '../composables'

const themeConfig = useThemeConfig()
const { $t } = useValaxyI18n()
</script>

<template>
  <div class="links flex-center">
    <AppLink
      v-for="item, i in themeConfig.pages" :key="i"
      class="link-item yun-icon-btn" inline-flex
      :to="item.url"
      :title="$t(item.name)"
      :style="`color:${item.color}`"
    >
      <div :class="item.icon" class="icon size-6" />
    </AppLink>
  </div>
</template>
