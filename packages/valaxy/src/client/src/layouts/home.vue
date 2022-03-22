<template>
  <main class="text-center text-gray-700 dark:text-gray-200">
    <ValaxySidebar :open="open" />
    <YunBanner />
    <YunSay />

    <router-view />

    <ValaxyFooter>
      <slot name="footer" />
    </ValaxyFooter>
  </main>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const open = ref(false)
</script>
