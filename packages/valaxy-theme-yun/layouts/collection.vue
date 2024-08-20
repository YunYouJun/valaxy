<script setup lang="ts">
// TODO: Implement collection layout
</script>

<template>
  <YunSidebar v-if="$slots['sidebar-child']">
    <slot name="sidebar-child" />
  </YunSidebar>
  <YunSidebar v-else />

  <RouterView v-slot="{ Component }">
    <component :is="Component">
      <div flex="~ wrap" gap="4">
        Collection
      </div>
    </component>
  </RouterView>
</template>
