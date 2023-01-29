<script lang="ts" setup>
import { useThemeConfig } from '../composables'

const themeConfig = useThemeConfig()
</script>

<template>
  <nav v-if="themeConfig.nav" class="pr-nav-screen-menu">
    <template v-for="item in themeConfig.nav" :key="item.text">
      <PressNavScreenMenuLink
        v-if="'link' in item"
        :text="item.text"
        :link="item.link"
      />
      <PressNavScreenMenuGroup
        v-else
        :text="item.text || ''"
        :items="item.items"
      />
    </template>
  </nav>
</template>
