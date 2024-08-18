<script setup lang="ts">
import { useCollections } from 'valaxy'

const { collections } = useCollections()
</script>

<template>
  <YunSidebar v-if="$slots['sidebar-child']">
    <slot name="sidebar-child" />
  </YunSidebar>
  <YunSidebar v-else />

  <RouterView v-slot="{ Component }">
    <component :is="Component">
      <div flex="~ wrap" gap="4">
        <YunCollectionItem
          v-for="collection in collections" :key="collection.id"
          :collection="collection"
        />
      </div>
    </component>
  </RouterView>
</template>
