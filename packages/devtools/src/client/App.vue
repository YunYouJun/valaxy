<script lang="ts" setup>
import { onMounted } from 'vue'
import { initDevtoolsClient } from './utils'

onMounted(() => {
  initDevtoolsClient()
})
</script>

<template>
  <RouterView />
</template>
