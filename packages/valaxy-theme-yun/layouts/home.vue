<script lang="ts" setup>
import { useLayout } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'
import { useYunAppStore } from '../stores'

const yunApp = useYunAppStore()
const isHome = useLayout('home')
const themeConfig = useThemeConfig()

const route = useRoute()
const isPage = computed(() => route.path.startsWith('/page'))

const showNotice = computed(() => {
  const notice = themeConfig.value.notice
  return notice.enable && (isPage.value ? !notice.hideInPages : true)
})
</script>

<template>
  <main
    class="yun-main flex-center"
    :class="(isHome && !yunApp.leftSidebar.isOpen) ? 'pl-0' : 'md:pl-$va-sidebar-width'" flex="~ col" w="full"
  >
    <YunSidebar :show-hamburger="true" />

    <template v-if="!isPage">
      <YunBanner v-if="themeConfig.banner.enable" />
      <YunSay v-if="themeConfig.say.enable" w="full" />
    </template>

    <YunNotice
      v-if="showNotice"
      :content="themeConfig.notice.content" mt="4"
    />

    <slot name="board" />

    <slot>
      <RouterView />
    </slot>

    <YunFooter />
  </main>
</template>
