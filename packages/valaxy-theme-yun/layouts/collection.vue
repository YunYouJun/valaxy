<script setup lang="ts">
import { useCollection } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const { collection } = useCollection()
const route = useRoute()

const currentItemIndex = computed(() => {
  if (!collection.value?.items)
    return -1
  const slug = route.path.split('/').pop()
  return collection.value.items.findIndex(item => item.key === slug)
})
</script>

<template>
  <YunLayoutWrapper>
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
          <YunMainHeaderAfter />
        </template>
        <template #main-content-after>
          <YunMainContentAfter />
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

    <YunLayoutRight />
  </YunLayoutWrapper>
</template>
