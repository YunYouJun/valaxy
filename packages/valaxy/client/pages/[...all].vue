<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()

onBeforeMount(() => {
  // compatible for post url ends with slash
  if (route.path.endsWith('/'))
    router.replace(route.path.slice(0, -1))
})
</script>

<template>
  <div m="2" text="xl">
    {{ t('not-found') }}
  </div>
</template>

<route lang="yaml">
meta:
  layout: 404
</route>
