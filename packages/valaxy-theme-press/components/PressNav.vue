<script lang="ts" setup>
import { isDark, toggleDark, useConfig } from 'valaxy'
import { useThemeConfig } from '../composables'

const config = useConfig()
const themeConfig = useThemeConfig()
</script>

<template>
  <nav w="full" class="press-nav relative md:fixed flex justify-between items-center px-6 py-4 font-bold">
    <a class="text-xl" href="/" :aria-label="config.title">
      <span class="md:inline">{{ config.title }}</span>
    </a>
    <div class="flex justify-center  items-centertext-sm text-gray-500 leading-5">
      <template v-for="(item, i) in themeConfig.nav" :key="i">
        <a
          class="hover:text-gray-700"
          :href="item.link"
          target="_blank"
          rel="noopener"
        >{{ item.text }}</a>

        <span v-if="i !== themeConfig.nav.length - 1" class="mr-2 ml-2">·</span>
      </template>

      <button type="button" aria-label="Toggle Dark Mode" @click="toggleDark()">
        <div v-if="!isDark" i-ri-sun-line />
        <div v-else i-ri-moon-line />
      </button>
    </div>
  </nav>
</template>

<style lang="scss">
.press-nav {
  z-index: var(--pr-z-index-nav);

  -webkit-backdrop-filter: saturate(50%) blur(8px);
  backdrop-filter: saturate(50%) blur(8px);
}
</style>
