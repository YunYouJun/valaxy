<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  content: string
}>()

const { t } = useI18n()
</script>

<template>
  {{ t(content) }}
</template>
