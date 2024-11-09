<script setup lang="ts">
// TODO: Implement collection layout
</script>

<template>
  <YunLayoutWrapper>
    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <div flex="~ wrap" gap="4">
          Collection
        </div>
      </component>
    </RouterView>
  </YunLayoutWrapper>
</template>
