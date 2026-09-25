<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'
import { useYunLocalMenu } from '../composables/localMenu'
import { hasYunDocsSidebarNavigation, resolveYunDocsSidebar } from '../utils/sidebar'

const route = useRoute()
const { t } = useI18n()
const themeConfig = useThemeConfig()
const { menuOpen, toggleMenu } = useYunLocalMenu()
const hasMenu = computed(() => hasYunDocsSidebarNavigation(
  resolveYunDocsSidebar(themeConfig.value.sidebar, route.path),
  route.path,
))
</script>

<template>
  <YunLayoutWrapper
    outline-nav
    :local-menu="hasMenu"
    :local-menu-label="t('theme.docsMenu')"
    :local-menu-open="menuOpen"
    @toggle-local-menu="toggleMenu"
  >
    <YunDocsSidebar v-model:open="menuOpen" :floating-trigger="false" />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header-after>
          <YunMainHeaderAfter />
        </template>

        <template #main-content-after>
          <YunMainContentAfter />
        </template>

        <template #main-nav>
          <span hidden aria-hidden="true" />
        </template>
        <template #comment>
          <span hidden aria-hidden="true" />
        </template>
      </component>
    </RouterView>

    <YunLayoutRight :floating-trigger="false" />
  </YunLayoutWrapper>
</template>
