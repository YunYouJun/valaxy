<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'

const route = useRoute()
const themeConfig = useThemeConfig()

const isPage = computed(() => route.path.startsWith('/page'))

const showNotice = computed(() => {
  const notice = themeConfig.value.notice
  return notice.enable && (isPage.value ? !notice.hideInPages : true)
})
</script>

<template>
  <YunLayoutWrapper
    class="items-center flex-col"
    :class="{
      'mt-0!': !isPage,
    }"
  >
    <template v-if="!isPage">
      <YunBanner />
      <YunSay v-if="themeConfig.say.enable" w="full" />
      <YunPrologue class="absolute left-0 top-0 right-0 bottom-0" />
    </template>

    <YunNotice
      v-if="showNotice"
      class="mb-2 md:mb-6"
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
  </YunLayoutWrapper>
</template>
