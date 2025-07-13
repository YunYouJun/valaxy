<script setup lang="ts">
// import { useValaxyI18n } from 'valaxy'
import { useI18n } from 'vue-i18n'

defineProps<{
  title: string
}>()

const { t } = useI18n()
</script>

<template>
  <span>
    {{ t(title) }}
  </span>
</template>
