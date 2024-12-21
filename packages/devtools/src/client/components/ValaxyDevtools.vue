<script lang="ts" setup>
import { useValaxyDevtools } from '../composables/useValaxyDevtools'

useValaxyDevtools()
</script>

<template>
  <main class="h-full overflow-hidden" flex="~ col" text="gray-700 dark:gray-200">
    <VDHeader />
    <div style="height: calc(100% - 32px)" overflow="auto">
      <slot />
    </div>
  </main>
</template>
