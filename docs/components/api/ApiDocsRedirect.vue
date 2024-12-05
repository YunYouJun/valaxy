<script setup lang="ts">
import { isClient } from '@vueuse/core'
import { onMounted } from 'vue'

onMounted(() => {
  if (isClient) {
    window.location.href = 'https://api.valaxy.site/typedoc/'
  }
})
</script>

<template>
  <div>
    Redirecting...
  </div>
</template>
