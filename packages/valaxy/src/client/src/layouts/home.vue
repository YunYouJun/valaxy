<template>
  <main class="text-center text-gray-700 dark:text-gray-200">
    <ValaxySidebar :open="open" />
    <YunBanner />
    <YunSay />

    <router-view class="px-4 py-10" />
    <!-- <Footer /> -->
    <div class="mt-5 mx-auto text-center opacity-25 text-sm">
      [Home Layout]
    </div>
  </main>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const open = ref(false)
</script>
