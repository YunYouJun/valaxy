<script lang="ts" setup>
import { useAppStore, useLayout } from 'valaxy'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'

const app = useAppStore()
const isHome = useLayout('home')
const themeConfig = useThemeConfig()

const route = useRoute()
</script>

<template>
  <main class="yun-main justify-center items-center" :class="(isHome && !app.isSidebarOpen) && 'pl-0'" flex="~ col" w="full">
    <ValaxySidebar>
      <slot name="sidebar">
        <YunSidebar />
      </slot>
    </ValaxySidebar>

    <template v-if="!route.path.startsWith('/page')">
      <YunBanner v-if="themeConfig.banner.enable" />
      <YunSay v-if="themeConfig.say.enable" w="full" />
    </template>

    <YunNotice
      v-if="themeConfig.notice.enable"
      :content="themeConfig.notice.content" mt="4"
    />

    <slot name="board" />

    <slot>
      <router-view />
    </slot>

    <YunFooter />
  </main>
</template>
