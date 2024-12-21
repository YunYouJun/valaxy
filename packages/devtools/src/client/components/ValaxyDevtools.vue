<script lang="ts" setup>
import { onMounted } from 'vue'
import { initDevtoolsClient } from '../utils'
import 'splitpanes/dist/splitpanes.css'

import '../styles/index.scss'

onMounted(() => {
  initDevtoolsClient()
})
</script>

<template>
  <main class="h-full" flex="~ col" text="gray-700 dark:gray-200">
    <VDHeader />
    <!-- <RouterLink to="/about">About</RouterLink> -->
    <div style="height: calc(100% - 32px)" overflow="auto">
      <PageIndex />
    </div>
  </main>>
</template>
