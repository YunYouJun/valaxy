<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

onBeforeMount(() => {
  router.push('/')

  // compatible for post url ends with slash
  if (route.path !== '/' && route.path.endsWith('/'))
    router.replace(route.path.slice(0, -1))
})
</script>

<template>
  <div />
</template>

<route lang="yaml">
meta:
  layout: 404
</route>
