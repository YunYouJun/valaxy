<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()

const routeMenus: {
  to: string
  icon?: string
  opened?: string
  closed?: string
  label: string
}[] = [
  {
    to: '/',
    icon: 'i-ri-dashboard-line',
    label: 'nav.dashboard',
  },
  {
    to: '/posts',
    icon: 'i-ri-article-line',
    label: 'nav.posts',
  },
  {
    to: '/archives',
    icon: 'i-ri-archive-line',
    label: 'nav.archives',
  },
  {
    to: '/categories',
    icon: 'i-ri:folder-2-line',
    label: 'nav.categories',
  },
  {
    to: '/tags',
    icon: 'i-ri:price-tag-3-line',
    label: 'nav.tags',
  },
  {
    to: '/collections',
    icon: 'i-ri:book-2-line',
    label: 'nav.collections',
  },
  {
    to: '/batch-edit',
    icon: 'i-ri:file-edit-line',
    label: 'nav.batch_edit',
  },
  {
    to: '/config',
    icon: 'i-ri:tools-line',
    label: 'nav.config',
  },
]

const route = useRoute()
</script>

<template>
  <div
    class="w-full border-b border-gray-200 dark:border-gray-700 flex bg-gray-50 dark:bg-dark-800"
  >
    <VDTooltip v-for="menu in routeMenus" :key="menu.to" :content="t(menu.label)">
      <RouterLink
        class="inline-flex justify-center items-center w-8 h-8 cursor-pointer transition-colors"
        :class="route.path === menu.to
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          : 'bg-gray-50 dark:bg-dark-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200'"
        :to="menu.to"
      >
        <div v-if="menu.icon" :class="menu.icon" />
        <div v-else-if="route.path === menu.to" :class="menu.opened" />
        <div v-else :class="menu.closed" />
      </RouterLink>
    </VDTooltip>

    <div flex="1" />

    <VDToggleLocale />
    <VDToggleDark />
    <VDTooltip :content="t('nav.settings')">
      <RouterLink
        class="inline-flex justify-center items-center w-8 h-8 cursor-pointer transition-colors"
        :class="route.path === '/settings'
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          : 'bg-gray-50 dark:bg-dark-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200'"
        to="/settings"
      >
        <div class="i-ri:settings-3-line" />
      </RouterLink>
    </VDTooltip>
    <VDTooltip :content="t('nav.docs')">
      <VDMenuBarBtn
        tag="a"
        href="https://valaxy.site" target="_blank"
      >
        <div i-ri-book-line />
      </VDMenuBarBtn>
    </VDTooltip>
  </div>
</template>
