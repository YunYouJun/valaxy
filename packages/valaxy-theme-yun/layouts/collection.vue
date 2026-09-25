<script setup lang="ts">
import { useYunCollection } from '../composables/collection'

const { collection, currentIndex: currentItemIndex } = useYunCollection()
</script>

<template>
  <YunLayoutWrapper outline-nav>
    <YunLayoutLeft>
      <YunCollectionSidebar />
    </YunLayoutLeft>

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header-after>
          <YunCollectionNav
            v-if="collection && currentItemIndex >= 0"
            :collection="collection"
            :current-index="currentItemIndex"
          />
          <YunMainHeaderAfter v-if="currentItemIndex >= 0" />
          <YunCollectionMobile />
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
