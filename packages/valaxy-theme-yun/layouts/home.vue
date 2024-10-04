<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useYunAppStore } from '../stores'
import { useThemeConfig } from '../composables'

const yunStore = useYunAppStore()
const route = useRoute()
const themeConfig = useThemeConfig()

const isPage = computed(() => route.path.startsWith('/page'))

const showNotice = computed(() => {
  const notice = themeConfig.value.notice
  return notice.enable && (isPage.value ? !notice.hideInPages : true)
})
</script>

<template>
  <main
    class="yun-main flex-center"
    :class="{
      'pl-0': !yunStore.leftSidebar.isOpen,
      'md:pl-$va-sidebar-width': yunStore.leftSidebar.isOpen,
      'pt-36': isPage,
    }" flex="~ col" w="full"
  >
    <YunSidebar :show-hamburger="true" />

    <template v-if="!isPage">
      <YunBanner />
      <YunSay v-if="themeConfig.say.enable" w="full" />
      <YunPrologue class="absolute left-0 top-0 right-0 bottom-0" />
    </template>

    <YunNotice
      v-if="showNotice"
      class="mb-10"
      :class="{
        'mt-4': !isPage,
      }"
      :content="themeConfig.notice.content"
    />

    <slot name="board" />

    <slot>
      <RouterView />
    </slot>

    <YunFooter />
  </main>
</template>
