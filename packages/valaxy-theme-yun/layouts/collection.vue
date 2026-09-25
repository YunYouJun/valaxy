<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useYunCollection } from '../composables/collection'
import { useYunLocalMenu } from '../composables/localMenu'

const { collection, currentIndex: currentItemIndex } = useYunCollection()
const { menuOpen, toggleMenu } = useYunLocalMenu()
const { t } = useI18n()
</script>

<template>
  <YunLayoutWrapper
    outline-nav
    :local-menu="!!collection"
    :local-menu-open="menuOpen"
    :local-menu-label="t('theme.collectionMenu')"
    local-menu-controls="yun-collection-menu"
    local-menu-kind="collection"
    @toggle-local-menu="toggleMenu"
  >
    <YunLayoutLeft>
      <YunCollectionSidebar />
    </YunLayoutLeft>
    <YunCollectionMobile v-model:open="menuOpen" />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header-after>
          <YunCollectionNav
            v-if="collection && currentItemIndex >= 0"
            :collection="collection"
            :current-index="currentItemIndex"
          />
          <YunMainHeaderAfter v-if="currentItemIndex >= 0" />
        </template>
        <template #main-content-after>
          <YunMainContentAfter v-if="currentItemIndex >= 0" />
        </template>
        <template #aside-custom>
          <slot name="aside-custom" />
        </template>

        <template #main-nav>
          <YunCollectionPrevNext
            v-if="collection && currentItemIndex >= 0"
            :collection="collection"
            :current-index="currentItemIndex"
          />
        </template>
      </component>
    </RouterView>

    <YunLayoutRight :floating-trigger="false" />
  </YunLayoutWrapper>
</template>
