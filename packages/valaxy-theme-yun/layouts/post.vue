<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useYunCollection } from '../composables/collection'
import { useYunLocalMenu } from '../composables/localMenu'

const { collection, currentIndex } = useYunCollection()
const { menuOpen, toggleMenu } = useYunLocalMenu()
const { t } = useI18n()
</script>

<template>
  <YunLayoutWrapper
    outline-nav
    author-notes
    :local-menu="!!collection"
    :local-menu-open="menuOpen"
    :local-menu-label="t('theme.collectionMenu')"
    local-menu-controls="yun-collection-menu"
    local-menu-kind="collection"
    @toggle-local-menu="toggleMenu"
  >
    <YunLayoutLeft />
    <YunCollectionMobile v-model:open="menuOpen" />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header-after>
          <YunMainHeaderAfter />
        </template>

        <template #main-content-after>
          <YunMainContentAfter />
        </template>

        <template v-if="collection" #main-nav>
          <YunCollectionPrevNext :collection="collection" :current-index="currentIndex" />
        </template>

        <template #aside-custom>
          <slot name="aside-custom" />
        </template>
      </component>
    </RouterView>

    <YunLayoutRight :floating-trigger="false" />
  </YunLayoutWrapper>
</template>
