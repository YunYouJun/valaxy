<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { toggleDark } from '../composables/dark'

const { t } = useI18n()
</script>

<template>
  <VDMenuBarBtn :title="t('button.toggle_dark')" @click="toggleDark()">
    <div i="carbon-sun dark:carbon-moon" />
  </VDMenuBarBtn>
</template>
