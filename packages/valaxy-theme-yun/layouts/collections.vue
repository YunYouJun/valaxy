<script setup lang="ts">
import { useCollections } from 'valaxy'

const { collections } = useCollections()
</script>

<template>
  <YunLayoutWrapper>
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
  </YunLayoutWrapper>
</template>
