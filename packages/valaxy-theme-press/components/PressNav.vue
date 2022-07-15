<script lang="ts" setup>
import { isDark, toggleDark, useBlogConfig } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'

const route = useRoute()
const isIndex = computed(() => route.path.replace(/index.html$/, '') === '/')

const config = useBlogConfig()
const themeConfig = useThemeConfig()
</script>

<template>
  <nav w="full" class="flex justify-between items-center py-10 font-bold">
    <a class="text-xl" href="/" :aria-label="config.title">
      <img
        class="inline-block mr-2"
        style="width: 50px; height: 35px"
        alt="logo"
        :src="config.favicon"
      >
      <span v-if="!isIndex" class="hidden md:inline">{{ config.title }}</span>
    </a>
    <div class="text-sm text-gray-500 leading-5">
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
