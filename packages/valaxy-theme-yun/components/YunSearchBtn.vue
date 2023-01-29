<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

withDefaults(defineProps<{
  open?: boolean
}>(), {
  open: false,
})

const { t } = useI18n()
</script>

<template>
  <button class="search-btn popup-trigger yun-icon-btn" :title="t('menu.search')">
    <div v-if="!open" i-ri-search-line />
    <div v-else text="!2xl" i-ri-close-line />
  </button>
</template>
